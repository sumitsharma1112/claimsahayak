"use client";

import { useEffect, useRef } from "react";
import type { LocaleCode, LocalizedText } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";

/**
 * The question's own heading, straight from the Rule Pack's `text` field.
 * Its only "logic" is accessibility wiring, not business logic: focus
 * moves here whenever `questionId` changes, so screen-reader users get the
 * same "a new screen arrived" signal sighted users get visually — the same
 * pattern `WizardCard` already uses for card transitions, and
 * `AccessibilityProvider` uses for full page navigations.
 */
export function QuestionCard({
  questionId,
  text,
  locale,
}: {
  readonly questionId: string;
  readonly text: LocalizedText;
  readonly locale: LocaleCode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [questionId]);

  return (
    <h2
      ref={headingRef}
      id={`question-${questionId}-heading`}
      tabIndex={-1}
      className="m-0 font-display text-question font-semibold text-ink outline-none"
    >
      {pickText(text, locale)}
    </h2>
  );
}
