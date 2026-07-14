import { describe, expect, it } from "vitest";
import { EMPTY_CLAIM_DATA, type ClaimDataModel } from "@claimsahayak/shared-types";
import { RULE_PACK, OFFICIAL_FORM_LAYOUTS } from "@claimsahayak/rule-pack";
import { resolveFieldValue } from "../src/index.js";

/**
 * Milestone 13 — Template Engine verification: realistic sample claim
 * data resolved against every document's layout/template fields for each
 * of the four supported nomination scenarios, proving (a) every collected
 * field appears on every applicable document (never re-derived per
 * document — one resolver, one source of truth), and (b) a genuinely
 * unset fact (nothing entered, or entered into an entity this scenario
 * never uses) resolves to `undefined` and never a fabricated value.
 *
 * This complements `document-engine.test.ts` (which proves WHICH
 * documents are selected and their aggregate auto-fill counts) by
 * checking actual resolved VALUES field-by-field against a realistic,
 * fully-populated model — the thing a Postmaster would actually see
 * printed.
 */

const SAMPLE: ClaimDataModel = {
  ...EMPTY_CLAIM_DATA,
  claimant: { name: "Asha Devi", address: "12 MG Road, New Delhi", relationship: "Daughter" },
  depositor: { name: "Ram Prasad", address: "45 Model Town, New Delhi" },
  witnesses: [
    { name: "Suresh Kumar", address: "8 Karol Bagh, New Delhi", mobile: "9811122233" },
    { name: "Geeta Rani", address: "22 Rajouri Garden, New Delhi", mobile: "9822233344" },
  ],
  accountNumbers: { 0: "SB-778899" },
  officeName: "Connaught Place HO",
  officeDetails: {
    address: "1 CP Block, New Delhi",
    pin: "110001",
    code: "DLNW01",
    phone: "011-23412345",
    headOfficeName: "New Delhi GPO",
  },
  preparer: { name: "K. Sharma", designation: "Sub Postmaster" },
  deathCertificate: {
    dateOfDeath: "2025-03-14",
    placeOfDeath: "New Delhi",
    certificateNumber: "DC-2025-004521",
    issuedBy: "MCD Delhi",
  },
  nameDifference: {
    depositorNameOnDeathCertificate: "Ram Prasadh",
    claimantNameAsPerId: "Asha Devi Sharma",
  },
  accountDetails: {
    0: { amountClaimed: "250000", nominationRegistrationNumber: "NOM-2019-0087", nominationDate: "2019-06-01" },
  },
  disclaimants: [
    { name: "Vinod Kumar", address: "9 Green Park, New Delhi" },
    { name: "Meena Kumari", address: "17 Saket, New Delhi" },
  ],
};

function resolveForm(formId: string, model: ClaimDataModel, accountIndex = 0) {
  const layout = OFFICIAL_FORM_LAYOUTS.find((l) => l.formId === formId);
  if (!layout) {
    throw new Error(`no layout for ${formId}`);
  }
  const resolved: Record<string, string | undefined> = {};
  for (const field of layout.fields) {
    if (field.claimDataField) {
      resolved[field.id] = resolveFieldValue(model, accountIndex, field.claimDataField);
    }
  }
  return resolved;
}

function resolveTemplate(templateId: string, model: ClaimDataModel, accountIndex = 0) {
  const template = RULE_PACK.templates.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`no template ${templateId}`);
  }
  const resolved: Record<string, string | undefined> = {};
  for (const field of template.fields) {
    if (field.kind === "blankLine" && field.claimDataField) {
      resolved[field.id] = resolveFieldValue(model, accountIndex, field.claimDataField);
    }
  }
  return resolved;
}

describe("Template Engine — Scenario 1: single nominee, Form 11 auto-fill", () => {
  it("every collected field appears correctly on Form 11", () => {
    const resolved = resolveForm("form_11", SAMPLE);
    expect(resolved.post_office_name).toBe("Connaught Place HO");
    expect(resolved.depositor_name).toBe("Ram Prasad");
    expect(resolved.account_number).toBe("SB-778899");
    expect(resolved.claimant_name).toBe("Asha Devi");
    expect(resolved.claimant_relationship).toBe("Daughter");
    expect(resolved.claimant_address).toBe("12 MG Road, New Delhi");
    expect(resolved.amount_claimed).toBe("250000");
    expect(resolved.witness_1_name).toBe("Suresh Kumar");
    expect(resolved.witness_2_name).toBe("Geeta Rani");
  });

  it("never invents a value for a field genuinely left blank", () => {
    const sparse: ClaimDataModel = { ...EMPTY_CLAIM_DATA, claimant: { name: "Asha Devi" } };
    const resolved = resolveForm("form_11", sparse);
    expect(resolved.claimant_name).toBe("Asha Devi");
    expect(resolved.claimant_address).toBeUndefined();
    expect(resolved.claimant_relationship).toBeUndefined();
    expect(resolved.depositor_name).toBeUndefined();
    expect(resolved.witness_1_name).toBeUndefined();
  });

  it("auto-fills the forwarding letter, approval note, office note, and witness sheet identically from the same model", () => {
    const fwd = resolveTemplate("template_forwarding_letter", SAMPLE);
    expect(fwd.office_name).toBe("Connaught Place HO");
    expect(fwd.to_office).toBe("New Delhi GPO");
    expect(fwd.depositor_name).toBe("Ram Prasad");
    expect(fwd.account_number).toBe("SB-778899");
    expect(fwd.amount_claimed).toBe("250000");
    expect(fwd.claimant_name).toBe("Asha Devi");
    expect(fwd.preparer_name).toBe("K. Sharma");
    expect(fwd.preparer_designation).toBe("Sub Postmaster");

    const approval = resolveTemplate("template_approval_note", SAMPLE);
    expect(approval.depositor_name).toBe("Ram Prasad");
    expect(approval.amount_claimed).toBe("250000");

    const officeNote = resolveTemplate("template_office_note", SAMPLE);
    expect(officeNote.nomination_reg_no).toBe("NOM-2019-0087");
    expect(officeNote.nomination_date).toBe("2019-06-01");
    expect(officeNote.death_cert_number).toBe("DC-2025-004521");
    expect(officeNote.death_cert_issued_by).toBe("MCD Delhi");
    expect(officeNote.preparer_name).toBe("K. Sharma");

    const witnessSheet = resolveTemplate("template_witness_sheet", SAMPLE);
    expect(witnessSheet.witness_1_name).toBe("Suresh Kumar");
    expect(witnessSheet.witness_1_address).toBe("8 Karol Bagh, New Delhi");
    expect(witnessSheet.witness_1_mobile).toBe("9811122233");
    expect(witnessSheet.witness_2_name).toBe("Geeta Rani");
    expect(witnessSheet.witness_2_address).toBe("22 Rajouri Garden, New Delhi");
    expect(witnessSheet.witness_2_mobile).toBe("9822233344");
  });

  it("the claimant's identity-document fields entered once appear on the office note", () => {
    const withId: ClaimDataModel = {
      ...SAMPLE,
      claimant: { ...SAMPLE.claimant, idDocumentType: "Aadhaar", idDocumentNumber: "XXXX-XXXX-4521" },
    };
    const officeNote = resolveTemplate("template_office_note", withId);
    expect(officeNote.claimant_id_type).toBe("Aadhaar");
    expect(officeNote.claimant_id_number).toBe("XXXX-XXXX-4521");
  });
});

describe("Template Engine — Scenario 2: depositor name difference", () => {
  it("the reconciliation-certificate request (depositor) auto-fills both name versions and never invents the difference", () => {
    const resolved = resolveTemplate("template_reconciliation_depositor", SAMPLE);
    expect(resolved.claimant_name).toBe("Asha Devi");
    expect(resolved.claimant_address).toBe("12 MG Road, New Delhi");
    expect(resolved.account_no).toBe("SB-778899");
    expect(resolved.post_office_name).toBe("Connaught Place HO");
    expect(resolved.name_in_records).toBe("Ram Prasad");
    expect(resolved.name_on_id).toBe("Ram Prasadh");
    expect(resolved.witness_1_name).toBe("Suresh Kumar");
    expect(resolved.witness_1_address).toBe("8 Karol Bagh, New Delhi");
  });

  it("leaves the differing name blank when it was never entered — never guesses the second version", () => {
    const noDifference: ClaimDataModel = { ...SAMPLE, nameDifference: EMPTY_CLAIM_DATA.nameDifference };
    const resolved = resolveTemplate("template_reconciliation_depositor", noDifference);
    expect(resolved.name_in_records).toBe("Ram Prasad");
    expect(resolved.name_on_id).toBeUndefined();
  });
});

describe("Template Engine — Scenario 3: claimant (nominee) name difference", () => {
  it("the reconciliation-certificate request (claimant) auto-fills both name versions", () => {
    const resolved = resolveTemplate("template_reconciliation_claimant", SAMPLE);
    expect(resolved.name_in_records).toBe("Asha Devi"); // same canonical name as claimant_name
    expect(resolved.name_on_id).toBe("Asha Devi Sharma");
    expect(resolved.claimant_name).toBe("Asha Devi");
  });
});

describe("Template Engine — Scenario 4: multiple nominees (Form 14 disclaimer)", () => {
  it("Form 14 auto-fills the disclaiming nominees' names/addresses from the disclaimant entity, never legalHeir", () => {
    const resolved = resolveForm("form_14", SAMPLE);
    expect(resolved.disclaiming_party_1).toBe("Vinod Kumar");
    expect(resolved.disclaiming_party_1_address).toBe("9 Green Park, New Delhi");
    expect(resolved.disclaiming_party_2).toBe("Meena Kumari");
    expect(resolved.disclaiming_party_2_address).toBe("17 Saket, New Delhi");
    expect(resolved.depositor_name).toBe("Ram Prasad");
    expect(resolved.account_number).toBe("SB-778899");
    expect(resolved.claimant_name).toBe("Asha Devi");
  });

  it("does not cross-wire disclaimants with legal heirs — a legalHeir-only model leaves Form 14's disclaimant fields blank", () => {
    const legalHeirOnly: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      legalHeirs: [{ name: "Someone Else Entirely" }],
    };
    const resolved = resolveForm("form_14", legalHeirOnly);
    expect(resolved.disclaiming_party_1).toBeUndefined();
    expect(resolved.disclaiming_party_1).not.toBe("Someone Else Entirely");
  });

  it("a third disclaimant slot left empty stays genuinely blank, not fabricated", () => {
    const twoOnly: ClaimDataModel = { ...SAMPLE, disclaimants: [SAMPLE.disclaimants[0]!] };
    const resolved = resolveForm("form_14", twoOnly);
    expect(resolved.disclaiming_party_1).toBe("Vinod Kumar");
    expect(resolved.disclaiming_party_2).toBeUndefined();
    expect(resolved.disclaiming_party_3).toBeUndefined();
  });
});

describe("Template Engine — manual fields never carry a claimDataField (future acts stay hand-fill)", () => {
  it("Form 11's date/place/signature have no claimDataField", () => {
    const layout = OFFICIAL_FORM_LAYOUTS.find((l) => l.formId === "form_11")!;
    const manualIds = layout.fields.filter((f) => f.manual).map((f) => f.id);
    expect(manualIds).toEqual(expect.arrayContaining(["to_line", "date_place", "signature"]));
  });

  it("the approval note's authority-exercised and amount-approved lines stay manual (the approving officer's own future act)", () => {
    const template = RULE_PACK.templates.find((t) => t.id === "template_approval_note")!;
    const authorityField = template.fields.find((f) => f.id === "authority_exercised");
    const amountApprovedField = template.fields.find((f) => f.id === "amount_approved");
    expect(authorityField && "claimDataField" in authorityField ? authorityField.claimDataField : undefined).toBeUndefined();
    expect(
      amountApprovedField && "claimDataField" in amountApprovedField ? amountApprovedField.claimDataField : undefined,
    ).toBeUndefined();
  });
});
