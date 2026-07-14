import type {
  AccountChecklist,
  ClaimDataModel,
  FormDefinition,
  LocalizedText,
  OfficialFormLayout,
  RulePack,
  TemplateDefinition,
} from "@claimsahayak/shared-types";
import { resolveFieldValue } from "./autofill.js";

/**
 * Milestone 12 — the Document Engine. Milestone 14 — the Complete Claim
 * File Generator: documents are no longer just an ordered flat list, they
 * belong to one of 12 named, fixed-order SECTIONS (`ClaimFileSection`)
 * matching how an experienced Senior Postmaster actually assembles a
 * physical claim file — Decision Summary, Rule References, Office
 * Processing Notes, Customer Applications, Official India Post Forms,
 * Declarations, Affidavits, Indemnity Bonds, Reconciliation Certificates,
 * Verification Certificates, Supporting Documents Checklist, Missing
 * Information Report, in that order. Cover page and table of contents are
 * file-level chrome, outside this section list — the web layer renders
 * them once, not per section.
 *
 * Decides WHICH printable documents belong in a Claim File and in what
 * order, producing a `ClaimPackageDefinition`. It contains NO business
 * rules. It consumes exactly two inputs:
 *   1. Rule Engine output — the already-resolved `AccountChecklist`s
 *      (whose checklist items carry the `refId`s of every form/document/
 *      template the authored `OutputRule`s/overlays selected), and
 *   2. the Universal Claim Data Model (only to report current fill state).
 * plus one piece of pure DATA: a `DocumentRegistryEntry[]` registry, passed
 * in by the caller. This module stays pack-agnostic like the rest of the
 * engine — the registry (which names pack-specific form/template ids)
 * lives with the composition root that also supplies the `RulePack` and
 * `OfficialFormLayout`s, not here.
 *
 * "No hardcoded if/else document logic": whether a document belongs is
 * decided by its registry entry's `trigger`, a closed two-member union —
 * `always` (every payable account's file) or `engineSelected` (the Rule
 * Engine's own resolved checklist references the given refId). Adding a
 * future document to the Claim File means adding ONE registry entry (with
 * its section); no engine or component code changes.
 *
 * Ordering is now derived entirely from data: a document's position is
 * `(SECTION_ORDER.indexOf(section), original registry array index)` — no
 * hand-maintained numeric `printOrder` to keep in sync (M12's design) and
 * no possibility of two documents silently claiming the same order.
 *
 * "No duplicate data" (M14's own principle): the M8-era standalone
 * Competent Authority Sheet and Monetary Limit Sheet are GONE — that
 * information was always a restatement of what `ClaimDecisionSummary`
 * already renders inline (competent authority, monetary limit, court-
 * order-required, references, processing notes, next action, all in one
 * place). Only the Rule References sheet remains standalone, because the
 * approved 14-section Claim File structure calls for it explicitly as its
 * own numbered section.
 *
 * This module determines WHAT belongs and in what order. It does not
 * render, populate, or template anything — presentation stays in the
 * existing M7/M8 renderers.
 */

/**
 * The 12 named sections of a Complete Claim File, in filing order. Cover
 * page and table of contents are rendered once by the web layer and are
 * not part of this list — every other document belongs to exactly one of
 * these.
 */
export const SECTION_ORDER = [
  "decisionSummary",
  "ruleReferences",
  "officeProcessingNotes",
  "customerApplications",
  "officialForms",
  "declarations",
  "affidavits",
  "indemnityBonds",
  "reconciliationCertificates",
  "verificationCertificates",
  "supportingDocumentsChecklist",
  "missingInformationReport",
] as const;

export type ClaimFileSection = (typeof SECTION_ORDER)[number];

/** Engine-rendered pages (decision/rule-references sheets, checklist, missing report) — chrome the web layer titles and renders itself. */
export type PackageSheetKind =
  | "decisionSummary"
  | "ruleReferencesSheet"
  | "officeChecklist"
  | "missingDocumentReport";

export type DocumentSource =
  | { readonly kind: "sheet"; readonly sheet: PackageSheetKind }
  | { readonly kind: "officialForm"; readonly formId: string }
  | { readonly kind: "template"; readonly templateId: string };

/**
 * The closed trigger union. Deliberately NOT a predicate function — a
 * trigger is data, so the registry stays serialisable, auditable, and
 * incapable of smuggling in business logic. `engineSelected` asks one
 * question only: did the Rule Engine's resolved checklist for this account
 * reference this refId? The business rule for WHY it did lives where it
 * always has — in the Rule Pack's OutputRules/overlays.
 */
export type DocumentTrigger =
  | { readonly kind: "always" }
  | { readonly kind: "engineSelected"; readonly refId: string };

export type DocumentRequirement = "mandatory" | "conditional" | "optional";

export interface DocumentRegistryEntry {
  /** Unique registry id (never rendered as visible text). */
  readonly id: string;
  readonly source: DocumentSource;
  /** `account` — appears once per payable account; `file` — appears once per Claim File. */
  readonly scope: "account" | "file";
  readonly requirement: DocumentRequirement;
  readonly trigger: DocumentTrigger;
  /** Which of the 12 named Claim File sections this document files under — see `SECTION_ORDER`. */
  readonly section: ClaimFileSection;
  /** Ids of claimant-brought `DocumentDefinition`s that accompany this document. */
  readonly supportingDocumentIds?: readonly string[];
  /** Only for entries whose rule reference can't be resolved from the pack record itself. */
  readonly ruleReference?: string;
}

export type AutoFillCapability = "full" | "partial" | "manual" | "not_applicable";

export interface PackageDocumentAutoFill {
  readonly capability: AutoFillCapability;
  readonly autoFillableFields: number;
  readonly manualFields: number;
  /** How many auto-fillable fields currently resolve from the Claim Data Model. */
  readonly filledFields: number;
}

/** One resolved document of the Complete Claim Package definition. */
export interface PackageDocument {
  readonly registryId: string;
  readonly source: DocumentSource;
  readonly requirement: DocumentRequirement;
  readonly section: ClaimFileSection;
  /** Resolved from the pack record (form name / template title); absent for sheets (web chrome titles those). */
  readonly title?: LocalizedText;
  /** Resolved from `FormDefinition.purpose`; absent elsewhere. */
  readonly purpose?: LocalizedText;
  /** Resolved from `FormDefinition.signatories`; absent elsewhere. */
  readonly signatories?: LocalizedText;
  /** Registry override, else `TemplateDefinition.handbookRef`, else the form's sourceRefs/officialSourceUrl. */
  readonly ruleReference?: string;
  /** Labels of this document's own signature/execution fields (computed from its layout/template fields, never authored twice). */
  readonly signatureFieldLabels: readonly LocalizedText[];
  /** Labels of this document's own witness fields (same derivation). */
  readonly witnessFieldLabels: readonly LocalizedText[];
  readonly supportingDocumentIds: readonly string[];
  readonly autoFill: PackageDocumentAutoFill;
}

export interface AccountPackageDefinition {
  readonly accountIndex: number;
  /** Sorted by section (per `SECTION_ORDER`), then by original registry order within a section. */
  readonly documents: readonly PackageDocument[];
}

/** The Complete Claim Package definition — WHAT belongs in the file, in order. */
export interface ClaimPackageDefinition {
  /** File-level documents (the Missing Information Report today), sorted the same way as account documents. */
  readonly fileDocuments: readonly PackageDocument[];
  /** One entry per payable account, in the order given. */
  readonly accounts: readonly AccountPackageDefinition[];
}

const NOT_APPLICABLE_AUTOFILL: PackageDocumentAutoFill = {
  capability: "not_applicable",
  autoFillableFields: 0,
  manualFields: 0,
  filledFields: 0,
};

function refIdsOf(account: AccountChecklist): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const section of account.sections) {
    for (const item of section.items) {
      if (item.refId !== undefined) {
        ids.add(item.refId);
      }
    }
  }
  return ids;
}

function isTriggered(entry: DocumentRegistryEntry, selectedRefIds: ReadonlySet<string>): boolean {
  switch (entry.trigger.kind) {
    case "always":
      return true;
    case "engineSelected":
      return selectedRefIds.has(entry.trigger.refId);
  }
}

interface FillableField {
  readonly id: string;
  readonly label: LocalizedText;
  readonly autoFillable: boolean;
  readonly filled: boolean;
}

function formFields(
  layout: OfficialFormLayout | undefined,
  claimData: ClaimDataModel,
  accountIndex: number,
): readonly FillableField[] {
  if (!layout) {
    return [];
  }
  return layout.fields.map((f) => ({
    id: f.id,
    label: f.label,
    autoFillable: f.claimDataField !== undefined && f.manual !== true,
    filled:
      f.claimDataField !== undefined &&
      f.manual !== true &&
      resolveFieldValue(claimData, accountIndex, f.claimDataField) !== undefined,
  }));
}

function templateFields(
  template: TemplateDefinition,
  claimData: ClaimDataModel,
  accountIndex: number,
): readonly FillableField[] {
  // Only blank lines are fillable; static text and checkbox rows are fixed content.
  return template.fields
    .filter((f) => f.kind === "blankLine")
    .map((f) => ({
      id: f.id,
      label: f.label,
      autoFillable: f.claimDataField !== undefined,
      filled:
        f.claimDataField !== undefined &&
        resolveFieldValue(claimData, accountIndex, f.claimDataField) !== undefined,
    }));
}

function autoFillOf(fields: readonly FillableField[]): PackageDocumentAutoFill {
  const autoFillableFields = fields.filter((f) => f.autoFillable).length;
  const manualFields = fields.length - autoFillableFields;
  const filledFields = fields.filter((f) => f.filled).length;
  const capability: AutoFillCapability =
    fields.length === 0
      ? "not_applicable"
      : autoFillableFields === 0
        ? "manual"
        : manualFields === 0
          ? "full"
          : "partial";
  return { capability, autoFillableFields, manualFields, filledFields };
}

/** A field is a signature/execution field when its own id says so — derived from the document's single source of truth, never authored a second time. */
function signatureLabels(fields: readonly FillableField[]): readonly LocalizedText[] {
  return fields.filter((f) => /signature|notary/i.test(f.id)).map((f) => f.label);
}

function witnessLabels(fields: readonly FillableField[]): readonly LocalizedText[] {
  return fields.filter((f) => /witness/i.test(f.id)).map((f) => f.label);
}

function formRuleReference(form: FormDefinition): string | undefined {
  if (form.sourceRefs !== undefined && form.sourceRefs.length > 0) {
    return form.sourceRefs.join("; ");
  }
  return form.officialSourceUrl;
}

function buildDocument(
  entry: DocumentRegistryEntry,
  rulePack: RulePack,
  layoutsById: ReadonlyMap<string, OfficialFormLayout>,
  claimData: ClaimDataModel,
  accountIndex: number,
): PackageDocument {
  const base = {
    registryId: entry.id,
    source: entry.source,
    requirement: entry.requirement,
    section: entry.section,
    supportingDocumentIds: entry.supportingDocumentIds ?? [],
  };

  switch (entry.source.kind) {
    case "sheet":
      return {
        ...base,
        ...(entry.ruleReference !== undefined ? { ruleReference: entry.ruleReference } : {}),
        signatureFieldLabels: [],
        witnessFieldLabels: [],
        autoFill: NOT_APPLICABLE_AUTOFILL,
      };
    case "officialForm": {
      const formId = entry.source.formId;
      const form = rulePack.forms.find((f) => f.id === formId);
      const fields = formFields(layoutsById.get(formId), claimData, accountIndex);
      const ruleReference = entry.ruleReference ?? (form ? formRuleReference(form) : undefined);
      return {
        ...base,
        ...(form ? { title: form.name, purpose: form.purpose, signatories: form.signatories } : {}),
        ...(ruleReference !== undefined ? { ruleReference } : {}),
        signatureFieldLabels: signatureLabels(fields),
        witnessFieldLabels: witnessLabels(fields),
        autoFill: autoFillOf(fields),
      };
    }
    case "template": {
      const templateId = entry.source.templateId;
      const template = rulePack.templates.find((t) => t.id === templateId);
      const fields = template ? templateFields(template, claimData, accountIndex) : [];
      const ruleReference = entry.ruleReference ?? template?.handbookRef;
      return {
        ...base,
        ...(template ? { title: template.title } : {}),
        ...(ruleReference !== undefined ? { ruleReference } : {}),
        signatureFieldLabels: signatureLabels(fields),
        witnessFieldLabels: witnessLabels(fields),
        autoFill: autoFillOf(fields),
      };
    }
  }
}

/**
 * The Document Engine's single entry point: Rule Engine output + Claim
 * Data Model + registry data → the Complete Claim Package definition.
 * Pure and deterministic; call it with the payable accounts only (the
 * same filter `packageAccounts` has applied since M7 — a stop/wait/
 * survivor outcome has no Claim File).
 */
export function buildClaimPackageDefinition(
  rulePack: RulePack,
  accounts: readonly AccountChecklist[],
  claimData: ClaimDataModel,
  officialFormLayouts: readonly OfficialFormLayout[],
  registry: readonly DocumentRegistryEntry[],
): ClaimPackageDefinition {
  const layoutsById = new Map(officialFormLayouts.map((l) => [l.formId, l]));
  // Ordering is derived, never hand-maintained: primarily by each
  // document's section position in SECTION_ORDER, then by the entry's own
  // position in the registry array — a stable tiebreak with no numeric
  // field to keep in sync as the registry grows.
  const registryIndexById = new Map(registry.map((e, i) => [e.id, i]));
  const byOrder = (a: PackageDocument, b: PackageDocument): number => {
    const sectionDelta = SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section);
    if (sectionDelta !== 0) {
      return sectionDelta;
    }
    return (registryIndexById.get(a.registryId) ?? 0) - (registryIndexById.get(b.registryId) ?? 0);
  };

  // File-level triggers see the union of every account's selection, so a
  // file-scoped conditional document appears if ANY account needs it.
  const unionRefIds = new Set<string>();
  for (const account of accounts) {
    for (const id of refIdsOf(account)) {
      unionRefIds.add(id);
    }
  }

  const fileDocuments = registry
    .filter((e) => e.scope === "file" && isTriggered(e, unionRefIds))
    // File-level documents have no single account; -1 resolves no account-scoped field.
    .map((e) => buildDocument(e, rulePack, layoutsById, claimData, -1))
    .sort(byOrder);

  const accountDefinitions = accounts.map((account) => {
    const selected = refIdsOf(account);
    const documents = registry
      .filter((e) => e.scope === "account" && isTriggered(e, selected))
      .map((e) => buildDocument(e, rulePack, layoutsById, claimData, account.accountIndex))
      .sort(byOrder);
    return { accountIndex: account.accountIndex, documents };
  });

  return { fileDocuments, accounts: accountDefinitions };
}
