import type { OfficialFormLayout } from "@claimsahayak/shared-types";

/**
 * Milestone 7 (extended Milestone 9), Tier A of the document-fidelity
 * model: the FIXED field layout of an official India Post form,
 * transcribed once from the real form (never regenerated at runtime).
 * ClaimSahayak auto-fills the `claimDataField` slots; every other field
 * is `manual` — completed by hand at the counter (signatures, today's
 * date, amounts the Post Office itself computes).
 *
 * Field order/labels approximate the real prescribed form at a level
 * useful for auto-fill; a future session with the actual gazetted form
 * image should re-verify field-for-field against
 * `knowledge-base/forms/document-library.md` before this is treated as a
 * certified transcription.
 *
 * Correction to the M7 record: M7's own comment here claimed the other 6
 * `FormDefinition`s (SCSS Form-4, NC-54(a)/(b), SB-7B, AOF/KYC, Form 10)
 * were "not currently reachable from any live route." That was wrong —
 * verified by grep before Milestone 9 started: all 6 ARE reachable, just
 * from overlay/continuation paths (`overlays.ts`'s `passbook_lost`/
 * `scss_spouse_continuing` flags, `outputs/minors.ts`'s `ROUTE_SSA_MINOR`,
 * `outputs/continue-addon.ts`'s `CONTINUE_ADDON`) rather than the primary
 * D-row routes M7's 8 test scenarios exercised. Milestone 9 closes this
 * gap for real, not a previously-miscategorized non-issue.
 *
 * Confidence note on `form_nc54a`/`form_nc54b`: the pack's own existing
 * overlay copy for these two (`overlays.ts`) already says "the Post
 * Office will confirm the exact execution requirements when you reach
 * this step" — i.e. even the M2-authored source material treats these as
 * lower-certainty than the others. Their layouts below are a reasonable
 * structural approximation (claimant/depositor/certificate identity +
 * surety/guarantee details), not a claim of verified fidelity — flagged
 * explicitly rather than presented with the same confidence as
 * `form_11`/`form_13`/`form_14`/`form_15`.
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
      {
        // Milestone 13 — was manual until now; the Universal Claim Data
        // Model (M11) gained a per-account amountClaimed field specifically
        // so this could auto-fill instead of asking the claimant to write
        // it twice (once in the Wizard, once by hand here).
        id: "amount_claimed",
        label: { en: "Amount claimed" },
        claimDataField: "account.amountClaimed",
      },
      {
        // Milestone 13 note: payment-routing fields (POSB / bank + IFSC)
        // were considered here and deliberately NOT added. Only ONE of
        // the three would ever be relevant per claim (per Q9's answer),
        // and `validateClaimPackage` has no per-field conditionality — it
        // would flag the two genuinely-inapplicable fields as "missing
        // information" on every claim, a false-positive noise problem
        // worse than staying manual. Revisit only alongside a conditional-
        // field mechanism in OfficialFormLayout, not by forcing it in here.
        id: "witness_1_name",
        label: { en: "Witness 1 — name" },
        claimDataField: "witness.0.name",
      },
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
    // Milestone 13 correctness fix — this layout previously wired the
    // disclaiming party's name to legalHeir.N, which is wrong whenever
    // Form 14 fires from the multiple-nominees/cannot-come-together
    // context (T14, ROUTE_A): the people disclaiming are the deceased's
    // NOMINEES who cannot attend, not legal heirs — a legal-heir claim
    // (ROUTE_C) never reaches T14 at all. Wiring legalHeir.N here would
    // have auto-filled the wrong array's names whenever this milestone's
    // Scenario 4 (multiple nominees) fires. `disclaimant` (added to the
    // Claim Data Model in M11 for exactly this reason) is the correct,
    // context-neutral entity: "whoever is relinquishing in this
    // claimant's favour," regardless of whether they're a nominee or an
    // heir in some future context.
    formId: "form_14",
    fields: [
      { id: "disclaiming_party_1", label: { en: "Nominee / legal heir disclaiming — name 1" }, claimDataField: "disclaimant.0.name" },
      { id: "disclaiming_party_1_address", label: { en: "Name 1 — address" }, claimDataField: "disclaimant.0.address" },
      { id: "disclaiming_party_2", label: { en: "Name 2" }, claimDataField: "disclaimant.1.name" },
      { id: "disclaiming_party_2_address", label: { en: "Name 2 — address" }, claimDataField: "disclaimant.1.address" },
      { id: "disclaiming_party_3", label: { en: "Name 3" }, claimDataField: "disclaimant.2.name" },
      { id: "disclaiming_party_3_address", label: { en: "Name 3 — address" }, claimDataField: "disclaimant.2.address" },
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
  {
    // Milestone 9 — the account is being CONTINUED into the claimant's own
    // name (CONTINUE_ADDON), so "claimant" here means the new account
    // holder registering a fresh nomination for their OWN continued
    // account — deliberately NOT reusing nominee.N.name (that would wrongly
    // imply auto-filling the deceased's original nominee into a brand new
    // nomination naming someone else entirely; ClaimDataModel has no field
    // for "who the claimant is newly nominating," so that line stays manual).
    formId: "form_10_nomination",
    fields: [
      { id: "post_office_name", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "account_number", label: { en: "Account / certificate number (now in your name)" }, claimDataField: "account.number" },
      { id: "holder_name", label: { en: "Name of account holder (you)" }, claimDataField: "claimant.name" },
      { id: "new_nominee_name", label: { en: "Name of the nominee you are registering" }, manual: true },
      { id: "new_nominee_relationship", label: { en: "Nominee's relationship to you" }, manual: true },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "signature", label: { en: "Signature of account holder" }, manual: true },
    ],
  },
  {
    formId: "form_aof_kyc",
    fields: [
      { id: "post_office_name", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "old_account_number", label: { en: "Account / certificate number being continued" }, claimDataField: "account.number" },
      { id: "holder_name", label: { en: "Name of new account holder / guardian" }, claimDataField: "claimant.name" },
      { id: "holder_address", label: { en: "Address" }, claimDataField: "claimant.address" },
      { id: "kyc_documents", label: { en: "KYC documents attached (ID proof, address proof, photographs)" }, manual: true },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "signature", label: { en: "Signature" }, manual: true },
    ],
  },
  {
    formId: "form_sb7b",
    fields: [
      { id: "post_office_name", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "account_number", label: { en: "Sukanya Samriddhi Account number" }, claimDataField: "account.number" },
      { id: "child_name", label: { en: "Name of the deceased child account holder" }, claimDataField: "depositor.name" },
      { id: "guardian_name", label: { en: "Name of guardian" }, claimDataField: "guardian.name" },
      { id: "guardian_address", label: { en: "Guardian's address" }, claimDataField: "claimant.address" },
      { id: "reason", label: { en: "Reason for premature closure" }, manual: true },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "signature", label: { en: "Signature of guardian" }, manual: true },
    ],
  },
  {
    formId: "form_scss_form4",
    fields: [
      { id: "post_office_name", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "account_number", label: { en: "SCSS account number" }, claimDataField: "account.number" },
      { id: "depositor_name", label: { en: "Name of the deceased account holder" }, claimDataField: "depositor.name" },
      { id: "spouse_name", label: { en: "Name of the continuing spouse" }, claimDataField: "claimant.name" },
      { id: "spouse_address", label: { en: "Address of the continuing spouse" }, claimDataField: "claimant.address" },
      { id: "eligibility_basis", label: { en: "Basis of eligibility (joint holder / sole nominee on date of death)" }, manual: true },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "signature", label: { en: "Signature of continuing spouse" }, manual: true },
    ],
  },
  {
    // Lower-confidence layout — see this file's header comment.
    formId: "form_nc54a",
    fields: [
      { id: "claimant_name", label: { en: "Name of claimant / certificate holder" }, claimDataField: "claimant.name" },
      { id: "claimant_address", label: { en: "Address" }, claimDataField: "claimant.address" },
      { id: "depositor_name", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", label: { en: "Certificate number(s) lost" }, claimDataField: "account.number" },
      { id: "surety_name", label: { en: "Surety — name and standing" }, manual: true },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "signature", label: { en: "Signature" }, manual: true },
    ],
  },
  {
    // Lower-confidence layout — see this file's header comment.
    formId: "form_nc54b",
    fields: [
      { id: "claimant_name", label: { en: "Name of claimant / certificate holder" }, claimDataField: "claimant.name" },
      { id: "claimant_address", label: { en: "Address" }, claimDataField: "claimant.address" },
      { id: "depositor_name", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", label: { en: "Certificate number(s) lost" }, claimDataField: "account.number" },
      { id: "bank_guarantee_details", label: { en: "Bank guarantee details" }, manual: true },
      { id: "date_place", label: { en: "Date and place" }, manual: true },
      { id: "signature", label: { en: "Signature" }, manual: true },
    ],
  },
];
