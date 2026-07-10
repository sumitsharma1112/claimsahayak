import type { QuestionDefinition, RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import { validateAnswers, type AnswerMap } from "@claimsahayak/rule-engine";

/**
 * Which question the wizard should show right now: the first one the
 * frozen `validateAnswers` gate (Milestone 3) reports as visible-but-
 * unanswered, in the Rule Pack's own authored order. Reusing that engine
 * export directly (rather than re-deriving visibility/answered-ness here)
 * keeps this file free of any business logic — it is pure bookkeeping over
 * whatever the engine already decided.
 */
export function getCurrentQuestion(
  rulePack: RulePack,
  scheme: SchemeDefinition,
  flatAnswers: AnswerMap,
): QuestionDefinition | undefined {
  const issues = validateAnswers(rulePack, flatAnswers, scheme);
  const firstUnansweredId = issues.find((i) => i.code === "unanswered_question")?.path;
  if (firstUnansweredId === undefined) {
    return undefined;
  }
  return rulePack.questions.find((q) => q.id === firstUnansweredId);
}
