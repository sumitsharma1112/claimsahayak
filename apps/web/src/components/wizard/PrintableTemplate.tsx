import type { ClaimDataModel, LocaleCode, TemplateDefinition } from "@claimsahayak/shared-types";
import { resolveFieldValue } from "@claimsahayak/rule-engine";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { formatClaimFieldValue } from "@/lib/formatClaimFieldValue";
import { OfficeUseFooter } from "./OfficeUseFooter";

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
 *
 * Milestone 15 (production document quality) — brought up to the same
 * visual standard as `OfficialFormView` (Tier A): every field is now a
 * numbered row (matching how a real numbered application/letter reads,
 * and giving Tier B documents the same convention Tier A already has),
 * auto-filled values are visually distinct (solid) from hand-fill blanks
 * (italic, muted, "fill in by hand"), and resolved values are formatted
 * for display the same way (currency, DD-MM-YYYY dates) via
 * `formatClaimFieldValue`. The eyebrow reads "Office-prepared document"
 * rather than "Official India Post Form" — these are ClaimSahayak-
 * composed, not gazetted forms, and the document-fidelity model has
 * always drawn that distinction; this just makes it visible on the page
 * itself, not only in source comments.
 */
export function PrintableTemplate({
  template,
  locale,
  claimData,
  accountIndex,
  showOfficeUseFooter = false,
}: {
  readonly template: TemplateDefinition;
  readonly locale: LocaleCode;
  readonly claimData?: ClaimDataModel;
  readonly accountIndex?: number;
  /** Milestone 15 — true only for documents an external office (e.g. the
   * Division office processing a reconciliation-certificate request)
   * would receive, verify, and forward, mirroring Form 11's own footer.
   * Purely a rendering choice, set by the caller that already knows the
   * document's identity — not a document-selection decision. */
  readonly showOfficeUseFooter?: boolean;
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
      <div className="cs-print-area mt-s3 rounded-control border-2 border-ink/30 bg-paper p-s4">
        <div className="border-b-2 border-ink/20 pb-s3 text-center">
          <p className="m-0 text-[16px] uppercase tracking-wide text-ink-soft">{t.printableTemplateEyebrow}</p>
          <h3 className="m-0 mt-s1 font-display font-semibold text-ink">{pickText(template.title, locale)}</h3>
        </div>
        <ol className="m-0 mt-s4 flex list-none flex-col gap-s2 pl-0">
          {template.fields.map((field, i) => {
            const resolved =
              claimData && field.kind === "blankLine" && field.claimDataField
                ? resolveFieldValue(claimData, accountIndex ?? -1, field.claimDataField)
                : undefined;
            const value =
              resolved !== undefined && field.claimDataField
                ? formatClaimFieldValue(field.claimDataField, resolved)
                : resolved;
            return (
              <li
                key={field.id}
                className="flex flex-wrap items-baseline gap-x-s2 border-b border-dotted border-ink-soft/40 pb-s1"
              >
                <span className="shrink-0 font-semibold text-ink-soft">{i + 1}.</span>
                <span className="shrink-0 text-ink-soft">{pickText(field.label, locale)}:</span>
                {field.kind === "blankLine" ? (
                  <span className={`flex-1 ${value ? "font-semibold text-ink" : "italic text-ink-soft"}`}>
                    {value ?? t.officialFormBlankFieldLabel}
                  </span>
                ) : (
                  <span className="flex-1 text-ink">
                    {field.kind === "checkboxRow" ? "☐ " : ""}
                    {field.text ? pickText(field.text, locale) : ""}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        {showOfficeUseFooter ? <OfficeUseFooter locale={locale} /> : null}
      </div>
    </div>
  );
}
