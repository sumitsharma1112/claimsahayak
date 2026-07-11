"use client";

import { useEffect, useRef } from "react";
import type {
  AccountChecklist,
  ChecklistSection,
  ClaimDecision,
  DecisionStatus,
  LocaleCode,
} from "@claimsahayak/shared-types";
import { formatInr } from "@claimsahayak/shared-utils";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { PreviousButton } from "./PreviousButton";

/**
 * Milestone 5 Part 6 — renders the Complete Claim Decision (Part 3) and its
 * dynamically-generated processing checklist (Part 4) for a "route"-kind
 * terminal, replacing the generic placeholder Wizard.tsx previously showed
 * once every visible question was answered. Deliberately mirrors
 * WizardCard.tsx's exact structure/tokens (status label + tabIndex={-1}
 * heading + focus-on-mount, visually-hidden aria-live announcement, the
 * "next step" box pattern) — this is not a new design language, just the
 * existing card pattern applied to a route-kind outcome instead of a
 * card-kind one.
 *
 * Renders only pack-authored text (LocalizedText) and CS-ID/D-row
 * citations — never a raw internal `routeId`/`RouteRule.id` (the
 * `AccountChecklist.routeName` already humanizes that, e.g.
 * "Route A", the same way WizardCard already renders `card.title`
 * instead of `card.id`).
 */

/** Existing design tokens only, per decision status — no new colors introduced. */
const STATUS_STYLES: Readonly<Record<DecisionStatus, string>> = {
  payable: "border-ok/40 bg-ok-bg text-ok",
  not_payable: "border-warn/40 bg-warn-bg text-warn",
  not_applicable: "border-ink-soft/20 bg-paper text-ink-soft",
  pending_information: "border-notice/40 bg-notice-bg text-notice",
};

function ChecklistSectionList({ section, locale }: { readonly section: ChecklistSection; readonly locale: LocaleCode }) {
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s3">
      <p className="m-0 font-semibold text-ink-soft">{pickText(section.title, locale)}</p>
      <ul className="m-0 mt-s2 flex list-disc flex-col gap-s2 pl-s5 text-ink">
        {section.items.map((item) => (
          <li key={item.id}>
            <p className="m-0">{pickText(item.label, locale)}</p>
            <p className="m-0 mt-s1 text-[16px] text-ink-soft">{pickText(item.attrs.why, locale)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClaimDecisionSummary({
  account,
  decision,
  locale,
  onBack,
  canGoBack,
}: {
  readonly account: AccountChecklist;
  readonly decision: ClaimDecision;
  readonly locale: LocaleCode;
  readonly onBack: () => void;
  readonly canGoBack: boolean;
}) {
  const t = getWizardDictionary(locale);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [decision.decisionRecordId]);

  const headingId = `decision-${decision.decisionRecordId}-heading`;
  const statusLabel = t.decisionStatusLabels[decision.decisionStatus];

  return (
    <section
      aria-labelledby={headingId}
      className={`flex flex-col gap-s3 rounded-card border p-s4 ${STATUS_STYLES[decision.decisionStatus]}`}
    >
      <p role="status" aria-live="polite" className="cs-visually-hidden">
        {statusLabel}: {pickText(decision.decision, locale)}
      </p>
      <p className="m-0 text-[16px] font-semibold uppercase tracking-wide">{statusLabel}</p>
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="m-0 font-display text-question font-semibold text-ink outline-none"
      >
        {pickText(decision.decision, locale)}
      </h2>
      <div>
        <p className="m-0 font-semibold text-ink-soft">{t.decisionReasonLabel}</p>
        <p className="mb-0 mt-s1 text-ink">{pickText(decision.reason, locale)}</p>
      </div>
      <div className="flex flex-wrap gap-s4 text-[16px]">
        <div>
          <p className="m-0 font-semibold text-ink-soft">{t.decisionSchemeLabel}</p>
          <p className="mb-0 mt-s1 text-ink">{pickText(account.schemeName, locale)}</p>
        </div>
        <div>
          <p className="m-0 font-semibold text-ink-soft">{t.decisionTimelineLabel}</p>
          <p className="mb-0 mt-s1 text-ink">{pickText(account.timelineNote, locale)}</p>
        </div>
      </div>

      {account.sections.length > 0 ? (
        <div>
          <p className="m-0 mb-s2 font-semibold text-ink-soft">{t.decisionChecklistHeading}</p>
          <div className="flex flex-col gap-s2">
            {account.sections.map((section) => (
              <ChecklistSectionList key={section.id} section={section} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-control border border-ink-soft/20 bg-paper p-s3">
        <p className="m-0 font-semibold text-ink-soft">{t.decisionCompetentAuthorityLabel}</p>
        <ul className="m-0 mt-s1 flex list-disc flex-col gap-s1 pl-s5 text-ink">
          {decision.competentAuthority.map((rung, i) => (
            <li key={`${rung.authorityLabel.en}-${String(i)}`}>
              {pickText(rung.authorityLabel, locale)}
              {rung.monetaryLimitInr !== undefined ? ` — ${formatInr(rung.monetaryLimitInr)}` : ""}
              {rung.escalatesTo ? ` (${pickText(rung.escalatesTo, locale)})` : ""}
            </li>
          ))}
        </ul>
        <p className="m-0 mt-s2 text-[16px] text-ink-soft">
          {t.decisionMonetaryLimitLabel}:{" "}
          <span className="text-ink">
            {decision.monetaryLimitInr !== undefined ? formatInr(decision.monetaryLimitInr) : t.decisionNoFixedLimitLabel}
          </span>
        </p>
        <p className="m-0 mt-s1 text-[16px] text-ink-soft">
          {t.decisionCourtOrderRequiredLabel}:{" "}
          <span className="text-ink">{t.decisionCourtOrderRequiredValues[decision.courtOrderRequired]}</span>
        </p>
      </div>

      <div>
        <p className="m-0 font-semibold text-ink-soft">{t.decisionOfficialReferencesLabel}</p>
        <ul className="m-0 mt-s1 flex list-disc flex-col gap-s1 pl-s5 text-ink">
          {decision.officialReferences.map((ref) => (
            <li key={ref.csId}>{pickText(ref.citation, locale)}</li>
          ))}
        </ul>
      </div>

      {decision.processingNotes ? (
        <div>
          <p className="m-0 font-semibold text-ink-soft">{t.decisionProcessingNotesLabel}</p>
          <p className="mb-0 mt-s1 text-ink">{pickText(decision.processingNotes, locale)}</p>
        </div>
      ) : null}

      <div className="rounded-control border border-ink-soft/20 bg-paper p-s3">
        <p className="m-0 font-semibold text-ink-soft">{t.decisionNextActionLabel}</p>
        <p className="mb-0 mt-s1 text-ink">{pickText(decision.nextActionForPostmaster, locale)}</p>
      </div>

      <div className="flex gap-s3">
        <PreviousButton locale={locale} disabled={!canGoBack} onClick={onBack} />
      </div>
    </section>
  );
}
