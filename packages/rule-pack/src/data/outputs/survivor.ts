import type { OutputRule } from "@claimsahayak/shared-types";

/**
 * ROUTE_SURVIVOR (T7): the surviving joint holder may continue the account
 * (as a single account, subject to conditions) or close it. No Form 11
 * route — this is a simpler, direct process (Blueprint v2 §3.2 T7).
 */
export const ROUTE_SURVIVOR_OUTPUTS: readonly OutputRule[] = [
  {
    id: "ROUTE_SURVIVOR_death_certificate",
    routeId: "ROUTE_SURVIVOR",
    itemType: "document",
    refId: "doc_death_certificate",
    label: { en: "Death certificate of the other account holder" },
    attrs: {
      why: { en: "Confirms the change to a single account." },
      originalOrCopy: { en: "Bring the original to show; hand in one photocopy." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 1,
    handbookRef: "§7.7 (table)",
  },
  {
    id: "ROUTE_SURVIVOR_id",
    routeId: "ROUTE_SURVIVOR",
    itemType: "document",
    refId: "doc_claimant_id",
    label: { en: "Your ID and address proof" },
    attrs: {
      why: { en: "Confirms who you are." },
      originalOrCopy: {
        en: "Bring the original (Aadhaar preferred) to show; hand in a self-attested photocopy.",
      },
      selfAttest: { en: "Yes." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 2,
    handbookRef: "§7.7 (table)",
  },
  {
    id: "ROUTE_SURVIVOR_passbook",
    routeId: "ROUTE_SURVIVOR",
    itemType: "document",
    refId: "doc_passbook_or_certificate",
    label: { en: "Passbook or certificate for this account" },
    attrs: {
      why: { en: "Confirms which account this is." },
      originalOrCopy: { en: "Original only." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 3,
    handbookRef: "§7.7 (table)",
  },
  {
    id: "ROUTE_SURVIVOR_choice",
    routeId: "ROUTE_SURVIVOR",
    itemType: "instruction",
    label: {
      en: "You may continue this account as a single account in your name (as long as you don't already hold another single Savings Account, for a Savings Account), or you may close it now — a simple application at the Post Office covers either choice.",
    },
    attrs: {
      why: { en: "Both options exist for a surviving joint holder." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 4,
    handbookRef: "§7.7 (table)",
  },
  {
    id: "ROUTE_SURVIVOR_mis_excess_note",
    routeId: "ROUTE_SURVIVOR",
    itemType: "goodToKnow",
    label: {
      en: "For a Monthly Income Scheme account, if the combined balance now exceeds the single-holder limit, the extra amount will need to be withdrawn, and the Post Office will adjust the interest on it.",
    },
    attrs: {
      why: { en: "This only applies to MIS accounts, and the Post Office handles the calculation." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 5,
    handbookRef: "§7.7 (MIS row)",
  },
];
