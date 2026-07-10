import type { QuestionDefinition, RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import { evaluate, type VarAssignment } from "./condition.js";
import type { AnswerMap } from "./variables.js";
import { buildVarAssignment } from "./variables.js";
import type { DerivedValues } from "./derived.js";

/** True if `question.visibleWhen` holds against the given account/answers state. */
export function isQuestionVisible(question: QuestionDefinition, vars: VarAssignment): boolean {
  return evaluate(question.visibleWhen, vars);
}

/**
 * Every question currently visible for one account, in the pack's own
 * authored order (never re-sorted) — the wizard-facing counterpart to
 * "Question Visibility" (Milestone 3 §5).
 */
export function resolveVisibleQuestions(
  rulePack: RulePack,
  scheme: SchemeDefinition,
  answers: AnswerMap,
  derived: DerivedValues | undefined,
): readonly QuestionDefinition[] {
  const vars = buildVarAssignment(rulePack, scheme, answers, derived);
  return rulePack.questions.filter((q) => isQuestionVisible(q, vars));
}
