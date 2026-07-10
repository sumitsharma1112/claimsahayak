import { describe, expect, it } from "vitest";
import { ALWAYS } from "@claimsahayak/shared-types";
import { collectVarRefs, evaluate } from "../src/condition.js";

describe("condition evaluator", () => {
  it("ALWAYS is vacuously true (empty and[])", () => {
    expect(evaluate(ALWAYS, {})).toBe(true);
  });

  it("and: true only when every child is true", () => {
    expect(evaluate({ and: [{ "==": [1, 1] }, { "==": [2, 2] }] }, {})).toBe(true);
    expect(evaluate({ and: [{ "==": [1, 1] }, { "==": [2, 3] }] }, {})).toBe(false);
  });

  it("or: true when any child is true", () => {
    expect(evaluate({ or: [{ "==": [1, 2] }, { "==": [2, 2] }] }, {})).toBe(true);
    expect(evaluate({ or: [{ "==": [1, 2] }, { "==": [2, 3] }] }, {})).toBe(false);
  });

  it("not: inverts", () => {
    expect(evaluate({ not: { "==": [1, 1] } }, {})).toBe(false);
    expect(evaluate({ not: { "==": [1, 2] } }, {})).toBe(true);
  });

  it("==: resolves var refs on either side", () => {
    expect(evaluate({ "==": [{ var: "answers.q" }, "yes"] }, { "answers.q": "yes" })).toBe(true);
    expect(evaluate({ "==": [{ var: "answers.q" }, "yes"] }, { "answers.q": "no" })).toBe(false);
  });

  it("==: an absent variable is false, never throws", () => {
    expect(evaluate({ "==": [{ var: "answers.missing" }, "yes"] }, {})).toBe(false);
  });

  it(">=: numeric comparison, false for non-numeric or absent operands", () => {
    expect(evaluate({ ">=": [{ var: "derived.monthsSinceDeath" }, 6] }, { "derived.monthsSinceDeath": 6 })).toBe(
      true,
    );
    expect(evaluate({ ">=": [{ var: "derived.monthsSinceDeath" }, 6] }, { "derived.monthsSinceDeath": 5 })).toBe(
      false,
    );
    expect(evaluate({ ">=": [{ var: "derived.monthsSinceDeath" }, 6] }, {})).toBe(false);
    expect(evaluate({ ">=": [{ var: "answers.q" }, 6] }, { "answers.q": "not_a_number" })).toBe(false);
  });

  it("in: membership check, false when the needle is absent", () => {
    expect(evaluate({ in: [{ var: "answers.q2_who_died" }, ["adult", "child", "both"]] }, { "answers.q2_who_died": "child" })).toBe(
      true,
    );
    expect(evaluate({ in: [{ var: "answers.q2_who_died" }, ["adult", "child", "both"]] }, { "answers.q2_who_died": "guardian" })).toBe(
      false,
    );
    expect(evaluate({ in: [{ var: "answers.missing" }, ["a", "b"]] }, {})).toBe(false);
  });

  it("literal operands (no var) compare directly", () => {
    expect(evaluate({ "==": ["a", "a"] }, {})).toBe(true);
    expect(evaluate({ "==": ["a", "b"] }, {})).toBe(false);
  });

  it("collectVarRefs walks every nested branch", () => {
    const condition = {
      and: [
        { "==": [{ var: "answers.a" }, 1] },
        { or: [{ ">=": [{ var: "derived.months" }, { var: "constants.X" }] }, { in: [{ var: "answers.b" }, [1, 2]] }] },
        { not: { "==": [{ var: "account.schemeId" }, "SB"] } },
      ],
    } as const;
    expect(new Set(collectVarRefs(condition))).toEqual(
      new Set(["answers.a", "derived.months", "constants.X", "answers.b", "account.schemeId"]),
    );
  });
});
