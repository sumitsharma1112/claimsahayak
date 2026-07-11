import type { ClaimDataModel, FormDefinition, LocaleCode, OfficialFormLayout } from "@claimsahayak/shared-types";
import { resolveAccountNumber, resolveClaimDataValue } from "@claimsahayak/rule-engine";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Milestone 7 Part 4/6, Tier A of the document-fidelity model: renders one
 * official India Post form from its FIXED `OfficialFormLayout` (never
 * regenerated — see claim-data.ts). Each field prints the resolved
 * Claim Data Model value when available, or a visible blank for the
 * claimant/officer to complete by hand — same "blank line" affordance
 * `PrintableTemplate` has used since M4.3, just field-driven here instead
 * of hand-authored per letter.
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
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s3">
      <h3 className="m-0 font-display font-semibold text-ink">{pickText(form.name, locale)}</h3>
      <p className="m-0 mt-s1 text-[16px] text-ink-soft">{pickText(form.purpose, locale)}</p>
      <dl className="m-0 mt-s3 flex flex-col gap-s2">
        {layout.fields.map((field) => {
          const value =
            field.claimDataField === "account.number"
              ? resolveAccountNumber(claimData, accountIndex)
              : field.claimDataField
                ? resolveClaimDataValue(claimData, field.claimDataField)
                : undefined;
          return (
            <div key={field.id}>
              <dt className="text-ink-soft">{pickText(field.label, locale)}</dt>
              <dd className="m-0 mt-s1 border-b border-ink-soft/40 pb-s1 text-ink">
                {value ?? <span className="text-ink-soft">{t.officialFormBlankFieldLabel}</span>}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
