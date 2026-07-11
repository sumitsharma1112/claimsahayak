"use client";

import { useEffect, useRef } from "react";
import type { ChecklistDocument, LocaleCode, LocalizedText, RulePack } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { WizardCard } from "./WizardCard";
import { ClaimDecisionSummary } from "./ClaimDecisionSummary";
import { PreviousButton } from "./PreviousButton";

/**
 * Milestone 6 Part 2 — the multi-account results view: one outcome per
 * `ChecklistDocument.accounts[]` entry, each rendered by the SAME
 * presentational component the single-account wizard already uses
 * (`WizardCard` for a card-kind terminal, `ClaimDecisionSummary` for a
 * route-kind decision) — no new outcome rendering is introduced here,
 * only the list around it. Focus and the Previous control are owned once
 * at this level (`focusOnMount={false}` / `showPrevious={false}` on every
 * child), mirroring the focus-follows-content pattern every other
 * terminal view uses.
 *
 * Dispatch is purely structural: an account renders as a card because the
 * pack has a `CardDefinition` matching its `routeId` (which
 * `evaluateAccount` set from the card id the route resolved to), never
 * because of any specific scheme/route id value.
 */
function LabeledList({ heading, items, locale }: {
  readonly heading: string;
  readonly items: readonly LocalizedText[];
  readonly locale: LocaleCode;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="rounded-control border border-ink-soft/20 bg-paper p-s3">
      <p className="m-0 font-semibold text-ink-soft">{heading}</p>
      <ul className="m-0 mt-s1 flex list-disc flex-col gap-s1 pl-s5 text-ink">
        {items.map((item, i) => (
          <li key={`${heading}-${String(i)}`}>{pickText(item, locale)}</li>
        ))}
      </ul>
    </div>
  );
}

export function ChecklistResults({
  document: checklistDocument,
  rulePack,
  locale,
  onBack,
  canGoBack,
}: {
  readonly document: ChecklistDocument;
  readonly rulePack: RulePack;
  readonly locale: LocaleCode;
  readonly onBack: () => void;
  readonly canGoBack: boolean;
}) {
  const t = getWizardDictionary(locale);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, []);

  return (
    <section aria-labelledby="checklist-results-heading" className="flex flex-col gap-s4">
      <p role="status" aria-live="polite" className="cs-visually-hidden">
        {t.resultsHeading}
      </p>
      <h2
        ref={headingRef}
        id="checklist-results-heading"
        tabIndex={-1}
        className="m-0 font-display text-question font-semibold text-ink outline-none"
      >
        {t.resultsHeading}
      </h2>
      <p className="m-0 text-ink-soft">{t.resultsIntro}</p>

      {checklistDocument.accounts.map((account) => {
        const card = rulePack.cards.find((c) => c.id === account.routeId);
        const template = card?.templateId
          ? rulePack.templates.find((tpl) => tpl.id === card.templateId)
          : undefined;
        return (
          <section
            key={account.accountIndex}
            aria-label={pickText(account.schemeName, locale)}
            className="flex flex-col gap-s2"
          >
            <p className="m-0 font-semibold text-ink-soft">{pickText(account.schemeName, locale)}</p>
            {card ? (
              <WizardCard
                card={card}
                template={template}
                locale={locale}
                onBack={onBack}
                canGoBack={canGoBack}
                focusOnMount={false}
                showPrevious={false}
              />
            ) : account.decision ? (
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
          </section>
        );
      })}

      <LabeledList heading={t.resultsGoodToKnowHeading} items={checklistDocument.goodToKnow} locale={locale} />
      <LabeledList
        heading={t.resultsVerificationHeading}
        items={checklistDocument.verificationPanel}
        locale={locale}
      />
      <LabeledList heading={t.resultsDisclaimersHeading} items={checklistDocument.disclaimers} locale={locale} />

      <div className="flex gap-s3">
        <PreviousButton locale={locale} disabled={!canGoBack} onClick={onBack} />
      </div>
    </section>
  );
}
