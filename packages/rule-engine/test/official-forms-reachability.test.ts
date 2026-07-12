import { describe, expect, it } from "vitest";
import { RULE_PACK, OFFICIAL_FORM_LAYOUTS } from "@claimsahayak/rule-pack";
import { evaluateAccount, resolveDocumentSelection } from "../src/index.js";

/**
 * Milestone 9 — proves the 6 newly-authored `OfficialFormLayout`s
 * (form_10_nomination/form_aof_kyc/form_sb7b/form_scss_form4/form_nc54a/
 * form_nc54b) are actually reachable from real routes/overlays, correcting
 * the M7 record which incorrectly claimed none of them were reachable
 * today. `resolveDocumentSelection` finding a `DocumentSelectionEntry`
 * whose `form.id` has a matching entry in `OFFICIAL_FORM_LAYOUTS` is
 * exactly the condition `ClaimPackage.tsx`'s `AutoFilledDocuments` checks
 * before rendering `OfficialFormView` — so this is a direct proof the
 * Claim File will actually surface these forms, not just that the data
 * exists in isolation.
 */
const layoutsById = new Map(OFFICIAL_FORM_LAYOUTS.map((l) => [l.formId, l]));

describe("Official form reachability — Milestone 9 forms", () => {
  it("form_10_nomination and form_aof_kyc surface via CONTINUE_ADDON (RD, continue)", () => {
    const { account } = evaluateAccount(
      RULE_PACK,
      "RD",
      {
        q2_who_died: "adult",
        q_armed_forces: false,
        q3_holding: "one_name",
        q5_nomination: "yes_alive",
        q8_maturity: "not_yet_matured",
        q8_close_or_continue: "continue",
        q9_payment: "own_posb",
      },
      undefined,
      0,
    );
    const selection = resolveDocumentSelection(RULE_PACK, account);
    const nomination = selection.find((e) => e.form?.id === "form_10_nomination");
    const aofKyc = selection.find((e) => e.form?.id === "form_aof_kyc");
    expect(nomination).toBeDefined();
    expect(aofKyc).toBeDefined();
    expect(layoutsById.has("form_10_nomination")).toBe(true);
    expect(layoutsById.has("form_aof_kyc")).toBe(true);
  });

  it("form_nc54a and form_nc54b surface via the passbook_lost overlay on an NSC claim", () => {
    const { account } = evaluateAccount(
      RULE_PACK,
      "NSC",
      {
        q1a_nsc_kvp_format: "certificates",
        q2_who_died: "adult",
        q_armed_forces: false,
        q5_nomination: "yes_alive",
        q9_payment: "own_posb",
        "q10_docs_check.passbook_lost": true,
      },
      undefined,
      0,
    );
    const selection = resolveDocumentSelection(RULE_PACK, account);
    expect(selection.find((e) => e.form?.id === "form_nc54a")).toBeDefined();
    expect(selection.find((e) => e.form?.id === "form_nc54b")).toBeDefined();
    expect(layoutsById.has("form_nc54a")).toBe(true);
    expect(layoutsById.has("form_nc54b")).toBe(true);
  });

  it("form_scss_form4 surfaces via the scss_spouse_continuing overlay", () => {
    const { account } = evaluateAccount(
      RULE_PACK,
      "SCSS",
      {
        q2_who_died: "adult",
        q_armed_forces: false,
        q3_holding: "two_names_survivor",
        q9_payment: "own_posb",
        "q10_docs_check.scss_spouse_continuing": true,
      },
      undefined,
      0,
    );
    const selection = resolveDocumentSelection(RULE_PACK, account);
    expect(selection.find((e) => e.form?.id === "form_scss_form4")).toBeDefined();
    expect(layoutsById.has("form_scss_form4")).toBe(true);
  });

  it("form_sb7b surfaces via ROUTE_SSA_MINOR (SSA, child died)", () => {
    const { account } = evaluateAccount(RULE_PACK, "SSA", { q2_who_died: "child" }, undefined, 0);
    const selection = resolveDocumentSelection(RULE_PACK, account);
    expect(selection.find((e) => e.form?.id === "form_sb7b")).toBeDefined();
    expect(layoutsById.has("form_sb7b")).toBe(true);
  });

  it("every authored layout's claimDataField-tagged fields resolve through the same closed union as the original four forms", () => {
    // Structural sanity: every OfficialFormField.claimDataField (if set) is
    // a real ClaimDataField — TypeScript already enforces this at compile
    // time (the array is typed `readonly OfficialFormLayout[]`), so this
    // just confirms the array actually contains all 10 forms, not fewer.
    const formIds = OFFICIAL_FORM_LAYOUTS.map((l) => l.formId);
    expect(formIds).toEqual(
      expect.arrayContaining([
        "form_11",
        "form_13",
        "form_14",
        "form_15",
        "form_10_nomination",
        "form_aof_kyc",
        "form_sb7b",
        "form_scss_form4",
        "form_nc54a",
        "form_nc54b",
      ]),
    );
    expect(formIds.length).toBe(10);
  });
});
