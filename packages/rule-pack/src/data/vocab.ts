import type { VocabEntry } from "@claimsahayak/shared-types";

/**
 * Every entry pairs a piece of internal postal jargon with the plain-
 * language replacement this pack uses instead (V2 §5.6). The copy-lint
 * validator (../validate/copy-lint.ts) scans every authored label/text in
 * this pack for the `forbidden` string and fails the build if found —
 * so this list is binding on the pack's own authors, not just documentation.
 */
export const VOCAB: readonly VocabEntry[] = [
  {
    forbidden: "Finacle",
    preferred: { en: "the Post Office's computer records" },
  },
  {
    forbidden: "CBS",
    preferred: { en: "the Post Office's computer records" },
  },
  {
    forbidden: "CIF",
    preferred: { en: "your customer record (created at the counter)" },
  },
  {
    forbidden: "acquittance",
    preferred: { en: "receipt-of-payment signature" },
  },
  {
    forbidden: "ECS",
    preferred: { en: "direct bank transfer" },
  },
  {
    forbidden: "silent account",
    preferred: {
      en: "inactive account (the Post Office reactivates it — nothing for you to do)",
    },
  },
  {
    forbidden: "sanction",
    preferred: { en: "approval" },
  },
  {
    forbidden: "GDS BPM",
    preferred: { en: "the Post Office staff" },
  },
  {
    forbidden: "SPM",
    preferred: { en: "the Post Office staff" },
  },
  {
    forbidden: "legal representation",
    preferred: { en: "court document" },
  },
  {
    forbidden: "GSPR-2018",
    preferred: { en: "(no need to mention the rule name — just say \"Form 11\")" },
  },
  {
    forbidden: "acknowledgement register",
    preferred: { en: "receipt slip" },
  },
];
