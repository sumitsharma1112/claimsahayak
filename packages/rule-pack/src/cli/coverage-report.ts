#!/usr/bin/env tsx
import { RULE_PACK } from "../data/index.js";
import { RULEBOOK_CS_IDS } from "../data/rulebook-cs-ids.js";
import { formatIssues, onlyErrors } from "../schema/issue.js";
import {
  checkDecisionsReferenceReachableRoutes,
  checkEveryReachableRouteHasDecision,
  checkNoDuplicateDecisions,
  checkRuleBookCsIdsResolve,
} from "../validate/rulebook-provenance.js";
import { reachableRouteIdentifiers } from "../validate/reachability.js";

/**
 * Milestone 5 Part 5 — the consolidated Rule Book validation report: every
 * category the milestone asks for (Missing Rules, Unsupported Scenarios,
 * Duplicate Rules, Broken References, Invalid Citations, Coverage
 * Percentage) in one place, reusing the same validators `validate-pack`
 * already runs plus two report-only computations (the missing-rules list,
 * the static unsupported-scenarios list — the latter is DATA, carried
 * forward from the integration report already produced when this pack's
 * Rule Book conversion was authored, not re-derived by static analysis).
 *
 *   pnpm --filter @claimsahayak/rule-pack run coverage-report
 */

type CarrierWithSourceRefs = { readonly sourceRefs?: readonly string[] };

function collectCitedCsIds(pack: typeof RULE_PACK): ReadonlySet<string> {
  const cited = new Set<string>();
  const fromSourceRefs = (carriers: readonly CarrierWithSourceRefs[]): void => {
    for (const c of carriers) {
      for (const id of c.sourceRefs ?? []) {
        cited.add(id);
      }
    }
  };
  fromSourceRefs(pack.questions);
  fromSourceRefs(pack.routes);
  fromSourceRefs(pack.outputs);
  fromSourceRefs(pack.forms);
  fromSourceRefs(pack.documents);
  for (const overlay of pack.overlays) {
    for (const id of overlay.sourceRefs ?? []) {
      cited.add(id);
    }
    for (const item of overlay.items) {
      for (const id of item.sourceRefs ?? []) {
        cited.add(id);
      }
    }
  }
  for (const decision of pack.decisions ?? []) {
    for (const ref of decision.officialReferences) {
      cited.add(ref.csId);
    }
  }
  return cited;
}

/**
 * Known-and-already-reported Rule Book scenarios the current pack/engine
 * genuinely cannot express, carried forward as data (not re-derived) from
 * the integration report produced when this pack was authored against the
 * Rule Book. Each entry names the concrete blocker, never invents a fix.
 */
const UNSUPPORTED_SCENARIOS: readonly string[] = [
  "NSC/KVP continuation cap of ≤ 3 nominees/heirs (CS-SCH-007/008): stated as information only — not enforced. The engine has no list-typed \"how many claimants are continuing together\" fact and no count() operator.",
  "RD Protected Savings Scheme eligibility (CS-SCH-002, D-18): the 1-year claim deadline and compound conditions (deposit history, age at opening, loan history) are stated as information, not verified — same list-fact/count() limitation.",
  "SCSS spouse-continuation eligibility (CS-SCH-005/CS-JNT-011, D-17): \"spouse, joint holder or sole nominee eligible at date of death\" is stated as information, not verified against actual relationship/eligibility data.",
  "Untraceable/unwilling co-nominee with no disclaimer (CS-MNM-006, D-07X): the Rule Book itself has no official procedure (OQ-14) — routed to a referral card, not a real decision.",
  "Heirs-of-last-dead-nominee competent authority (CS-PRE-004/005, D-06): the Rule Book itself leaves the exact authority open (OQ-11) — routed to \"depends on evidence track\", not a fixed authority.",
  "Freeze/pledge release procedure (M-B, OQ-28): the Rule Book itself has no published release procedure — the overlay states the gap, not an invented process.",
  "Unsound-mind adult depositor (D-13 residual): unaddressed; the Rule Book itself leaves this open (OQ-26).",
  "Inter-post-office claim forwarding (M-D): deliberately not modeled as a claimant-facing question — internal DoP mechanics, same precedent as the pack's existing NV-10.",
  "Scheme-specific claim/closure forms (DOC-C1–C11: SCSS Form-3/4 added; NSC/KVP/MIS/RD/TD/PPF/POSA scheme forms not yet substituted for the generic Form 11 on the 8 pre-existing schemes) — Rule Book Topic 8 §C notes certificates specifically may need scheme forms rather than Form 11.",
  "Multi-account Wizard evaluation: the Wizard (apps/web) evaluates only rulePack.schemes[0] — a pre-existing Milestone 4 limitation, not something this Rule Book integration was asked to fix.",
  "Result Page / PDF rendering of the full ChecklistDocument: apps/web now renders ClaimDecision + AccountChecklist for the single-account terminal state (Milestone 5), but there is still no multi-account result page or PDF export.",
  "The 6-month no-nomination wait gate (T17/T19, CS-NON-002) and the 10-year freeze overlay's derived trigger: apps/web's Wizard never computes derived date values (always passes `undefined`), so ROUTE_C (the discretionary affidavit route) is currently unreachable in the live app — it always falls to the WAIT card instead, even past 6 months. Discovered during Milestone 5 manual verification; a pre-existing Milestone 4 gap, not introduced by this integration.",
];

function main(): void {
  const pack = RULE_PACK;
  const reachable = reachableRouteIdentifiers(pack);

  console.log("=== ClaimSahayak Rule Pack — Rule Book Validation Report ===\n");

  // 1. Invalid citations
  const invalidCitationIssues = checkRuleBookCsIdsResolve(pack);
  console.log(`--- Invalid Citations (${String(invalidCitationIssues.length)}) ---`);
  console.log(invalidCitationIssues.length > 0 ? formatIssues(invalidCitationIssues) : "(none)");

  // 2. Broken references (both directions)
  const brokenDecisionRefs = checkDecisionsReferenceReachableRoutes(pack, reachable);
  const missingDecisionCoverage = checkEveryReachableRouteHasDecision(pack);
  const brokenReferenceIssues = [...brokenDecisionRefs, ...missingDecisionCoverage];
  console.log(`\n--- Broken References (${String(brokenReferenceIssues.length)}) ---`);
  console.log(brokenReferenceIssues.length > 0 ? formatIssues(brokenReferenceIssues) : "(none)");

  // 3. Duplicate rules
  const duplicateIssues = checkNoDuplicateDecisions(pack);
  console.log(`\n--- Duplicate Rules (${String(duplicateIssues.length)}) ---`);
  console.log(duplicateIssues.length > 0 ? formatIssues(duplicateIssues) : "(none)");

  // 4. Missing rules + coverage percentage
  const cited = collectCitedCsIds(pack);
  const missingRules = RULEBOOK_CS_IDS.filter((id) => !cited.has(id));
  const coveredCount = RULEBOOK_CS_IDS.length - missingRules.length;
  const coveragePercent = (coveredCount / RULEBOOK_CS_IDS.length) * 100;
  console.log(`\n--- Missing Rules (${String(missingRules.length)} of ${String(RULEBOOK_CS_IDS.length)} verified CS-IDs) ---`);
  console.log(missingRules.length > 0 ? missingRules.join(", ") : "(none)");

  // 5. Unsupported scenarios
  console.log(`\n--- Unsupported Scenarios (${String(UNSUPPORTED_SCENARIOS.length)}) ---`);
  for (const scenario of UNSUPPORTED_SCENARIOS) {
    console.log(`  - ${scenario}`);
  }

  // 6. Coverage percentage
  console.log(`\n--- Coverage Percentage ---`);
  console.log(`  ${coveredCount} / ${RULEBOOK_CS_IDS.length} verified CS-IDs cited = ${coveragePercent.toFixed(1)}%`);

  const errorCount =
    onlyErrors(invalidCitationIssues).length +
    onlyErrors(brokenReferenceIssues).length +
    onlyErrors(duplicateIssues).length;
  console.log(`\n${errorCount === 0 ? "PASS" : "FAIL"} — ${String(errorCount)} error(s) across invalid-citations/broken-references/duplicate-rules`);
  process.exit(errorCount === 0 ? 0 : 1);
}

main();
