import type { DocumentRegistryEntry } from "@claimsahayak/rule-engine";

/**
 * Milestone 12 — the central Document Registry: ONE entry per printable
 * document that can appear in a Claim File. This is the single place that
 * says what belongs, when, and which of the 12 named Claim File sections
 * it files under — the Document Engine (`buildClaimPackageDefinition`,
 * rule-engine) evaluates these entries against Rule Engine output;
 * `ClaimPackage.tsx` renders whatever the resulting definition says, with
 * no per-document if/else of its own. Adding a future document to the
 * Claim File = adding one entry here (plus authoring its pack template/
 * layout if it's a new document).
 *
 * It lives in the web app — the composition root that already supplies
 * `RULE_PACK` and `OFFICIAL_FORM_LAYOUTS` to the Wizard — because it wires
 * pack-specific ids together, which the pack-agnostic engine must not do
 * (M10 established this layering with `officeTemplateIdsForAccount`; this
 * registry replaces that mechanism outright).
 *
 * NO business rule lives here. A `trigger` of `engineSelected` only asks
 * whether the Rule Engine's own resolved checklist referenced that refId —
 * the rule for WHY (which route, which overlay) stays in the Rule Pack.
 *
 * Titles/purposes/signatories are NOT restated here — the engine resolves
 * them from the pack records (`FormDefinition`/`TemplateDefinition`), so
 * no document data exists twice.
 *
 * Milestone 14 — each entry's `section` (not a hand-maintained
 * `printOrder` number) places it in the Complete Claim File's 12 named
 * sections, in the fixed order `SECTION_ORDER` declares: Decision
 * Summary, Rule References, Office Processing Notes, Customer
 * Applications, Official India Post Forms, Declarations, Affidavits,
 * Indemnity Bonds, Reconciliation Certificates, Verification
 * Certificates, Supporting Documents Checklist, Missing Information
 * Report. Entries are grouped by section below purely for readability;
 * the Document Engine sorts by (section order, registry array position),
 * not by declaration order in this file.
 *
 * Section-assignment notes (a document's NATURE decides its section, not
 * its form number): Form 15 and NC-54(a)/(b) are indemnity bonds by their
 * own titles, so they file under Indemnity Bonds, not Official Forms;
 * Form 13 is an affidavit, so it files under Affidavits. The witness
 * sheet files under Verification Certificates — its entire purpose is a
 * witness's confirmation of the claimant's identity to the Post Office.
 * "Customer Applications" has no entry today: no document currently
 * modeled is a claimant-authored application distinct from a
 * reconciliation-certificate request (which has its own section) — an
 * honest absence, not an oversight, exactly like a route that selects no
 * declarations.
 *
 * The M8-era standalone Competent Authority Sheet and Monetary Limit
 * Sheet are GONE (M14) — that data was always a restatement of what
 * `ClaimDecisionSummary` already renders inline. The approved 14-section
 * Claim File structure doesn't list them separately, and "no duplicate
 * data" is one of its own stated principles.
 */
export const CLAIM_DOCUMENT_REGISTRY: readonly DocumentRegistryEntry[] = [
  // ---- Decision Summary ----------------------------------------------------
  {
    id: "reg_decision_summary",
    source: { kind: "sheet", sheet: "decisionSummary" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "decisionSummary",
  },

  // ---- Rule References ------------------------------------------------------
  {
    id: "reg_references_sheet",
    source: { kind: "sheet", sheet: "ruleReferencesSheet" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "ruleReferences",
  },

  // ---- Office Processing Notes (Tier B, always present) ---------------------
  {
    id: "reg_forwarding_letter",
    source: { kind: "template", templateId: "template_forwarding_letter" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "officeProcessingNotes",
  },
  {
    id: "reg_approval_note",
    source: { kind: "template", templateId: "template_approval_note" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "officeProcessingNotes",
  },
  {
    id: "reg_office_note",
    source: { kind: "template", templateId: "template_office_note" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "officeProcessingNotes",
  },

  // ---- Customer Applications -------------------------------------------------
  // (no entry today — see this file's header comment)

  // ---- Official India Post Forms — every form whose nature is neither an
  // affidavit nor an indemnity bond ------------------------------------------
  {
    id: "reg_form_11",
    source: { kind: "officialForm", formId: "form_11" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "engineSelected", refId: "form_11" },
    section: "officialForms",
    supportingDocumentIds: [
      "doc_death_certificate",
      "doc_passbook_or_certificate",
      "doc_claimant_id",
      "doc_witness_id",
    ],
  },
  {
    id: "reg_form_14",
    source: { kind: "officialForm", formId: "form_14" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_14" },
    section: "officialForms",
    supportingDocumentIds: ["doc_absent_nominee_id"],
  },
  {
    id: "reg_form_10_nomination",
    source: { kind: "officialForm", formId: "form_10_nomination" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_10_nomination" },
    section: "officialForms",
  },
  {
    id: "reg_form_aof_kyc",
    source: { kind: "officialForm", formId: "form_aof_kyc" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_aof_kyc" },
    section: "officialForms",
  },
  {
    id: "reg_form_sb7b",
    source: { kind: "officialForm", formId: "form_sb7b" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_sb7b" },
    section: "officialForms",
  },
  {
    id: "reg_form_scss_form4",
    source: { kind: "officialForm", formId: "form_scss_form4" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_scss_form4" },
    section: "officialForms",
  },

  // ---- Declarations (Rule-Book-sourced, conditional) ------------------------
  {
    // M10's minor-alive declaration: included when the Rule Engine itself
    // required the "minor is alive" certificate (T13's own OutputRule) —
    // the registry expression of the exact condition
    // `officeTemplateIdsForAccount` hardcoded before M12.
    id: "reg_minor_alive_declaration",
    source: { kind: "template", templateId: "template_minor_alive_declaration" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "doc_minor_alive_certificate" },
    section: "declarations",
  },

  // ---- Affidavits -------------------------------------------------------------
  {
    id: "reg_form_13",
    source: { kind: "officialForm", formId: "form_13" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_13" },
    section: "affidavits",
  },

  // ---- Indemnity Bonds --------------------------------------------------------
  {
    id: "reg_form_15",
    source: { kind: "officialForm", formId: "form_15" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_15" },
    section: "indemnityBonds",
  },
  {
    id: "reg_form_nc54a",
    source: { kind: "officialForm", formId: "form_nc54a" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_nc54a" },
    section: "indemnityBonds",
  },
  {
    id: "reg_form_nc54b",
    source: { kind: "officialForm", formId: "form_nc54b" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_nc54b" },
    section: "indemnityBonds",
  },

  // ---- Reconciliation Certificates -------------------------------------------
  {
    id: "reg_reconciliation_depositor",
    source: { kind: "template", templateId: "template_reconciliation_depositor" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "template_reconciliation_depositor" },
    section: "reconciliationCertificates",
    supportingDocumentIds: ["doc_reconciliation_certificate"],
  },
  {
    id: "reg_reconciliation_claimant",
    source: { kind: "template", templateId: "template_reconciliation_claimant" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "template_reconciliation_claimant" },
    section: "reconciliationCertificates",
    supportingDocumentIds: ["doc_reconciliation_certificate"],
  },

  // ---- Verification Certificates ---------------------------------------------
  {
    id: "reg_witness_sheet",
    source: { kind: "template", templateId: "template_witness_sheet" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "verificationCertificates",
    supportingDocumentIds: ["doc_witness_id"],
  },

  // ---- Supporting Documents Checklist -----------------------------------------
  {
    id: "reg_office_checklist",
    source: { kind: "sheet", sheet: "officeChecklist" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "supportingDocumentsChecklist",
  },

  // ---- Missing Information Report (file-level, always last) ------------------
  {
    id: "reg_missing_report",
    source: { kind: "sheet", sheet: "missingDocumentReport" },
    scope: "file",
    requirement: "mandatory",
    trigger: { kind: "always" },
    section: "missingInformationReport",
  },
];
