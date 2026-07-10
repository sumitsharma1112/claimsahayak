import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { resolveVisibleQuestions } from "../src/index.js";

function schemeOrThrow(id: string) {
  const scheme = RULE_PACK.schemes.find((s) => s.id === id);
  if (!scheme) throw new Error(`scheme "${id}" missing from pack`);
  return scheme;
}

describe("question visibility", () => {
  it("q1a_nsc_kvp_format is only visible when NSC or KVP was ticked", () => {
    const scheme = schemeOrThrow("NSC");
    const withNsc = resolveVisibleQuestions(RULE_PACK, scheme, { "q1_schemes.NSC": true }, undefined);
    expect(withNsc.some((q) => q.id === "q1a_nsc_kvp_format")).toBe(true);

    const withoutNsc = resolveVisibleQuestions(RULE_PACK, scheme, { "q1_schemes.SB": true }, undefined);
    expect(withoutNsc.some((q) => q.id === "q1a_nsc_kvp_format")).toBe(false);
  });

  it("q3_holding is hidden once the scheme cannot be joint (PPF)", () => {
    const ppf = schemeOrThrow("PPF");
    const questions = resolveVisibleQuestions(RULE_PACK, ppf, { q2_who_died: "adult" }, undefined);
    expect(questions.some((q) => q.id === "q3_holding")).toBe(false);
  });

  it("q3_holding is visible for a jointable scheme once the account holder (adult) died", () => {
    const sb = schemeOrThrow("SB");
    const questions = resolveVisibleQuestions(RULE_PACK, sb, { q2_who_died: "adult" }, undefined);
    expect(questions.some((q) => q.id === "q3_holding")).toBe(true);
  });

  it("q9_payment is hidden once the claimant chose to continue the account", () => {
    const rd = schemeOrThrow("RD");
    const questions = resolveVisibleQuestions(
      RULE_PACK,
      rd,
      { q2_who_died: "adult", q8_maturity: "not_yet_matured", q8_close_or_continue: "continue" },
      undefined,
    );
    expect(questions.some((q) => q.id === "q9_payment")).toBe(false);
  });

  it("q4_death_month is visible whenever someone (adult/child/both) died, never for a guardian", () => {
    const sb = schemeOrThrow("SB");
    expect(
      resolveVisibleQuestions(RULE_PACK, sb, { q2_who_died: "adult" }, undefined).some(
        (q) => q.id === "q4_death_month",
      ),
    ).toBe(true);
    expect(
      resolveVisibleQuestions(RULE_PACK, sb, { q2_who_died: "guardian" }, undefined).some(
        (q) => q.id === "q4_death_month",
      ),
    ).toBe(false);
  });
});
