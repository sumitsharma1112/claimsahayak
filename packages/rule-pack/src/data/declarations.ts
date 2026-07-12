import type { TemplateDefinition } from "@claimsahayak/shared-types";

/**
 * Milestone 10 — Rule-Book-sourced declarations, kept structurally
 * separate from `office-documents.ts` (ClaimSahayak-composed office
 * administrivia with no Rule Book anchor) because these carry real
 * official citations, not just the Blueprint's own printable-template
 * convention.
 *
 * M10 was explicitly gated on research before any declaration wording was
 * authored (approved by the user before M8 was scoped): "no Rule-Book-
 * sourced Guardian/Minor Nominee Declaration format exists" was the
 * working assumption going in. A dedicated research pass through
 * `knowledge-base/official-rule-book/topic-05-minor-nominee.md` (the
 * locked, verified Topic 5 record) found that assumption only PARTLY
 * correct:
 *
 * - **Minor "alive and required" declaration — a real format EXISTS**
 *   (CS-MIN-007, confidence: High, Verification Status: VERIFIED):
 *   R60(7)(c) requires "a certificate that the minor is alive and that
 *   the money is required on behalf of the minor"; the cognate GSPR
 *   12(2)/20(2) provisions quote the actual wording pattern: "…is
 *   required for the use and welfare of [name], who is a minor, and is
 *   alive on this day." R60(7)(c) itself is paraphrased, not quoted
 *   verbatim, in the knowledge-base — this template's text is composed
 *   from the closest sourced official wording, cited accordingly, not
 *   presented as a verbatim government form the way Form 11/13/14/15 are.
 * - **Guardian Declaration — confirmed NOT to exist, with a reason**
 *   (CS-MIN-006): a natural guardian (parent) needs no certificate at
 *   all; a non-natural guardian needs an external court order / court-
 *   issued guardianship certificate — not something ClaimSahayak could
 *   ever template. `doc_guardianship_certificate` (documents.ts) already
 *   correctly models this as "bring this," and stays that way.
 * - **Name/Identity Difference Declaration — confirmed NOT to exist**
 *   (`knowledge-base/forms/forms-catalog.md` §D): the process is applying
 *   TO the department for a Reconciliation Certificate (issued by the
 *   Divisional Head/GPO/Gazetted HO), not a claimant-authored declaration
 *   — already correctly modeled by `template_reconciliation_depositor`/
 *   `template_reconciliation_claimant` (M4.3).
 *
 * Selection: unlike `office-documents.ts`'s templates (unconditionally
 * attached to every payable Claim File), this declaration is only
 * relevant when the claim actually involves a minor nominee. Rather than
 * extend `resolveDocumentSelection`'s type-matching for one template,
 * `ClaimPackage.tsx` includes it conditionally by checking whether the
 * account's own (already Rule-Engine-selected) checklist requires
 * `doc_minor_alive_certificate` — reusing data the engine already
 * computes correctly (T13's own OutputRule), not a new hardcoded route
 * check.
 */
export const DECLARATION_TEMPLATES: readonly TemplateDefinition[] = [
  {
    id: "template_minor_alive_declaration",
    title: { en: "Declaration — the minor is alive and the money is required for the minor" },
    handbookRef: "R60(7)(c); GSPR 2018, Rule 12(2), Rule 20(2) (cognate declaration wording); CS-MIN-007",
    fields: [
      { id: "office_name", kind: "blankLine", label: { en: "Name of Post Office" }, claimDataField: "office.name" },
      { id: "depositor_name", kind: "blankLine", label: { en: "Name of the deceased depositor" }, claimDataField: "depositor.name" },
      { id: "account_number", kind: "blankLine", label: { en: "Account / certificate number" }, claimDataField: "account.number" },
      {
        id: "recipient_name",
        kind: "blankLine",
        label: { en: "Name of the guardian / appointee receiving on the minor's behalf" },
        claimDataField: "guardian.name",
      },
      { id: "minor_name", kind: "blankLine", label: { en: "Name of the minor nominee" } },
      {
        id: "declaration_text",
        kind: "staticText",
        label: { en: "Declaration" },
        text: {
          en: "I declare that the above-named minor is alive on this day, and that the money now being withdrawn is required for the use and welfare of the minor.",
        },
      },
      { id: "date_place", kind: "blankLine", label: { en: "Date and place" } },
      { id: "signature", kind: "blankLine", label: { en: "Signature of guardian / appointee" } },
    ],
  },
];
