import type { TemplateDefinition } from "@claimsahayak/shared-types";

/**
 * Every template is a sequence of structured fields (static printed text,
 * blank lines for the claimant to hand-fill, or checkbox rows) — never raw
 * HTML (V3 §3.4). The PDF/print renderer (Milestone 6) lays these out; this
 * file only says WHAT the letter contains.
 */
export const TEMPLATES: readonly TemplateDefinition[] = [
  {
    id: "template_nomination_request",
    title: { en: "Ask the Post Office about a registered nominee" },
    handbookRef: "Annexure 10; FAQ 1, FAQ 3",
    fields: [
      { id: "to_line", kind: "staticText", label: { en: "To" }, text: { en: "The Postmaster / Sub Postmaster" } },
      { id: "post_office_name", kind: "blankLine", label: { en: "Name of Post Office" } },
      {
        id: "subject",
        kind: "staticText",
        label: { en: "Subject" },
        text: { en: "Request for nomination details" },
      },
      { id: "holder_name", kind: "blankLine", label: { en: "Name of the account holder who has passed away" } },
      { id: "scheme_account_no", kind: "blankLine", label: { en: "Scheme and account/certificate number (if known)" } },
      { id: "date_of_death", kind: "blankLine", label: { en: "Date of death" } },
      {
        id: "body",
        kind: "staticText",
        label: { en: "Message" },
        text: {
          en: "The above account holder has passed away. Please let me know whether a nominee is registered for this account, so I can proceed with the claim.",
        },
      },
      { id: "relationship", kind: "blankLine", label: { en: "Your relationship to the account holder" } },
      {
        id: "relationship_note",
        kind: "staticText",
        label: { en: "Note" },
        text: {
          en: "The Post Office may ask you to show proof of this relationship.",
        },
      },
      { id: "your_name", kind: "blankLine", label: { en: "Your name" } },
      { id: "your_address", kind: "blankLine", label: { en: "Your address and mobile number" } },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
    ],
  },
  {
    // Milestone 13 — fully wired to the Claim Data Model (M11). Previously
    // this template carried zero claimDataField mappings at all — every
    // field was a hand-fill blank even when the Wizard had already
    // collected the exact same fact. The witness field is split into
    // name/address/signature (matching template_witness_sheet's own
    // pattern) so the name — the one part of it the model can supply —
    // auto-fills instead of the whole compound line staying manual.
    id: "template_reconciliation_depositor",
    title: { en: "Apply for a reconciliation certificate — depositor's name" },
    handbookRef: "Annexure 7; §5.4-1; FAQ 12",
    fields: [
      {
        id: "purpose",
        kind: "staticText",
        label: { en: "This application is for" },
        text: {
          en: "A difference between the name of the DECEASED ACCOUNT HOLDER in the Post Office's records and the name on the death certificate.",
        },
      },
      { id: "claimant_name", kind: "blankLine", label: { en: "Your name" }, claimDataField: "claimant.name" },
      { id: "claimant_address", kind: "blankLine", label: { en: "Your address" }, claimDataField: "claimant.address" },
      { id: "scheme_type", kind: "blankLine", label: { en: "Type of account (e.g. Savings, RD, NSC, KVP)" } },
      { id: "account_no", kind: "blankLine", label: { en: "Account or registration number" }, claimDataField: "account.number" },
      { id: "post_office_name", kind: "blankLine", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      {
        id: "name_in_records",
        kind: "blankLine",
        label: { en: "Name of the account holder as per Post Office records" },
        claimDataField: "depositor.name",
      },
      {
        id: "name_on_id",
        kind: "blankLine",
        label: { en: "Name of the account holder as per the death certificate / Aadhaar" },
        claimDataField: "nameDifference.depositorNameOnDeathCertificate",
      },
      {
        id: "enclosures_note",
        kind: "staticText",
        label: { en: "Enclose" },
        text: { en: "Copies of the documents that show both versions of the name." },
      },
      { id: "witness_1_name", kind: "blankLine", label: { en: "Witness 1 — name" }, claimDataField: "witness.0.name" },
      { id: "witness_1_address", kind: "blankLine", label: { en: "Witness 1 — address" }, claimDataField: "witness.0.address" },
      { id: "witness_1_signature", kind: "blankLine", label: { en: "Witness 1 — signature" } },
      { id: "witness_2_name", kind: "blankLine", label: { en: "Witness 2 — name" }, claimDataField: "witness.1.name" },
      { id: "witness_2_address", kind: "blankLine", label: { en: "Witness 2 — address" }, claimDataField: "witness.1.address" },
      { id: "witness_2_signature", kind: "blankLine", label: { en: "Witness 2 — signature" } },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
      {
        // Milestone 16 — the ACTUAL certificate text (SB Order 31/2020's
        // own "Reconciliation certificate in case of a difference in name
        // of deceased depositor/investor" specimen), appended after the
        // claimant's own application above rather than replacing it — the
        // real process is genuinely two documents (an informal manuscript
        // application, then this fixed-format certificate the Divisional/
        // GPO/Gazetted authority issues and signs). The account/scheme
        // clause ("of Account/Certificate No. ___ under ___") follows the
        // exact phrasing convention Form 11 itself uses for the identical
        // fact, since the specimen's own text has a scan gap there.
        id: "certificate_divider",
        kind: "staticText",
        label: { en: "Reconciliation Certificate" },
        text: { en: "Reconciliation Certificate (official format — for the issuing authority to complete and sign)" },
      },
      {
        id: "certificate_text",
        kind: "richParagraph",
        label: { en: "Certificate text" },
        segments: [
          { kind: "text", text: "Certified that the real name of the deceased depositor/investor of Account/Certificate No. " },
          { kind: "blank", id: "certificate_account_no", claimDataField: "account.number" },
          { kind: "text", text: " under " },
          { kind: "blank", id: "certificate_scheme_name", computed: "schemeName" },
          { kind: "text", text: " (Name of scheme) is " },
          { kind: "blank", id: "certificate_name_in_records", claimDataField: "depositor.name" },
          { kind: "text", text: ". He/she also used to be called by " },
          { kind: "blank", id: "certificate_name_on_death_cert", claimDataField: "nameDifference.depositorNameOnDeathCertificate" },
          {
            kind: "text",
            text: " (name as per the Death Certificate). The name mentioned in the Post Office's records and in the Death Certificate is that of one and the same person, viz., the deceased depositor/investor.",
          },
        ],
      },
      { id: "certificate_date_place", kind: "blankLine", label: { en: "Date / Place" } },
      { id: "certificate_signature", kind: "blankLine", label: { en: "Signature" } },
      { id: "certificate_issuer_name", kind: "blankLine", label: { en: "Name (in block letters)" } },
      { id: "certificate_issuer_designation", kind: "blankLine", label: { en: "Designation" } },
      { id: "certificate_stamp_note", kind: "staticText", label: { en: "Note" }, text: { en: "(Office seal / stamp)" } },
    ],
  },
  {
    // Milestone 13 — same wiring pattern as the depositor version above;
    // the two name-difference facts are the mirror image of each other
    // (see NameDifferenceDetails, claim-data.ts).
    id: "template_reconciliation_claimant",
    title: { en: "Apply for a reconciliation certificate — your own name" },
    handbookRef: "Annexure 7; §5.4-2; FAQ 13",
    fields: [
      {
        id: "purpose",
        kind: "staticText",
        label: { en: "This application is for" },
        text: {
          en: "A difference between YOUR name (as nominee or claimant) in the Post Office's records and the name on your ID.",
        },
      },
      { id: "claimant_name", kind: "blankLine", label: { en: "Your name" }, claimDataField: "claimant.name" },
      { id: "claimant_address", kind: "blankLine", label: { en: "Your address" }, claimDataField: "claimant.address" },
      { id: "scheme_type", kind: "blankLine", label: { en: "Type of account (e.g. Savings, RD, NSC, KVP)" } },
      { id: "account_no", kind: "blankLine", label: { en: "Account or registration number" }, claimDataField: "account.number" },
      { id: "post_office_name", kind: "blankLine", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      {
        id: "name_in_records",
        kind: "blankLine",
        label: { en: "Your name as per Post Office records (nomination/claimant)" },
        claimDataField: "claimant.name",
      },
      {
        id: "name_on_id",
        kind: "blankLine",
        label: { en: "Your name as per your ID (e.g. Aadhaar)" },
        claimDataField: "nameDifference.claimantNameAsPerId",
      },
      {
        id: "alternate_note",
        kind: "staticText",
        label: { en: "Alternative" },
        text: {
          en: "Instead of this application, you may also bring a reconciliation certificate from any Gazetted Officer in the prescribed format.",
        },
      },
      { id: "witness_1_name", kind: "blankLine", label: { en: "Witness 1 — name" }, claimDataField: "witness.0.name" },
      { id: "witness_1_address", kind: "blankLine", label: { en: "Witness 1 — address" }, claimDataField: "witness.0.address" },
      { id: "witness_1_signature", kind: "blankLine", label: { en: "Witness 1 — signature" } },
      { id: "witness_2_name", kind: "blankLine", label: { en: "Witness 2 — name" }, claimDataField: "witness.1.name" },
      { id: "witness_2_address", kind: "blankLine", label: { en: "Witness 2 — address" }, claimDataField: "witness.1.address" },
      { id: "witness_2_signature", kind: "blankLine", label: { en: "Witness 2 — signature" } },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
      {
        // Milestone 16 — the same real certificate specimen as the
        // depositor version, adapted to the claimant/nominee name-
        // difference case: SB Order 31/2020's §15 only spells out the
        // depositor scenario verbatim, but the pack's own `forms-catalog.md`
        // research (M10) already established that a claimant/nominee name
        // difference goes through the identical Reconciliation Certificate
        // mechanism — this reapplies the same certified-statement pattern
        // to that already-established case, substituting "the claimant/
        // nominee" for "the deceased depositor/investor"; it is not a
        // separately-sourced specimen.
        id: "certificate_divider",
        kind: "staticText",
        label: { en: "Reconciliation Certificate" },
        text: { en: "Reconciliation Certificate (official format — for the issuing authority to complete and sign)" },
      },
      {
        id: "certificate_text",
        kind: "richParagraph",
        label: { en: "Certificate text" },
        segments: [
          { kind: "text", text: "Certified that the real name of the claimant/nominee in respect of Account/Certificate No. " },
          { kind: "blank", id: "certificate_account_no", claimDataField: "account.number" },
          { kind: "text", text: " under " },
          { kind: "blank", id: "certificate_scheme_name", computed: "schemeName" },
          { kind: "text", text: " (Name of scheme) is " },
          { kind: "blank", id: "certificate_name_in_records", claimDataField: "claimant.name" },
          { kind: "text", text: ". He/she also used to be called by " },
          { kind: "blank", id: "certificate_name_on_id", claimDataField: "nameDifference.claimantNameAsPerId" },
          {
            kind: "text",
            text: " (name as per the claimant's ID). The name mentioned in the Post Office's records and in the claimant's ID is that of one and the same person.",
          },
        ],
      },
      { id: "certificate_date_place", kind: "blankLine", label: { en: "Date / Place" } },
      { id: "certificate_signature", kind: "blankLine", label: { en: "Signature" } },
      { id: "certificate_issuer_name", kind: "blankLine", label: { en: "Name (in block letters)" } },
      { id: "certificate_issuer_designation", kind: "blankLine", label: { en: "Designation" } },
      { id: "certificate_stamp_note", kind: "staticText", label: { en: "Note" }, text: { en: "(Office seal / stamp)" } },
    ],
  },
  {
    id: "template_no_passbook_request",
    title: { en: "Ask to close the account without the original passbook" },
    handbookRef: "Annexure 9; §5.4-5",
    fields: [
      { id: "claimant_name", kind: "blankLine", label: { en: "Your name" } },
      { id: "claimant_address", kind: "blankLine", label: { en: "Your address" } },
      { id: "scheme_type", kind: "blankLine", label: { en: "Type of account (e.g. Savings, RD, NSC, KVP)" } },
      { id: "account_no", kind: "blankLine", label: { en: "Account or registration number" } },
      { id: "post_office_name", kind: "blankLine", label: { en: "Name of Post Office" } },
      { id: "holder_name_in_records", kind: "blankLine", label: { en: "Name of the deceased account holder as per Post Office records" } },
      { id: "reason", kind: "blankLine", label: { en: "Why the passbook is not available" } },
      {
        id: "enclosures",
        kind: "checkboxRow",
        label: { en: "Enclosed with this application" },
        text: {
          en: "Aadhaar copy of claimant and witness; death certificate; letter requesting closure without passbook; copy of the account opening form (if you have it); claim application",
        },
      },
      { id: "witness_1", kind: "blankLine", label: { en: "Witness 1 — name, address, signature" } },
      { id: "witness_2", kind: "blankLine", label: { en: "Witness 2 — name, address, signature" } },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
    ],
  },
];
