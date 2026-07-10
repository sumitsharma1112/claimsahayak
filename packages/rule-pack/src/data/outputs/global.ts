import type { OutputRule } from "@claimsahayak/shared-types";

/**
 * Always-printed on every checklist, regardless of route (Blueprint v2 §3.3
 * "good-to-know" block). These are general facts, not route-specific
 * requirements, so they carry no per-item original/copy/self-attest
 * distinctions — the four attribute fields are still populated (never
 * blank) with "Not applicable" so the result page and PDF never need
 * type-specific layout logic (see output.schema.ts).
 */
export const GOOD_TO_KNOW_OUTPUTS: readonly OutputRule[] = [
  {
    id: "GLOBAL_atm_cheque_surrender",
    routeId: "GLOBAL",
    itemType: "warning",
    label: {
      en: "Do not use the account holder's ATM card or any unused cheques after the death — hand them back to the Post Office instead.",
    },
    attrs: {
      why: { en: "Using them after the date of death is not allowed, even by family members." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 1,
    handbookRef: "FAQ 34",
  },
  {
    id: "GLOBAL_acknowledgment_slip",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: { en: "Ask for a receipt slip when you submit your claim papers." },
    attrs: {
      why: { en: "This is your proof of when you submitted, useful if there's ever a delay." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 2,
    handbookRef: "FAQ 19; Annexure 8",
  },
  {
    id: "GLOBAL_any_post_office",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "You can hand in your papers at any nearby Post Office — it will forward them the same day to the Post Office where the account actually stands.",
    },
    attrs: {
      why: { en: "You do not have to travel to the exact Post Office where the account was opened." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 3,
    handbookRef: "FAQ 5; FAQ 27",
  },
  {
    id: "GLOBAL_separate_per_account",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "A separate claim application and document set is needed for each account or certificate registration, even if several are held by the same person.",
    },
    attrs: {
      why: { en: "Each account is settled on its own, even when submitted together." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 4,
    handbookRef: "FAQ 26; FAQ 35",
  },
  {
    id: "GLOBAL_agents_cannot_submit",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "If the account was opened through an agent, the agent cannot submit the claim papers for you — you must submit them yourself.",
    },
    attrs: {
      why: { en: "This avoids a wasted trip by the wrong person." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 5,
    handbookRef: "FAQ 32; SB Order 15/2021 dated 29.06.2021",
  },
  {
    id: "GLOBAL_power_of_attorney",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "If you genuinely cannot be present, someone holding your Power of Attorney can act on your behalf.",
    },
    attrs: {
      why: { en: "This covers situations where the claimant cannot travel or attend in person." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 6,
    handbookRef: "FAQ 29",
  },
  {
    id: "GLOBAL_sms_note",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "You will only get an SMS once the claim is approved if you hold your own Post Office savings account with a mobile number registered on it.",
    },
    attrs: {
      why: { en: "So you know what to expect, and aren't left wondering why no message arrived." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 7,
    handbookRef: "FAQ 24",
  },
  {
    id: "GLOBAL_timeline",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "Once your papers are complete: usually 1 working day when a nominee is registered, and up to 7 working days otherwise.",
    },
    attrs: {
      why: { en: "This sets a realistic expectation for how long the process takes." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 8,
    handbookRef: "FAQ 17; SB Order 01/2023 dated 09.01.2023",
  },
  {
    id: "GLOBAL_escalation",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "If it takes longer than expected after you've submitted complete papers, you can contact the Superintendent of Post Offices, use indiapost.gov.in, pgportal.gov.in, or the Postinfo app.",
    },
    attrs: {
      why: { en: "So you know exactly where to turn if there's a delay." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 9,
    handbookRef: "FAQ 25; FAQ 30",
  },
  {
    id: "GLOBAL_senior_office_normal",
    routeId: "GLOBAL",
    itemType: "goodToKnow",
    label: {
      en: "Depending on the amount involved, your papers may be sent to a more senior office for approval. This is normal and needs nothing extra from you.",
    },
    attrs: {
      why: { en: "So a transfer to another office doesn't feel like something has gone wrong." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "good-to-know",
    sortOrder: 10,
    handbookRef: "§5.3",
  },
];

/**
 * FR-19 verification-transparency panel: what the Post Office checks from
 * its own records, so the claimant is never asked to prove something only
 * departmental systems can confirm (V2 principle: never ask a question only
 * a Postmaster can answer).
 */
export const VERIFICATION_PANEL_OUTPUTS: readonly OutputRule[] = [
  {
    id: "GLOBAL_verify_name_match",
    routeId: "GLOBAL",
    itemType: "instruction",
    label: { en: "That the depositor's name matches across the passbook, records, and death certificate." },
    attrs: {
      why: { en: "Not something you need to prove — the Post Office compares these itself." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "verification-panel",
    sortOrder: 1,
    handbookRef: "§5.2",
  },
  {
    id: "GLOBAL_verify_balance",
    routeId: "GLOBAL",
    itemType: "instruction",
    label: { en: "The exact balance in the account." },
    attrs: {
      why: { en: "Taken from the Post Office's own computer records, not from you." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "verification-panel",
    sortOrder: 2,
    handbookRef: "§5.2",
  },
  {
    id: "GLOBAL_verify_nomination",
    routeId: "GLOBAL",
    itemType: "instruction",
    label: { en: "Whether a nomination is registered, and its exact details." },
    attrs: {
      why: { en: "Confirmed from the Post Office's own nomination register." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "verification-panel",
    sortOrder: 3,
    handbookRef: "§5.2",
  },
  {
    id: "GLOBAL_verify_freeze_pledge",
    routeId: "GLOBAL",
    itemType: "instruction",
    label: { en: "Whether any court order, tax freeze, or pledge is recorded against the account." },
    attrs: {
      why: { en: "This is internal to the Post Office's own records." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "verification-panel",
    sortOrder: 4,
    handbookRef: "§5.2; §5.4-6",
  },
  {
    id: "GLOBAL_verify_dormant",
    routeId: "GLOBAL",
    itemType: "instruction",
    label: { en: "Whether the account has gone inactive — this is reactivated internally, with nothing extra for you to do." },
    attrs: {
      why: { en: "An inactive account does not need a separate application from you to revive it." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "verification-panel",
    sortOrder: 5,
    handbookRef: "§5.4-3",
  },
  {
    id: "GLOBAL_verify_ippb",
    routeId: "GLOBAL",
    itemType: "instruction",
    label: { en: "Whether the account is linked to an India Post Payments Bank account." },
    attrs: {
      why: { en: "Any needed delinking is handled internally between the two systems." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "verification-panel",
    sortOrder: 6,
    handbookRef: "§5.4-11",
  },
];
