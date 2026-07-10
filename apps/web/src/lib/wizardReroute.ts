import type { LocalizedText, RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import { buildVarAssignment, resolveRoute, type AnswerMap } from "@claimsahayak/rule-engine";

/**
 * Detects whether editing a PAST answer changed this account's resolved
 * route, and if so, returns the banner text of whichever newly-fired
 * `reroute`-kind rule explains the redirect (straight from the Rule
 * Pack's own `RouteRule.banner` field — never authored here). Returns
 * `undefined` when the terminal outcome didn't change, or changed without
 * a reroute rule declaring a banner for it.
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
): LocalizedText | undefined {
  const varsBefore = buildVarAssignment(rulePack, scheme, previousFlatAnswers, undefined);
  const varsAfter = buildVarAssignment(rulePack, scheme, nextFlatAnswers, undefined);
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
