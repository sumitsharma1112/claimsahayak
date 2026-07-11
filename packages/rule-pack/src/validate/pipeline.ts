import type { RulePack } from "@claimsahayak/shared-types";
import { formatIssues, onlyErrors, type ValidationIssue } from "../schema/issue.js";
import { parseRulePack } from "../schema/rule-pack.schema.js";
import {
  checkInvalidatesReferenceRealQuestions,
  checkOutputsReferenceReachableRoutes,
  checkOverlayFlagsAreReal,
  checkSatisfiability,
  checkVarReferencesExist,
  reachableRouteIdentifiers,
} from "./reachability.js";
import {
  checkDecisionsReferenceReachableRoutes,
  checkRuleBookCsIdsResolve,
} from "./rulebook-provenance.js";
import {
  checkFixSlugsResolve,
  checkNoOrphanCards,
  checkNoOrphanDocuments,
  checkNoOrphanForms,
  checkNoOrphanTemplates,
  checkRefIdsResolve,
} from "./orphans.js";
import { checkCardRouteTargetsResolve, checkRerouteTargetsResolve } from "./no-dead-end.js";
import { checkLocaleParity, type LocaleParityReport } from "./locale-parity.js";
import { checkCopyLint } from "./copy-lint.js";
import { checkProvenance } from "./provenance.js";
import {
  checkTruthTableFixturesReferentialIntegrity,
  type TruthTableFixture,
} from "./truth-table.js";

export interface PipelineStageResult {
  readonly stage: string;
  readonly issues: readonly ValidationIssue[];
}

export interface PipelineResult {
  readonly ok: boolean;
  readonly stages: readonly PipelineStageResult[];
  readonly localeParity?: LocaleParityReport;
}

/**
 * Runs every Milestone 2 validation gate (V3 §2.5) in sequence: schema →
 * reachability → orphan detection → no-dead-end → locale parity → copy
 * lint → provenance → truth-table referential integrity. `ok` reflects
 * ERROR-severity issues only; WARNING-severity issues (locale parity,
 * overlay flag naming) are surfaced but do not fail the gate, matching
 * this milestone's own "EN complete, HI scaffolded" scope.
 *
 * `raw` is unknown JSON (e.g. freshly parsed from a published artifact) —
 * this is deliberate: the pipeline is exactly as strict about a pack
 * loaded from disk/CDN as it is about the pack authored in this repo.
 */
export function runValidationPipeline(
  raw: unknown,
  fixtures: readonly TruthTableFixture[] = [],
): PipelineResult {
  const stages: PipelineStageResult[] = [];

  const parseResult = parseRulePack(raw);
  stages.push({
    stage: "schema",
    issues: parseResult.ok ? [] : parseResult.error,
  });

  if (!parseResult.ok) {
    return { ok: false, stages };
  }
  const pack: RulePack = parseResult.value;

  stages.push({
    stage: "reachability:var-references",
    issues: checkVarReferencesExist(pack),
  });
  stages.push({
    stage: "reachability:satisfiability",
    issues: checkSatisfiability(pack),
  });
  stages.push({
    stage: "reachability:outputs-reference-routes",
    issues: checkOutputsReferenceReachableRoutes(pack),
  });
  stages.push({
    stage: "reachability:invalidates",
    issues: checkInvalidatesReferenceRealQuestions(pack),
  });
  stages.push({
    stage: "reachability:overlay-flags",
    issues: checkOverlayFlagsAreReal(pack),
  });

  stages.push({ stage: "orphans:refIds-resolve", issues: checkRefIdsResolve(pack) });
  stages.push({ stage: "orphans:documents", issues: checkNoOrphanDocuments(pack) });
  stages.push({ stage: "orphans:forms", issues: checkNoOrphanForms(pack) });
  stages.push({ stage: "orphans:templates", issues: checkNoOrphanTemplates(pack) });
  stages.push({ stage: "orphans:cards", issues: checkNoOrphanCards(pack) });
  stages.push({ stage: "orphans:fix-slugs", issues: checkFixSlugsResolve(pack) });

  stages.push({
    stage: "no-dead-end:card-targets",
    issues: checkCardRouteTargetsResolve(pack),
  });
  stages.push({
    stage: "no-dead-end:reroute-targets",
    issues: checkRerouteTargetsResolve(pack),
  });

  const localeParity = checkLocaleParity(pack);
  stages.push({ stage: "locale-parity", issues: localeParity.issues });

  stages.push({ stage: "copy-lint", issues: checkCopyLint(pack) });
  stages.push({ stage: "provenance", issues: checkProvenance(pack) });
  stages.push({
    stage: "rulebook-provenance:cs-ids-resolve",
    issues: checkRuleBookCsIdsResolve(pack),
  });
  stages.push({
    stage: "rulebook-provenance:decisions-reference-routes",
    issues: checkDecisionsReferenceReachableRoutes(pack, reachableRouteIdentifiers(pack)),
  });

  if (fixtures.length > 0) {
    stages.push({
      stage: "truth-table:referential-integrity",
      issues: checkTruthTableFixturesReferentialIntegrity(pack, fixtures),
    });
  }

  const ok = stages.every((s) => onlyErrors(s.issues).length === 0);
  return { ok, stages, localeParity: localeParity.report };
}

export function formatPipelineResult(result: PipelineResult): string {
  const lines: string[] = [];
  for (const stage of result.stages) {
    if (stage.issues.length === 0) {
      continue;
    }
    lines.push(`\n=== ${stage.stage} ===`);
    lines.push(formatIssues(stage.issues));
  }
  lines.push(
    `\n${result.ok ? "PASS" : "FAIL"} — ${String(
      result.stages.reduce((n, s) => n + onlyErrors(s.issues).length, 0),
    )} error(s), ${String(
      result.stages.reduce((n, s) => n + s.issues.length - onlyErrors(s.issues).length, 0),
    )} warning(s)`,
  );
  if (result.localeParity) {
    for (const [locale, coverage] of Object.entries(result.localeParity.coverageByLocale)) {
      lines.push(
        `Locale coverage (${locale}): ${(coverage * 100).toFixed(1)}% of ${String(
          result.localeParity.totalStrings,
        )} strings`,
      );
    }
  }
  return lines.join("\n");
}
