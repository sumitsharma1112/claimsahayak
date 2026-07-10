import type { LocaleCode } from "@claimsahayak/shared-types";

/**
 * Site-level constants. English serves at the root; Hindi under /hi when the
 * locale content track lands (V2 §8.2 hreflang architecture).
 */
export const LOCALE_PATH_PREFIX: Readonly<Record<LocaleCode, string>> = {
  en: "",
  hi: "/hi",
};

export const SITE = {
  /** Overridden by NEXT_PUBLIC_SITE_URL at build/deploy time. */
  defaultUrl: "https://claimsahayak.example",
  /**
   * Official forms index (V2 FR-15): link to the index page, never deep
   * PDF links (NV-08 link-rot policy; health-checked from Milestone 10).
   */
  officialFormsIndexUrl: "https://www.indiapost.gov.in/VAS/Pages/Form.aspx",
} as const;
