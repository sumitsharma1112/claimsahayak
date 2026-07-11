import type { OfficialFormLayout } from "@claimsahayak/shared-types";

/**
 * Milestone 7, Tier A of the document-fidelity model: the FIXED field
 * layout of an official India Post form, transcribed once from the real
 * form (never regenerated at runtime). ClaimSahayak auto-fills the
 * `claimDataField` slots; every other field is `manual` — completed by
 * hand at the counter (signatures, today's date, amounts the Post Office
 * itself computes).
 *
 * Scoped to the four forms actually reachable in the current pack's routes
 * (`forms.ts`'s `form_11`/`form_13`/`form_14`/`form_15`, referenced from
 * `outputs/route-a.ts`/`outputs/route-c.ts`). The remaining `FormDefinition`s
 * (SCSS Form-4, NC-54(a)/(b), SB-7B, AOF/KYC, Form 10) have no layout
 * authored yet — an honest gap, not a silent omission (see the M7
 * completion report), same convention as the CS-ID coverage percentage.
 *
 * Field order/labels approximate the real prescribed form at a level
 * useful for auto-fill; a future session with the actual gazetted form
 * image should re-verify field-for-field against
 * `knowledge-base/forms/document-library.md` before this is treated as a
 * certified transcription.
 */
export const OFFICIAL_FORM_LAYOUTS: readonly OfficialFormLayout[] = [
  {
    formId: "form_11",
    fields: [
      { id: "to_line", label: { en: "To the Postmaster" }, manual: true },
      { id: "post_office_name", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "depositor_name", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      { id: "claimant_name", label: { en: "Name of claimant" }, claimDataField: "claimant.name" },
      { id: "claimant_relationship", label: { en: "Relationship to the depositor" }, claimDataField: "claimant.relationship" },
      { id: "claimant_address", label: { en: "Claimant's address" }, claimDataField: "claimant.address" },
      { id: "amount_claimed", label: { en: "Amount claimed" }, manual: true },
      { id: "witness_1_name", label: { en: "Witness 1 — name" }, claimDataField: "witness.0.name" },
      { id: "witness_2_name", label: { en: "Witness 2 — name" }, claimDataField: "witness.1.name" },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "signature", label: { en: "Signature of claimant" }, manual: true },
    ],
  },
  {
    formId: "form_13",
    fields: [
      { id: "deponent_name", label: { en: "I / We, (name of every legal heir, including the claimant)" }, claimDataField: "legalHeir.0.name" },
      { id: "deponent_2_name", label: { en: "Legal heir 2" }, claimDataField: "legalHeir.1.name" },
      { id: "deponent_3_name", label: { en: "Legal heir 3" }, claimDataField: "legalHeir.2.name" },
      { id: "deponent_4_name", label: { en: "Legal heir 4" }, claimDataField: "legalHeir.3.name" },
      { id: "depositor_name", label: { en: "do solemnly affirm that (name of the deceased depositor)" }, claimDataField: "depositor.name" },
      { id: "account_number", label: { en: "held account / certificate number" }, claimDataField: "account.number" },
      { id: "claimant_name", label: { en: "and that the claimant, (name)" }, claimDataField: "claimant.name" },
      { id: "claimant_relationship", label: { en: "is the deceased's (relationship)" }, claimDataField: "claimant.relationship" },
      {
        id: "affirmation",
        label: { en: "is the only person / one of the only persons entitled to receive the amount, to the best of our knowledge" },
        manual: true,
      },
      { id: "date_place", label: { en: "Sworn on (date and place)" }, manual: true },
      { id: "notary_seal", label: { en: "Before (notary public / oath commissioner) — seal and signature" }, manual: true },
    ],
  },
  {
    formId: "form_14",
    fields: [
      { id: "disclaiming_heir_1", label: { en: "Legal heir / nominee disclaiming — name 1" }, claimDataField: "legalHeir.0.name" },
      { id: "disclaiming_heir_2", label: { en: "Name 2" }, claimDataField: "legalHeir.1.name" },
      { id: "disclaiming_heir_3", label: { en: "Name 3" }, claimDataField: "legalHeir.2.name" },
      { id: "depositor_name", label: { en: "In the matter of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      { id: "claimant_name", label: { en: "I/we relinquish my/our share in favour of (claimant's name)" }, claimDataField: "claimant.name" },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "notary_seal", label: { en: "Before (notary public / oath commissioner) — seal and signature" }, manual: true },
    ],
  },
  {
    formId: "form_15",
    fields: [
      { id: "claimant_name", label: { en: "I, (claimant's name)" }, claimDataField: "claimant.name" },
      { id: "claimant_address", label: { en: "of (address)" }, claimDataField: "claimant.address" },
      { id: "depositor_name", label: { en: "in respect of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      { id: "surety_1_name", label: { en: "Surety 1 — name and standing" }, manual: true },
      { id: "surety_2_name", label: { en: "Surety 2 — name and standing" }, manual: true },
      { id: "witness_1_name", label: { en: "Witness 1 — name" }, claimDataField: "witness.0.name" },
      { id: "witness_2_name", label: { en: "Witness 2 — name" }, claimDataField: "witness.1.name" },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "notary_seal", label: { en: "Before a notary public — seal and signature" }, manual: true },
    ],
  },
];
