import type { SchemeDefinition } from "@claimsahayak/shared-types";

/**
 * Capability matrix (V3 §2.2 — data, never code). Every branch in routes.ts
 * that asks "can this scheme be joint / minor-held / continued / paid by
 * bank transfer" reads these flags rather than hardcoding a scheme list.
 */
export const SCHEMES: readonly SchemeDefinition[] = [
  {
    id: "SB",
    displayName: { en: "Savings Account" },
    description: {
      en: "A regular Post Office savings account, used for everyday deposits and withdrawals.",
    },
    canBeJoint: true,
    canBeMinorAccount: true,
    continuableByClaimant: false,
    bankTransferEligible: false,
    illustrationId: "illustration-sb-passbook",
    sortOrder: 1,
  },
  {
    id: "RD",
    displayName: { en: "Recurring Deposit (RD)" },
    description: {
      en: "A fixed monthly deposit that builds up over a chosen number of years.",
    },
    canBeJoint: true,
    canBeMinorAccount: true,
    continuableByClaimant: true,
    bankTransferEligible: true,
    illustrationId: "illustration-rd-passbook",
    sortOrder: 2,
  },
  {
    id: "TD",
    displayName: { en: "Time Deposit (TD)" },
    description: {
      en: "A lump-sum deposit held for a fixed term, similar to a bank fixed deposit.",
    },
    canBeJoint: true,
    canBeMinorAccount: true,
    continuableByClaimant: true,
    bankTransferEligible: true,
    illustrationId: "illustration-td-passbook",
    sortOrder: 3,
  },
  {
    id: "MIS",
    displayName: { en: "Monthly Income Scheme (MIS)" },
    description: {
      en: "A lump-sum deposit that pays out a fixed amount every month.",
    },
    canBeJoint: true,
    canBeMinorAccount: true,
    continuableByClaimant: false,
    bankTransferEligible: true,
    illustrationId: "illustration-mis-passbook",
    sortOrder: 4,
  },
  {
    id: "PPF",
    displayName: { en: "Public Provident Fund (PPF)" },
    description: {
      en: "A long-term savings account with tax benefits, held in one person's name only.",
    },
    canBeJoint: false,
    canBeMinorAccount: true,
    continuableByClaimant: false,
    bankTransferEligible: false,
    illustrationId: "illustration-ppf-passbook",
    sortOrder: 5,
  },
  {
    id: "SSA",
    displayName: { en: "Sukanya Samriddhi Account (SSA)" },
    description: {
      en: "A savings account opened by a guardian for a girl child.",
    },
    canBeJoint: false,
    canBeMinorAccount: true,
    continuableByClaimant: false,
    bankTransferEligible: false,
    illustrationId: "illustration-ssa-passbook",
    sortOrder: 6,
  },
  {
    id: "NSC",
    displayName: { en: "National Savings Certificate (NSC)" },
    description: {
      en: "A fixed-term savings certificate, sold either as a passbook (after 2016) or as paper certificates (before 2016).",
    },
    canBeJoint: true,
    canBeMinorAccount: true,
    continuableByClaimant: true,
    bankTransferEligible: true,
    illustrationId: "illustration-nsc-certificate",
    sortOrder: 7,
  },
  {
    id: "KVP",
    displayName: { en: "Kisan Vikas Patra (KVP)" },
    description: {
      en: "A fixed-term certificate that doubles the deposit over a set period, sold either as a passbook (after 2016) or as paper certificates (before 2016).",
    },
    canBeJoint: true,
    canBeMinorAccount: true,
    continuableByClaimant: true,
    bankTransferEligible: true,
    illustrationId: "illustration-kvp-certificate",
    sortOrder: 8,
  },
  {
    id: "SCSS",
    displayName: { en: "Senior Citizen Savings Scheme (SCSS)" },
    description: {
      en: "A fixed-term deposit for senior citizens that pays quarterly interest.",
    },
    // CS-JNT-011: SCSS is joint only with a spouse (never any other co-holder).
    canBeJoint: true,
    canBeMinorAccount: false,
    // CS-SCH-005/CS-JNT-011: continuation is spouse-only (joint holder, or
    // sole nominee, eligible at the date of death) — not open to any
    // claimant the way RD/TD/NSC/KVP are; see the CONTINUE_ADDON
    // scheme-specific goodToKnow item and the "scss_spouse_continuing"
    // Q10 flag for how this narrower rule is surfaced without the engine
    // being able to verify the spouse relationship itself.
    continuableByClaimant: true,
    bankTransferEligible: true,
    sortOrder: 9,
  },
];
