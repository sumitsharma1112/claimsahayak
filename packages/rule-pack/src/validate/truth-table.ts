import type { RulePack, SchemeId } from "@claimsahayak/shared-types";
import { issue, type ValidationIssue } from "../schema/issue.js";
import { reachableRouteIdentifiers } from "./reachability.js";

/**
 * One row of the truth-table acceptance matrix (V3 §2.5's "truth-table
 * snapshot suite"; Roadmap M2 item 11). `answers` uses the same
 * variable-path convention documented in data/questions.ts: a plain
 * question id maps to a single/boolean value, and `<questionId>.<optionId>`
 * maps to a per-option boolean for multi-select questions.
 *
 * Milestone 2 authors these fixtures and checks that every id they mention
 * is real (this file). Actually EVALUATING a fixture — running the pack's
 * conditions against its answers and confirming the resulting route/output
 * set matches `expected` exactly — is the Decision Engine's job
 * (Milestone 3), which the roadmap explicitly scores against these same
 * fixtures ("100% truth-table fixtures pass").
 */
export interface TruthTableFixture {
  readonly id: string;
  readonly description: string;
  readonly schemeId: SchemeId;
  readonly answers: Readonly<Record<string, string | number | boolean>>;
  readonly derived?: {
    readonly monthsSinceDeath?: number;
    readonly yearsSinceDeath?: number;
  };
  readonly expected: {
    readonly firedRouteIds: readonly string[];
    readonly cardId?: string;
    readonly outputBuckets: readonly string[];
    readonly overlayFlags?: readonly string[];
  };
}

function questionIdAndOptionId(answerKey: string): { questionId: string; optionId?: string } {
  const parts = answerKey.split(".");
  if (parts.length === 1) {
    return { questionId: parts[0] ?? "" };
  }
  return { questionId: parts[0] ?? "", optionId: parts.slice(1).join(".") };
}

export function checkTruthTableFixturesReferentialIntegrity(
  pack: RulePack,
  fixtures: readonly TruthTableFixture[],
): readonly ValidationIssue[] {
  const schemeIds = new Set(pack.schemes.map((s) => s.id));
  const questionsById = new Map(pack.questions.map((q) => [q.id, q]));
  const routeIds = new Set(pack.routes.map((r) => r.id));
  const cardIds = new Set(pack.cards.map((c) => c.id));
  const overlayFlagIds = new Set(pack.overlays.map((o) => o.flagId));
  const reachableBuckets = reachableRouteIdentifiers(pack);

  const issues: ValidationIssue[] = [];

  fixtures.forEach((fixture, i) => {
    const path = `fixtures[${String(i)}](${fixture.id})`;

    if (!schemeIds.has(fixture.schemeId)) {
      issues.push(issue(`${path}.schemeId`, `"${fixture.schemeId}" is not one of the pack's schemes`));
    }

    for (const answerKey of Object.keys(fixture.answers)) {
      const { questionId, optionId } = questionIdAndOptionId(answerKey);
      const question = questionsById.get(questionId);
      if (!question) {
        issues.push(
          issue(`${path}.answers["${answerKey}"]`, `question id "${questionId}" does not exist`),
        );
        continue;
      }
      if (optionId !== undefined) {
        const hasOption = question.options.some((o) => o.id === optionId);
        if (!hasOption) {
          issues.push(
            issue(
              `${path}.answers["${answerKey}"]`,
              `"${questionId}" has no option "${optionId}"`,
            ),
          );
        }
      }
    }

    for (const routeId of fixture.expected.firedRouteIds) {
      if (!routeIds.has(routeId)) {
        issues.push(
          issue(`${path}.expected.firedRouteIds`, `route id "${routeId}" does not exist`),
        );
      }
    }

    if (fixture.expected.cardId !== undefined && !cardIds.has(fixture.expected.cardId)) {
      issues.push(
        issue(`${path}.expected.cardId`, `card id "${fixture.expected.cardId}" does not exist`),
      );
    }

    for (const bucket of fixture.expected.outputBuckets) {
      if (!reachableBuckets.has(bucket)) {
        issues.push(
          issue(
            `${path}.expected.outputBuckets`,
            `"${bucket}" is not any route's id or route-target`,
          ),
        );
      }
    }

    for (const flag of fixture.expected.overlayFlags ?? []) {
      if (!overlayFlagIds.has(flag)) {
        issues.push(issue(`${path}.expected.overlayFlags`, `overlay flag "${flag}" does not exist`));
      }
    }
  });

  return issues;
}
