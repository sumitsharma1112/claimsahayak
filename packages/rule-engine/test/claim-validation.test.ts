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
    expect(issues.some((i) => i.fieldId === "signature")).toBe(false);
  });

  it("flags account.amountClaimed on the forwarding letter once it's wired (Milestone 13), and stops once entered", () => {
    // Milestone 16 note: form_11's own application text has no "amount
    // claimed" blank at all — the real form (SB Order 31/2020) only ever
    // asks for "the entire amount", never a specific figure; the amount
    // only appears in the office-use/acquittance section as the
    // sanctioning/receiving authority's own future act. account.amountClaimed
    // still auto-fills the (ClaimSahayak-composed) forwarding letter, so
    // this test moved there.
    const account = routeAAccount(EMPTY_CLAIM_DATA);
    const empty = validateClaimPackage(RULE_PACK, [account], EMPTY_CLAIM_DATA, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(empty.some((i) => i.documentId === "template_forwarding_letter" && i.fieldId === "amount_claimed")).toBe(true);

    const filled: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      accountDetails: { 0: { amountClaimed: "250000", nominationRegistrationNumber: "", nominationDate: "" } },
    };
    const withAmount = validateClaimPackage(RULE_PACK, [account], filled, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(withAmount.some((i) => i.documentId === "template_forwarding_letter" && i.fieldId === "amount_claimed")).toBe(
      false,
    );
  });

  it("returns no issues once every mandatory field across forms and office documents is filled", () => {
    const account = routeAAccount(EMPTY_CLAIM_DATA);
    const fullyFilled: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      claimant: { name: "Asha Devi", address: "12 MG Road", relationship: "Daughter", mobile: "9811100000" },
      depositor: { name: "Ram Prasad" },
      witnesses: [
        { name: "Witness One", address: "1 Some Road", mobile: "9811100001" },
        { name: "Witness Two", address: "2 Some Road", mobile: "9811100002" },
      ],
      accountNumbers: { 0: "SB-12345" },
      officeName: "Connaught Place HO",
      officeDetails: {
        address: "1 CP Block",
        pin: "110001",
        code: "DL01",
        phone: "011-12345678",
        headOfficeName: "New Delhi GPO",
      },
      preparer: { name: "K. Sharma", designation: "Sub Postmaster" },
      accountDetails: { 0: { amountClaimed: "250000", nominationRegistrationNumber: "", nominationDate: "" } },
      // Milestone 16: the real Form 11 acquittance prints BOTH "PO Savings
      // Account No." and "Bank Account No." as alternatives ("transfer to
      // ... or ...") — a real claim only ever uses one, so this fixture
      // (which must leave zero issues) fills both; a genuine claim leaving
      // the unused one blank is expected and correct, not a bug.
      payment: { bankName: "", bankBranch: "", bankAccountNumber: "1234567890", bankIfsc: "IPOS0000001", posbAccountNumber: "SB-99999" },
    };
    const issues = validateClaimPackage(RULE_PACK, [account], fullyFilled, OFFICIAL_FORM_LAYOUTS, OFFICE_DOCUMENT_TEMPLATES);
    expect(issues).toEqual([]);
  });
});
