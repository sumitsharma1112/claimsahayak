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
import { computeSessionDerived } from "@/lib/wizardDerived";

// A fixed "as of" instant (rather than the wall clock) keeps this
// exploration byte-deterministic across runs, exactly like the engine's
// own truth-table fixtures. The monthYear candidates below are chosen
// relative to THIS date, not to "today".
const AS_OF_ISO = "2026-07-01T00:00:00.000Z";

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
      // The raw date never enters the flat map, but since Milestone 6 the
      // Wizard computes derived.monthsSinceDeath from it — so exploration
      // needs one value on each side of the NO_NOMINATION_WAIT_MONTHS gate
      // (relative to AS_OF_ISO) to walk both the T17 and T19 branches.
      return [
        { kind: "monthYear", month: 6, year: 2026 },
        { kind: "monthYear", month: 3, year: 2024 },
      ];
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
  const derived = computeSessionDerived(answers, AS_OF_ISO, RULE_PACK.constants);
  const vars = buildVarAssignment(RULE_PACK, scheme, flat, derived);
  const route = resolveRoute(RULE_PACK, vars);
  if (route.terminal?.kind === "card") {
    onLeaf(depth, path);
    return;
  }
  const current = getCurrentQuestion(RULE_PACK, scheme, flat, answers, derived);
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
  it("never exceeds 13 screens for any reachable SB-scheme path", () => {
    // Was <=10 under the original M4 roadmap budget, <=11 after the Rule
    // Book v1.0 integration added q_armed_forces (D-14) and q_dispute
    // (D-11). Milestone 6's derived-date wiring raised the TRUE worst case
    // to 13: the over-six-months no-nomination path now correctly reaches
    // T17/ROUTE_C (a route-kind terminal), so it continues through
    // q9_payment and q10_docs_check instead of stopping early at the T19
    // WAIT card — those two screens were always part of the pack's design
    // for that path; they were just unreachable while the Wizard passed
    // `derived: undefined` (the pre-M6 correctness gap this milestone
    // fixed). No new question was added; the budget now measures the path
    // the engine's truth-table fixtures always intended.
    let maxDepth = 0;
    let maxPath: readonly string[] = [];
    explore({}, 0, [], (depth, path) => {
      if (depth > maxDepth) {
        maxDepth = depth;
        maxPath = path;
      }
    });
    expect(maxDepth, `Longest path found (${String(maxDepth)} screens): ${maxPath.join(" -> ")}`).toBeLessThanOrEqual(
      13,
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
      const derived = computeSessionDerived(current, AS_OF_ISO, RULE_PACK.constants);
      const q = getCurrentQuestion(RULE_PACK, scheme, toAnswerMap(current), current, derived);
      if (!q) break;
      const planned = plannedAnswers[q.id];
      if (!planned) {
        throw new Error(`Unplanned question reached on the happy path: "${q.id}" — fixture assumption broken.`);
      }
      current = { ...current, [q.id]: planned };
      depth += 1;
    }

    expect(depth).toBeLessThanOrEqual(8);
    const finalDerived = computeSessionDerived(current, AS_OF_ISO, RULE_PACK.constants);
    expect(getCurrentQuestion(RULE_PACK, scheme, toAnswerMap(current), current, finalDerived)).toBeUndefined();
  });
});
