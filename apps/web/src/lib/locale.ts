import type { LocaleCode, LocalizedText } from "@claimsahayak/shared-types";

/**
 * Picks one locale's string out of a Rule-Pack `LocalizedText`, falling
 * back to English (the mandatory base locale — see shared-types/locale.ts)
 * when the requested locale has no translation yet.
 */
export function pickText(text: LocalizedText, locale: LocaleCode): string {
  return text[locale] ?? text.en;
}
