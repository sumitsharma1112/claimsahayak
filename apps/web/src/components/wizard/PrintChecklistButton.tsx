"use client";

import type { LocaleCode } from "@claimsahayak/shared-types";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Milestone 6 Part 3 — hands the finished checklist to the browser's own
 * print dialog (`window.print()`, where "Save as PDF" lives), exactly the
 * mechanism `PrintableTemplate` established in M4.3. Deliberately NOT a
 * PDF-generation library: zero new dependencies, works fully offline
 * (preserving the M4 zero-fetch invariant), and no claim data ever
 * leaves the browser. The M4.3 print pipeline in globals.css prints only
 * the nearest `.cs-print-area` subtree, so callers place this button
 * OUTSIDE that area (a print button on the printout would be noise).
 */
export function PrintChecklistButton({ locale }: { readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  return (
    <div>
      <button
        type="button"
        className="cs-btn-primary"
        onClick={() => {
          window.print();
        }}
      >
        {t.printChecklistLabel}
      </button>
    </div>
  );
}
