import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { applyAnswerChange } from "../src/index.js";

describe("answer invalidation cascade", () => {
  it("changing q2_who_died removes every downstream answer it declares in invalidates[]", () => {
    const previous = {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    };
    const result = applyAnswerChange(RULE_PACK, previous, "q2_who_died", { q2_who_died: "guardian" });

    expect(result.answers.q2_who_died).toBe("guardian");
    expect(result.answers.q3_holding).toBeUndefined();
    expect(result.answers.q5_nomination).toBeUndefined();
    expect(result.answers.q9_payment).toBeUndefined();
    expect(result.invalidatedQuestionIds).toContain("q3_holding");
    expect(result.removedKeys.slice().sort()).toEqual(["q3_holding", "q5_nomination", "q9_payment"].sort());
  });

  it("removes every sub-key of an invalidated multi-select question", () => {
    const previous = {
      q2_who_died: "adult",
      q5_nomination: "yes_complication",
      "q5a_complication.predeceased_no_others": true,
      "q5a_complication.nominee_is_minor": false,
    };
    const result = applyAnswerChange(RULE_PACK, previous, "q2_who_died", { q2_who_died: "child" });

    expect(result.answers["q5a_complication.predeceased_no_others"]).toBeUndefined();
    expect(result.answers["q5a_complication.nominee_is_minor"]).toBeUndefined();
    expect(result.removedKeys).toContain("q5a_complication.predeceased_no_others");
    expect(result.removedKeys).toContain("q5a_complication.nominee_is_minor");
  });

  it("a question with no invalidates[] entries leaves everything else untouched", () => {
    const previous = { q2_who_died: "adult", q7a_amount: "up_to_5_lakh" };
    const result = applyAnswerChange(RULE_PACK, previous, "q7a_amount", { q7a_amount: "more_than_5_lakh" });

    expect(result.invalidatedQuestionIds).toEqual([]);
    expect(result.removedKeys).toEqual([]);
    expect(result.answers.q2_who_died).toBe("adult");
    expect(result.answers.q7a_amount).toBe("more_than_5_lakh");
  });

  it("changing q1_schemes clears essentially the whole downstream wizard", () => {
    const previous = {
      "q1_schemes.SB": true,
      q2_who_died: "adult",
      q3_holding: "one_name",
      q9_payment: "own_posb",
      q10_docs_check: "irrelevant-placeholder",
    };
    const result = applyAnswerChange(RULE_PACK, previous, "q1_schemes", { "q1_schemes.RD": true });

    expect(result.answers["q1_schemes.RD"]).toBe(true);
    expect(result.answers.q2_who_died).toBeUndefined();
    expect(result.answers.q10_docs_check).toBeUndefined();
  });
});
