"use client";

import { useEffect, useRef } from "react";
import type { CardDefinition, CardKind, LocaleCode, TemplateDefinition } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { PortableText } from "./PortableText";
import { PrintableTemplate } from "./PrintableTemplate";

/** Existing design tokens only, per card `kind` — no new colors introduced. */
const KIND_STYLES: Readonly<Record<CardKind, string>> = {
  pause: "border-pause/40 bg-pause-bg text-pause",
  stop: "border-warn/40 bg-warn-bg text-warn",
  wait: "border-notice/40 bg-notice-bg text-notice",
  dual: "border-notice/40 bg-notice-bg text-notice",
  info: "border-ink-soft/20 bg-paper text-ink-soft",
};

/**
 * Renders one Rule Pack `CardDefinition` — the terminal outcome for a
 * route whose `kind` is `"card"` (pause/stop/wait/dual/info). Every visible
 * string (title, body, next-physical-step) comes from the card itself;
 * only the `kind` (a fixed 5-value enum, not a route/scheme/card id) picks
 * presentation. Focus moves to the card's own heading whenever a NEW card
 * appears, the same "new page-like content arrived" pattern
 * AccessibilityProvider already uses for route changes — plus a quiet
 * aria-live announcement for screen-reader users who aren't watching focus.
 */
export function WizardCard({
  card,
  template,
  locale,
}: {
  readonly card: CardDefinition;
  readonly template: TemplateDefinition | undefined;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [card.id]);

  const headingId = `card-${card.id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={`flex flex-col gap-s3 rounded-card border p-s4 ${KIND_STYLES[card.kind]}`}
    >
      <p role="status" aria-live="polite" className="cs-visually-hidden">
        {t.cardKindLabels[card.kind]}: {pickText(card.title, locale)}
      </p>
      <p className="m-0 text-[16px] font-semibold uppercase tracking-wide">
        {t.cardKindLabels[card.kind]}
      </p>
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="m-0 font-display text-question font-semibold text-ink outline-none"
      >
        {pickText(card.title, locale)}
      </h2>
      <PortableText blocks={card.body} locale={locale} />
      <div className="rounded-control border border-ink-soft/20 bg-paper p-s3">
        <p className="m-0 font-semibold text-ink-soft">{t.cardNextStepLabel}</p>
        <p className="mb-0 mt-s1 text-ink">{pickText(card.nextPhysicalStep, locale)}</p>
      </div>
      {card.kind === "pause" && template ? <PrintableTemplate template={template} locale={locale} /> : null}
    </section>
  );
}
