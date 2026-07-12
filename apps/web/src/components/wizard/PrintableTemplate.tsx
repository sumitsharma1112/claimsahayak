import type { ClaimDataModel, LocaleCode, TemplateDefinition } from "@claimsahayak/shared-types";
import { resolveFieldValue } from "@claimsahayak/rule-engine";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Renders one Rule Pack `TemplateDefinition` as a printable letter, and a
 * "Print Letter" button that hands off to the browser's own print dialog
 * (`window.print()`). Every field renders purely from its own `kind`
 * (staticText/blankLine/checkboxRow) — never from the template's id.
 *
 * Milestone 7 (Tier B of the document-fidelity model): a `blankLine` field
 * that declares `claimDataField` prints the resolved Claim Data Model
 * value instead of a bare underline, once one has been entered. Optional
 * and additive — `claimData`/`accountIndex` are omitted by every M4.3
 * pause-card caller (data entry happens post-decision, before which no
 * Claim Data Model exists yet), so those templates render exactly as
 * before: a blank line for the claimant to hand-fill.
 */
export function PrintableTemplate({
  template,
  locale,
  claimData,
  accountIndex,
}: {
  readonly template: TemplateDefinition;
  readonly locale: LocaleCode;
  readonly claimData?: ClaimDataModel;
  readonly accountIndex?: number;
}) {
  const t = getWizardDictionary(locale);
  return (
    <div>
      <button
        type="button"
        className="cs-btn-secondary"
        onClick={() => {
          window.print();
        }}
      >
        {t.printLetterLabel}
      </button>
      <div className="cs-print-area mt-s3 flex flex-col gap-s3 rounded-control border border-ink-soft/20 bg-paper p-s4">
        <h3 className="m-0 font-display font-semibold text-ink">{pickText(template.title, locale)}</h3>
        {template.fields.map((field) => {
          const autoFilledValue =
            claimData && field.kind === "blankLine" && field.claimDataField
              ? resolveFieldValue(claimData, accountIndex ?? -1, field.claimDataField)
              : undefined;
          return (
            <div key={field.id}>
              <p className="m-0 font-semibold text-ink-soft">{pickText(field.label, locale)}</p>
              {field.kind === "blankLine" ? (
                <p className="m-0 mt-s2 border-b border-ink-soft/40 pb-s4 text-ink">
                  {autoFilledValue ?? <>&nbsp;</>}
                </p>
              ) : (
                <p className="m-0 mt-s1 text-ink">
                  {field.kind === "checkboxRow" ? "☐ " : ""}
                  {field.text ? pickText(field.text, locale) : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
