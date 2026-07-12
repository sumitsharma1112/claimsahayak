"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type {
  AccountChecklist,
  ClaimDataModel,
  ClaimDecision,
  LocaleCode,
  OfficialFormLayout,
  RulePack,
} from "@claimsahayak/shared-types";
import { formatInr } from "@claimsahayak/shared-utils";
import { resolveDocumentSelection, validateClaimPackage } from "@claimsahayak/rule-engine";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { ClaimDecisionSummary } from "./ClaimDecisionSummary";
import { OfficialFormView } from "./OfficialFormView";
import { PrintableTemplate } from "./PrintableTemplate";
import { PreviousButton } from "./PreviousButton";

const OFFICE_DOCUMENT_TEMPLATE_IDS = [
  "template_forwarding_letter",
  "template_approval_note",
  "template_office_note",
  "template_witness_sheet",
];

/**
 * Milestone 10 — unlike the office documents above (unconditionally
 * attached to every payable Claim File), this Rule-Book-sourced
 * declaration is only relevant when the claim actually involves a minor
 * nominee. Selected conditionally below by checking whether the account's
 * own Rule-Engine-computed document selection already requires
 * `doc_minor_alive_certificate` (T13's own OutputRule) — reusing data the
 * engine already gets right, rather than a new hardcoded route check. See
 * declarations.ts's header comment for the full research trail.
 */
const MINOR_ALIVE_DECLARATION_TEMPLATE_ID = "template_minor_alive_declaration";
const MINOR_ALIVE_DOCUMENT_ID = "doc_minor_alive_certificate";

/** The office/declaration template ids relevant to ONE account — shared between file assembly and validation so the two never disagree. */
function officeTemplateIdsForAccount(rulePack: RulePack, account: AccountChecklist): readonly string[] {
  const selection = resolveDocumentSelection(rulePack, account);
  const includesMinorAliveDeclaration = selection.some((e) => e.document?.id === MINOR_ALIVE_DOCUMENT_ID);
  return includesMinorAliveDeclaration
    ? [...OFFICE_DOCUMENT_TEMPLATE_IDS, MINOR_ALIVE_DECLARATION_TEMPLATE_ID]
    : OFFICE_DOCUMENT_TEMPLATE_IDS;
}

/**
 * Milestone 8 — the Claim Package (M7) becomes a full, paginated Claim
 * File: a cover page, a print index, and every document assembled in the
 * order a Postmaster actually files a physical claim (decision → authority
 * sheets → auto-filled forms/letters → office checklist), each starting
 * on its own printed page (`.cs-print-page`, `globals.css`), plus a
 * Missing Document Report at the end covering every account together.
 *
 * All of this is a PRESENTATION layer over data that already existed
 * before this milestone (`ClaimDecision` since M5, `resolveDocumentSelection`/
 * `validateClaimPackage` since M7) — no new engine computation, no new
 * legal content. `ClaimDecisionSummary` itself is reused completely
 * unmodified for the decision+checklist unit (Parts 1-3, 11-15 of the
 * original brief); everything below is new page-level packaging around
 * data that component already had access to.
 */

interface FileEntry {
  readonly id: string;
  readonly title: string;
  readonly node: ReactNode;
}

function CoverPage({
  accounts,
  claimData,
  locale,
}: {
  readonly accounts: readonly AccountChecklist[];
  readonly claimData: ClaimDataModel;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  // Display-only, computed once at render time — never fed back into the
  // engine or persisted; a claim file needs a "prepared on" date the same
  // way any printed cover sheet does.
  const preparedOn = useMemo(() => new Date().toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN"), [locale]);
  const schemeNames = accounts.map((a) => pickText(a.schemeName, locale)).join(", ");

  return (
    <div className="flex flex-col items-center gap-s4 rounded-card border border-ink-soft/20 bg-paper p-s6 text-center">
      <p className="m-0 text-[16px] uppercase tracking-wide text-ink-soft">{t.claimFileCoverEyebrow}</p>
      <h3 className="m-0 font-display text-question font-semibold text-ink">{t.claimFileCoverTitle}</h3>
      <dl className="m-0 grid w-full max-w-md grid-cols-[max-content_1fr] gap-x-s4 gap-y-s2 text-left text-[16px]">
        <dt className="text-ink-soft">{t.claimDetailsClaimantLabel}</dt>
        <dd className="m-0 text-ink">{claimData.claimant.name || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.claimDetailsDepositorLabel}</dt>
        <dd className="m-0 text-ink">{claimData.depositor.name || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.decisionSchemeLabel}</dt>
        <dd className="m-0 text-ink">{schemeNames}</dd>
        <dt className="text-ink-soft">{t.claimDetailsOfficeLabel}</dt>
        <dd className="m-0 text-ink">{claimData.officeName || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.claimFileCoverPreparedOnLabel}</dt>
        <dd className="m-0 text-ink">{preparedOn}</dd>
      </dl>
    </div>
  );
}

function FileIndex({ entries, locale }: { readonly entries: readonly FileEntry[]; readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s4">
      <h3 className="m-0 mb-s3 font-display font-semibold text-ink">{t.claimFileIndexHeading}</h3>
      <ol className="m-0 flex list-decimal flex-col gap-s1 pl-s5 text-ink">
        {entries.map((entry) => (
          <li key={entry.id}>{entry.title}</li>
        ))}
      </ol>
    </div>
  );
}

function CompetentAuthoritySheet({ decision, locale }: { readonly decision: ClaimDecision; readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s4">
      <h3 className="m-0 mb-s3 font-display font-semibold text-ink">{t.claimFileAuthoritySheetHeading}</h3>
      <ul className="m-0 flex list-disc flex-col gap-s2 pl-s5 text-ink">
        {decision.competentAuthority.map((rung, i) => (
          <li key={`${rung.authorityLabel.en}-${String(i)}`}>
            {pickText(rung.authorityLabel, locale)}
            {rung.monetaryLimitInr !== undefined ? ` — ${formatInr(rung.monetaryLimitInr)}` : ""}
            {rung.timelineWorkingDays !== undefined ? ` (${String(rung.timelineWorkingDays)} working days)` : ""}
            {rung.escalatesTo ? ` — ${t.claimFileEscalatesToLabel}: ${pickText(rung.escalatesTo, locale)}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MonetaryLimitSheet({ decision, locale }: { readonly decision: ClaimDecision; readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s4">
      <h3 className="m-0 mb-s3 font-display font-semibold text-ink">{t.claimFileLimitSheetHeading}</h3>
      <p className="m-0 text-ink">
        {decision.monetaryLimitInr !== undefined ? formatInr(decision.monetaryLimitInr) : t.decisionNoFixedLimitLabel}
      </p>
      <p className="m-0 mt-s2 text-[16px] text-ink-soft">
        {t.decisionCourtOrderRequiredLabel}: {t.decisionCourtOrderRequiredValues[decision.courtOrderRequired]}
      </p>
    </div>
  );
}

function RuleReferencesSheet({ decision, locale }: { readonly decision: ClaimDecision; readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s4">
      <h3 className="m-0 mb-s3 font-display font-semibold text-ink">{t.claimFileReferencesSheetHeading}</h3>
      <ul className="m-0 flex list-disc flex-col gap-s1 pl-s5 text-ink">
        {decision.officialReferences.map((ref) => (
          <li key={ref.csId}>{pickText(ref.citation, locale)}</li>
        ))}
      </ul>
      {decision.applicableRuleIds.length > 0 ? (
        <p className="m-0 mt-s3 text-[16px] text-ink-soft">
          {t.claimFileApplicableRuleIdsLabel}: {decision.applicableRuleIds.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

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

function MissingDocumentReport({
  missingInfo,
  locale,
}: {
  readonly missingInfo: ReturnType<typeof validateClaimPackage>;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  return (
    <div role="status" className="rounded-control border border-notice/40 bg-notice-bg p-s4">
      <h3 className="m-0 mb-s2 font-display font-semibold text-notice">{t.claimPackageMissingInfoHeading}</h3>
      {missingInfo.length === 0 ? (
        <p className="m-0 text-ink">{t.claimFileMissingReportNoneLabel}</p>
      ) : (
        <ul className="m-0 mt-s2 flex list-disc flex-col gap-s1 pl-s5 text-ink">
          {missingInfo.map((i) => (
            <li key={`${String(i.accountIndex)}-${i.documentId}-${i.fieldId}`}>{i.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Builds the ordered file entries for one account — decision through office checklist. Returns [] if the account has no decision (shouldn't happen: callers only pass payable accounts). */
function buildAccountEntries(
  account: AccountChecklist,
  rulePack: RulePack,
  officialFormLayouts: readonly OfficialFormLayout[],
  claimData: ClaimDataModel,
  locale: LocaleCode,
  onBack: () => void,
): readonly FileEntry[] {
  const decision = account.decision;
  if (!decision) {
    return [];
  }
  const t = getWizardDictionary(locale);
  const schemeName = pickText(account.schemeName, locale);
  const layoutsById = new Map(officialFormLayouts.map((l) => [l.formId, l]));
  const selection = resolveDocumentSelection(rulePack, account);
  const officialEntries = selection.filter((e) => e.form && layoutsById.has(e.form.id));
  const officeTemplateIds = officeTemplateIdsForAccount(rulePack, account);
  const officeTemplates = rulePack.templates.filter((tpl) => officeTemplateIds.includes(tpl.id));

  const entries: FileEntry[] = [
    {
      id: `${String(account.accountIndex)}-decision`,
      title: `${schemeName} — ${t.claimFileDecisionSummaryTitle}`,
      node: (
        <ClaimDecisionSummary
          account={account}
          decision={decision}
          locale={locale}
          onBack={onBack}
          canGoBack={false}
          focusOnMount={false}
          showPrevious={false}
        />
      ),
    },
    {
      id: `${String(account.accountIndex)}-authority`,
      title: `${schemeName} — ${t.claimFileAuthoritySheetHeading}`,
      node: <CompetentAuthoritySheet decision={decision} locale={locale} />,
    },
    {
      id: `${String(account.accountIndex)}-limit`,
      title: `${schemeName} — ${t.claimFileLimitSheetHeading}`,
      node: <MonetaryLimitSheet decision={decision} locale={locale} />,
    },
    {
      id: `${String(account.accountIndex)}-references`,
      title: `${schemeName} — ${t.claimFileReferencesSheetHeading}`,
      node: <RuleReferencesSheet decision={decision} locale={locale} />,
    },
  ];

  for (const entry of officialEntries) {
    if (!entry.form) {
      continue;
    }
    const layout = layoutsById.get(entry.form.id);
    if (!layout) {
      continue;
    }
    entries.push({
      id: `${String(account.accountIndex)}-form-${entry.form.id}`,
      title: `${schemeName} — ${pickText(entry.form.name, locale)}`,
      node: (
        <OfficialFormView
          form={entry.form}
          layout={layout}
          claimData={claimData}
          accountIndex={account.accountIndex}
          locale={locale}
        />
      ),
    });
  }

  for (const tpl of officeTemplates) {
    entries.push({
      id: `${String(account.accountIndex)}-doc-${tpl.id}`,
      title: `${schemeName} — ${pickText(tpl.title, locale)}`,
      node: <PrintableTemplate template={tpl} locale={locale} claimData={claimData} accountIndex={account.accountIndex} />,
    });
  }

  entries.push({
    id: `${String(account.accountIndex)}-checklist`,
    title: `${schemeName} — ${t.claimPackageOfficeChecklistHeading}`,
    node: <OfficeChecklistTable account={account} locale={locale} />,
  });

  return entries;
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

  // Milestone 10: which office/declaration templates apply differs per
  // account (the minor-alive declaration only applies to accounts that
  // actually need it) — validateClaimPackage takes one shared template
  // list per call, so it's called once per account with that account's
  // own correct list, rather than passing every template to every
  // account, which would falsely flag the declaration's fields as
  // "missing" on accounts that don't have that declaration at all.
  const missingInfo = accounts.flatMap((account) => {
    const officeTemplates = rulePack.templates.filter((tpl) =>
      officeTemplateIdsForAccount(rulePack, account).includes(tpl.id),
    );
    return validateClaimPackage(rulePack, [account], claimData, officialFormLayouts, officeTemplates);
  });

  const accountEntries = useMemo(
    () => accounts.flatMap((account) => buildAccountEntries(account, rulePack, officialFormLayouts, claimData, locale, onBack)),
    [accounts, rulePack, officialFormLayouts, claimData, locale, onBack],
  );
  const missingReportEntry: FileEntry = {
    id: "missing-report",
    title: t.claimPackageMissingInfoHeading,
    node: <MissingDocumentReport missingInfo={missingInfo} locale={locale} />,
  };
  const bodyEntries: readonly FileEntry[] = [...accountEntries, missingReportEntry];

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

      <div className="cs-print-page">
        <CoverPage accounts={accounts} claimData={claimData} locale={locale} />
      </div>
      <div className="cs-print-page">
        <FileIndex entries={bodyEntries} locale={locale} />
      </div>
      {bodyEntries.map((entry) => (
        <div key={entry.id} className="cs-print-page">
          {entry.node}
        </div>
      ))}

      <div className="flex gap-s3">
        <PreviousButton locale={locale} disabled={!canGoBack} onClick={onBack} />
      </div>
    </section>
  );
}
