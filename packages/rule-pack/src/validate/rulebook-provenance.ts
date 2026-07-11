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

/** DecisionRecord.officialReferences[].csId is a MANDATORY citation (schema-enforced non-empty), always checked — not an opt-in `sourceRefs` field. */
function checkDecisionOfficialReferences(pack: RulePack): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  (pack.decisions ?? []).forEach((d, i) => {
    d.officialReferences.forEach((ref, j) => {
      if (!KNOWN_CS_IDS.has(ref.csId)) {
        issues.push(
          issue(
            `decisions[${String(i)}](${d.id}).officialReferences[${String(j)}].csId`,
            `"${ref.csId}" is not a verified Rule Book CS-ID (see master-rule-matrix.md — provisional/UNVERIFIED items like CS-NOM-024/025 must not be cited)`,
          ),
        );
      }
    });
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
    ...checkDecisionOfficialReferences(pack),
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

/**
 * The inverse of `checkDecisionsReferenceReachableRoutes`: every terminal a
 * live account can actually land on (a `kind:"route"` rule's own `target`,
 * or a `kind:"card"` rule's target card id — SYS_ output buckets and
 * `reroute` targets are never a terminal `routeId`, so they're excluded)
 * must have a matching `DecisionRecord`, or objective 5's "every decision
 * must include..." guarantee has a silent gap.
 */
export function checkEveryReachableRouteHasDecision(pack: RulePack): readonly ValidationIssue[] {
  const decisionRouteIds = new Set((pack.decisions ?? []).map((d) => d.routeId));
  const terminalIds = new Set<string>();
  for (const route of pack.routes) {
    if (route.id.startsWith("SYS_")) {
      continue;
    }
    if (route.kind === "route" || route.kind === "card") {
      terminalIds.add(route.target);
    }
  }
  const issues: ValidationIssue[] = [];
  for (const routeId of terminalIds) {
    if (!decisionRouteIds.has(routeId)) {
      issues.push(
        issue(
          `decisions[].routeId`,
          `terminal "${routeId}" is reachable but has no matching DecisionRecord`,
        ),
      );
    }
  }
  return issues;
}

/** Duplicate DecisionRecord.id, duplicate routeId across decisions, or a repeated CS-ID within one record's own officialReferences. */
export function checkNoDuplicateDecisions(pack: RulePack): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Map<string, number>();
  const seenRouteIds = new Map<string, number>();
  (pack.decisions ?? []).forEach((d, i) => {
    const firstId = seenIds.get(d.id);
    if (firstId !== undefined) {
      issues.push(issue(`decisions[${String(i)}].id`, `duplicate decision id "${d.id}" (first at decisions[${String(firstId)}])`));
    } else {
      seenIds.set(d.id, i);
    }
    const firstRoute = seenRouteIds.get(d.routeId);
    if (firstRoute !== undefined) {
      issues.push(
        issue(
          `decisions[${String(i)}].routeId`,
          `duplicate routeId "${d.routeId}" — decisions[${String(firstRoute)}] already targets it`,
        ),
      );
    } else {
      seenRouteIds.set(d.routeId, i);
    }
    const seenCsIds = new Set<string>();
    d.officialReferences.forEach((ref, j) => {
      if (seenCsIds.has(ref.csId)) {
        issues.push(
          issue(
            `decisions[${String(i)}].officialReferences[${String(j)}].csId`,
            `"${ref.csId}" is cited more than once in the same decision's officialReferences`,
          ),
        );
      } else {
        seenCsIds.add(ref.csId);
      }
    });
  });
  return issues;
}
