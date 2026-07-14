import { describe, expect, it } from "vitest";
import { EMPTY_CLAIM_DATA, type ClaimDataModel } from "@claimsahayak/shared-types";
import { RULE_PACK, OFFICIAL_FORM_LAYOUTS } from "@claimsahayak/rule-pack";
import {
  buildClaimPackageDefinition,
  evaluateAccount,
  type DocumentRegistryEntry,
} from "../src/index.js";

/**
 * Milestone 12 — the Document Engine MECHANISM: trigger evaluation over
 * real Rule Engine output, print-order sorting, auto-fill capability
 * computation, and pack-record metadata resolution. Exercised with a
 * small synthetic registry so each behavior is isolated; the REAL
 * registry's four supported scenarios are proven in
 * `apps/web/test/lib/documentEngine.test.ts`, where the registry lives.
 */

const NOMINATION_ANSWERS = {
  q2_who_died: "adult",
  q_armed_forces: false,
  q3_holding: "one_name",
  q5_nomination: "yes_alive",
  q9_payment: "own_posb",
} as const;

function nominationAccount() {
  const { account } = evaluateAccount(RULE_PACK, "SB", NOMINATION_ANSWERS, undefined, 0);
  return account;
}

const REGISTRY: readonly DocumentRegistryEntry[] = [
  {
    id: "t_always_sheet",
    source: { kind: "sheet", sheet: "decisionSummary" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 20,
  },
  {
    id: "t_form_11",
    source: { kind: "officialForm", formId: "form_11" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "engineSelected", refId: "form_11" },
    printOrder: 10,
    supportingDocumentIds: ["doc_death_certificate"],
  },
  {
    id: "t_form_14_not_selected",
    source: { kind: "officialForm", formId: "form_14" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_14" },
    printOrder: 30,
  },
  {
    id: "t_forwarding",
    source: { kind: "template", templateId: "template_forwarding_letter" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 40,
  },
  {
    id: "t_reconciliation",
    source: { kind: "template", templateId: "template_reconciliation_depositor" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "template_reconciliation_depositor" },
    printOrder: 50,
  },
  {
    id: "t_cover",
    source: { kind: "sheet", sheet: "coverPage" },
    scope: "file",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 0,
  },
  {
    id: "t_file_conditional",
    source: { kind: "sheet", sheet: "missingDocumentReport" },
    scope: "file",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_11" },
    printOrder: 99,
  },
];

function build(claimData: ClaimDataModel = EMPTY_CLAIM_DATA) {
  return buildClaimPackageDefinition(RULE_PACK, [nominationAccount()], claimData, OFFICIAL_FORM_LAYOUTS, REGISTRY);
}

describe("Document Engine — trigger evaluation", () => {
  it("includes 'always' entries and engine-selected entries; excludes entries the engine did not select", () => {
    const definition = build();
    const ids = definition.accounts[0]?.documents.map((d) => d.registryId) ?? [];
    expect(ids).toContain("t_always_sheet");
    expect(ids).toContain("t_form_11"); // ROUTE_A selects form_11
    expect(ids).toContain("t_forwarding");
    expect(ids).not.toContain("t_form_14_not_selected"); // no T14 on this claim
    expect(ids).not.toContain("t_reconciliation"); // no name-mismatch flag ticked
  });

  it("evaluates file-scoped triggers against the union of every account's selection", () => {
    const definition = build();
    const fileIds = definition.fileDocuments.map((d) => d.registryId);
    expect(fileIds).toContain("t_cover");
    expect(fileIds).toContain("t_file_conditional"); // form_11 selected on the one account
  });

  it("returns file documents even when there are no accounts, but only 'always' ones", () => {
    const definition = buildClaimPackageDefinition(RULE_PACK, [], EMPTY_CLAIM_DATA, OFFICIAL_FORM_LAYOUTS, REGISTRY);
    expect(definition.accounts).toEqual([]);
    expect(definition.fileDocuments.map((d) => d.registryId)).toEqual(["t_cover"]);
  });
});

describe("Document Engine — print order", () => {
  it("sorts each account's documents by printOrder regardless of registry order", () => {
    const definition = build();
    const orders = definition.accounts[0]?.documents.map((d) => d.printOrder) ?? [];
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    // form_11 (10) comes before the decision sheet (20) in this synthetic registry.
    const ids = definition.accounts[0]?.documents.map((d) => d.registryId) ?? [];
    expect(ids.indexOf("t_form_11")).toBeLessThan(ids.indexOf("t_always_sheet"));
  });
});

describe("Document Engine — auto-fill capability (computed, never authored)", () => {
  it("computes form_11 as partial, with the layout's own auto/manual field split", () => {
    const definition = build();
    const form11 = definition.accounts[0]?.documents.find((d) => d.registryId === "t_form_11");
    expect(form11?.autoFill.capability).toBe("partial");
    // form_11's layout (Milestone 13): 9 claimDataField slots (incl. the
    // newly-wired amount_claimed), 3 manual (to-line, date/place, signature).
    expect(form11?.autoFill.autoFillableFields).toBe(9);
    expect(form11?.autoFill.manualFields).toBe(3);
    expect(form11?.autoFill.filledFields).toBe(0); // empty model
  });

  it("counts currently-filled fields from the Claim Data Model", () => {
    const model: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      claimant: { name: "Asha Devi" },
      depositor: { name: "Ram Prasad" },
      officeName: "Connaught Place HO",
      accountNumbers: { 0: "SB-12345" },
    };
    const definition = build(model);
    const form11 = definition.accounts[0]?.documents.find((d) => d.registryId === "t_form_11");
    expect(form11?.autoFill.filledFields).toBe(4);
  });

  it("computes a fully-wired template as 'partial' (its own signature/date lines still manual), and sheets as 'not_applicable'", () => {
    // Force-include the reconciliation template via an 'always' trigger so
    // its capability is observable on a plain nomination claim.
    const registry: readonly DocumentRegistryEntry[] = [
      { ...REGISTRY[4]!, trigger: { kind: "always" } },
      REGISTRY[0]!,
    ];
    const definition = buildClaimPackageDefinition(
      RULE_PACK,
      [nominationAccount()],
      EMPTY_CLAIM_DATA,
      OFFICIAL_FORM_LAYOUTS,
      registry,
    );
    const recon = definition.accounts[0]?.documents.find((d) => d.registryId === "t_reconciliation");
    // Milestone 13 wired this template fully; only scheme_type (no
    // matching ClaimDataField exists) and the two witness signatures +
    // date/place stay manual.
    expect(recon?.autoFill.capability).toBe("partial");
    expect(recon?.autoFill.autoFillableFields).toBe(10);
    expect(recon?.autoFill.manualFields).toBe(4);
    const sheet = definition.accounts[0]?.documents.find((d) => d.registryId === "t_always_sheet");
    expect(sheet?.autoFill.capability).toBe("not_applicable");
  });

  it("computes the forwarding letter as partial (its blank lines are part-wired since M7, extended in M13)", () => {
    const definition = build();
    const fwd = definition.accounts[0]?.documents.find((d) => d.registryId === "t_forwarding");
    expect(fwd?.autoFill.capability).toBe("partial");
    // office/head-office/depositor/account/amount/claimant/preparer name+designation
    expect(fwd?.autoFill.autoFillableFields).toBe(8);
    expect(fwd?.autoFill.manualFields).toBe(2); // date+place, signature
  });
});

describe("Document Engine — pack-record metadata resolution (no data stated twice)", () => {
  it("resolves a form's title/purpose/signatories and rule reference from its FormDefinition", () => {
    const definition = build();
    const form11 = definition.accounts[0]?.documents.find((d) => d.registryId === "t_form_11");
    expect(form11?.title?.en).toBe("Form 11 — claim application");
    expect(form11?.purpose?.en).toContain("main claim application");
    expect(form11?.signatories?.en).toContain("two witnesses");
    expect(form11?.ruleReference).toBe("https://www.indiapost.gov.in/VAS/Pages/Form.aspx");
    expect(form11?.supportingDocumentIds).toContain("doc_death_certificate");
  });

  it("resolves a template's title and handbookRef", () => {
    const definition = build();
    const fwd = definition.accounts[0]?.documents.find((d) => d.registryId === "t_forwarding");
    expect(fwd?.title?.en).toContain("forwarding letter");
    expect(fwd?.ruleReference).toContain("Blueprint v2 §3.4");
  });

  it("derives signature and witness field labels from the document's own fields", () => {
    const definition = build();
    const form11 = definition.accounts[0]?.documents.find((d) => d.registryId === "t_form_11");
    expect(form11?.signatureFieldLabels.map((l) => l.en)).toEqual(["Signature of claimant"]);
    expect(form11?.witnessFieldLabels.map((l) => l.en)).toEqual(["Witness 1 — name", "Witness 2 — name"]);
  });
});
