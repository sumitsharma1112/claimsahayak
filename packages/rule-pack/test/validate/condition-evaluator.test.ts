import { describe, expect, it } from "vitest";
import type { Condition } from "@claimsahayak/shared-types";
import { evaluateCondition } from "../../src/validate/condition-evaluator.js";

describe("evaluateCondition", () => {
  it("evaluates == against a matching and non-matching literal", () => {
    const c: Condition = { "==": [{ var: "x" }, "yes"] };
    expect(evaluateCondition(c, { x: "yes" })).toBe(true);
    expect(evaluateCondition(c, { x: "no" })).toBe(false);
  });

  it("treats an absent variable as false for ==", () => {
    const c: Condition = { "==": [{ var: "x" }, "yes"] };
    expect(evaluateCondition(c, {})).toBe(false);
  });

  it("evaluates >= numerically, false for non-numeric or absent operands", () => {
    const c: Condition = { ">=": [{ var: "months" }, { var: "threshold" }] };
    expect(evaluateCondition(c, { months: 6, threshold: 6 })).toBe(true);
    expect(evaluateCondition(c, { months: 5, threshold: 6 })).toBe(false);
    expect(evaluateCondition(c, { threshold: 6 })).toBe(false);
  });

  it("evaluates in against a literal haystack", () => {
    const c: Condition = { in: [{ var: "scheme" }, ["RD", "TD", "NSC", "KVP"]] };
    expect(evaluateCondition(c, { scheme: "RD" })).toBe(true);
    expect(evaluateCondition(c, { scheme: "SB" })).toBe(false);
    expect(evaluateCondition(c, {})).toBe(false);
  });

  it("evaluates and/or/not with correct short-circuit semantics", () => {
    const and: Condition = {
      and: [{ "==": [{ var: "a" }, true] }, { "==": [{ var: "b" }, true] }],
    };
    expect(evaluateCondition(and, { a: true, b: true })).toBe(true);
    expect(evaluateCondition(and, { a: true, b: false })).toBe(false);

    const or: Condition = {
      or: [{ "==": [{ var: "a" }, true] }, { "==": [{ var: "b" }, true] }],
    };
    expect(evaluateCondition(or, { a: false, b: true })).toBe(true);
    expect(evaluateCondition(or, { a: false, b: false })).toBe(false);

    const not: Condition = { not: { "==": [{ var: "a" }, true] } };
    expect(evaluateCondition(not, { a: false })).toBe(true);
    expect(evaluateCondition(not, { a: true })).toBe(false);
  });

  it("treats an empty `and` (ALWAYS) as vacuously true", () => {
    const always: Condition = { and: [] };
    expect(evaluateCondition(always, {})).toBe(true);
  });

  it("handles a realistic compound condition (T17-shaped)", () => {
    const t17: Condition = {
      and: [
        { "==": [{ var: "answers.q6_legal_evidence" }, "no"] },
        { "==": [{ var: "answers.q7a_amount" }, "up_to_5_lakh"] },
        {
          ">=": [
            { var: "derived.monthsSinceDeath" },
            { var: "constants.NO_NOMINATION_WAIT_MONTHS" },
          ],
        },
        { "==": [{ var: "answers.q7b_heirs_together" }, "yes"] },
      ],
    };
    expect(
      evaluateCondition(t17, {
        "answers.q6_legal_evidence": "no",
        "answers.q7a_amount": "up_to_5_lakh",
        "derived.monthsSinceDeath": 8,
        "constants.NO_NOMINATION_WAIT_MONTHS": 6,
        "answers.q7b_heirs_together": "yes",
      }),
    ).toBe(true);
    expect(
      evaluateCondition(t17, {
        "answers.q6_legal_evidence": "no",
        "answers.q7a_amount": "up_to_5_lakh",
        "derived.monthsSinceDeath": 3,
        "constants.NO_NOMINATION_WAIT_MONTHS": 6,
        "answers.q7b_heirs_together": "yes",
      }),
    ).toBe(false);
  });
});
