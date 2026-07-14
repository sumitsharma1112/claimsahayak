import type { LocaleCode } from "@claimsahayak/shared-types";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Milestone 13 (Form 11) / Milestone 15 (extracted for reuse on the
 * reconciliation-certificate requests too) — a boxed "For office use
 * only" footer: received-on / verified-by / forwarded-on. Deliberately
 * chrome, not data — there is no `ClaimDataField` for any of these (each
 * is a future act by office staff, never a fact the Wizard or Claim Data
 * Model could supply), so every line always prints blank.
 */
export function OfficeUseFooter({ locale }: { readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  return (
    <div className="mt-s4 rounded-control border border-dashed border-ink-soft/40 p-s3">
      <p className="m-0 text-[16px] font-semibold uppercase tracking-wide text-ink-soft">
        {t.officialFormOfficeUseHeading}
      </p>
      <div className="mt-s2 grid grid-cols-1 gap-s2 text-[16px] desktop:grid-cols-3">
        <p className="m-0 border-b border-dotted border-ink-soft/40 pb-s1 text-ink-soft">
          {t.officialFormOfficeUseReceivedOnLabel}
        </p>
        <p className="m-0 border-b border-dotted border-ink-soft/40 pb-s1 text-ink-soft">
          {t.officialFormOfficeUseVerifiedByLabel}
        </p>
        <p className="m-0 border-b border-dotted border-ink-soft/40 pb-s1 text-ink-soft">
          {t.officialFormOfficeUseForwardedOnLabel}
        </p>
      </div>
    </div>
  );
}
