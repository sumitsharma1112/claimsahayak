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
      { id: "from_line", kind: "staticText", label: { en: "From" }, text: { en: "The Postmaster / Sub Postmaster" } },
      { id: "office_name", kind: "blankLine", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "subject", kind: "staticText", label: { en: "Subject" }, text: { en: "Forwarding of deceased-claim papers for approval" } },
      { id: "depositor_name", kind: "blankLine", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", kind: "blankLine", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
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
        id: "authority_note",
        kind: "staticText",
        label: { en: "Note" },
        text: {
          en: "Record the authority exercised and the amount approved against the competent-authority ladder shown in the attached Decision Summary.",
        },
      },
      { id: "authority_exercised", kind: "blankLine", label: { en: "Authority exercised (rank / office)" } },
      { id: "amount_approved", kind: "blankLine", label: { en: "Amount approved" } },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
      { id: "signature", kind: "blankLine", label: { en: "Signature of approving officer" } },
    ],
  },
];
