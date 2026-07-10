import type { DocumentDefinition } from "@claimsahayak/shared-types";

/**
 * Documents = things the claimant brings or submits (certificates, IDs,
 * photographs, copies). Things the claimant FILLS IN AND SIGNS live in
 * forms.ts instead. Every row is referenced from outputs/*.ts by id.
 */
export const DOCUMENTS: readonly DocumentDefinition[] = [
  {
    id: "doc_death_certificate",
    name: { en: "Death certificate of the account holder" },
    detail: {
      en: "From a municipality, hospital, or police station. Bring the original to show; a photocopy is submitted and compared at the counter.",
    },
    category: "core",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_child_death_certificate",
    name: { en: "Death certificate of the child (minor account holder)" },
    detail: {
      en: "Issued by the competent authority. Bring the original to show; a photocopy is submitted.",
    },
    category: "core",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_guardian_death_certificate",
    name: { en: "Death certificate of the earlier guardian" },
    detail: {
      en: "Needed when a new guardian is taking over a child's account after the previous guardian has died.",
    },
    category: "core",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_nominee_death_certificate",
    name: { en: "Death certificate of a nominee who has since died" },
    detail: {
      en: "Needed only if one of the registered nominees has died. Bring the original to show; a photocopy is submitted.",
    },
    category: "core",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_passbook_or_certificate",
    name: { en: "Passbook or certificate for this account" },
    detail: { en: "The original passbook or certificate for this specific account." },
    category: "core",
    originalRequired: true,
    copiesRequired: 0,
  },
  {
    id: "doc_claimant_id",
    name: { en: "Your ID and address proof" },
    detail: {
      en: "Aadhaar card is preferred. Bring the original to show; a self-attested photocopy is submitted.",
    },
    category: "identity",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_witness_id",
    name: { en: "ID and address proof of each witness" },
    detail: {
      en: "A self-attested photocopy from each witness, with their mobile number written on it. Witnesses do not need to visit the Post Office in person.",
    },
    category: "witness",
    originalRequired: false,
    copiesRequired: 1,
  },
  {
    id: "doc_absent_nominee_id",
    name: { en: "ID and address proof of each absent nominee" },
    detail: {
      en: "A self-attested photocopy from each nominee named on the Form 14 disclaimer. Absent nominees do not need to visit the Post Office in person.",
    },
    category: "identity",
    originalRequired: false,
    copiesRequired: 1,
  },
  {
    id: "doc_legal_evidence_copy",
    name: { en: "Succession Certificate, Probate of Will, or Letter of Administration" },
    detail: {
      en: "An attested copy naming every legal heir and their share. Bring the original to show for comparison.",
    },
    category: "legal",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_bank_passbook_first_page",
    name: { en: "First page of your bank passbook, or a bank statement" },
    detail: {
      en: "Needed only if you choose direct bank transfer. Must clearly show the IFSC code.",
    },
    category: "identity",
    originalRequired: false,
    copiesRequired: 1,
  },
  {
    id: "doc_own_posb_passbook_copy",
    name: { en: "Copy of your own Post Office savings passbook" },
    detail: {
      en: "Needed only if you choose to receive the money in your own Post Office savings account. You may also simply write the account number on the claim form.",
    },
    category: "identity",
    originalRequired: false,
    copiesRequired: 1,
  },
  {
    id: "doc_photos_2",
    name: { en: "Two passport-size photographs" },
    detail: {
      en: "Needed only if you are continuing the account in your own name instead of closing it.",
    },
    category: "identity",
    originalRequired: false,
    copiesRequired: 2,
  },
  {
    id: "doc_reconciliation_certificate",
    name: { en: "Reconciliation certificate" },
    detail: {
      en: "Obtained in advance from the Division office or a Gazetted Postmaster when a name does not match exactly between records. Attach it to your claim papers.",
    },
    category: "exception",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_fir_copy",
    name: { en: "Copy of the police FIR" },
    detail: {
      en: "Needed only when the account holder has been missing (not heard of) for more than 7 years.",
    },
    category: "exception",
    originalRequired: false,
    copiesRequired: 1,
  },
  {
    id: "doc_nontraceable_or_presumption_certificate",
    name: { en: "Police non-traceable report, or a court order presuming death" },
    detail: {
      en: "Needed only when the account holder has been missing for more than 7 years. A court must first declare a presumption of death under the Indian Evidence Act.",
    },
    category: "exception",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_missing_person_indemnity",
    name: { en: "Letter of indemnity from the claimant(s)" },
    detail: {
      en: "Needed only for a missing-person claim. This is simpler than the Form 15 indemnity bond used elsewhere.",
    },
    category: "exception",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_apostille_authentication",
    name: { en: "Consular or apostille authentication of documents signed abroad" },
    detail: {
      en: "Needed only when a claimant, relative, or document is from outside India, unless the country has a reciprocal arrangement with India.",
    },
    category: "exception",
    originalRequired: true,
    copiesRequired: 1,
  },
  {
    id: "doc_minor_alive_certificate",
    name: { en: "\"The minor is alive\" certificate" },
    detail: {
      en: "A short certificate you sign confirming the minor is alive and the money is needed on the minor's behalf.",
    },
    category: "exception",
    originalRequired: true,
    copiesRequired: 0,
  },
  {
    id: "doc_pmsby_pmjjby_claim_papers",
    name: { en: "PMSBY / PMJJBY insurance claim papers" },
    detail: {
      en: "Needed only if small yearly insurance deductions appear in the passbook. Closing the savings account does not need to wait for this claim.",
    },
    category: "exception",
    originalRequired: false,
    copiesRequired: 1,
  },
  {
    id: "doc_apy_claim_papers",
    name: { en: "Atal Pension Yojana (APY) claim papers" },
    detail: {
      en: "Needed only if the account holder was enrolled in APY. Closing the savings account does not need to wait for this claim.",
    },
    category: "exception",
    originalRequired: false,
    copiesRequired: 1,
  },
];
