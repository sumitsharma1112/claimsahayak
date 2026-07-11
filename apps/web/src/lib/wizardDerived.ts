import type { RulePackConstants } from "@claimsahayak/shared-types";
import { computeDerivedValues, type DerivedValues } from "@claimsahayak/rule-engine";
import type { AnswersState } from "./wizardAnswers";

/**
 * Builds the engine's `derived` input bag from the wizard's answer state
 * (Milestone 6 Part 1). Dispatches purely on the structural `monthYear`
 * answer kind — never on a question id: the engine's derived module is
 * defined over exactly one month/year-of-death input (see
 * rule-engine/derived.ts), and `monthYear` is that input's only carrier
 * kind, so the first (and, per the pack's schema, only) monthYear answer
 * IS the death date by construction.
 *
 * `asOfIso` is supplied by the caller — the engine never reads the wall
 * clock (rule-engine purity), and neither does this helper. The Wizard
 * passes its session-start instant so that a given session evaluates
 * deterministically: the same answers always resolve the same route for
 * the whole sitting (and across a resume, since session start is
 * persisted), rather than a route flipping mid-session at a month
 * boundary.
 *
 * Privacy note (Blueprint invariant): the raw month/year never enters the
 * flat AnswerMap (`toAnswerMap` skips monthYear) — only the derived
 * month/year *counts* computed here ever reach the engine.
 */
export function computeSessionDerived(
  answers: AnswersState,
  asOfIso: string,
  constants: RulePackConstants,
): DerivedValues | undefined {
  for (const value of Object.values(answers)) {
    if (value.kind === "monthYear") {
      return computeDerivedValues({ month: value.month, year: value.year }, asOfIso, constants);
    }
  }
  return undefined;
}
