import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { evaluateAccount, resolveDocumentSelection } from "../src/index.js";

/**
 * Milestone 7 — resolveDocumentSelection is a thin join over an already-
 * resolved AccountChecklist's sections; it must never re-decide anything
 * routing/output-selection already decided (Part 9 — no duplicated Rule
 * Engine logic).
 */
describe("resolveDocumentSelection", () => {
  it("joins ROUTE_A's checklist items back to their real FormDefinition/DocumentDefinition records", () => {
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
    const selection = resolveDocumentSelection(RULE_PACK, account);
    expect(selection.length).toBeGreaterThan(0);

    const form11 = selection.find((e) => e.form?.id === "form_11");
    expect(form11).toBeDefined();
    expect(form11?.form?.name.en).toContain("Form 11");
    expect(form11?.sectionId).toBe("forms");

    const deathCert = selection.find((e) => e.document?.id === "doc_death_certificate");
    expect(deathCert).toBeDefined();
    expect(deathCert?.sectionId).toBe("documents");
  });

  it("includes ROUTE_C's affidavit/disclaimer/indemnity-bond forms, correctly sectioned", () => {
    const { account } = evaluateAccount(
      RULE_PACK,
      "SB",
      {
        q2_who_died: "adult",
        q_armed_forces: false,
        q3_holding: "one_name",
        q5_nomination: "no",
        q6_legal_evidence: "no",
        q_dispute: false,
        q7a_amount: "up_to_5_lakh",
        q7b_heirs_together: "yes",
        q9_payment: "own_posb",
      },
      { monthsSinceDeath: 12, yearsSinceDeath: 1 },
      0,
    );
    const selection = resolveDocumentSelection(RULE_PACK, account);

    const affidavit = selection.find((e) => e.form?.id === "form_13");
    expect(affidavit?.sectionId).toBe("affidavits");
    const bond = selection.find((e) => e.form?.id === "form_15");
    expect(bond?.sectionId).toBe("indemnityBonds");
  });

  it("returns an empty list for an account with no sections (e.g. an out-of-scope card terminal)", () => {
    const { account } = evaluateAccount(RULE_PACK, "SB", { "q1_schemes.OLD_UNSURE": true }, undefined, 0);
    expect(resolveDocumentSelection(RULE_PACK, account)).toEqual([]);
  });
});
