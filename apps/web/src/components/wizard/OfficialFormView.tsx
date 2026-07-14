import type { ClaimDataModel, FormDefinition, LocaleCode, OfficialFormLayout } from "@claimsahayak/shared-types";
import { formatInr } from "@claimsahayak/shared-utils";
import { resolveFieldValue } from "@claimsahayak/rule-engine";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { formatClaimFieldValue } from "@/lib/formatClaimFieldValue";
import { OfficeUseFooter } from "./OfficeUseFooter";

/**
 * Milestone 7 Part 4/6, Tier A of the document-fidelity model: renders one
 * official India Post form from its FIXED `OfficialFormLayout` (never
 * regenerated — see claim-data.ts). Each field prints the resolved
 * Claim Data Model value when available, or a visible blank for the
 * claimant/officer to complete by hand.
 *
 * Milestone 11 revision — the original rendering (a plain label/value
 * list) was functionally correct but didn't visually read as an official
 * form, and dropped `FormDefinition`'s own execution metadata
 * (signatories/executedBefore/stampPaper/officialSourceUrl) entirely,
 * even though that data was always there. This version: (a) a bordered,
 * letterhead-style page instead of a plain card, (b) numbered fields in a
 * single-line label:value form, matching how the real forms are laid
 * out, with auto-filled values visually distinct (solid) from hand-fill
 * blanks (dotted, italic), and (c) a certification block surfacing who
 * signs, where it's executed, the stamp-paper requirement, copies
 * needed, and the official source link — all Rule-Book-sourced data that
 * already existed on `FormDefinition`, just never rendered.
 *
 * Milestone 13 — a boxed "For Office Use Only" footer, the way many real
 * government forms carry one: received-on / verified-by / forwarded-on.
 * Deliberately chrome, not data: there is no `ClaimDataField` for any of
 * these (each is a future act by office staff — receiving, verifying,
 * forwarding — not a fact the Wizard or Claim Data Model could ever
 * supply), so every line always prints blank. Present on Tier A official
 * forms only; Tier B office documents (forwarding letter, approval note,
 * office note) already end in their own office-authored signature/
 * verification blocks and don't need a second one.
 */
export function OfficialFormView({
  form,
  layout,
  claimData,
  accountIndex,
  locale,
}: {
  readonly form: FormDefinition;
  readonly layout: OfficialFormLayout;
  readonly claimData: ClaimDataModel;
  readonly accountIndex: number;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  return (
    <div className="rounded-control border-2 border-ink/30 bg-paper p-s4">
      <div className="border-b-2 border-ink/20 pb-s3 text-center">
        <p className="m-0 text-[16px] uppercase tracking-wide text-ink-soft">{t.officialFormEyebrow}</p>
        <h3 className="m-0 mt-s1 font-display text-question font-semibold text-ink">{pickText(form.name, locale)}</h3>
        <p className="m-0 mt-s1 text-[16px] italic text-ink-soft">{pickText(form.purpose, locale)}</p>
      </div>

      <ol className="m-0 mt-s4 flex list-none flex-col gap-s2 pl-0">
        {layout.fields.map((field, i) => {
          const resolved = field.claimDataField
            ? resolveFieldValue(claimData, accountIndex, field.claimDataField)
            : undefined;
          // Milestone 15 — formatting is purely presentational: it never
          // changes what's stored, only how an already-resolved value
          // prints (amounts as currency, dates as DD-MM-YYYY).
          const value = resolved !== undefined && field.claimDataField
            ? formatClaimFieldValue(field.claimDataField, resolved)
            : resolved;
          return (
            <li
              key={field.id}
              className="flex flex-wrap items-baseline gap-x-s2 border-b border-dotted border-ink-soft/40 pb-s1"
            >
              <span className="shrink-0 font-semibold text-ink-soft">{i + 1}.</span>
              <span className="shrink-0 text-ink-soft">{pickText(field.label, locale)}:</span>
              <span className={`flex-1 ${value ? "font-semibold text-ink" : "italic text-ink-soft"}`}>
                {value ?? t.officialFormBlankFieldLabel}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-s4 grid grid-cols-1 gap-s3 border-t-2 border-ink/20 pt-s3 text-[16px] desktop:grid-cols-2">
        <div>
          <p className="m-0 font-semibold text-ink-soft">{t.officialFormSignatoriesLabel}</p>
          <p className="m-0 mt-s1 text-ink">{pickText(form.signatories, locale)}</p>
        </div>
        <div>
          <p className="m-0 font-semibold text-ink-soft">{t.officialFormExecutedBeforeLabel}</p>
          <p className="m-0 mt-s1 text-ink">{pickText(form.executedBefore, locale)}</p>
        </div>
        {form.stampPaper ? (
          <div>
            <p className="m-0 font-semibold text-ink-soft">{t.officialFormStampPaperLabel}</p>
            <p className="m-0 mt-s1 text-ink">
              {formatInr(form.stampPaper.commonValueInr)} — {t.officialFormValidForLabel} {form.stampPaper.validityMonths}{" "}
              {t.officialFormMonthsLabel}
            </p>
            <p className="m-0 mt-s1 text-[16px] text-ink-soft">{pickText(form.stampPaper.stateVariationNote, locale)}</p>
          </div>
        ) : null}
        <div>
          <p className="m-0 font-semibold text-ink-soft">{t.officialFormCopiesLabel}</p>
          <p className="m-0 mt-s1 text-ink">{form.copies}</p>
        </div>
      </div>

      {form.officialSourceUrl ? (
        <p className="m-0 mt-s3 text-[16px] text-ink-soft">
          {t.officialFormSourceLabel}: {form.officialSourceUrl}
        </p>
      ) : null}

      <OfficeUseFooter locale={locale} />
    </div>
  );
}
