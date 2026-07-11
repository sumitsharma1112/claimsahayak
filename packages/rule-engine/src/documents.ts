import type {
  AccountChecklist,
  DocumentDefinition,
  FormDefinition,
  RulePack,
} from "@claimsahayak/shared-types";

/**
 * Milestone 7 Part 2 — document selection. Document/checklist SELECTION is
 * already fully computed by the engine (`collectOutputItems`/`buildSections`,
 * Milestone 3) purely from authored `OutputRule` data — nothing hardcoded.
 * This module does not re-implement that; it's a thin JOIN on top of an
 * already-resolved `AccountChecklist`, resolving each checklist item's
 * `refId` (Milestone 7 addition to `ChecklistItem`) back to the
 * `FormDefinition`/`DocumentDefinition` record that carries the fields a
 * document renderer needs (signatories, stamp paper, copies, official
 * source URL) — data `ChecklistItem` itself never carried.
 */
export interface DocumentSelectionEntry {
  /** The `ChecklistSection.id` this item was grouped under (documents/forms/people/affidavits/indemnityBonds/declarations). */
  readonly sectionId: string;
  readonly checklistItemId: string;
  readonly form?: FormDefinition;
  readonly document?: DocumentDefinition;
}

/**
 * Every form/document one account's ALREADY-RESOLVED checklist needs,
 * joined to its full `FormDefinition`/`DocumentDefinition` record. Items
 * whose `itemType` is neither `"form"` nor `"document"` (instructions,
 * warnings, people, good-to-know) are not documents to render and are
 * skipped; an item with a `refId` that resolves to nothing (authoring
 * drift) is also skipped — the `validate-pack` referential-integrity gate
 * (`checkRefIdsResolve`) is what should catch that upstream, not this
 * caller-facing join.
 */
export function resolveDocumentSelection(
  rulePack: RulePack,
  account: AccountChecklist,
): readonly DocumentSelectionEntry[] {
  const formsById = new Map(rulePack.forms.map((f) => [f.id, f]));
  const documentsById = new Map(rulePack.documents.map((d) => [d.id, d]));

  const entries: DocumentSelectionEntry[] = [];
  for (const section of account.sections) {
    for (const item of section.items) {
      if (item.refId === undefined) {
        continue;
      }
      if (item.itemType === "form") {
        const form = formsById.get(item.refId);
        if (form) {
          entries.push({ sectionId: section.id, checklistItemId: item.id, form });
        }
      } else if (item.itemType === "document") {
        const document = documentsById.get(item.refId);
        if (document) {
          entries.push({ sectionId: section.id, checklistItemId: item.id, document });
        }
      }
    }
  }
  return entries;
}
