import type { RulePack } from "@claimsahayak/shared-types";
import { issue, type ValidationIssue } from "../schema/issue.js";

/**
 * V3 §2.5's "no-dead-end proof": every evaluation path must end somewhere
 * that states a concrete next physical step. card.schema.ts already
 * guarantees any CARD that exists has a non-empty nextPhysicalStep; this
 * check closes the other half of the loop — that every card-kind route
 * actually points at a card that exists, so a typo'd target can't silently
 * strand a claimant on nothing.
 */
export function checkCardRouteTargetsResolve(pack: RulePack): readonly ValidationIssue[] {
  const cardIds = new Set(pack.cards.map((c) => c.id));
  const issues: ValidationIssue[] = [];
  pack.routes.forEach((route, i) => {
    if (route.kind === "card" && !cardIds.has(route.target)) {
      issues.push(
        issue(
          `routes[${String(i)}](${route.id}).target`,
          `card-kind route targets "${route.target}", which does not match any cards[] id`,
        ),
      );
    }
  });
  return issues;
}

/**
 * A reroute must point at a real question id (V2 R-14: it re-enters the
 * flow at a specific question, always with an explanatory banner —
 * already enforced at parse time in route.schema.ts).
 */
export function checkRerouteTargetsResolve(pack: RulePack): readonly ValidationIssue[] {
  const questionIds = new Set(pack.questions.map((q) => q.id));
  const issues: ValidationIssue[] = [];
  pack.routes.forEach((route, i) => {
    if (route.kind === "reroute" && !questionIds.has(route.target)) {
      issues.push(
        issue(
          `routes[${String(i)}](${route.id}).target`,
          `reroute targets "${route.target}", which does not match any questions[] id`,
        ),
      );
    }
  });
  return issues;
}
