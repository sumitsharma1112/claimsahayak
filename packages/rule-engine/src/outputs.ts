import type { OutputRule, RulePack } from "@claimsahayak/shared-types";
import type { AnswerMap } from "./variables.js";
import { getAnswer } from "./variables.js";
import type { RouteResolution } from "./routing.js";

/**
 * Identifiers whose matching `OutputRule.routeId` should be pulled into
 * one account's output set, plus which system buckets apply (Milestone 3
 * §7-8). `OutputRule.routeId` may name either a `RouteRule.id` directly
 * (an extra on top of whatever bucket ultimately wins — e.g. `"T11"`,
 * `"T10"`) or a `RouteRule.target` when that rule's `kind` is `"route"`
 * (the shared bucket itself — e.g. `"ROUTE_A"`).
 *
 * A `"card"`-kind terminal is a dead end/pause: no real checklist exists
 * for the account yet, so none of the fired rules' own T-id-keyed extras
 * apply — only the shared, always-relevant GLOBAL block does (per the
 * Milestone 2 truth-table fixtures: `card_guardian_change` fires T2, which
 * DOES have its own authored outputs in the pack, yet the fixture's
 * expected `outputBuckets` is `["GLOBAL"]` only — those T2 outputs are
 * data for a future milestone's card-detail rendering, not this engine's
 * checklist assembly). Only a `"route"`-kind terminal — an account that
 * actually resolves to a real, payable checklist — pulls in the full set
 * of fired T-ids' own extras alongside the bucket it targets.
 */
export function collectOutputBucketIds(
  resolution: RouteResolution,
  answers: AnswerMap,
  includeGlobal: boolean,
): readonly string[] {
  const ids = new Set<string>();

  if (resolution.terminal?.kind === "route") {
    for (const id of resolution.firedRouteIds) {
      ids.add(id);
    }
    ids.add(resolution.terminal.target);
  }

  if (includeGlobal) {
    ids.add("GLOBAL");
  }

  if (getAnswer(answers, "q8_close_or_continue") === "continue") {
    ids.add("CONTINUE_ADDON");
  }

  const payment = getAnswer(answers, "q9_payment");
  if (payment === "bank_transfer") {
    ids.add("PAYMENT_BANK_TRANSFER");
  } else if (payment === "own_posb") {
    ids.add("PAYMENT_OWN_POSB");
  }

  return Array.from(ids);
}

/** Every `OutputRule` in the pack whose `routeId` is one of `bucketIds`. */
export function collectOutputItems(
  rulePack: RulePack,
  bucketIds: readonly string[],
): readonly OutputRule[] {
  const bucketSet = new Set(bucketIds);
  return rulePack.outputs.filter((o) => bucketSet.has(o.routeId));
}
