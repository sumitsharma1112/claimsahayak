import type { ClaimDecision, RulePack } from "@claimsahayak/shared-types";
import { engineIssue, type EngineIssue } from "./errors.js";

/**
 * Milestone 5 Part 2/3 — assembles the Complete Claim Decision purely from
 * `RulePack.decisions` (the ClaimSahayak Official Rule Book v1.0
 * integration's authored `DecisionRecord[]`). No business threshold is
 * decided here: every number, authority, status, and citation comes from
 * the matching pack record — this function only does structural
 * aggregation (deduping id lists, taking the max of a ladder) to compute
 * the two fields the pack does not author directly.
 */

/**
 * `officialReferences[].csId` ∪ `rulebookRefs`, deduped, in that order —
 * the "Applicable Rule IDs" for a decision (CS-IDs first since they are
 * the more granular, source-verified citation; D/M-row ids are the
 * Decision Matrix's own coarser grouping).
 */
function deriveApplicableRuleIds(record: {
  readonly officialReferences: readonly { readonly csId: string }[];
  readonly rulebookRefs: readonly string[];
}): readonly string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const ref of record.officialReferences) {
    if (!seen.has(ref.csId)) {
      seen.add(ref.csId);
      ids.push(ref.csId);
    }
  }
  for (const id of record.rulebookRefs) {
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

/**
 * The max monetary limit across every rung of the competent-authority
 * ladder, ONLY if every rung declares one — a single rung with no
 * `monetaryLimitInr` means that tier has no fixed cap (e.g. an HO/GPO
 * Postmaster or the Divisional Head), so the overall answer is genuinely
 * "no fixed limit stated," not a number.
 */
function deriveMonetaryLimitInr(
  competentAuthority: readonly { readonly monetaryLimitInr?: number }[],
): number | undefined {
  if (competentAuthority.length === 0) {
    return undefined;
  }
  const limits: number[] = [];
  for (const rung of competentAuthority) {
    if (rung.monetaryLimitInr === undefined) {
      return undefined;
    }
    limits.push(rung.monetaryLimitInr);
  }
  return Math.max(...limits);
}

/**
 * Resolves the Complete Claim Decision for one account/terminal's
 * `routeId` (the same id-space `OutputRule.routeId` / a card's own id
 * already use). Returns `undefined` — never throws — when the pack has
 * no `decisions` array at all (e.g. the bundled fallback pack) or no
 * record matches this `routeId`; callers push a non-fatal
 * `"missing_decision"` issue in that second case, mirroring the existing
 * `resolveScheme`/`resolveCard` non-throwing pattern.
 */
export function resolveClaimDecision(
  rulePack: RulePack,
  routeId: string,
): { readonly decision?: ClaimDecision; readonly issue?: EngineIssue } {
  const record = rulePack.decisions?.find((d) => d.routeId === routeId);
  if (!record) {
    if (rulePack.decisions === undefined || routeId === "UNRESOLVED") {
      return {};
    }
    return {
      issue: engineIssue(
        "missing_decision",
        `No DecisionRecord in this Rule Pack matches routeId "${routeId}".`,
        routeId,
      ),
    };
  }

  const decision: ClaimDecision = {
    decisionRecordId: record.id,
    decisionStatus: record.decisionStatus,
    decision: record.decision,
    reason: record.reason,
    applicableRuleIds: deriveApplicableRuleIds(record),
    competentAuthority: record.competentAuthority,
    ...(() => {
      const monetaryLimitInr = deriveMonetaryLimitInr(record.competentAuthority);
      return monetaryLimitInr === undefined ? {} : { monetaryLimitInr };
    })(),
    courtOrderRequired: record.courtOrderRequired,
    officialReferences: record.officialReferences,
    ...(record.processingNotes === undefined ? {} : { processingNotes: record.processingNotes }),
    nextActionForPostmaster: record.nextActionForPostmaster,
  };
  return { decision };
}
