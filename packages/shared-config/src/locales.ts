import { LOCALE_CODES, type LocaleCode } from "@claimsahayak/shared-types";

/** Locale registry (V3 §5.7: adding a language is a data change plus fonts). */
export const LOCALES = LOCALE_CODES;

/** Convenience alias so app code can depend on config alone. */
export type Locale = LocaleCode;

export const DEFAULT_LOCALE: LocaleCode = "en";

export const LOCALE_LABELS: Readonly<Record<LocaleCode, string>> = {
  en: "EN",
  hi: "हिं",
};

/** Values for the html lang attribute (V2 §9.4 / V3 §5.4). */
export const LOCALE_LANG_ATTR: Readonly<Record<LocaleCode, string>> = {
  en: "en-IN",
  hi: "hi-IN",
};

export function isLocale(value: string): value is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(value);
}
