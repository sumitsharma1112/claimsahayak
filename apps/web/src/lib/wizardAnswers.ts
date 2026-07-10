import type { AnswerValue } from "@claimsahayak/shared-types";
import type { AnswerMap } from "@claimsahayak/rule-engine";

/**
 * Wizard-local answer state: one `AnswerValue` per question id. Deliberately
 * the SAME shape as `SessionState["answers"]` (shared-types/session.ts) so a
 * later persistence milestone can wrap this directly into a `SessionState`
 * without a shape migration.
 */
export type AnswersState = Readonly<Record<string, AnswerValue>>;

/**
 * Translates the wizard's per-question `AnswersState` into the flat,
 * bare-keyed `AnswerMap` the Rule Engine's condition evaluator expects
 * (see rule-engine/src/variables.ts: "translating a rich SessionState.answers
 * ... into this flat map is a UI/session-layer concern outside this
 * package"). Purely structural — keyed only by `AnswerValue.kind`, never by
 * a specific question id, scheme, or route.
 *
 * `monthYear` answers are intentionally omitted: the engine exposes no
 * direct condition variable for them (privacy — see variables.ts), only the
 * derived monthsSinceDeath/yearsSinceDeath a caller computes separately.
 */
export function toAnswerMap(answers: AnswersState): AnswerMap {
  const flat: Record<string, AnswerMap[string]> = {};
  for (const [questionId, value] of Object.entries(answers)) {
    Object.assign(flat, answerToPatch(questionId, value));
  }
  return flat;
}

/**
 * The flat patch for a single question's answer, in the same bare-keyed
 * convention as `toAnswerMap` (one key for single/boolean, one
 * `<questionId>.<optionId>` key per ticked option for multi, nothing for
 * monthYear). Used when re-applying one edited answer on top of the rest
 * of the flat map, without needing to re-flatten every other question.
 */
export function answerToPatch(questionId: string, value: AnswerValue): AnswerMap {
  switch (value.kind) {
    case "single":
      return { [questionId]: value.optionId };
    case "boolean":
      return { [questionId]: value.value };
    case "multi": {
      const patch: Record<string, AnswerMap[string]> = {};
      for (const optionId of value.optionIds) {
        patch[`${questionId}.${optionId}`] = true;
      }
      return patch;
    }
    case "monthYear":
      return {};
  }
}

/**
 * Strips every flat key belonging to one question (its bare key, or its
 * `<id>.<optionId>` multi sub-keys) out of a flat answer map. Required
 * before re-patching a multi question's answer: unlike single/boolean,
 * unticking a multi option has no key to overwrite, so the old ticked
 * keys must be removed first or they'd linger as stale `true`s.
 */
export function withoutQuestionKeys(flat: AnswerMap, questionId: string): AnswerMap {
  const next: Record<string, AnswerMap[string]> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (key !== questionId && !key.startsWith(`${questionId}.`)) {
      next[key] = value;
    }
  }
  return next;
}
