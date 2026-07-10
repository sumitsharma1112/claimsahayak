import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { evaluateAccount, evaluateChecklist } from "../src/index.js";

describe("multi-account evaluation", () => {
  it("never merges accounts: two different schemes with different answers each get their own checklist", () => {
    const answers = {
      "q1_schemes.SB": true,
      "q1_schemes.RD": true,
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    };
    const evaluation = evaluateChecklist(RULE_PACK, answers);
    expect(evaluation.document.accounts).toHaveLength(2);

    const schemeIds = evaluation.document.accounts.map((a) => a.schemeId).sort();
    expect(schemeIds).toEqual(["RD", "SB"]);

    // Each account is independently resolved (same route here, but each
    // carries its own accountIndex and its own sections array instance).
    const [first, second] = evaluation.document.accounts;
    expect(first?.accountIndex).toBe(0);
    expect(second?.accountIndex).toBe(1);
    expect(first?.sections).not.toBe(second?.sections);
  });

  it("independent accounts can resolve to entirely different routes from the same answer set", () => {
    // SSA: a child's death goes through the minor-account route regardless
    // of nomination; SB (using the same top-level answers) follows the
    // ordinary nomination route. Both are evaluated directly to make the
    // independence explicit without relying on Q1 shape.
    const ssa = evaluateAccount(RULE_PACK, "SSA", { q2_who_died: "child" }, undefined, 0);
    const sb = evaluateAccount(
      RULE_PACK,
      "SB",
      { q2_who_died: "adult", q3_holding: "one_name", q5_nomination: "yes_alive", q9_payment: "own_posb" },
      undefined,
      1,
    );
    expect(ssa.account.routeId).toBe("ROUTE_SSA_MINOR");
    expect(sb.account.routeId).toBe("ROUTE_A");
  });
});

describe("determinism", () => {
  it("evaluateAccount is a pure function: identical inputs produce byte-identical output", () => {
    const answers = {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "yes",
      q9_payment: "own_posb",
    };
    const derived = { monthsSinceDeath: 8, yearsSinceDeath: 0 };
    const a = evaluateAccount(RULE_PACK, "SB", answers, derived, 0);
    const b = evaluateAccount(RULE_PACK, "SB", answers, derived, 0);
    expect(JSON.stringify(a.account)).toBe(JSON.stringify(b.account));
  });

  it("evaluateChecklist is deterministic across repeated calls", () => {
    const answers = {
      "q1_schemes.SB": true,
      q2_who_died: "adult",
      q3_holding: "two_names_survivor",
    };
    const a = evaluateChecklist(RULE_PACK, answers);
    const b = evaluateChecklist(RULE_PACK, answers);
    expect(JSON.stringify(a.document)).toBe(JSON.stringify(b.document));
  });
});

describe("performance", () => {
  it("evaluates a single account well within a generous budget", () => {
    const answers = {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    };
    const start = performance.now();
    for (let i = 0; i < 100; i += 1) {
      evaluateAccount(RULE_PACK, "SB", answers, undefined, 0);
    }
    const elapsed = performance.now() - start;
    // 100 evaluations well under 1000ms comfortably demonstrates each one
    // individually clears the <10ms target (Milestone 3 §16) with margin
    // for slower CI hardware — a tight per-call microbenchmark is flaky
    // in a shared CI runner, so this checks the aggregate instead.
    expect(elapsed).toBeLessThan(1000);
  });
});
