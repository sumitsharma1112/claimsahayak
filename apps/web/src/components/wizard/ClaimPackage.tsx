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
import {
  buildClaimPackageDefinition,
  validateClaimPackage,
  SECTION_ORDER,
  type AccountPackageDefinition,
  type ClaimFileSection,
  type PackageDocument,
  type PackageSheetKind,
} from "@claimsahayak/rule-engine";
import { pickText } from "@/lib/locale";
import { CLAIM_DOCUMENT_REGISTRY } from "@/lib/claimDocumentRegistry";
import { getWizardDictionary } from "@/i18n/wizard";
import { ClaimDecisionSummary } from "./ClaimDecisionSummary";
import { OfficialFormView } from "./OfficialFormView";
import { PrintableTemplate } from "./PrintableTemplate";
import { PreviousButton } from "./PreviousButton";

/**
 * Milestone 8 — the Claim Package (M7) becomes a full, paginated Claim
 * File. Milestone 12 — WHICH documents the file contains is decided by
 * the Document Engine + central registry, not this component. Milestone
 * 14 — the Complete Claim File Generator: this component is now the one
 * place the Wizard → Rule Engine → Document Engine → Template Engine
 * pipeline's output becomes a SINGLE assembled, section-ordered,
 * print-ready file — no separate per-document "generate" step exists
 * anywhere; there was never more than one entry point to begin with; M14
 * makes that single output the 12-named-section structure a Senior
 * Postmaster actually files by (`SECTION_ORDER`, rule-engine).
 *
 * All rendering stays the M7/M8 machinery: `ClaimDecisionSummary` reused
 * unmodified, `OfficialFormView` for Tier A forms, `PrintableTemplate`
 * for Tier B templates, each DOCUMENT on its own printed page
 * (`.cs-print-page`) — sections themselves are not separate pages, only a
 * small heading marking where each one starts — and the table of
 * contents built from the SAME entry list the body renders, grouped by
 * the same sections, so the two can never drift (M8 invariant, now
 * section-aware).
 *
 * "No duplicate data" (M14): the M8-era standalone Competent Authority
 * Sheet and Monetary Limit Sheet are gone — `ClaimDecisionSummary` already
 * renders that data inline, and the approved 14-section structure doesn't
 * list them as their own pages.
 */

interface FileEntry {
  readonly id: string;
  readonly title: string;
  readonly section: ClaimFileSection;
  readonly node: ReactNode;
}

/** All the people actually claiming as nominee(s) on this account — the lead claimant plus any joint co-claimants (Milestone 11's coClaimants). Not the legacy, unused-in-this-workflow `nominees[]` array. */
function nomineeNames(claimData: ClaimDataModel): readonly string[] {
  return [claimData.claimant, ...claimData.coClaimants].map((p) => p.name).filter((name) => name.trim().length > 0);
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
  const claimTypes = accounts.map((a) => pickText(a.routeName, locale)).join(", ");
  const decisionTexts = accounts
    .map((a) => (a.decision ? pickText(a.decision.decision, locale) : undefined))
    .filter((d): d is string => d !== undefined)
    .join("; ");
  const accountNumbers = accounts
    .map((a) => claimData.accountNumbers[a.accountIndex])
    .filter((n): n is string => Boolean(n && n.trim().length > 0))
    .join(", ");
  const nominees = nomineeNames(claimData).join(", ");
  const preparedBy = [claimData.preparer.name, claimData.preparer.designation].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col items-center gap-s4 rounded-card border border-ink-soft/20 bg-paper p-s6 text-center">
      <p className="m-0 text-[16px] uppercase tracking-wide text-ink-soft">{t.claimFileCoverEyebrow}</p>
      <h3 className="m-0 font-display text-question font-semibold text-ink">{t.claimFileCoverTitle}</h3>
      <dl className="m-0 grid w-full max-w-md grid-cols-[max-content_1fr] gap-x-s4 gap-y-s2 text-left text-[16px]">
        <dt className="text-ink-soft">{t.claimDetailsOfficeLabel}</dt>
        <dd className="m-0 text-ink">{claimData.officeName || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.decisionSchemeLabel}</dt>
        <dd className="m-0 text-ink">{schemeNames}</dd>
        <dt className="text-ink-soft">{t.claimFileCoverAccountNumberLabel}</dt>
        <dd className="m-0 text-ink">{accountNumbers || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.claimFileCoverClaimTypeLabel}</dt>
        <dd className="m-0 text-ink">{claimTypes}</dd>
        <dt className="text-ink-soft">{t.claimFileCoverDecisionLabel}</dt>
        <dd className="m-0 text-ink">{decisionTexts || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.claimDetailsClaimantLabel}</dt>
        <dd className="m-0 text-ink">{claimData.claimant.name || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.claimFileCoverNomineesLabel}</dt>
        <dd className="m-0 text-ink">{nominees || t.officialFormBlankFieldLabel}</dd>
        <dt className="text-ink-soft">{t.claimFileCoverPreparedOnLabel}</dt>
        <dd className="m-0 text-ink">{preparedOn}</dd>
        <dt className="text-ink-soft">{t.claimFileCoverPreparedByLabel}</dt>
        <dd className="m-0 text-ink">{preparedBy || t.officialFormBlankFieldLabel}</dd>
      </dl>
    </div>
  );
}

/** Groups entries by section (in SECTION_ORDER), dropping empty sections, for both the table of contents and the body's section dividers. */
function groupBySection(entries: readonly FileEntry[]): readonly (readonly [ClaimFileSection, readonly FileEntry[]])[] {
  const bySection = new Map<ClaimFileSection, FileEntry[]>();
  for (const entry of entries) {
    const list = bySection.get(entry.section) ?? [];
    list.push(entry);
    bySection.set(entry.section, list);
  }
  return SECTION_ORDER.filter((s) => bySection.has(s)).map((s) => [s, bySection.get(s) ?? []] as const);
}

function FileIndex({ entries, locale }: { readonly entries: readonly FileEntry[]; readonly locale: LocaleCode }) {
  const t = getWizardDictionary(locale);
  const grouped = groupBySection(entries);
  let runningStart = 1;
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s4">
      <h3 className="m-0 mb-s3 font-display font-semibold text-ink">{t.claimFileIndexHeading}</h3>
      <div className="flex flex-col gap-s3">
        {grouped.map(([section, items]) => {
          const start = runningStart;
          runningStart += items.length;
          return (
            <div key={section}>
              <p className="m-0 font-semibold text-ink-soft">{t.claimFileSectionLabels[section]}</p>
              <ol start={start} className="m-0 mt-s1 flex list-decimal flex-col gap-s1 pl-s5 text-ink">
                {items.map((entry) => (
                  <li key={entry.id}>{entry.title}</li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
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

/** The web-chrome title for an engine-rendered sheet kind. */
function sheetTitle(sheet: PackageSheetKind, t: ReturnType<typeof getWizardDictionary>): string {
  switch (sheet) {
    case "decisionSummary":
      return t.claimFileDecisionSummaryTitle;
    case "ruleReferencesSheet":
      return t.claimFileReferencesSheetHeading;
    case "officeChecklist":
      return t.claimPackageOfficeChecklistHeading;
    case "missingDocumentReport":
      return t.claimPackageMissingInfoHeading;
  }
}

/**
 * Renders one account's definition documents, in the definition's section
 * order. Purely a mapping from `PackageDocument.source` to the existing
 * renderer for that source kind — no document-selection decision is made
 * here (that's the Document Engine's job).
 */
function buildAccountEntries(
  account: AccountChecklist,
  accountDefinition: AccountPackageDefinition | undefined,
  rulePack: RulePack,
  officialFormLayouts: readonly OfficialFormLayout[],
  claimData: ClaimDataModel,
  locale: LocaleCode,
  onBack: () => void,
): readonly FileEntry[] {
  const decision = account.decision;
  if (!decision || !accountDefinition) {
    return [];
  }
  const t = getWizardDictionary(locale);
  const schemeName = pickText(account.schemeName, locale);
  const layoutsById = new Map(officialFormLayouts.map((l) => [l.formId, l]));

  const entries: FileEntry[] = [];
  for (const doc of accountDefinition.documents) {
    const entryId = `${String(account.accountIndex)}-${doc.registryId}`;
    const node = nodeForDocument(doc, account, decision, rulePack, layoutsById, claimData, locale, onBack);
    if (!node) {
      continue;
    }
    const title =
      doc.source.kind === "sheet" ? sheetTitle(doc.source.sheet, t) : pickText(doc.title ?? { en: "" }, locale);
    entries.push({ id: entryId, title: `${schemeName} — ${title}`, section: doc.section, node });
  }
  return entries;
}

function nodeForDocument(
  doc: PackageDocument,
  account: AccountChecklist,
  decision: ClaimDecision,
  rulePack: RulePack,
  layoutsById: ReadonlyMap<string, OfficialFormLayout>,
  claimData: ClaimDataModel,
  locale: LocaleCode,
  onBack: () => void,
): ReactNode | null {
  switch (doc.source.kind) {
    case "sheet":
      switch (doc.source.sheet) {
        case "decisionSummary":
          return (
            <ClaimDecisionSummary
              account={account}
              decision={decision}
              locale={locale}
              onBack={onBack}
              canGoBack={false}
              focusOnMount={false}
              showPrevious={false}
            />
          );
        case "ruleReferencesSheet":
          return <RuleReferencesSheet decision={decision} locale={locale} />;
        case "officeChecklist":
          return <OfficeChecklistTable account={account} locale={locale} />;
        // The missing-information report is file-level chrome, rendered by
        // the ClaimPackage component itself, never per account.
        case "missingDocumentReport":
          return null;
      }
      break;
    case "officialForm": {
      const formId = doc.source.formId;
      const form = rulePack.forms.find((f) => f.id === formId);
      const layout = layoutsById.get(formId);
      if (!form || !layout) {
        return null;
      }
      return (
        <OfficialFormView
          form={form}
          layout={layout}
          claimData={claimData}
          accountIndex={account.accountIndex}
          locale={locale}
          schemeName={account.schemeName}
        />
      );
    }
    case "template": {
      const templateId = doc.source.templateId;
      const template = rulePack.templates.find((tpl) => tpl.id === templateId);
      if (!template) {
        return null;
      }
      // Milestone 15 — only the two reconciliation-certificate requests
      // are addressed to an external office (the Division office) that
      // would receive/verify/forward them, so only those two carry the
      // office-use footer, matching Form 11's own rationale.
      const showOfficeUseFooter =
        templateId === "template_reconciliation_depositor" || templateId === "template_reconciliation_claimant";
      return (
        <PrintableTemplate
          template={template}
          locale={locale}
          claimData={claimData}
          accountIndex={account.accountIndex}
          showOfficeUseFooter={showOfficeUseFooter}
          schemeName={account.schemeName}
        />
      );
    }
  }
  return null;
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

  // Milestone 12 — the Document Engine decides the file's contents once;
  // assembly, the table of contents, and the missing-information
  // validation all read the same definition, so they can never disagree
  // (the M10 per-account-template-list lesson, now structural rather than
  // manual).
  const definition = useMemo(
    () => buildClaimPackageDefinition(rulePack, accounts, claimData, officialFormLayouts, CLAIM_DOCUMENT_REGISTRY),
    [rulePack, accounts, claimData, officialFormLayouts],
  );

  const missingInfo = useMemo(
    () =>
      accounts.flatMap((account) => {
        const accountDefinition = definition.accounts.find((a) => a.accountIndex === account.accountIndex);
        const templateIds = (accountDefinition?.documents ?? []).flatMap((d) =>
          d.source.kind === "template" ? [d.source.templateId] : [],
        );
        const templates = rulePack.templates.filter((tpl) => templateIds.includes(tpl.id));
        return validateClaimPackage(rulePack, [account], claimData, officialFormLayouts, templates);
      }),
    [definition, accounts, rulePack, claimData, officialFormLayouts],
  );

  const accountEntries = useMemo(
    () =>
      accounts.flatMap((account) =>
        buildAccountEntries(
          account,
          definition.accounts.find((a) => a.accountIndex === account.accountIndex),
          rulePack,
          officialFormLayouts,
          claimData,
          locale,
          onBack,
        ),
      ),
    [accounts, definition, rulePack, officialFormLayouts, claimData, locale, onBack],
  );

  const hasMissingReport = definition.fileDocuments.some(
    (d) => d.source.kind === "sheet" && d.source.sheet === "missingDocumentReport",
  );
  const missingReportEntries: readonly FileEntry[] = hasMissingReport
    ? [
        {
          id: "missing-report",
          title: t.claimPackageMissingInfoHeading,
          section: "missingInformationReport",
          node: <MissingDocumentReport missingInfo={missingInfo} locale={locale} />,
        },
      ]
    : [];
  const bodyEntries: readonly FileEntry[] = [...accountEntries, ...missingReportEntries];

  // Which entries are the FIRST of their section, in final body order — so
  // a small divider heading can mark where each of the 12 sections begins,
  // without turning the divider itself into an extra page (only documents
  // get their own `.cs-print-page`).
  const firstOfSection = new Set<string>();
  {
    let previousSection: ClaimFileSection | undefined;
    for (const entry of bodyEntries) {
      if (entry.section !== previousSection) {
        firstOfSection.add(entry.id);
        previousSection = entry.section;
      }
    }
  }

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
          {firstOfSection.has(entry.id) ? (
            <p className="m-0 mb-s2 text-[16px] font-semibold uppercase tracking-wide text-ink-soft">
              {t.claimFileSectionLabels[entry.section]}
            </p>
          ) : null}
          {entry.node}
        </div>
      ))}

      <div className="flex gap-s3">
        <PreviousButton locale={locale} disabled={!canGoBack} onClick={onBack} />
      </div>
    </section>
  );
}
