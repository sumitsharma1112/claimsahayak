import type { RouteRule, RulePack } from "@claimsahayak/shared-types";
import { evaluate, type VarAssignment } from "./condition.js";

/**
 * The four system buckets (`docs/rule-pack.md`'s "GLOBAL, CONTINUE_ADDON,
 * PAYMENT_BANK_TRANSFER, PAYMENT_OWN_POSB" note) are not part of the
 * customer-facing T1-T21 priority pass — the engine applies them from a
 * direct answer/always-on rule instead (see `outputs.ts`). They are
 * recognisable in the data by their `SYS_` id prefix.
 */
function isSystemBucketRoute(route: RouteRule): boolean {
  return route.id.startsWith("SYS_");
}

export interface RouteResolution {
  /** Every route rule whose `when` matched, in priority order encountered (T1-T21 §7). */
  readonly firedRouteIds: readonly string[];
  /**
   * The terminal (`kind: "route"` or `"card"`) rule that decided this
   * account's outcome, or `undefined` if the priority pass ran out of
   * rules without one (a malformed/incomplete pack — see `errors.ts`).
   */
  readonly terminal?: RouteRule;
}

/**
 * Walks `pack.routes` (excluding system buckets) in descending priority
 * order. A `kind: "reroute"` match is recorded in `firedRouteIds` (its own
 * extra outputs, if any, still apply — see `data/routes.ts`'s note on
 * T10/T5/T6/T8) but does not stop the pass, since a reroute only redirects
 * the WIZARD to a different question; on a complete, final answer set the
 * actual `route`/`card` rule that decides the account's outcome is found
 * further down the same priority-ordered list. A `kind: "route"` or
 * `"card"` match is terminal and stops the pass immediately (Milestone 3
 * §7's "evaluate routes in priority order").
 */
export function resolveRoute(rulePack: RulePack, vars: VarAssignment): RouteResolution {
  const candidates = rulePack.routes
    .filter((r) => !isSystemBucketRoute(r))
    .map((route, originalIndex) => ({ route, originalIndex }))
    .sort((a, b) => b.route.priority - a.route.priority || a.originalIndex - b.originalIndex);

  const firedRouteIds: string[] = [];
  for (const { route } of candidates) {
    if (!evaluate(route.when, vars)) {
      continue;
    }
    firedRouteIds.push(route.id);
    if (route.kind === "route" || route.kind === "card") {
      return { firedRouteIds, terminal: route };
    }
    // kind === "reroute": recorded, keep scanning lower-priority rules.
  }
  return { firedRouteIds };
}
