import { LOCALE_CODES, type LocaleCode, type RulePack } from "@claimsahayak/shared-types";
import { warning, type ValidationIssue } from "../schema/issue.js";
import { collectLocalizedTexts } from "./walk-localized-text.js";

export interface LocaleParityReport {
  readonly totalStrings: number;
  readonly coverageByLocale: Readonly<Record<Exclude<LocaleCode, "en">, number>>;
}

const NON_ENGLISH_LOCALES = LOCALE_CODES.filter(
  (l): l is Exclude<LocaleCode, "en"> => l !== "en",
);

/**
 * Reports Hindi (and any other non-English locale) coverage across every
 * LocalizedText in the pack. This intentionally returns WARNINGS, not
 * errors: the Roadmap defines Milestone 2's deliverable as "Rule Pack v0
 * (EN complete, HI scaffolded)" — full Hindi authoring is a parallel
 * content track finishing before Milestone 13, not a Milestone 2 gate.
 */
export function checkLocaleParity(
  pack: RulePack,
): { report: LocaleParityReport; issues: readonly ValidationIssue[] } {
  const texts = collectLocalizedTexts(pack);

  const coverageByLocale = {} as Record<Exclude<LocaleCode, "en">, number>;
  const issues: ValidationIssue[] = [];

  for (const locale of NON_ENGLISH_LOCALES) {
    const present = texts.filter((t) => typeof t[locale] === "string").length;
    coverageByLocale[locale] = texts.length === 0 ? 1 : present / texts.length;
    if (coverageByLocale[locale] < 1) {
      const missing = texts.length - present;
      issues.push(
        warning(
          "$.content/questions/routes/... (locale coverage)",
          `${String(missing)} of ${String(texts.length)} strings have no "${locale}" translation yet (EN-complete/HI-scaffolded is expected at this milestone)`,
        ),
      );
    }
  }

  return {
    report: { totalStrings: texts.length, coverageByLocale },
    issues,
  };
}
