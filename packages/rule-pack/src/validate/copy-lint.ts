import type { RulePack } from "@claimsahayak/shared-types";
import { issue, type ValidationIssue } from "../schema/issue.js";
import { collectLocalizedTexts } from "./walk-localized-text.js";

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Whole-word, case-sensitive matching (not a plain substring search): a
 * naive substring check on a short forbidden term like "PM" would
 * false-positive on scheme names such as "PM-KISAN" or "PMSBY" that
 * legitimately appear in this pack's own copy. Word boundaries around a
 * hyphen aren't treated as word characters by `\b`, so a forbidden term
 * that is itself hyphenated (e.g. "GSPR-2018") still matches correctly.
 */
export function checkCopyLint(pack: RulePack): readonly ValidationIssue[] {
  const texts = collectLocalizedTexts(pack);
  const issues: ValidationIssue[] = [];

  for (const vocabEntry of pack.vocab) {
    const pattern = new RegExp(`\\b${escapeRegExp(vocabEntry.forbidden)}\\b`);
    texts.forEach((text, i) => {
      const en = text["en"];
      if (typeof en === "string" && pattern.test(en)) {
        issues.push(
          issue(
            `(en string #${String(i)})`,
            `contains forbidden term "${vocabEntry.forbidden}" — use "${vocabEntry.preferred.en}" instead: "${en}"`,
          ),
        );
      }
    });
  }

  return issues;
}
