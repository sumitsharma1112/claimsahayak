import type { ChecklistDocument, LocaleCode, LocalizedText } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Milestone 6 — the `ChecklistDocument`-level shared content
 * (good-to-know, verification panel, disclaimers) that `evaluateAccount`
 * lifts OUT of per-account sections precisely so it prints once per
 * document, not once per account. Rendered under both the single-account
 * decision summary and the multi-account results list; purely
 * presentational, pack-authored `LocalizedText` only.
 */
function LabeledList({ heading, items, locale }: {
  readonly heading: string;
  readonly items: readonly LocalizedText[];
  readonly locale: LocaleCode;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s3">
      <p className="m-0 font-semibold text-ink-soft">{heading}</p>
      <ul className="m-0 mt-s1 flex list-disc flex-col gap-s1 pl-s5 text-ink">
        {items.map((item, i) => (
          <li key={`${heading}-${String(i)}`}>{pickText(item, locale)}</li>
        ))}
      </ul>
    </div>
  );
}

export function DocumentNotes({
  document: checklistDocument,
  locale,
}: {
  readonly document: ChecklistDocument;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  return (
    <>
      <LabeledList heading={t.resultsGoodToKnowHeading} items={checklistDocument.goodToKnow} locale={locale} />
      <LabeledList
        heading={t.resultsVerificationHeading}
        items={checklistDocument.verificationPanel}
        locale={locale}
      />
      <LabeledList heading={t.resultsDisclaimersHeading} items={checklistDocument.disclaimers} locale={locale} />
    </>
  );
}
