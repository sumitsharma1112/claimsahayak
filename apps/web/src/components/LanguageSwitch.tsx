import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

/**
 * Language switch — Milestone 1 placeholder (per Master Prompt 1 §6).
 * Renders the control's final position and semantics; activation ships with
 * the Hindi content track (M2+, /hi path prefix per V2 §8.2). Marked
 * aria-disabled so assistive tech communicates the pending state honestly.
 */
export function LanguageSwitch() {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <span aria-label={t.languageSwitchLabel} className="inline-flex items-center gap-s2">
      <span aria-current="true" className="font-semibold text-peacock">
        EN
      </span>
      <span aria-hidden="true" className="text-ink-soft">
        |
      </span>
      <span
        aria-disabled="true"
        lang="hi"
        title={t.languageSwitchPending}
        className="text-ink-soft"
      >
        हिं
      </span>
    </span>
  );
}
