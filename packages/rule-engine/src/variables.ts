import type { ConditionValue, RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import type { VarAssignment } from "./condition.js";
import type { DerivedValues } from "./derived.js";

/**
 * The engine's public "answers" shape: a flat map keyed by the SAME
 * bare-question-id convention the truth-table fixtures already use
 * (`q2_who_died`, `"q5a_complication.predeceased_no_others"`, etc — no
 * "answers." prefix here; that namespace prefix is added internally when
 * building the full Condition variable assignment, since `account.*`,
 * `scheme.*`, `derived.*`, and `constants.*` all live alongside
 * `answers.*` in the same flat namespace routes/questions are written
 * against). This is a deliberate, minimal wire format — translating a rich
 * `SessionState.answers` (typed `AnswerValue` per question) into this flat
 * map is a UI/session-layer concern outside this package.
 */
export type AnswerMap = Readonly<Record<string, ConditionValue>>;

/** Reads a bare-keyed single/boolean answer (`q2_who_died` -> "adult" | true | ...). */
export function getAnswer(answers: AnswerMap, questionId: string): ConditionValue | undefined {
  return answers[questionId];
}

/** Reads a bare-keyed multi-option tick (`q10_docs_check.passbook_lost` -> true/false). */
export function isOptionTicked(answers: AnswerMap, questionId: string, optionId: string): boolean {
  return answers[`${questionId}.${optionId}`] === true;
}

/**
 * Builds the flat variable assignment for one account's evaluation:
 * every `answers.*` entry (namespaced), `account.schemeId`, this
 * scheme's own `scheme.*` capability flags, `derived.*` (only the keys
 * actually supplied — an omitted derived value stays genuinely absent,
 * not zero), and every named `constants.*` value from the Rule Pack.
 */
export function buildVarAssignment(
  rulePack: RulePack,
  scheme: SchemeDefinition,
  answers: AnswerMap,
  derived: DerivedValues | undefined,
): VarAssignment {
  const assignment: Record<string, ConditionValue> = {};

  for (const [key, value] of Object.entries(answers)) {
    assignment[`answers.${key}`] = value;
  }

  assignment["account.schemeId"] = scheme.id;
  assignment["scheme.canBeJoint"] = scheme.canBeJoint;
  assignment["scheme.canBeMinorAccount"] = scheme.canBeMinorAccount;
  assignment["scheme.continuableByClaimant"] = scheme.continuableByClaimant;
  assignment["scheme.bankTransferEligible"] = scheme.bankTransferEligible;

  if (derived?.monthsSinceDeath !== undefined) {
    assignment["derived.monthsSinceDeath"] = derived.monthsSinceDeath;
  }
  if (derived?.yearsSinceDeath !== undefined) {
    assignment["derived.yearsSinceDeath"] = derived.yearsSinceDeath;
  }

  for (const [key, value] of Object.entries(rulePack.constants)) {
    assignment[`constants.${key}`] = value;
  }

  return assignment;
}
