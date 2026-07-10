/**
 * Locale contracts. English is the mandatory base locale; additional locales
 * are optional per string and completeness is enforced by the Milestone 2
 * locale-parity validation gate (V3 §2.5), not by the type system.
 */
export const LOCALE_CODES = ["en", "hi"] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

/** Locale-keyed string. Every user-facing string in the Rule Pack uses this shape. */
export type LocalizedText = {
  readonly en: string;
} & {
  readonly [K in Exclude<LocaleCode, "en">]?: string;
};

/** Portable-text block model for learn/fix/claims content (V3 §3.4: no raw HTML). */
export interface PortableTextBlock {
  readonly kind:
    | "paragraph"
    | "heading"
    | "list"
    | "summaryBox"
    | "warningChip"
    | "table";
  readonly text?: LocalizedText;
  readonly items?: readonly LocalizedText[];
  readonly rows?: readonly (readonly LocalizedText[])[];
  readonly level?: 2 | 3;
}
