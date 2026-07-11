"use client";

import { useEffect, useRef } from "react";
import type {
  AccountChecklist,
  ClaimDataModel,
  LocaleCode,
  OfficialFormLayout,
  RulePack,
} from "@claimsahayak/shared-types";
import { resolveDocumentSelection, validateClaimPackage } from "@claimsahayak/rule-engine";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { ClaimDecisionSummary } from "./ClaimDecisionSummary";
import { OfficialFormView } from "./OfficialFormView";
import { PrintableTemplate } from "./PrintableTemplate";
import { PreviousButton } from "./PreviousButton";

const OFFICE_DOCUMENT_TEMPLATE_IDS = ["template_forwarding_letter", "template_approval_note"];

/**
 * Milestone 7 Part 5 — the complete, printable Claim Package for one or
 * more decision-bearing accounts: decision summary + Rule Engine
 * explanation + checklist (reusing `ClaimDecisionSummary`, unchanged, for
 * all of that — Parts 1/2/3/11-15), plus what's new this milestone —
 * auto-filled official forms/affidavits/indemnity bonds (Tier A,
 * `OfficialFormView`), an auto-filled forwarding letter and approval note
 * (Tier B, the extended `PrintableTemplate`), and a compact office
 * checklist table. A non-blocking "missing information" prompt
 * (`validateClaimPackage`) sits above everything — printing is never
 * blocked, since gaps can legitimately be filled by hand at the counter.
 */
function OfficeChecklistTable({ account, locale }: { readonly account: AccountChecklist; readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  const rows = account.sections.flatMap((section) => section.items.map((item) => ({ section, item })));
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="overflow-x-auto rounded-control border border-ink-soft/20 bg-paper p-s3">
      <p className="m-0 mb-s2 font-semibold text-ink-soft">{t.claimPackageOfficeChecklistHeading}</p>
      <table className="w-full border-collapse text-[16px]">
        <thead>
          <tr className="border-b border-ink-soft/20 text-left text-ink-soft">
            <th className="py-s1 pr-s3">{t.claimPackageOfficeChecklistItemColumn}</th>
            <th className="py-s1 pr-s3">{t.claimPackageOfficeChecklistSectionColumn}</th>
            <th className="py-s1">{t.claimPackageOfficeChecklistVerifiedByColumn}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ section, item }) => (
            <tr key={item.id} className="border-b border-ink-soft/10">
              <td className="py-s1 pr-s3 text-ink">{pickText(item.label, locale)}</td>
              <td className="py-s1 pr-s3 text-ink-soft">{pickText(section.title, locale)}</td>
              <td className="py-s1 text-ink-soft">{pickText(item.attrs.verifiedBy, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AutoFilledDocuments({
  account,
  rulePack,
  officialFormLayouts,
  claimData,
  locale,
}: {
  readonly account: AccountChecklist;
  readonly rulePack: RulePack;
  readonly officialFormLayouts: readonly OfficialFormLayout[];
  readonly claimData: ClaimDataModel;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  const layoutsById = new Map(officialFormLayouts.map((l) => [l.formId, l]));
  const selection = resolveDocumentSelection(rulePack, account);
  const officialEntries = selection.filter((e) => e.form && layoutsById.has(e.form.id));

  const officeTemplates = rulePack.templates.filter((tpl) => OFFICE_DOCUMENT_TEMPLATE_IDS.includes(tpl.id));

  if (officialEntries.length === 0 && officeTemplates.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-s3">
      <p className="m-0 font-semibold text-ink-soft">{t.claimPackageAutoFilledHeading}</p>
      {officialEntries.map((entry) =>
        entry.form ? (
          <OfficialFormView
            key={entry.checklistItemId}
            form={entry.form}
            layout={layoutsById.get(entry.form.id) as OfficialFormLayout}
            claimData={claimData}
            accountIndex={account.accountIndex}
            locale={locale}
          />
        ) : null,
      )}
      {officeTemplates.map((tpl) => (
        <PrintableTemplate
          key={tpl.id}
          template={tpl}
          locale={locale}
          claimData={claimData}
          accountIndex={account.accountIndex}
        />
      ))}
    </div>
  );
}

export function ClaimPackage({
  accounts,
  rulePack,
  officialFormLayouts,
  claimData,
  locale,
  onBack,
  canGoBack,
}: {
  readonly accounts: readonly AccountChecklist[];
  readonly rulePack: RulePack;
  readonly officialFormLayouts: readonly OfficialFormLayout[];
  readonly claimData: ClaimDataModel;
  readonly locale: LocaleCode;
  readonly onBack: () => void;
  readonly canGoBack: boolean;
}) {
  const t = getWizardDictionary(locale);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, []);

  const officeTemplates = rulePack.templates.filter((tpl) => OFFICE_DOCUMENT_TEMPLATE_IDS.includes(tpl.id));
  const missingInfo = validateClaimPackage(rulePack, accounts, claimData, officialFormLayouts, officeTemplates);

  return (
    <section aria-labelledby="claim-package-heading" className="flex flex-col gap-s4">
      <h2
        ref={headingRef}
        id="claim-package-heading"
        tabIndex={-1}
        className="m-0 font-display text-question font-semibold text-ink outline-none"
      >
        {t.claimPackageHeading}
      </h2>

      {missingInfo.length > 0 ? (
        <div role="status" className="rounded-control border border-notice/40 bg-notice-bg p-s3">
          <p className="m-0 font-semibold text-notice">{t.claimPackageMissingInfoHeading}</p>
          <ul className="m-0 mt-s2 flex list-disc flex-col gap-s1 pl-s5 text-ink">
            {missingInfo.map((i) => (
              <li key={`${String(i.accountIndex)}-${i.documentId}-${i.fieldId}`}>{i.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {accounts.map((account) => (
        <div key={account.accountIndex} className="flex flex-col gap-s3">
          <p className="m-0 font-semibold text-ink-soft">{pickText(account.schemeName, locale)}</p>
          {account.decision ? (
            <ClaimDecisionSummary
              account={account}
              decision={account.decision}
              locale={locale}
              onBack={onBack}
              canGoBack={canGoBack}
              focusOnMount={false}
              showPrevious={false}
            />
          ) : null}
          <OfficeChecklistTable account={account} locale={locale} />
          <AutoFilledDocuments
            account={account}
            rulePack={rulePack}
            officialFormLayouts={officialFormLayouts}
            claimData={claimData}
            locale={locale}
          />
        </div>
      ))}

      <div className="flex gap-s3">
        <PreviousButton locale={locale} disabled={!canGoBack} onClick={onBack} />
      </div>
    </section>
  );
}
