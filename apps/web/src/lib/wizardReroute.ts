import type { LocalizedText, RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import { buildVarAssignment, resolveRoute, type AnswerMap, type DerivedValues } from "@claimsahayak/rule-engine";

/**
 * Detects whether editing a PAST answer changed this account's resolved
 * route, and if so, returns the banner text of whichever newly-fired
 * `reroute`-kind rule explains the redirect (straight from the Rule
 * Pack's own `RouteRule.banner` field — never authored here). Returns
 * `undefined` when the terminal outcome didn't change, or changed without
 * a reroute rule declaring a banner for it.
 *
 * Takes a before AND an after `derived` bag (Milestone 6 Part 1): editing
 * the month-of-death answer changes no flat-map key at all (monthYear
 * never enters the flat map — privacy, see wizardAnswers.ts), only the
 * derived values — so a date-driven reroute is invisible unless both
 * evaluations see their own derived state.
 *
 * Pure engine-only logic: this only calls the frozen `resolveRoute` /
 * `buildVarAssignment` exports and reads `rulePack.routes` for banner
 * text — no scheme/route/threshold decision is made here.
 */
export function detectRerouteBanner(
  rulePack: RulePack,
  scheme: SchemeDefinition,
  previousFlatAnswers: AnswerMap,
  nextFlatAnswers: AnswerMap,
  previousDerived: DerivedValues | undefined,
  nextDerived: DerivedValues | undefined,
): LocalizedText | undefined {
  const varsBefore = buildVarAssignment(rulePack, scheme, previousFlatAnswers, previousDerived);
  const varsAfter = buildVarAssignment(rulePack, scheme, nextFlatAnswers, nextDerived);
  const before = resolveRoute(rulePack, varsBefore);
  const after = resolveRoute(rulePack, varsAfter);

  if (before.terminal?.id === after.terminal?.id) {
    return undefined;
  }

  const newlyFiredIds = after.firedRouteIds.filter((id) => !before.firedRouteIds.includes(id));
  const rerouteRule = newlyFiredIds
    .map((id) => rulePack.routes.find((r) => r.id === id))
    .find((route) => route?.kind === "reroute" && route.banner !== undefined);

  return rerouteRule?.banner;
}
