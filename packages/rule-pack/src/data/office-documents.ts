import type { TemplateDefinition } from "@claimsahayak/shared-types";

/**
 * Milestone 7, Tier B of the document-fidelity model: composed documents
 * ClaimSahayak has latitude to assemble (no government-prescribed wording),
 * authored generically per outcome shape rather than per scheme/route — the
 * same "nothing hardcoded to a scheme/route" discipline every other pack
 * file follows. Each holds only Claim Data Model identity fields
 * (`claimDataField`); the decision-specific content (competent authority,
 * monetary limit, official references, processing notes, next action) is
 * NOT duplicated into these templates — it's read directly from
 * `ClaimDecision` and rendered alongside, in `ClaimPackage.tsx`, exactly
 * once, from exactly one source.
 *
 * These join the pack's existing `TEMPLATES` array (see `data/index.ts`) —
 * reusing the same `TemplateDefinition`/`TemplateField` contract and print
 * pipeline `PrintableTemplate.tsx` already renders, rather than inventing a
 * second templating mechanism. `handbookRef` cites the Blueprint (there is
 * no Rule Book row for a UI-authored internal office document, the same
 * convention T20's `card_dual_preview` already uses); "approval" is used
 * throughout per the pack's own forbidden-jargon map (`vocab.ts`: "sanction"
 * → "approval").
 */
export const OFFICE_DOCUMENT_TEMPLATES: readonly TemplateDefinition[] = [
  {
    id: "template_forwarding_letter",
    title: { en: "Office forwarding letter — claim forwarded for approval" },
    handbookRef: "Blueprint v2 §3.4 (printable templates); Milestone 7 (office forwarding letter)",
    fields: [
      {
        id: "to_office",
        kind: "blankLine",
        label: { en: "To (Head Post Office)" },
        claimDataField: "office.headOfficeName",
      },
      { id: "from_line", kind: "staticText", label: { en: "From" }, text: { en: "The Postmaster / Sub Postmaster" } },
      { id: "office_name", kind: "blankLine", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "subject", kind: "staticText", label: { en: "Subject" }, text: { en: "Forwarding of deceased-claim papers for approval" } },
      { id: "depositor_name", kind: "blankLine", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", kind: "blankLine", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      {
        id: "amount_claimed",
        kind: "blankLine",
        label: { en: "Amount claimed" },
        claimDataField: "account.amountClaimed",
      },
      { id: "claimant_name", kind: "blankLine", label: { en: "Name of claimant" }, claimDataField: "claimant.name" },
      {
        id: "body",
        kind: "staticText",
        label: { en: "Note" },
        text: {
          en: "The claim papers listed in the attached checklist are forwarded for approval. The applicable competent authority, monetary limit, and official references are set out in the attached Decision Summary.",
        },
      },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
      { id: "preparer_name", kind: "blankLine", label: { en: "Name of Postmaster" }, claimDataField: "preparer.name" },
      { id: "preparer_designation", kind: "blankLine", label: { en: "Designation" }, claimDataField: "preparer.designation" },
      { id: "signature", kind: "blankLine", label: { en: "Signature of Postmaster" } },
    ],
  },
  {
    id: "template_approval_note",
    title: { en: "Internal office note — approval record" },
    handbookRef: "Blueprint v2 §3.4 (printable templates); Milestone 7 (approval note)",
    fields: [
      { id: "depositor_name", kind: "blankLine", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", kind: "blankLine", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      { id: "claimant_name", kind: "blankLine", label: { en: "Name of claimant" }, claimDataField: "claimant.name" },
      {
        id: "amount_claimed",
        kind: "blankLine",
        label: { en: "Amount claimed" },
        claimDataField: "account.amountClaimed",
      },
      {
        id: "authority_note",
        kind: "staticText",
        label: { en: "Note" },
        text: {
          en: "Record the authority exercised and the amount approved against the competent-authority ladder shown in the attached Decision Summary.",
        },
      },
      // Milestone 13 — deliberately still manual: which rank/office actually
      // exercises authority, and the amount actually approved, are the
      // approving officer's own future acts (they may approve less than
      // was claimed) — auto-filling either from account.amountClaimed
      // would be inventing a decision the officer hasn't made yet.
      { id: "authority_exercised", kind: "blankLine", label: { en: "Authority exercised (rank / office)" } },
      { id: "amount_approved", kind: "blankLine", label: { en: "Amount approved" } },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
      { id: "signature", kind: "blankLine", label: { en: "Signature of approving officer" } },
    ],
  },
  {
    // Milestone 8 — distinct from template_approval_note: this is the
    // general internal noting on the file (why the decision was reached,
    // what was reviewed), not the formal approval-authority/amount record.
    // Milestone 13 — gained the office verification record (nomination
    // register entry, death certificate particulars, claimant identity
    // document) the Postmaster checks against the department's own
    // records before forwarding — the Universal Claim Data Dictionary's
    // "Verification Details" group, previously not rendered anywhere.
    id: "template_office_note",
    title: { en: "Internal office note — case noting" },
    handbookRef: "Blueprint v2 §3.4 (printable templates); Milestone 8 (office note); Milestone 13 (verification record)",
    fields: [
      { id: "office_name", kind: "blankLine", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "depositor_name", kind: "blankLine", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", kind: "blankLine", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      { id: "claimant_name", kind: "blankLine", label: { en: "Name of claimant" }, claimDataField: "claimant.name" },
      {
        id: "verification_heading",
        kind: "staticText",
        label: { en: "Office verification" },
        text: { en: "Checked against the Post Office's own records before forwarding:" },
      },
      {
        id: "nomination_reg_no",
        kind: "blankLine",
        label: { en: "Nomination register entry number" },
        claimDataField: "account.nominationRegistrationNumber",
      },
      {
        id: "nomination_date",
        kind: "blankLine",
        label: { en: "Nomination registered on" },
        claimDataField: "account.nominationDate",
      },
      {
        // Milestone 15 — a genuine gap found during production-quality
        // review: the Wizard has collected date/place of death since M11,
        // but no document ever displayed them until now.
        id: "death_date",
        kind: "blankLine",
        label: { en: "Date of death" },
        claimDataField: "deathCertificate.dateOfDeath",
      },
      {
        id: "death_place",
        kind: "blankLine",
        label: { en: "Place of death" },
        claimDataField: "deathCertificate.placeOfDeath",
      },
      {
        id: "death_cert_number",
        kind: "blankLine",
        label: { en: "Death certificate number" },
        claimDataField: "deathCertificate.certificateNumber",
      },
      {
        id: "death_cert_issued_by",
        kind: "blankLine",
        label: { en: "Death certificate issued by" },
        claimDataField: "deathCertificate.issuedBy",
      },
      {
        id: "claimant_id_type",
        kind: "blankLine",
        label: { en: "Claimant's identity document type" },
        claimDataField: "claimant.idDocumentType",
      },
      {
        id: "claimant_id_number",
        kind: "blankLine",
        label: { en: "Claimant's identity document number" },
        claimDataField: "claimant.idDocumentNumber",
      },
      {
        id: "review_note",
        kind: "staticText",
        label: { en: "Note" },
        text: {
          en: "The claim papers have been reviewed against the attached checklist and Decision Summary. Record any additional remarks below before forwarding for approval.",
        },
      },
      { id: "remarks", kind: "blankLine", label: { en: "Remarks" } },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
      { id: "preparer_name", kind: "blankLine", label: { en: "Prepared by (name)" }, claimDataField: "preparer.name" },
      { id: "preparer_designation", kind: "blankLine", label: { en: "Designation" }, claimDataField: "preparer.designation" },
      { id: "signature", kind: "blankLine", label: { en: "Signature" } },
    ],
  },
  {
    // Milestone 8 — a standalone witness page: previously witness names
    // only ever appeared as two fields embedded inside Form 11 itself.
    // Milestone 13 — address/mobile now auto-fill too (the Claim Data
    // Model gained witness.N.address/mobile in M11; only the signature
    // itself — a future act — stays manual).
    id: "template_witness_sheet",
    title: { en: "Witness sheet" },
    handbookRef: "Blueprint v2 §3.4 (printable templates); Milestone 8 (witness sheet)",
    fields: [
      { id: "depositor_name", kind: "blankLine", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", kind: "blankLine", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      { id: "claimant_name", kind: "blankLine", label: { en: "Name of claimant" }, claimDataField: "claimant.name" },
      { id: "witness_1_name", kind: "blankLine", label: { en: "Witness 1 — name" }, claimDataField: "witness.0.name" },
      { id: "witness_1_address", kind: "blankLine", label: { en: "Witness 1 — address" }, claimDataField: "witness.0.address" },
      { id: "witness_1_mobile", kind: "blankLine", label: { en: "Witness 1 — mobile number" }, claimDataField: "witness.0.mobile" },
      { id: "witness_1_signature", kind: "blankLine", label: { en: "Witness 1 — signature" } },
      { id: "witness_2_name", kind: "blankLine", label: { en: "Witness 2 — name" }, claimDataField: "witness.1.name" },
      { id: "witness_2_address", kind: "blankLine", label: { en: "Witness 2 — address" }, claimDataField: "witness.1.address" },
      { id: "witness_2_mobile", kind: "blankLine", label: { en: "Witness 2 — mobile number" }, claimDataField: "witness.1.mobile" },
      { id: "witness_2_signature", kind: "blankLine", label: { en: "Witness 2 — signature" } },
    ],
  },
];
