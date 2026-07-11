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
  {
    // D-17: who may actually continue differs by scheme, but this bucket
    // (like every other CONTINUE_ADDON item) is not scheme-filtered by the
    // engine — informing every continuing claimant of the limit for THEIR
    // scheme is the most honest thing this static item can do without a
    // scheme-conditional output mechanism (a gap noted in the integration
    // report). NSC/KVP's "up to 3" cap is stated but not enforced — the
    // engine has no way to count how many claimants are actually joining.
    id: "CONTINUE_ADDON_scheme_limits_note",
    routeId: "CONTINUE_ADDON",
    itemType: "goodToKnow",
    label: {
      en: "Who may continue the account depends on the scheme: for Recurring Deposit and Time Deposit, any single claimant may continue it. For NSC and KVP, up to 3 nominees/heirs together may continue it. For SCSS, only the surviving spouse may continue it — as a joint holder, or as the sole nominee eligible on the date of death.",
    },
    attrs: {
      why: { en: "So you know upfront whether continuation is available to you for this particular scheme." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder: 5,
    handbookRef: "R60(10)-(11); RD para 12(2); NSC/KVP scheme rules; SCSS para 8",
    nvRef: "NV-RB-5",
    sourceRefs: ["CS-SCH-002", "CS-SCH-003", "CS-SCH-005", "CS-SCH-007", "CS-SCH-008"],
  },
];
