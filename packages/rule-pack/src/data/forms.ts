import type { FormDefinition } from "@claimsahayak/shared-types";

/** NV-02: stamp-paper values are commonly quoted but governed by state Stamp Acts. */
const STAMP_STATE_NOTE = {
  en: "Commonly quoted value — confirm the exact figure for your state with the notary or oath commissioner.",
};

export const FORMS: readonly FormDefinition[] = [
  {
    id: "form_11",
    name: { en: "Form 11 — claim application" },
    purpose: {
      en: "The main claim application. Needed for every claim, whichever route applies.",
    },
    signatories: {
      en: "You (the claimant), plus two witnesses. If more than one nominee or legal heir is claiming, every one of them signs.",
    },
    executedBefore: { en: "No notary needed — signed and handed in at the Post Office." },
    copies: 2,
    officialSourceUrl: "https://www.indiapost.gov.in/VAS/Pages/Form.aspx",
  },
  {
    id: "form_13",
    name: { en: "Form 13 — affidavit" },
    purpose: {
      en: "A sworn statement used only when there is no nomination and no court document, and the account balance is within the affidavit limit.",
    },
    signatories: { en: "Every legal heir, including you (the claimant)." },
    executedBefore: { en: "A notary public or an oath commissioner." },
    stampPaper: {
      required: true,
      commonValueInr: 20,
      validityMonths: 12,
      stateVariationNote: STAMP_STATE_NOTE,
    },
    copies: 1,
    officialSourceUrl: "https://www.indiapost.gov.in/VAS/Pages/Form.aspx",
  },
  {
    id: "form_14",
    name: { en: "Form 14 — letter of disclaimer" },
    purpose: {
      en: "Signed by legal heirs (or other nominees) who agree the claim proceeds should be paid to one particular claimant instead of to themselves.",
    },
    signatories: {
      en: "Every legal heir or nominee EXCEPT the person actually claiming the money.",
    },
    executedBefore: { en: "A notary public or an oath commissioner." },
    stampPaper: {
      required: true,
      commonValueInr: 20,
      validityMonths: 12,
      stateVariationNote: STAMP_STATE_NOTE,
    },
    copies: 1,
    officialSourceUrl: "https://www.indiapost.gov.in/VAS/Pages/Form.aspx",
  },
  {
    id: "form_15",
    name: { en: "Form 15 — indemnity bond" },
    purpose: {
      en: "Used only in the affidavit route, alongside Forms 13 and 14, when there is no nomination and no court document.",
    },
    signatories: {
      en: "You (the claimant) plus two sureties whose financial standing the Post Office is satisfied with, in front of two witnesses.",
    },
    executedBefore: { en: "A notary public." },
    stampPaper: {
      required: true,
      commonValueInr: 100,
      validityMonths: 12,
      stateVariationNote: STAMP_STATE_NOTE,
    },
    copies: 1,
    officialSourceUrl: "https://www.indiapost.gov.in/VAS/Pages/Form.aspx",
  },
  {
    id: "form_10_nomination",
    name: { en: "Form 10 — nomination form" },
    purpose: {
      en: "Registers a nominee for the account being transferred into your name, so a future claim on it is simpler for your own family.",
    },
    signatories: { en: "You, as the new account holder." },
    executedBefore: { en: "No notary needed — signed and handed in at the Post Office." },
    copies: 1,
    officialSourceUrl: "https://www.indiapost.gov.in/VAS/Pages/Form.aspx",
  },
  {
    id: "form_aof_kyc",
    name: { en: "Account Opening Form and KYC documents" },
    purpose: {
      en: "Needed to open a fresh customer record when continuing an account in your name, or when a new guardian takes over a child's account.",
    },
    signatories: { en: "You, as the new account holder or new guardian." },
    executedBefore: { en: "No notary needed — signed and handed in at the Post Office." },
    copies: 1,
    officialSourceUrl: "https://www.indiapost.gov.in/VAS/Pages/Form.aspx",
  },
  {
    id: "form_sb7b",
    name: { en: "Form SB-7B — premature closure form" },
    purpose: {
      en: "Used specifically to close a Sukanya Samriddhi Account after the death of the child or the guardian.",
    },
    signatories: { en: "The guardian (or, in some cases, the legal heirs)." },
    executedBefore: { en: "No notary needed — signed and handed in at the Post Office." },
    copies: 1,
  },
  {
    id: "form_nc54a",
    name: { en: "Indemnity bond NC-54(a)" },
    purpose: {
      en: "Used only when an NSC or KVP certificate has been lost and a duplicate is needed, with one surety.",
    },
    signatories: { en: "The certificate holder or claimant, with one surety." },
    executedBefore: {
      en: "The Post Office will confirm the exact execution requirements for this bond when you reach this step.",
    },
    copies: 1,
  },
  {
    id: "form_nc54b",
    name: { en: "Indemnity bond NC-54(b)" },
    purpose: {
      en: "An alternative to NC-54(a) for a lost NSC or KVP certificate, backed by a bank guarantee instead of a personal surety.",
    },
    signatories: { en: "The certificate holder or claimant, with a bank guarantee." },
    executedBefore: {
      en: "The Post Office will confirm the exact execution requirements for this bond when you reach this step.",
    },
    copies: 1,
  },
];
