/**
 * Milestone 4.4 — roadmap acceptance: "longest path <= 10 screens, normal
 * path <= 7 screens." Computed by actually walking the real RULE_PACK
 * through the same engine calls the Wizard itself uses (`getCurrentQuestion`,
 * `resolveRoute`), rather than hand-counting questions — the project's
 * established convention for anything claimed about the authored pack.
 *
 * Scoped to the SB scheme, because that's the only scheme the current
 * single-account Wizard ever evaluates (`rulePack.schemes[0]` — multi-account
 * looping across every ticked Q1 scheme is a documented limitation carried
 * over from Milestone 4.1, not yet implemented). See docs/m4-acceptance.md
 * for the corresponding note about other schemes' theoretical path lengths.
 */
import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { buildVarAssignment, resolveRoute } from "@claimsahayak/rule-engine";
import type { AnswerValue, QuestionDefinition } from "@claimsahayak/shared-types";
import type { SchemeDefinition } from "@claimsahayak/shared-types";
import { toAnswerMap, type AnswersState } from "@/lib/wizardAnswers";
import { getCurrentQuestion } from "@/lib/wizardCurrentQuestion";

// An explicitly-typed binding (not `SchemeDefinition | undefined` narrowed by
// a guard) so `scheme` stays non-undefined inside `explore()` below — a
// `function` declaration doesn't retain a module-scope narrowing across its
// own closure the way an arrow function would.
const scheme: SchemeDefinition = (() => {
  const found = RULE_PACK.schemes.find((s) => s.id === "SB");
  if (!found) throw new Error("Fixture assumption broken: SB scheme missing.");
  return found;
})();

/** A representative spread of answers to try for one question, not an exhaustive combinatorial explosion. */
function candidateAnswers(q: QuestionDefinition): readonly AnswerValue[] {
  switch (q.inputType) {
    case "single":
      return q.options.map((o) => ({ kind: "single", optionId: o.id }));
    case "boolean":
      return [
        { kind: "boolean", value: true },
        { kind: "boolean", value: false },
      ];
    case "monthYear":
      // The raw date never drives visibility itself (only a derived boolean
      // the Wizard doesn't compute — see rule-engine/variables.ts), so one
      // representative value is sufficient to explore every branch.
      return [{ kind: "monthYear", month: 3, year: 2024 }];
    case "multi": {
      const singles: AnswerValue[] = q.options.map((o) => ({ kind: "multi", optionIds: [o.id] }));
      const nonExclusiveIds = q.options.filter((o) => !o.exclusive).map((o) => o.id);
      return [...singles, { kind: "multi", optionIds: nonExclusiveIds }];
    }
  }
}

// A generous ceiling that only trips on a genuine bug (a cycle, or an
// invalidation gap that keeps re-asking the same question) — the roadmap's
// own limit is 10; this is just a backstop so a real bug fails loudly
// instead of hanging.
const SAFETY_DEPTH = 16;

function explore(
  answers: AnswersState,
  depth: number,
  path: readonly string[],
  onLeaf: (depth: number, path: readonly string[]) => void,
): void {
  if (depth > SAFETY_DEPTH) {
    throw new Error(
      `Exploration exceeded ${String(SAFETY_DEPTH)} screens without reaching a leaf — ` +
        `likely a real cycle or missing invalidation, not a genuinely long path. Path so far: ${path.join(" -> ")}`,
    );
  }
  const flat = toAnswerMap(answers);
  const vars = buildVarAssignment(RULE_PACK, scheme, flat, undefined);
  const route = resolveRoute(RULE_PACK, vars);
  if (route.terminal?.kind === "card") {
    onLeaf(depth, path);
    return;
  }
  const current = getCurrentQuestion(RULE_PACK, scheme, flat, answers);
  if (!current) {
    onLeaf(depth, path);
    return;
  }
  for (const candidate of candidateAnswers(current)) {
    explore(
      { ...answers, [current.id]: candidate },
      depth + 1,
      [...path, `${current.id}=${JSON.stringify(candidate)}`],
      onLeaf,
    );
  }
}

describe("Wizard path-length acceptance (Milestone 4 roadmap)", () => {
  it("never exceeds 11 screens for any reachable SB-scheme path", () => {
    // Was <=10 under the original M4 roadmap budget. The ClaimSahayak
    // Official Rule Book v1.0 integration adds two mandatory questions to
    // the worst-case path — q_armed_forces (D-14) and q_dispute (D-11) —
    // both genuine competent-authority/decision forks the Rule Book
    // requires; not addable via an existing screen without misreporting
    // the outcome. Budget bumped by exactly the two new questions;
    // flagged in the integration report as a deliberate, reported
    // trade-off.
    let maxDepth = 0;
    let maxPath: readonly string[] = [];
    explore({}, 0, [], (depth, path) => {
      if (depth > maxDepth) {
        maxDepth = depth;
        maxPath = path;
      }
    });
    expect(maxDepth, `Longest path found (${String(maxDepth)} screens): ${maxPath.join(" -> ")}`).toBeLessThanOrEqual(
      11,
    );
  });

  it("keeps the normal happy path (adult, one name, nominee alive) to 8 screens or fewer", () => {
    // Was <=7 under the original M4 roadmap budget. The ClaimSahayak
    // Official Rule Book v1.0 integration adds one mandatory question,
    // q_armed_forces (Decision Matrix D-14, CS-NOM-017) — a genuine
    // competent-authority fork (CO/Committee of Adjustment overrides
    // nomination for serving military personnel), not a cosmetic addition,
    // so it cannot be folded into an existing screen without misreporting
    // the outcome. Budget bumped by exactly the one new question; flagged
    // in the integration report as a deliberate, reported trade-off.
    const plannedAnswers: Record<string, AnswerValue> = {
      q1_schemes: { kind: "multi", optionIds: ["SB"] },
      q2_who_died: { kind: "single", optionId: "adult" },
      q_armed_forces: { kind: "boolean", value: false },
      q3_holding: { kind: "single", optionId: "one_name" },
      q4_death_month: { kind: "monthYear", month: 3, year: 2024 },
      q5_nomination: { kind: "single", optionId: "yes_alive" },
      q9_payment: { kind: "single", optionId: "own_posb" },
      q10_docs_check: { kind: "multi", optionIds: ["none"] },
    };

    let current: AnswersState = {};
    let depth = 0;
    for (;;) {
      const q = getCurrentQuestion(RULE_PACK, scheme, toAnswerMap(current), current);
      if (!q) break;
      const planned = plannedAnswers[q.id];
      if (!planned) {
        throw new Error(`Unplanned question reached on the happy path: "${q.id}" — fixture assumption broken.`);
      }
      current = { ...current, [q.id]: planned };
      depth += 1;
    }

    expect(depth).toBeLessThanOrEqual(8);
    expect(getCurrentQuestion(RULE_PACK, scheme, toAnswerMap(current), current)).toBeUndefined();
  });
});
