import type { RulePack } from "@claimsahayak/shared-types";
import { RULEBOOK_CS_IDS } from "../data/rulebook-cs-ids.js";
import { issue, type ValidationIssue } from "../schema/issue.js";

const KNOWN_CS_IDS = new Set(RULEBOOK_CS_IDS);

/**
 * ClaimSahayak Official Rule Book v1.0 integration: any carrier that opts
 * IN to Rule Book provenance by declaring `sourceRefs` must cite only real,
 * verified CS-IDs (§2 of `master-rule-matrix.md`). Carriers that don't
 * declare `sourceRefs` at all (pre-integration T1-T20 entries not yet
 * re-cited) are untouched by this check — it only ever inspects entries
 * that have opted in, so it can never newly fail existing data.
 */
function checkCarrierSourceRefs<T extends { readonly sourceRefs?: readonly string[] }>(
  carriers: readonly T[],
  label: string,
  idOf: (c: T) => string,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  carriers.forEach((c, i) => {
    for (const csId of c.sourceRefs ?? []) {
      if (!KNOWN_CS_IDS.has(csId)) {
        issues.push(
          issue(
            `${label}[${String(i)}](${idOf(c)}).sourceRefs`,
            `"${csId}" is not a verified Rule Book CS-ID (see master-rule-matrix.md — provisional/UNVERIFIED items like CS-NOM-024/025 must not be cited as sourceRefs)`,
          ),
        );
      }
    }
  });
  return issues;
}

export function checkRuleBookCsIdsResolve(pack: RulePack): readonly ValidationIssue[] {
  return [
    ...checkCarrierSourceRefs(pack.questions, "questions", (c) => c.id),
    ...checkCarrierSourceRefs(pack.routes, "routes", (c) => c.id),
    ...checkCarrierSourceRefs(pack.outputs, "outputs", (c) => c.id),
    ...checkCarrierSourceRefs(pack.overlays, "overlays", (c) => c.flagId),
    ...checkCarrierSourceRefs(pack.forms, "forms", (c) => c.id),
    ...checkCarrierSourceRefs(pack.documents, "documents", (c) => c.id),
  ];
}

/**
 * Every DecisionRecord.routeId must resolve to a reachable route id/target
 * (the same join OutputRule.routeId uses) OR a real card id — a route-kind
 * bucket names a payable checklist, while D-10/D-12-style outcomes land on
 * a card, and both are genuine "decisions" objective 5 requires.
 */
export function checkDecisionsReferenceReachableRoutes(
  pack: RulePack,
  reachableRouteIds: ReadonlySet<string>,
): readonly ValidationIssue[] {
  const cardIds = new Set(pack.cards.map((c) => c.id));
  const issues: ValidationIssue[] = [];
  (pack.decisions ?? []).forEach((d, i) => {
    if (!reachableRouteIds.has(d.routeId) && !cardIds.has(d.routeId)) {
      issues.push(
        issue(
          `decisions[${String(i)}].routeId`,
          `decision "${d.id}" references routeId "${d.routeId}", which is not any route's id/target or a real card id`,
        ),
      );
    }
  });
  return issues;
}
