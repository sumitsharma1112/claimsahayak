import type { LocalizedText } from "@claimsahayak/shared-types";

/**
 * Brand constants (Roadmap §0 guardrails).
 * The disclaimer strings below are mandatory on every page, the PDF header,
 * and all SEO meta descriptions (guardrail #1). They must never be removed
 * or reworded without an approved content change.
 */
export const BRAND: {
  readonly name: string;
  readonly wordmark: LocalizedText;
  readonly tagline: LocalizedText;
  readonly independenceStrip: LocalizedText;
  readonly notLegalAdvice: LocalizedText;
} = {
  name: "ClaimSahayak",
  wordmark: {
    en: "ClaimSahayak",
    hi: "क्लेम सहायक",
  },
  tagline: {
    en: "Independent guide for Post Office savings claims",
    hi: "पोस्ट ऑफ़िस बचत क्लेम के लिए स्वतंत्र मार्गदर्शक",
  },
  independenceStrip: {
    en: "Not an official India Post website. Free & private.",
    hi: "यह इंडिया पोस्ट की आधिकारिक वेबसाइट नहीं है। मुफ़्त और निजी।",
  },
  notLegalAdvice: {
    en: "General information only — not legal advice.",
    hi: "केवल सामान्य जानकारी — यह कानूनी सलाह नहीं है।",
  },
} as const;

/**
 * Words the brand must never use about itself (Roadmap §0 guardrail #2).
 * Enforced by the brand test and, from Milestone 9, by the SEO string rule.
 */
export const FORBIDDEN_BRAND_WORDS: readonly string[] = [
  "official",
  "government",
  "sarkari",
];
