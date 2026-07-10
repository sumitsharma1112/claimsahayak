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
    switch (value.kind) {
      case "single":
        flat[questionId] = value.optionId;
        break;
      case "boolean":
        flat[questionId] = value.value;
        break;
      case "multi":
        for (const optionId of value.optionIds) {
          flat[`${questionId}.${optionId}`] = true;
        }
        break;
      case "monthYear":
        break;
    }
  }
  return flat;
}
