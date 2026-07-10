import type { QuestionDefinition, RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import { resolveVisibleQuestions, type AnswerMap } from "@claimsahayak/rule-engine";
import type { AnswersState } from "./wizardAnswers";

/**
 * Which question the wizard should show right now: the first currently
 * visible one (per the frozen `resolveVisibleQuestions`, in the Rule
 * Pack's own authored order) that has no recorded answer yet.
 *
 * "Answered" is checked against the wizard's own rich `AnswersState`
 * (one `AnswerValue` per question id) rather than the flat `AnswerMap` —
 * deliberately, since `monthYear` answers are never added to the flat map
 * (the engine exposes no direct condition variable for them; see
 * rule-engine/variables.ts's privacy note), so a flat-map-only "answered"
 * check would report a monthYear question as permanently unanswered even
 * after the user picks a date, freezing navigation. The rich state has no
 * such gap: every answered question gets exactly one entry regardless of
 * its input type.
 */
export function getCurrentQuestion(
  rulePack: RulePack,
  scheme: SchemeDefinition,
  flatAnswers: AnswerMap,
  answers: AnswersState,
): QuestionDefinition | undefined {
  const visible = resolveVisibleQuestions(rulePack, scheme, flatAnswers, undefined);
  return visible.find((q) => !Object.prototype.hasOwnProperty.call(answers, q.id));
}
