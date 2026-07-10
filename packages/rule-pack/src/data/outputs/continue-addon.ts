import type { OutputRule } from "@claimsahayak/shared-types";

/**
 * Appended by the engine whenever q8_close_or_continue == "continue", on
 * top of whichever of ROUTE_A/B/C/ROUTE_SURVIVOR resolved (§5.4-4).
 * Only RD, TD, NSC, and KVP are continuable — the question itself is
 * already gated on `scheme.continuableByClaimant` (questions.ts).
 */
export const CONTINUE_ADDON_OUTPUTS: readonly OutputRule[] = [
  {
    id: "CONTINUE_ADDON_aof_kyc",
    routeId: "CONTINUE_ADDON",
    itemType: "form",
    refId: "form_aof_kyc",
    label: { en: "Revised Account Opening Form and KYC documents" },
    attrs: {
      why: { en: "Registers the account in your name going forward." },
      originalOrCopy: { en: "Fill in and sign; bring your KYC documents." },
      selfAttest: { en: "Yes, where the form asks for it." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder: 1,
    handbookRef: "§5.4-4",
  },
  {
    id: "CONTINUE_ADDON_photos",
    routeId: "CONTINUE_ADDON",
    itemType: "document",
    refId: "doc_photos_2",
    label: { en: "Two passport-size photographs" },
    attrs: {
      why: { en: "Needed for the new account record in your name." },
      originalOrCopy: { en: "Original photographs." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 2,
    handbookRef: "§5.4-4",
  },
  {
    id: "CONTINUE_ADDON_nomination",
    routeId: "CONTINUE_ADDON",
    itemType: "form",
    refId: "form_10_nomination",
    label: { en: "Form 10 — nomination for the account now in your name" },
    attrs: {
      why: { en: "So a future claim on this account is simpler for your own family." },
      originalOrCopy: { en: "Fill in and sign." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder: 3,
    handbookRef: "§7.9",
  },
  {
    id: "CONTINUE_ADDON_no_fee_note",
    routeId: "CONTINUE_ADDON",
    itemType: "goodToKnow",
    label: {
      en: "No transfer fee applies. Once the approval is complete, come back to the Post Office where you submitted the claim to collect your new passbook.",
    },
    attrs: {
      why: { en: "This saves a needless worry about cost, and tells you what happens next." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "forms",
    sortOrder: 4,
    handbookRef: "§5.4-4",
  },
];
