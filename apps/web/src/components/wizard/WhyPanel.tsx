import type { LocaleCode, LocalizedText } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Expandable "why we ask" strip. A native <details>/<summary> disclosure is
 * keyboard- and screen-reader-operable with zero custom ARIA wiring.
 * Presentation only — the why text itself is Rule Pack data (`whyStrip`).
 */
export function WhyPanel({
  questionId,
  whyText,
  locale,
}: {
  readonly questionId: string;
  readonly whyText: LocalizedText;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  return (
    <details
      id={`question-${questionId}-why`}
      className="mt-s2 rounded-control border border-ink-soft/20 bg-paper px-s3 py-s2"
    >
      <summary className="flex min-h-touch cursor-pointer items-center font-semibold text-peacock">
        {t.whyToggleLabel}
      </summary>
      <p className="mb-0 mt-s2 text-ink-soft">{pickText(whyText, locale)}</p>
    </details>
  );
}
