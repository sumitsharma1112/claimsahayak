import type {
  AccountChecklist,
  ClaimDataModel,
  OfficialFormLayout,
  RulePack,
  TemplateDefinition,
} from "@claimsahayak/shared-types";
import { resolveDocumentSelection } from "./documents.js";
import { resolveFieldValue } from "./autofill.js";

/**
 * Milestone 7 Part 7 — validates a live claim's generated documents, not
 * authored pack data (a different concern from `@claimsahayak/rule-pack`'s
 * `validate/*`, which checks the Rule Pack itself is internally
 * consistent). Follows the same shape as that pipeline's own validators
 * (one pure function, a flat `readonly issue[]` return, severity-tagged)
 * without importing from `rule-pack` — the engine stays pack-agnostic.
 *
 * Non-fatal by design: a claim package with gaps can still legitimately be
 * printed (a real Postmaster fills the rest by hand at the counter), so
 * every issue here is a "missing information" prompt, not a hard block.
 */
export interface ClaimValidationIssue {
  readonly accountIndex: number;
  readonly documentId: string;
  readonly documentLabel: string;
  readonly fieldId: string;
  readonly fieldLabel: string;
  readonly message: string;
}

export function validateClaimPackage(
  rulePack: RulePack,
  accounts: readonly AccountChecklist[],
  claimData: ClaimDataModel,
  officialFormLayouts: readonly OfficialFormLayout[],
  officeDocumentTemplates: readonly TemplateDefinition[],
): readonly ClaimValidationIssue[] {
  const issues: ClaimValidationIssue[] = [];
  const layoutsById = new Map(officialFormLayouts.map((l) => [l.formId, l]));

  for (const account of accounts) {
    const selection = resolveDocumentSelection(rulePack, account);
    for (const entry of selection) {
      if (!entry.form) {
        continue;
      }
      const layout = layoutsById.get(entry.form.id);
      if (!layout) {
        continue;
      }
      for (const field of layout.fields) {
        if (field.manual || !field.claimDataField) {
          continue;
        }
        const value = resolveFieldValue(claimData, account.accountIndex, field.claimDataField);
        if (value === undefined) {
          issues.push({
            accountIndex: account.accountIndex,
            documentId: entry.form.id,
            documentLabel: entry.form.name.en,
            fieldId: field.id,
            fieldLabel: field.label.en,
            message: `"${field.label.en}" on ${entry.form.name.en} is not filled in yet.`,
          });
        }
      }
    }

    for (const template of officeDocumentTemplates) {
      for (const field of template.fields) {
        if (!field.claimDataField) {
          continue;
        }
        const value = resolveFieldValue(claimData, account.accountIndex, field.claimDataField);
        if (value === undefined) {
          issues.push({
            accountIndex: account.accountIndex,
            documentId: template.id,
            documentLabel: template.title.en,
            fieldId: field.id,
            fieldLabel: field.label.en,
            message: `"${field.label.en}" on ${template.title.en} is not filled in yet.`,
          });
        }
      }
    }
  }

  return issues;
}
