import type { QuestionDefinition, RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import {
  buildVarAssignment,
  isQuestionVisible,
  resolveRoute,
  type AnswerMap,
  type DerivedValues,
  type RouteResolution,
} from "@claimsahayak/rule-engine";
import type { AnswersState } from "./wizardAnswers";

/**
 * Multi-account question sequencing (Milestone 6 Part 2). The Rule Engine
 * already evaluates every ticked scheme (`evaluateChecklist`); what it
 * deliberately does NOT decide is which question a wizard should show
 * next when several schemes are in play at once. These helpers make that
 * call the same way `getCurrentQuestion` always has — purely by
 * sequencing frozen engine outputs (`isQuestionVisible`, `resolveRoute`),
 * never by evaluating a scheme/route/threshold themselves.
 *
 * The model is UNION VISIBILITY over one shared answer set: the claimant
 * answers each question once (the facts — who died, when, nomination —
 * are the same for every account), and a question is asked if any scheme
 * still on a live (non-card) path needs it. The wizard is finished only
 * when EVERY ticked scheme has reached a terminal — a card, or a
 * route-kind decision with no question left to ask.
 */

/**
 * The schemes this session actually evaluates: every scheme ticked in Q1
 * (the engine's own `q1_schemes.<id>` convention, mirroring
 * `evaluateChecklist`), or — before Q1 is answered, and for the
 * "older/discontinued" exclusive option that ticks no real scheme — the
 * pack's first scheme as a neutral evaluation context, exactly the
 * neutral-probe fallback `evaluateChecklist` itself uses.
 */
export function resolveActiveSchemes(
  rulePack: RulePack,
  flatAnswers: AnswerMap,
): readonly SchemeDefinition[] {
  const ticked = rulePack.schemes.filter((s) => flatAnswers[`q1_schemes.${s.id}`] === true);
  if (ticked.length > 0) {
    return ticked;
  }
  const neutral = rulePack.schemes[0];
  return neutral ? [neutral] : [];
}

/** Per-scheme route resolutions for the current shared answer state. */
export function resolveSchemeRoutes(
  rulePack: RulePack,
  schemes: readonly SchemeDefinition[],
  flatAnswers: AnswerMap,
  derived: DerivedValues | undefined,
): ReadonlyMap<string, RouteResolution> {
  return new Map(
    schemes.map((scheme) => [
      scheme.id,
      resolveRoute(rulePack, buildVarAssignment(rulePack, scheme, flatAnswers, derived)),
    ]),
  );
}

/**
 * Every question visible for AT LEAST ONE of the given schemes, in the
 * Rule Pack's own authored order. This is the progress-bar denominator:
 * computed over every active scheme (not just live ones) so the total
 * never shrinks mid-session when one scheme reaches a card early.
 */
export function resolveUnionVisibleQuestions(
  rulePack: RulePack,
  schemes: readonly SchemeDefinition[],
  flatAnswers: AnswerMap,
  derived: DerivedValues | undefined,
): readonly QuestionDefinition[] {
  const varsPerScheme = schemes.map((scheme) =>
    buildVarAssignment(rulePack, scheme, flatAnswers, derived),
  );
  return rulePack.questions.filter((q) => varsPerScheme.some((vars) => isQuestionVisible(q, vars)));
}

/**
 * The next question to show, or `undefined` when every active scheme is
 * terminal. Only schemes still on a live (non-card) path contribute
 * questions: once a scheme has short-circuited to a card, answers that
 * only IT would have needed can no longer change any outcome, so asking
 * them would be pure noise. "Answered" is checked against the rich
 * `AnswersState` for the same monthYear reason as `getCurrentQuestion`.
 */
export function getCurrentQuestionUnion(
  rulePack: RulePack,
  schemes: readonly SchemeDefinition[],
  flatAnswers: AnswerMap,
  answers: AnswersState,
  derived: DerivedValues | undefined,
): QuestionDefinition | undefined {
  const routes = resolveSchemeRoutes(rulePack, schemes, flatAnswers, derived);
  const liveSchemes = schemes.filter((s) => routes.get(s.id)?.terminal?.kind !== "card");
  if (liveSchemes.length === 0) {
    return undefined;
  }
  const visible = resolveUnionVisibleQuestions(rulePack, liveSchemes, flatAnswers, derived);
  return visible.find((q) => !Object.prototype.hasOwnProperty.call(answers, q.id));
}
