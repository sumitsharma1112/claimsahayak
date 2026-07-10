"use client";

import { useEffect, useState } from "react";
import type { LocaleCode, LocalizedText } from "@claimsahayak/shared-types";
import { LOCALE_LANG_ATTR } from "@claimsahayak/shared-config";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Progressive enhancement (Milestone 4.3 §8): reads the current question
 * aloud via the browser's own Web Speech API. Renders nothing at all when
 * `window.speechSynthesis` doesn't exist — no polyfill, no error, just a
 * graceful no-op, exactly like `OfflineBanner`'s `navigator.onLine` check.
 */
export function ReadAloudButton({
  text,
  locale,
}: {
  readonly text: LocalizedText;
  readonly locale: LocaleCode;
}) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const t = getWizardDictionary(locale);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Stop any in-flight speech when the question changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  if (!supported) {
    return null;
  }

  const handleClick = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(pickText(text, locale));
    utterance.lang = LOCALE_LANG_ATTR[locale];
    utterance.onend = () => {
      setSpeaking(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      className="cs-btn-secondary"
      aria-pressed={speaking}
      onClick={handleClick}
    >
      {speaking ? t.readAloudStopLabel : t.readAloudLabel}
    </button>
  );
}
