import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { validateAnswers } from "../src/index.js";

function schemeOrThrow(id: string) {
  const scheme = RULE_PACK.schemes.find((s) => s.id === id);
  if (!scheme) throw new Error(`scheme "${id}" missing from pack`);
  return scheme;
}

describe("validateAnswers", () => {
  it("returns no issues for a fully-answered, valid answer set", () => {
    const sb = schemeOrThrow("SB");
    const answers = {
      "q1_schemes.SB": true,
      q2_who_died: "adult",
      q_armed_forces: false,
      q3_holding: "two_names_survivor",
      q4_death_month: "2024-01",
      q9_payment: "own_posb",
      "q10_docs_check.none": true,
    };
    const issues = validateAnswers(RULE_PACK, answers, sb);
    expect(issues).toEqual([]);
  });

  it("flags an answer for a question id that does not exist, without throwing", () => {
    const sb = schemeOrThrow("SB");
    const issues = validateAnswers(RULE_PACK, { not_a_real_question: "x" }, sb);
    expect(issues.some((i) => i.code === "unknown_question")).toBe(true);
  });

  it("flags an unknown option id on a real multi question", () => {
    const sb = schemeOrThrow("SB");
    const issues = validateAnswers(RULE_PACK, { "q10_docs_check.not_a_real_option": true }, sb);
    expect(issues.some((i) => i.code === "unknown_option")).toBe(true);
  });

  it("flags a visible question that has not been answered yet, as a non-fatal issue", () => {
    const sb = schemeOrThrow("SB");
    // q2_who_died is always visible (ALWAYS) but left unanswered here.
    const issues = validateAnswers(RULE_PACK, {}, sb);
    expect(issues.some((i) => i.code === "unanswered_question" && i.path === "q2_who_died")).toBe(true);
  });

  it("never throws, even for a completely empty answer set", () => {
    const sb = schemeOrThrow("SB");
    expect(() => validateAnswers(RULE_PACK, {}, sb)).not.toThrow();
  });
});
