import type { FormLine, OfficialFormLayout } from "@claimsahayak/shared-types";

/**
 * Milestone 7 (extended Milestone 9), Tier A of the document-fidelity
 * model: the FIXED field layout of an official India Post form,
 * transcribed once from the real form (never regenerated at runtime).
 * ClaimSahayak auto-fills the `claimDataField` slots; every other field
 * is `manual` — completed by hand at the counter (signatures, today's
 * date, amounts the Post Office itself computes).
 *
 * Milestone 16 — `form_11` and `form_14` (the only two official forms
 * the four supported nomination scenarios actually use) were rebuilt
 * from a REAL specimen: `knowledge-base/sources/sb-order-31-2020.pdf`
 * (the SB Order's own "FORMAT"/"FORM-14" specimen pages), cross-checked
 * against `knowledge-base/sources/gspr-form-11-nsi.pdf` (the GSPR-2018
 * gazette's own Form-11 specimen) for Form 11. This replaces the earlier
 * approximated numbered-field-list rendering entirely — every word,
 * clause, numbered document, footnote, and the "For office use
 * only"/Acquittance section is now the ACTUAL printed text, via the new
 * `body` (see claim-data.ts's `OfficialFormBody`), not a UI-friendly
 * paraphrase. `fields` stays `[]` for these two; `body` is the one
 * source of truth.
 *
 * Everything else in this file (`form_13`/`form_15`/the 6 other forms)
 * still uses the pre-M16 `fields` approximation — none of them render
 * for the four supported scenarios, so they were out of this fidelity
 * pass's scope; a future session extending scope beyond nomination
 * claims should give each the same real-specimen treatment before
 * trusting its layout the way form_11/form_14 can now be trusted.
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
 * surety/guarantee details), not a claim of verified fidelity.
 */

// ---- Form 11 body (verbatim from sb-order-31-2020.pdf's own "FORMAT" specimen) ----

const FORM_11_LINES: readonly FormLine[] = [
  { kind: "paragraph", segments: [{ kind: "text", text: "To" }] },
  { kind: "paragraph", segments: [{ kind: "text", text: "The Postmaster," }] },
  {
    kind: "paragraph",
    segments: [{ kind: "blank", id: "office_name", claimDataField: "office.name" }],
  },
  {
    kind: "listItem",
    marker: "1.",
    segments: [
      { kind: "text", text: "I/we " },
      // Only the lead claimant's name fills this inline blank — a real
      // multi-claimant case additionally lists co-claimants on the cover
      // page and their own signature lines, but this one printed blank
      // has no repeating mechanism to hold a variable-length name list.
      { kind: "blank", id: "claimant_name", claimDataField: "claimant.name" },
      { kind: "text", text: " the nominee(s)/ legal heirs of late " },
      { kind: "blank", id: "depositor_name", claimDataField: "depositor.name" },
      { kind: "text", text: " the depositor to Account no./Savings certificate(s)* " },
      { kind: "blank", id: "account_number", claimDataField: "account.number" },
      { kind: "text", text: " under " },
      { kind: "blank", id: "scheme_name", computed: "schemeName" },
      {
        kind: "text",
        text: " (Name of scheme), apply for withdrawal of entire amount/transfer of the account/certificate(s) in my/our name standing to the credit of the deceased in the said account. In support of the claim, I hereby submit the following documents:-",
      },
    ],
  },
  { kind: "listItem", marker: "(i)", segments: [{ kind: "text", text: "Death certificate of depositor/s" }] },
  {
    kind: "listItem",
    marker: "(ii)",
    segments: [
      { kind: "text", text: "Death certificate of Sh./Smt. " },
      { kind: "blank", id: "predeceased_nominee_name" },
      { kind: "text", text: ", also the nominee(s) appointed by the depositor(s). (***)" },
    ],
  },
  {
    kind: "listItem",
    marker: "(iii)",
    segments: [
      {
        kind: "text",
        text: "Succession certificate/letters of administration with attested copy of probated will of the deceased depositor issued by ",
      },
      { kind: "blank", id: "issuing_court" },
      { kind: "text", text: " competent court. (**)" },
    ],
  },
  { kind: "listItem", marker: "(iv)", segments: [{ kind: "text", text: "Letter of Indemnity (*)" }] },
  { kind: "listItem", marker: "(v)", segments: [{ kind: "text", text: "Affidavit (*)" }] },
  { kind: "listItem", marker: "(vi)", segments: [{ kind: "text", text: "Letter of disclaimer on affidavit (*)" }] },
  {
    kind: "listItem",
    marker: "(vii)",
    segments: [{ kind: "text", text: "Pass book/deposit receipt/statement of account" }],
  },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Signature/thumb impression of Claimant/s" }] },
  {
    kind: "note",
    segments: [{ kind: "text", text: "(Thumb impression should be attested by a person known to the Post office)" }],
  },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Address: " },
      { kind: "blank", id: "claimant_address", claimDataField: "claimant.address" },
    ],
  },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Mobile No.: " },
      { kind: "blank", id: "claimant_mobile", claimDataField: "claimant.mobile" },
    ],
  },
  { kind: "note", segments: [{ kind: "text", text: "(ID and Address proof of claimant(s) must be attached)" }] },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Witness (1) ......................... (Signature)" }] },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Name & Address: " },
      { kind: "blank", id: "witness_1_name", claimDataField: "witness.0.name" },
      { kind: "text", text: ", " },
      { kind: "blank", id: "witness_1_address", claimDataField: "witness.0.address" },
    ],
  },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Mobile Number: " },
      { kind: "blank", id: "witness_1_mobile", claimDataField: "witness.0.mobile" },
    ],
  },
  { kind: "note", segments: [{ kind: "text", text: "(ID and Address proof must be attached)" }] },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Witness (2) ......................... (Signature)" }] },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Name & Address: " },
      { kind: "blank", id: "witness_2_name", claimDataField: "witness.1.name" },
      { kind: "text", text: ", " },
      { kind: "blank", id: "witness_2_address", claimDataField: "witness.1.address" },
    ],
  },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Mobile Number: " },
      { kind: "blank", id: "witness_2_mobile", claimDataField: "witness.1.mobile" },
    ],
  },
  { kind: "note", segments: [{ kind: "text", text: "(ID and Address proof must be attached)" }] },
  { kind: "paragraph", segments: [{ kind: "text", text: "Witnesses accepted" }] },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Signature of Sr. PM/PM/SPM/GDS BPM" }] },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Date" }] },
  {
    kind: "note",
    segments: [{ kind: "text", text: "(*) To be produced by legal heirs, in the absence of nomination for claims upto Rs.5 lakh." }],
  },
  { kind: "note", segments: [{ kind: "text", text: "(**) Strike off if there is a valid nomination." }] },
  { kind: "note", segments: [{ kind: "text", text: "(***) Strike off if not applicable" }] },
];

const FORM_11_OFFICE_USE_LINES: readonly FormLine[] = [
  { kind: "sectionHeading", segments: [{ kind: "text", text: "For office use only" }] },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "No.- Claim has been sanctioned by competent authority vide Sanction Memo " },
      { kind: "blank", id: "sanction_memo_no" },
      { kind: "text", text: " dated " },
      { kind: "blank", id: "sanction_memo_date" },
      { kind: "text", text: " (copy attached)." },
    ],
  },
  { kind: "note", segments: [{ kind: "text", text: "(to be filled if claim is sanctioned by any administrative authority)" }] },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Withdrawal of Rs. " },
      { kind: "blank", id: "withdrawal_amount" },
      { kind: "text", text: " or transfer of account/certificate(s) in the name of claimant(s) is sanctioned." },
    ],
  },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Signature of Postmaster" }] },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Date" }] },
  { kind: "sectionHeading", segments: [{ kind: "text", text: "Acquittance (to be filled by claimant/s)" }] },
  {
    kind: "paragraph",
    segments: [
      { kind: "text", text: "Received Rs. " },
      { kind: "blank", id: "received_amount_figures" },
      { kind: "text", text: " (In figures) " },
      { kind: "blank", id: "received_amount_words" },
      { kind: "text", text: " (in words) By cheque bearing no " },
      { kind: "blank", id: "cheque_no" },
      { kind: "text", text: " Dated " },
      { kind: "blank", id: "cheque_date" },
      { kind: "text", text: " transfer to PO Savings Account No. " },
      { kind: "blank", id: "posb_account_number", claimDataField: "payment.posbAccountNumber" },
      { kind: "text", text: " or Bank Account No " },
      { kind: "blank", id: "bank_account_number", claimDataField: "payment.bankAccountNumber" },
      { kind: "text", text: " (IFSC " },
      { kind: "blank", id: "bank_ifsc", claimDataField: "payment.bankIfsc" },
      { kind: "text", text: ") in full settlement of my/our claim." },
    ],
  },
  {
    kind: "paragraph",
    segments: [
      {
        kind: "text",
        text: "OR (In case of RD/TD/Savings Certificates) Please transfer the account/Certificate(s) in my/our name for which Account Opening Form (AOF) alongwith Annexure-II (KYC Form) and KYC documents are submitted.",
      },
    ],
  },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Signature/thumb impression of claimant/s" }] },
];

// ---- Form 14 body (verbatim from sb-order-31-2020.pdf's own "FORM-14" specimen) ----

const FORM_14_LINES: readonly FormLine[] = [
  { kind: "paragraph", segments: [{ kind: "text", text: "To," }] },
  {
    kind: "paragraph",
    segments: [{ kind: "text", text: "The Postmaster" }],
  },
  { kind: "paragraph", segments: [{ kind: "text", text: "Sir," }] },
  {
    kind: "listItem",
    marker: "1.",
    segments: [
      { kind: "text", text: "I/We " },
      { kind: "blank", id: "disclaimant_name", claimDataField: "disclaimant.0.name" },
      { kind: "text", text: " husband of/wife of/son of/daughter of late " },
      { kind: "blank", id: "depositor_name_1", claimDataField: "depositor.name" },
      { kind: "text", text: " (deceased depositor) resident of " },
      { kind: "blank", id: "disclaimant_address", claimDataField: "disclaimant.0.address" },
      { kind: "text", text: " do hereby declare and solemnly affirm as under:-" },
    ],
  },
  {
    kind: "listItem",
    marker: "2.",
    segments: [
      { kind: "text", text: "That late " },
      { kind: "blank", id: "depositor_name_2", claimDataField: "depositor.name" },
      { kind: "text", text: " (deceased depositor) died intestate on " },
      { kind: "blank", id: "date_of_death" },
      { kind: "text", text: " leaving behind us as his/her only heirs" },
    ],
  },
  {
    kind: "listItem",
    marker: "3.",
    segments: [
      { kind: "text", text: "That, I/we " },
      { kind: "blank", id: "disclaimant_names", claimDataField: "disclaimant.0.name" },
      { kind: "text", text: " heirs of late " },
      { kind: "blank", id: "depositor_name_3", claimDataField: "depositor.name" },
      {
        kind: "text",
        text: " (deceased depositor) for ourselves and on behalf of our heirs, executors, representatives and assigns do hereby relinquish our claims to the balance of Rs. ",
      },
      { kind: "blank", id: "amount_relinquished", claimDataField: "account.amountClaimed" },
      { kind: "text", text: " payable to the heirs of late " },
      { kind: "blank", id: "depositor_name_4", claimDataField: "depositor.name" },
      { kind: "text", text: " (the deceased) which may be credited to the account sought by Mr./Ms. " },
      { kind: "blank", id: "claimant_name", claimDataField: "claimant.name" },
      { kind: "text", text: " (claimant), our " },
      // Genuinely a different fact from `disclaimant.relationship` (which
      // means "relationship to the depositor," per the same convention
      // every other party field uses) — this blank asks for the
      // disclaimant's relationship to the CLAIMANT instead ("our
      // brother"), which the Claim Data Model has no field for. Wiring
      // `disclaimant.relationship` here would silently print the wrong
      // fact, the same mistake M9 already caught once for Form 10.
      { kind: "blank", id: "relation_to_claimant" },
      {
        kind: "text",
        text: " (mention relation). We have no objection whatsoever in the balance in the above referred account No. ",
      },
      { kind: "blank", id: "account_number", claimDataField: "account.number" },
      {
        kind: "text",
        text: " together with interest, if any, accrued thereon being paid by the Post Office to said Mr./Ms. ",
      },
      { kind: "blank", id: "claimant_name_2", claimDataField: "claimant.name" },
      { kind: "text", text: " (claimant)." },
    ],
  },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Deponent 1 — signature" }] },
  {
    kind: "signatureLine",
    segments: [
      { kind: "text", text: "Deponent 2 — " },
      { kind: "blank", id: "disclaimant_2_name", claimDataField: "disclaimant.1.name" },
      { kind: "text", text: " — signature" },
    ],
  },
  {
    kind: "signatureLine",
    segments: [
      { kind: "text", text: "Deponent 3 — " },
      { kind: "blank", id: "disclaimant_3_name", claimDataField: "disclaimant.2.name" },
      { kind: "text", text: " — signature" },
    ],
  },
  {
    kind: "note",
    segments: [
      {
        kind: "text",
        text: "Verification: I/we, the above named deponents do hereby verify on solemn affirmation that the contents of this affidavit are true to my/our knowledge and nothing material has been concealed.",
      },
    ],
  },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Dated:-" }] },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Deponents" }] },
  {
    kind: "note",
    segments: [
      {
        kind: "text",
        text: "I identify the deponent(s) who is/are personally known to me and who has/have signed in my presence.",
      },
    ],
  },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Dated:-" }] },
  { kind: "signatureLine", segments: [{ kind: "text", text: "Attested — Oath Commissioner/Notary Public" }] },
];

export const OFFICIAL_FORM_LAYOUTS: readonly OfficialFormLayout[] = [
  {
    formId: "form_11",
    fields: [],
    body: {
      formNumber: "FORM-11",
      ruleCitation: "(See Rule 15 of Government Savings Promotion General Rules, 2018)",
      heading:
        "Application for settlement of an account of the deceased depositor by nominee or legal heirs under National (Small) Savings Scheme",
      lines: FORM_11_LINES,
      officeUseLines: FORM_11_OFFICE_USE_LINES,
    },
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
    // Milestone 13 correctness fix (still the reason `disclaimant`, not
    // `legalHeir`, is used below): Form 14 fires from the multiple-
    // nominees/cannot-come-together context (T14, ROUTE_A) in every
    // scenario this form is actually used for today — the people
    // disclaiming are the deceased's NOMINEES who cannot attend, not
    // legal heirs.
    //
    // Milestone 16 — rebuilt as a verbatim `body` from
    // `knowledge-base/sources/sb-order-31-2020.pdf`'s own "FORM-14"
    // specimen (the real "Letter of disclaimer" affidavit, with its
    // actual declaration/verification/attestation wording) — see
    // `FORM_14_LINES` above for the full transcription and its own
    // per-blank notes (in particular: the "our ___ (mention relation)"
    // blank stays manual, since it asks the disclaimant's relationship
    // to the CLAIMANT, a fact the Claim Data Model doesn't carry —
    // `disclaimant.relationship` means relationship to the depositor,
    // a different fact).
    formId: "form_14",
    fields: [],
    body: {
      formNumber: "FORM-14",
      ruleCitation: "(See Rule 15 of Government Savings Promotion General Rules, 2018)",
      heading: "Letter of disclaimer",
      lines: FORM_14_LINES,
      officeUseLines: [],
    },
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
