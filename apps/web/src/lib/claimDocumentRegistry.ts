import type { DocumentRegistryEntry } from "@claimsahayak/rule-engine";

/**
 * Milestone 12 — the central Document Registry: ONE entry per printable
 * document that can appear in a Claim File. This is the single place that
 * says what belongs, when, and in what physical filing order — the
 * Document Engine (`buildClaimPackageDefinition`, rule-engine) evaluates
 * these entries against Rule Engine output; `ClaimPackage.tsx` renders
 * whatever the resulting definition says, with no per-document if/else of
 * its own. Adding a future document to the Claim File = adding one entry
 * here (plus authoring its pack template/layout if it's a new document).
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
 * Print order mirrors the physical file a Postmaster assembles (approved
 * Document Catalogue order): cover → index → decision/authority/limit/
 * references → official forms → claimant applications (reconciliation
 * requests) → office documents → declarations → office checklist →
 * missing-document report.
 */
export const CLAIM_DOCUMENT_REGISTRY: readonly DocumentRegistryEntry[] = [
  // ---- File chrome -------------------------------------------------------
  {
    id: "reg_cover_page",
    source: { kind: "sheet", sheet: "coverPage" },
    scope: "file",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 0,
  },
  {
    id: "reg_file_index",
    source: { kind: "sheet", sheet: "fileIndex" },
    scope: "file",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 1,
  },

  // ---- Engine-rendered decision sheets (per account) -----------------------
  {
    id: "reg_decision_summary",
    source: { kind: "sheet", sheet: "decisionSummary" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 10,
  },
  {
    id: "reg_authority_sheet",
    source: { kind: "sheet", sheet: "competentAuthoritySheet" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 20,
  },
  {
    id: "reg_limit_sheet",
    source: { kind: "sheet", sheet: "monetaryLimitSheet" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 30,
  },
  {
    id: "reg_references_sheet",
    source: { kind: "sheet", sheet: "ruleReferencesSheet" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 40,
  },

  // ---- Official forms (Tier A) — each appears when the Rule Engine's own
  // resolved checklist selected it, never by a re-implemented condition ----
  {
    id: "reg_form_11",
    source: { kind: "officialForm", formId: "form_11" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "engineSelected", refId: "form_11" },
    printOrder: 100,
    supportingDocumentIds: [
      "doc_death_certificate",
      "doc_passbook_or_certificate",
      "doc_claimant_id",
      "doc_witness_id",
    ],
  },
  {
    id: "reg_form_13",
    source: { kind: "officialForm", formId: "form_13" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_13" },
    printOrder: 110,
  },
  {
    id: "reg_form_14",
    source: { kind: "officialForm", formId: "form_14" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_14" },
    printOrder: 120,
    supportingDocumentIds: ["doc_absent_nominee_id"],
  },
  {
    id: "reg_form_15",
    source: { kind: "officialForm", formId: "form_15" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_15" },
    printOrder: 130,
  },
  {
    id: "reg_form_10_nomination",
    source: { kind: "officialForm", formId: "form_10_nomination" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_10_nomination" },
    printOrder: 140,
  },
  {
    id: "reg_form_aof_kyc",
    source: { kind: "officialForm", formId: "form_aof_kyc" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_aof_kyc" },
    printOrder: 150,
  },
  {
    id: "reg_form_sb7b",
    source: { kind: "officialForm", formId: "form_sb7b" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_sb7b" },
    printOrder: 160,
  },
  {
    id: "reg_form_scss_form4",
    source: { kind: "officialForm", formId: "form_scss_form4" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_scss_form4" },
    printOrder: 170,
  },
  {
    id: "reg_form_nc54a",
    source: { kind: "officialForm", formId: "form_nc54a" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_nc54a" },
    printOrder: 180,
  },
  {
    id: "reg_form_nc54b",
    source: { kind: "officialForm", formId: "form_nc54b" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "form_nc54b" },
    printOrder: 190,
  },

  // ---- Claimant applications (Tier B, pack-authored) ----------------------
  {
    id: "reg_reconciliation_depositor",
    source: { kind: "template", templateId: "template_reconciliation_depositor" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "template_reconciliation_depositor" },
    printOrder: 200,
    supportingDocumentIds: ["doc_reconciliation_certificate"],
  },
  {
    id: "reg_reconciliation_claimant",
    source: { kind: "template", templateId: "template_reconciliation_claimant" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "template_reconciliation_claimant" },
    printOrder: 210,
    supportingDocumentIds: ["doc_reconciliation_certificate"],
  },

  // ---- Office documents (Tier B) — every payable Claim File --------------
  {
    id: "reg_forwarding_letter",
    source: { kind: "template", templateId: "template_forwarding_letter" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 300,
  },
  {
    id: "reg_approval_note",
    source: { kind: "template", templateId: "template_approval_note" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 310,
  },
  {
    id: "reg_office_note",
    source: { kind: "template", templateId: "template_office_note" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 320,
  },
  {
    id: "reg_witness_sheet",
    source: { kind: "template", templateId: "template_witness_sheet" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 330,
    supportingDocumentIds: ["doc_witness_id"],
  },

  // ---- Declarations (Rule-Book-sourced, conditional) ----------------------
  {
    // M10's minor-alive declaration: included when the Rule Engine itself
    // required the "minor is alive" certificate (T13's own OutputRule) —
    // the registry expression of the exact condition
    // `officeTemplateIdsForAccount` hardcoded before this milestone.
    id: "reg_minor_alive_declaration",
    source: { kind: "template", templateId: "template_minor_alive_declaration" },
    scope: "account",
    requirement: "conditional",
    trigger: { kind: "engineSelected", refId: "doc_minor_alive_certificate" },
    printOrder: 340,
  },

  // ---- Closing sheets ------------------------------------------------------
  {
    id: "reg_office_checklist",
    source: { kind: "sheet", sheet: "officeChecklist" },
    scope: "account",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 400,
  },
  {
    id: "reg_missing_report",
    source: { kind: "sheet", sheet: "missingDocumentReport" },
    scope: "file",
    requirement: "mandatory",
    trigger: { kind: "always" },
    printOrder: 9999,
  },
];
