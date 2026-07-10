#!/usr/bin/env tsx
import { RULE_PACK } from "../data/index.js";
import { checkCopyLint } from "../validate/copy-lint.js";
import { checkLocaleParity } from "../validate/locale-parity.js";
import { checkProvenance } from "../validate/provenance.js";
import { formatIssues, onlyErrors } from "../schema/issue.js";

/**
 * A fast content-editing check: copy-lint (forbidden jargon), locale
 * parity (coverage report), and provenance (citation-shape check) only.
 * Intended for quick iteration while authoring content; run validate-pack
 * for the full publish gate (schema, reachability, orphans, no-dead-end,
 * truth-table) before actually publishing a pack.
 */
function main(): void {
  const copyLintIssues = checkCopyLint(RULE_PACK);
  const provenanceIssues = checkProvenance(RULE_PACK);
  const { report, issues: localeIssues } = checkLocaleParity(RULE_PACK);

  console.log("=== copy-lint ===");
  console.log(copyLintIssues.length > 0 ? formatIssues(copyLintIssues) : "(clean)");

  console.log("\n=== provenance ===");
  console.log(provenanceIssues.length > 0 ? formatIssues(provenanceIssues) : "(clean)");

  console.log("\n=== locale-parity ===");
  for (const [locale, coverage] of Object.entries(report.coverageByLocale)) {
    console.log(
      `  ${locale}: ${(coverage * 100).toFixed(1)}% of ${String(report.totalStrings)} strings`,
    );
  }
  if (localeIssues.length > 0) {
    console.log(formatIssues(localeIssues));
  }

  const errorCount =
    onlyErrors(copyLintIssues).length + onlyErrors(provenanceIssues).length;
  console.log(`\n${errorCount === 0 ? "PASS" : "FAIL"} — ${String(errorCount)} error(s)`);
  process.exit(errorCount === 0 ? 0 : 1);
}

main();
