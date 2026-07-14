import type { ClaimDataModel, FormDefinition, FormLine, LocaleCode, LocalizedText, OfficialFormLayout } from "@claimsahayak/shared-types";
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
 * Milestone 16 — a form with a `body` (the real, verbatim SB Order
 * 31/2020 specimen text — see official-forms.ts) renders as FLOWING
 * PARAGRAPHS with inline blanks, numbered/lettered supporting-document
 * clauses, signature lines, and its own real "For office use only"/
 * Acquittance section — not a numbered label:value list. This is the
 * fix for the earlier approximated rendering: the numbered-row layout
 * below (`layout.fields`) is a UI-friendly paraphrase that never matched
 * how an actual government form reads; the `body` branch is pixel-level
 * text fidelity to the real document instead. Forms not yet checked
 * against a real specimen keep rendering from `layout.fields` (see
 * official-forms.ts's header comment for which is which) until they too
 * get the same treatment.
 */
export function OfficialFormView({
  form,
  layout,
  claimData,
  accountIndex,
  locale,
  schemeName,
}: {
  readonly form: FormDefinition;
  readonly layout: OfficialFormLayout;
  readonly claimData: ClaimDataModel;
  readonly accountIndex: number;
  readonly locale: LocaleCode;
  /** Milestone 16 — Rule-Engine output (`AccountChecklist.schemeName`), needed only by a `body` blank marked `computed: "schemeName"`. Never duplicated into the Claim Data Model — read directly from the engine's own resolved account, same as competent authority/monetary limit elsewhere. */
  readonly schemeName?: LocalizedText;
}) {
  const t = getWizardDictionary(locale);

  function resolveSegmentValue(segment: Extract<FormLine["segments"][number], { kind: "blank" }>): string | undefined {
    if (segment.computed === "schemeName") {
      return schemeName ? pickText(schemeName, locale) : undefined;
    }
    if (!segment.claimDataField) {
      return undefined;
    }
    const resolved = resolveFieldValue(claimData, accountIndex, segment.claimDataField);
    return resolved !== undefined ? formatClaimFieldValue(segment.claimDataField, resolved) : undefined;
  }

  function renderLine(line: FormLine, key: string) {
    if (line.kind === "sectionHeading") {
      return (
        <p key={key} className="m-0 mt-s3 text-center font-display font-semibold uppercase tracking-wide text-ink">
          {line.segments.map((s) => (s.kind === "text" ? s.text : "")).join("")}
        </p>
      );
    }
    if (line.kind === "note") {
      return (
        <p key={key} className="m-0 text-[15px] italic text-ink-soft">
          {line.segments.map((s) => (s.kind === "text" ? s.text : "")).join("")}
        </p>
      );
    }
    if (line.kind === "signatureLine") {
      return (
        <p key={key} className="m-0 mt-s3 border-b border-dotted border-ink-soft/50 pb-s2 text-ink">
          {line.segments.map((segment, i) =>
            segment.kind === "text" ? (
              <span key={i}>{segment.text}</span>
            ) : (
              <InlineBlank key={i} value={resolveSegmentValue(segment)} blankLabel={t.officialFormBlankFieldLabel} />
            ),
          )}
        </p>
      );
    }
    // 'paragraph' and 'listItem'
    return (
      <p key={key} className="m-0 leading-relaxed text-ink">
        {line.kind === "listItem" ? <span className="mr-s2 font-semibold text-ink-soft">{line.marker}</span> : null}
        {line.segments.map((segment, i) =>
          segment.kind === "text" ? (
            <span key={i}>{segment.text}</span>
          ) : (
            <InlineBlank key={i} value={resolveSegmentValue(segment)} blankLabel={t.officialFormBlankFieldLabel} />
          ),
        )}
      </p>
    );
  }

  if (layout.body) {
    return (
      <div className="rounded-control border-2 border-ink/30 bg-paper p-s4">
        <div className="border-b-2 border-ink/20 pb-s3 text-center">
          <p className="m-0 text-[16px] uppercase tracking-wide text-ink-soft">{t.officialFormEyebrow}</p>
          <h3 className="m-0 mt-s1 font-display text-question font-semibold text-ink">{layout.body.formNumber}</h3>
          <p className="m-0 mt-s1 text-[15px] text-ink-soft">{layout.body.ruleCitation}</p>
          <p className="m-0 mt-s2 font-semibold text-ink">{layout.body.heading}</p>
        </div>

        <div className="mt-s4 flex flex-col gap-s2">
          {layout.body.lines.map((line, i) => renderLine(line, `line-${String(i)}`))}
        </div>

        {layout.body.officeUseLines.length > 0 ? (
          <div className="mt-s4 flex flex-col gap-s2 border-t-2 border-ink/20 pt-s3">
            {layout.body.officeUseLines.map((line, i) => renderLine(line, `office-${String(i)}`))}
          </div>
        ) : (
          <OfficeUseFooter locale={locale} />
        )}
      </div>
    );
  }

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

/** Milestone 16 — one inline blank within a flowing paragraph: the resolved (and formatted) value when known, visually distinct (solid) from a genuinely empty blank (an underline run — matching how the real, printed form shows unfilled space, not a phrase). */
function InlineBlank({ value, blankLabel }: { readonly value: string | undefined; readonly blankLabel: string }) {
  if (value) {
    return <span className="font-semibold text-ink">{` ${value} `}</span>;
  }
  return <span className="inline-block min-w-[6em] border-b border-ink-soft/60 align-baseline" title={blankLabel}>{" "}</span>;
}
