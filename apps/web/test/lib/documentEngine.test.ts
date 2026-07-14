import { describe, expect, it } from "vitest";
import { EMPTY_CLAIM_DATA } from "@claimsahayak/shared-types";
import { RULE_PACK, OFFICIAL_FORM_LAYOUTS } from "@claimsahayak/rule-pack";
import { buildClaimPackageDefinition, evaluateAccount } from "@claimsahayak/rule-engine";
import { CLAIM_DOCUMENT_REGISTRY } from "@/lib/claimDocumentRegistry";

/**
 * Milestone 12 — the four supported valid-nomination scenarios, driven
 * through the REAL Rule Engine + the REAL Document Registry: for each
 * scenario, the Document Engine's Complete Claim Package definition must
 * contain every required document and none of the out-of-scope ones.
 * Registry integrity (unique ids/orders, every id resolves against the
 * pack) is proven here too, so a future registry entry with a typo'd
 * form/template/document id fails CI instead of silently never rendering.
 */

const BASE_NOMINATION_ANSWERS = {
  q2_who_died: "adult",
  q_armed_forces: false,
  q3_holding: "one_name",
  q5_nomination: "yes_alive",
  q9_payment: "own_posb",
} as const;

function definitionFor(answers: Record<string, unknown>) {
  const { account } = evaluateAccount(
    RULE_PACK,
    "SB",
    answers as Parameters<typeof evaluateAccount>[2],
    undefined,
    0,
  );
  expect(account.decision?.decisionStatus).toBe("payable");
  return buildClaimPackageDefinition(RULE_PACK, [account], EMPTY_CLAIM_DATA, OFFICIAL_FORM_LAYOUTS, CLAIM_DOCUMENT_REGISTRY);
}

function accountRegistryIds(definition: ReturnType<typeof definitionFor>): readonly string[] {
  return definition.accounts[0]?.documents.map((d) => d.registryId) ?? [];
}

/** Every document a plain payable nomination file always carries. */
const ALWAYS_EXPECTED = [
  "reg_decision_summary",
  "reg_authority_sheet",
  "reg_limit_sheet",
  "reg_references_sheet",
  "reg_form_11",
  "reg_forwarding_letter",
  "reg_approval_note",
  "reg_office_note",
  "reg_witness_sheet",
  "reg_office_checklist",
];

describe("Scenario 1 — valid nomination, single nominee", () => {
  const definition = definitionFor(BASE_NOMINATION_ANSWERS);
  const ids = accountRegistryIds(definition);

  it("contains every always-required document", () => {
    for (const id of ALWAYS_EXPECTED) {
      expect(ids, id).toContain(id);
    }
  });

  it("contains the file chrome (cover, index, missing-document report)", () => {
    expect(definition.fileDocuments.map((d) => d.registryId)).toEqual([
      "reg_cover_page",
      "reg_file_index",
      "reg_missing_report",
    ]);
  });

  it("contains nothing this scenario does not need", () => {
    for (const id of [
      "reg_form_13",
      "reg_form_14",
      "reg_form_15",
      "reg_reconciliation_depositor",
      "reg_reconciliation_claimant",
      "reg_minor_alive_declaration",
      "reg_form_10_nomination",
      "reg_form_aof_kyc",
    ]) {
      expect(ids, id).not.toContain(id);
    }
  });

  it("orders the documents by physical filing position", () => {
    const orders = definition.accounts[0]?.documents.map((d) => d.printOrder) ?? [];
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("Scenario 2 — valid nomination, depositor name difference", () => {
  const definition = definitionFor({
    ...BASE_NOMINATION_ANSWERS,
    "q10_docs_check.name_mismatch_depositor": true,
  });
  const ids = accountRegistryIds(definition);

  it("adds the depositor reconciliation-certificate request, and only that one", () => {
    expect(ids).toContain("reg_reconciliation_depositor");
    expect(ids).not.toContain("reg_reconciliation_claimant");
  });

  it("keeps every always-required document", () => {
    for (const id of ALWAYS_EXPECTED) {
      expect(ids, id).toContain(id);
    }
  });

  it("names the reconciliation certificate as the request's supporting document", () => {
    const recon = definition.accounts[0]?.documents.find((d) => d.registryId === "reg_reconciliation_depositor");
    expect(recon?.supportingDocumentIds).toContain("doc_reconciliation_certificate");
    expect(recon?.requirement).toBe("conditional");
  });
});

describe("Scenario 3 — valid nomination, claimant (nominee) name difference", () => {
  const definition = definitionFor({
    ...BASE_NOMINATION_ANSWERS,
    "q10_docs_check.name_mismatch_own": true,
  });
  const ids = accountRegistryIds(definition);

  it("adds the claimant reconciliation-certificate request, and only that one", () => {
    expect(ids).toContain("reg_reconciliation_claimant");
    expect(ids).not.toContain("reg_reconciliation_depositor");
  });
});

describe("Scenario 4 — valid nomination, multiple nominees (not all can attend)", () => {
  const definition = definitionFor({
    ...BASE_NOMINATION_ANSWERS,
    q5_nomination: "yes_complication",
    "q5a_complication.cannot_come_together": true,
  });
  const ids = accountRegistryIds(definition);

  it("adds the Form 14 disclaimer", () => {
    expect(ids).toContain("reg_form_14");
  });

  it("names the absent nominees' ID copies as Form 14's supporting document", () => {
    const form14 = definition.accounts[0]?.documents.find((d) => d.registryId === "reg_form_14");
    expect(form14?.supportingDocumentIds).toContain("doc_absent_nominee_id");
    expect(form14?.requirement).toBe("conditional");
  });

  it("keeps every always-required document and none of the other conditionals", () => {
    for (const id of ALWAYS_EXPECTED) {
      expect(ids, id).toContain(id);
    }
    expect(ids).not.toContain("reg_reconciliation_depositor");
    expect(ids).not.toContain("reg_minor_alive_declaration");
  });
});

describe("Out-of-scope regression — minor nominee (M10 behavior preserved)", () => {
  it("still includes the minor-alive declaration exactly when the engine required the certificate", () => {
    const withMinor = definitionFor({
      ...BASE_NOMINATION_ANSWERS,
      q5_nomination: "yes_complication",
      "q5a_complication.nominee_is_minor": true,
    });
    expect(accountRegistryIds(withMinor)).toContain("reg_minor_alive_declaration");

    const withoutMinor = definitionFor(BASE_NOMINATION_ANSWERS);
    expect(accountRegistryIds(withoutMinor)).not.toContain("reg_minor_alive_declaration");
  });
});

describe("Document Registry integrity", () => {
  it("has globally unique registry ids and print orders", () => {
    const ids = CLAIM_DOCUMENT_REGISTRY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = CLAIM_DOCUMENT_REGISTRY.map((e) => e.printOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("references only form/template ids that exist in the Rule Pack", () => {
    const formIds = new Set(RULE_PACK.forms.map((f) => f.id));
    const templateIds = new Set(RULE_PACK.templates.map((t) => t.id));
    for (const entry of CLAIM_DOCUMENT_REGISTRY) {
      if (entry.source.kind === "officialForm") {
        expect(formIds.has(entry.source.formId), entry.id).toBe(true);
      }
      if (entry.source.kind === "template") {
        expect(templateIds.has(entry.source.templateId), entry.id).toBe(true);
      }
    }
  });

  it("every engineSelected trigger refId resolves to a real pack form/document/template", () => {
    const known = new Set([
      ...RULE_PACK.forms.map((f) => f.id),
      ...RULE_PACK.documents.map((d) => d.id),
      ...RULE_PACK.templates.map((t) => t.id),
    ]);
    for (const entry of CLAIM_DOCUMENT_REGISTRY) {
      if (entry.trigger.kind === "engineSelected") {
        expect(known.has(entry.trigger.refId), `${entry.id}: ${entry.trigger.refId}`).toBe(true);
      }
    }
  });

  it("every supporting-document id resolves to a real claimant-brought DocumentDefinition", () => {
    const documentIds = new Set(RULE_PACK.documents.map((d) => d.id));
    for (const entry of CLAIM_DOCUMENT_REGISTRY) {
      for (const id of entry.supportingDocumentIds ?? []) {
        expect(documentIds.has(id), `${entry.id}: ${id}`).toBe(true);
      }
    }
  });

  it("covers all 10 official forms, so a form selected on any route always has a registry entry", () => {
    const registryFormIds = CLAIM_DOCUMENT_REGISTRY.flatMap((e) =>
      e.source.kind === "officialForm" ? [e.source.formId] : [],
    );
    expect(new Set(registryFormIds).size).toBe(RULE_PACK.forms.length);
  });
});
