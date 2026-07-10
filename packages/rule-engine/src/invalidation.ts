import type { RulePack } from "@claimsahayak/shared-types";
import type { AnswerMap } from "./variables.js";

export interface InvalidationResult {
  /** The answers map after removing every invalidated key. */
  readonly answers: AnswerMap;
  /** Question ids whose answers were removed by this change. */
  readonly invalidatedQuestionIds: readonly string[];
  /** The exact bare-keyed answer keys removed (including multi-option sub-keys). */
  readonly removedKeys: readonly string[];
}

/**
 * Applies a new answer for `questionId` on top of `previousAnswers`, then
 * removes every answer `questionId.invalidates` names (Milestone 3 §6).
 * The Rule Pack authors this list already fully flattened per question
 * (e.g. `q1_schemes.invalidates` names every downstream question, not
 * just its immediate children), so a single non-recursive pass over the
 * named ids is sufficient — the engine does not need to compute its own
 * transitive closure on top of what the pack already declares.
 *
 * `patch` carries the new answer(s) for `questionId` itself: a single
 * bare key for single/boolean/monthYear questions, or one key per ticked
 * option (`"<questionId>.<optionId>": boolean`) for a multi question.
 */
export function applyAnswerChange(
  rulePack: RulePack,
  previousAnswers: AnswerMap,
  questionId: string,
  patch: AnswerMap,
): InvalidationResult {
  const question = rulePack.questions.find((q) => q.id === questionId);
  const next: Record<string, AnswerMap[string]> = { ...previousAnswers, ...patch };

  const removedKeys: string[] = [];
  const invalidatedQuestionIds = question?.invalidates ?? [];

  for (const invalidatedId of invalidatedQuestionIds) {
    for (const key of Object.keys(next)) {
      if (key === invalidatedId || key.startsWith(`${invalidatedId}.`)) {
        delete next[key];
        removedKeys.push(key);
      }
    }
  }

  return {
    answers: next,
    invalidatedQuestionIds,
    removedKeys,
  };
}
