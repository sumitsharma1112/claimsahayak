import type { OutputRule } from "@claimsahayak/shared-types";

/**
 * ROUTE_SSA_MINOR (T3): on the child's death, the Sukanya Samriddhi Account
 * is closed by premature-closure application and paid to the GUARDIAN —
 * whether or not a nominee is registered (handbook §7.6-SSA; this is one of
 * two asymmetric SSA rules, see NV-05 for the both-deceased case).
 */
export const ROUTE_SSA_MINOR_OUTPUTS: readonly OutputRule[] = [
  {
    id: "ROUTE_SSA_MINOR_sb7b",
    routeId: "ROUTE_SSA_MINOR",
    itemType: "form",
    refId: "form_sb7b",
    label: { en: "Form SB-7B — premature closure form" },
    attrs: {
      why: { en: "Closes the Sukanya Samriddhi Account immediately after the child's death." },
      originalOrCopy: { en: "Available at the counter; fill in and sign." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder: 1,
    handbookRef: "§7.6-SSA",
    nvRef: "NV-12",
  },
  {
    id: "ROUTE_SSA_MINOR_child_death_certificate",
    routeId: "ROUTE_SSA_MINOR",
    itemType: "document",
    refId: "doc_child_death_certificate",
    label: { en: "Death certificate of the child" },
    attrs: {
      why: { en: "Confirms the child's death to the Post Office." },
      originalOrCopy: { en: "Bring the original to show; hand in one photocopy." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 2,
    handbookRef: "§7.6-SSA",
  },
  {
    id: "ROUTE_SSA_MINOR_guardian_id",
    routeId: "ROUTE_SSA_MINOR",
    itemType: "document",
    refId: "doc_claimant_id",
    label: { en: "Your ID and address proof (as guardian)" },
    attrs: {
      why: { en: "Confirms who you are." },
      originalOrCopy: {
        en: "Bring the original (Aadhaar preferred) to show; hand in a self-attested photocopy.",
      },
      selfAttest: { en: "Yes." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 3,
    handbookRef: "§7.6-SSA",
  },
  {
    id: "ROUTE_SSA_MINOR_interest_note",
    routeId: "ROUTE_SSA_MINOR",
    itemType: "goodToKnow",
    label: {
      en: "The account earns the normal SSA interest rate up to the child's date of death, and the ordinary Post Office savings rate from then until the account is closed.",
    },
    attrs: {
      why: { en: "This is how interest is calculated for this situation." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 4,
    handbookRef: "§7.6-SSA",
  },
];

/**
 * ROUTE_PPF_MINOR (T4): on the child's death, the PPF account is closed and
 * paid to the guardian at the PPF interest rate.
 */
export const ROUTE_PPF_MINOR_OUTPUTS: readonly OutputRule[] = [
  {
    id: "ROUTE_PPF_MINOR_child_death_certificate",
    routeId: "ROUTE_PPF_MINOR",
    itemType: "document",
    refId: "doc_child_death_certificate",
    label: { en: "Death certificate of the child" },
    attrs: {
      why: { en: "Confirms the child's death to the Post Office." },
      originalOrCopy: { en: "Bring the original to show; hand in one photocopy." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 1,
    handbookRef: "§7.6-PPF",
  },
  {
    id: "ROUTE_PPF_MINOR_guardian_id",
    routeId: "ROUTE_PPF_MINOR",
    itemType: "document",
    refId: "doc_claimant_id",
    label: { en: "Your ID and address proof (as guardian)" },
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
    handbookRef: "§7.6-PPF",
  },
  {
    id: "ROUTE_PPF_MINOR_passbook",
    routeId: "ROUTE_PPF_MINOR",
    itemType: "document",
    refId: "doc_passbook_or_certificate",
    label: { en: "PPF passbook" },
    attrs: {
      why: { en: "Confirms which account this is." },
      originalOrCopy: { en: "Original only." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 3,
    handbookRef: "§7.6-PPF",
  },
  {
    id: "ROUTE_PPF_MINOR_note",
    routeId: "ROUTE_PPF_MINOR",
    itemType: "goodToKnow",
    label: {
      en: "The account is closed immediately and paid out at the PPF interest rate. A nominee cannot continue a PPF account after the account holder's death.",
    },
    attrs: {
      why: { en: "This is how PPF specifically works on the death of the account holder." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 4,
    handbookRef: "§7.6-PPF",
  },
];

/**
 * T2 — guardian-change: NOT a money claim. A new guardian (surviving
 * parent, or a court-appointed guardian) takes over a still-living child's
 * account, submitting a fresh account-opening form and the previous
 * guardian's death certificate.
 */
export const T2_GUARDIAN_CHANGE_OUTPUTS: readonly OutputRule[] = [
  {
    id: "T2_guardian_death_certificate",
    routeId: "T2",
    itemType: "document",
    refId: "doc_guardian_death_certificate",
    label: { en: "Death certificate of the previous guardian" },
    attrs: {
      why: { en: "Confirms the change of guardian is needed." },
      originalOrCopy: { en: "Bring the original to show; hand in one photocopy." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 1,
    handbookRef: "§7.6 (guardian rows); SB Order 35/2021 dated 05.11.2021",
  },
  {
    id: "T2_aof_kyc",
    routeId: "T2",
    itemType: "form",
    refId: "form_aof_kyc",
    label: { en: "Fresh Account Opening Form and KYC documents" },
    attrs: {
      why: { en: "Registers the new guardian on the child's account." },
      originalOrCopy: { en: "Fill in and sign; bring your KYC documents." },
      selfAttest: { en: "Yes, where the form asks for it." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder: 2,
    handbookRef: "§7.6 (guardian rows)",
  },
  {
    id: "T2_court_order_note",
    routeId: "T2",
    itemType: "instruction",
    label: {
      en: "If the surviving parent is not available, a new guardian can only be appointed by a court order — bring that order along with the death certificate.",
    },
    attrs: {
      why: { en: "A change of guardian (outside a surviving parent) needs a court's order." },
      originalOrCopy: { en: "Bring the original court order to show." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 3,
    handbookRef: "SB Order 35/2021 dated 05.11.2021",
  },
];
