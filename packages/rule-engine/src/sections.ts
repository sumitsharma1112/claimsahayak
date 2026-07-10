import type { ChecklistItem, ChecklistSection, LocalizedText, OutputRule } from "@claimsahayak/shared-types";

/**
 * Section ids used throughout the Rule Pack's `OutputRule.section` field.
 * "good-to-know" and "verification-panel" are lifted straight to the
 * document level (`ChecklistDocument.goodToKnow` / `.verificationPanel`
 * are flat `LocalizedText[]`, not per-account sections — Blueprint v2
 * §3.3's "always-printed block" is document-wide, not per-account). The
 * remaining section ids become real per-account `ChecklistSection`s.
 * These titles are structural chrome (the closed set of section ids is
 * itself part of the checklist contract every route/overlay in the pack
 * already writes against), not a business rule sourced from an SB Order,
 * so — unlike thresholds or scheme names — owning this small label map
 * here does not violate "no business rules outside the Rule Pack".
 */
const LIFTED_SECTION_IDS = new Set(["good-to-know", "verification-panel"]);

const SECTION_TITLES: Readonly<Record<string, LocalizedText>> = {
  documents: { en: "Documents" },
  forms: { en: "Forms" },
  people: { en: "People" },
};

function titleFor(sectionId: string): LocalizedText {
  return SECTION_TITLES[sectionId] ?? { en: sectionId };
}

function toChecklistItem(output: OutputRule): ChecklistItem {
  const base: ChecklistItem = {
    id: output.id,
    itemType: output.itemType,
    label: output.label,
    attrs: output.attrs,
    handbookRef: output.handbookRef,
  };
  return output.nvRef === undefined ? base : { ...base, nvRef: output.nvRef };
}

export interface BuiltSections {
  readonly sections: readonly ChecklistSection[];
  readonly liftedGoodToKnow: readonly { readonly id: string; readonly label: LocalizedText }[];
  readonly liftedVerificationPanel: readonly { readonly id: string; readonly label: LocalizedText }[];
}

/**
 * Dedupes by `refId` (Milestone 3 §11 — first occurrence, by `sortOrder`,
 * wins; items without a `refId` are never deduped against one another),
 * sorts by declared `sortOrder` (§12 — never alphabetical), then groups
 * into sections in the order each section id is first encountered in that
 * sorted sequence — i.e. the "declared order", derived from the pack's
 * own `sortOrder` values rather than any hardcoded section ordering.
 * "good-to-know" and "verification-panel" items are pulled out for the
 * caller to lift to the document level instead of becoming a section.
 */
export function buildSections(items: readonly OutputRule[]): BuiltSections {
  const sorted = items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => a.item.sortOrder - b.item.sortOrder || a.originalIndex - b.originalIndex);

  const seenRefIds = new Set<string>();
  const deduped: OutputRule[] = [];
  for (const { item } of sorted) {
    if (item.refId !== undefined) {
      if (seenRefIds.has(item.refId)) {
        continue;
      }
      seenRefIds.add(item.refId);
    }
    deduped.push(item);
  }

  const sectionOrder: string[] = [];
  const sectionItems = new Map<string, ChecklistItem[]>();
  const liftedGoodToKnow: { id: string; label: LocalizedText }[] = [];
  const liftedVerificationPanel: { id: string; label: LocalizedText }[] = [];

  for (const item of deduped) {
    if (LIFTED_SECTION_IDS.has(item.section)) {
      const target = item.section === "good-to-know" ? liftedGoodToKnow : liftedVerificationPanel;
      target.push({ id: item.id, label: item.label });
      continue;
    }
    if (!sectionItems.has(item.section)) {
      sectionItems.set(item.section, []);
      sectionOrder.push(item.section);
    }
    sectionItems.get(item.section)?.push(toChecklistItem(item));
  }

  const sections: ChecklistSection[] = sectionOrder.map((id) => ({
    id,
    title: titleFor(id),
    items: sectionItems.get(id) ?? [],
  }));

  return { sections, liftedGoodToKnow, liftedVerificationPanel };
}
