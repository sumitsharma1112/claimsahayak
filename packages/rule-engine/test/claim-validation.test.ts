import { describe, expect, it } from "vitest";
import { RULE_PACK, OFFICIAL_FORM_LAYOUTS } from "@claimsahayak/rule-pack";
import { EMPTY_CLAIM_DATA, type ClaimDataModel } from "@claimsahayak/shared-types";
import { evaluateAccount, validateClaimPackage } from "../src/index.js";

const OFFICE_DOCUMENT_TEMPLATES = RULE_PACK.templates.filter((t) =>
  ["template_forwarding_letter", "template_approval_note"].includes(t.id),
);

function routeAAccount(claimData: ClaimDataModel) {
  const { account } = evaluateAccount(
    RULE_PACK,
    "SB",
    {
      q2_who_died: "adult",
      q_armed_forces: false,
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    },
    undefined,
    0,
  );
  return account;
}

describe("validateClaimPackage", () => {
  it("flags every mandatory auto-fill field left empty on a fully-empty Claim Data Model", () => {
    const account = routeAAccount(EMPTY_CLAIM_DATA);
    const issues = validateClaimPackage(RULE_PACK, [account], EMPTY_CLAIM_DATA, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.documentId === "form_11" && i.fieldId === "claimant_name")).toBe(true);
    expect(issues.some((i) => i.documentId === "template_forwarding_letter")).toBe(true);
  });

  it("stops flagging a field once it's filled in", () => {
    const account = routeAAccount(EMPTY_CLAIM_DATA);
    const withoutClaimant = validateClaimPackage(RULE_PACK, [account], EMPTY_CLAIM_DATA, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(withoutClaimant.some((i) => i.documentId === "form_11" && i.fieldId === "claimant_name")).toBe(true);

    const filled: ClaimDataModel = { ...EMPTY_CLAIM_DATA, claimant: { name: "Asha Devi" } };
    const withClaimant = validateClaimPackage(RULE_PACK, [account], filled, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(withClaimant.some((i) => i.documentId === "form_11" && i.fieldId === "claimant_name")).toBe(false);
  });

  it("never flags a manual-only field (no claimDataField declared)", () => {
    const account = routeAAccount(EMPTY_CLAIM_DATA);
    const issues = validateClaimPackage(RULE_PACK, [account], EMPTY_CLAIM_DATA, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(issues.some((i) => i.fieldId === "date_place")).toBe(false);
    expect(issues.some((i) => i.fieldId === "amount_claimed")).toBe(false);
  });

  it("returns no issues once every mandatory field across forms and office documents is filled", () => {
    const account = routeAAccount(EMPTY_CLAIM_DATA);
    const fullyFilled: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      claimant: { name: "Asha Devi", address: "12 MG Road", relationship: "Daughter" },
      depositor: { name: "Ram Prasad" },
      witnesses: [{ name: "Witness One" }, { name: "Witness Two" }],
      accountNumbers: { 0: "SB-12345" },
      officeName: "Connaught Place HO",
    };
    const issues = validateClaimPackage(RULE_PACK, [account], fullyFilled, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(issues).toEqual([]);
  });
});
