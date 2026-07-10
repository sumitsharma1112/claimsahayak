import type { RulePack } from "@claimsahayak/shared-types";
import { issue, type ValidationIssue } from "../schema/issue.js";

/**
 * A citation should contain at least one recognizable marker: a section
 * symbol, "FAQ", "Annexure", "SB Order", "Blueprint", or "NV-" (a
 * Needs-Verification reference standing in for a handbook citation where
 * the handbook itself is silent). Schema validation already guarantees
 * `handbookRef` is non-empty; this check catches a placeholder-shaped
 * string ("TODO", "tbd", a stray word) that technically passes that but
 * clearly isn't a real citation.
 */
const CITATION_MARKER_PATTERN = /§|FAQ|Annexure|SB Order|Blueprint|NV-|R-\d/;

function checkCarriers<T extends { readonly handbookRef: string }>(
  carriers: readonly T[],
  label: string,
  idOf: (c: T) => string,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  carriers.forEach((c, i) => {
    if (!CITATION_MARKER_PATTERN.test(c.handbookRef)) {
      issues.push(
        issue(
          `${label}[${String(i)}](${idOf(c)}).handbookRef`,
          `"${c.handbookRef}" does not look like a real citation (expected a §, FAQ, Annexure, SB Order, Blueprint, or NV- reference)`,
        ),
      );
    }
  });
  return issues;
}

export function checkProvenance(pack: RulePack): readonly ValidationIssue[] {
  const contentWithHandbookRef = pack.content.filter(
    (c): c is typeof c & { handbookRef: string } => c.handbookRef !== undefined,
  );
  return [
    ...checkCarriers(pack.questions, "questions", (c) => c.id),
    ...checkCarriers(pack.routes, "routes", (c) => c.id),
    ...checkCarriers(pack.outputs, "outputs", (c) => c.id),
    ...checkCarriers(pack.overlays, "overlays", (c) => c.flagId),
    ...checkCarriers(pack.templates, "templates", (c) => c.id),
    ...checkCarriers(contentWithHandbookRef, "content", (c) => c.id),
  ];
}
