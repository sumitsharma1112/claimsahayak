import { describe, expect, it } from "vitest";
import type { OutputRule } from "@claimsahayak/shared-types";
import { buildSections } from "../src/index.js";

const ATTRS = {
  why: { en: "why" },
  originalOrCopy: { en: "orig" },
  selfAttest: { en: "self" },
  verifiedBy: { en: "verifier" },
};

function item(partial: Partial<OutputRule> & Pick<OutputRule, "id" | "routeId" | "section" | "sortOrder">): OutputRule {
  return {
    itemType: "document",
    label: { en: partial.id },
    attrs: ATTRS,
    handbookRef: "n/a",
    ...partial,
  };
}

describe("buildSections", () => {
  it("groups by section in declared (sortOrder-derived) order, never alphabetically", () => {
    // "zzz-section" would sort AFTER "aaa-section" alphabetically, but it
    // appears first by sortOrder, so it must come first in the output.
    const items: OutputRule[] = [
      item({ id: "a1", routeId: "R", section: "zzz-section", sortOrder: 1 }),
      item({ id: "a2", routeId: "R", section: "aaa-section", sortOrder: 2 }),
      item({ id: "a3", routeId: "R", section: "zzz-section", sortOrder: 3 }),
    ];
    const { sections } = buildSections(items);
    expect(sections.map((s) => s.id)).toEqual(["zzz-section", "aaa-section"]);
    expect(sections[0]?.items.map((i) => i.id)).toEqual(["a1", "a3"]);
  });

  it("sorts items within a section by sortOrder, stable on ties", () => {
    const items: OutputRule[] = [
      item({ id: "third", routeId: "R", section: "documents", sortOrder: 3 }),
      item({ id: "first", routeId: "R", section: "documents", sortOrder: 1 }),
      item({ id: "second-a", routeId: "R", section: "documents", sortOrder: 2 }),
      item({ id: "second-b", routeId: "R", section: "documents", sortOrder: 2 }),
    ];
    const { sections } = buildSections(items);
    expect(sections[0]?.items.map((i) => i.id)).toEqual(["first", "second-a", "second-b", "third"]);
  });

  it("dedupes by refId, keeping the first occurrence by sortOrder", () => {
    const items: OutputRule[] = [
      item({ id: "dup2", routeId: "R", section: "documents", sortOrder: 2, refId: "doc_x" }),
      item({ id: "dup1", routeId: "R", section: "documents", sortOrder: 1, refId: "doc_x" }),
      item({ id: "unique", routeId: "R", section: "documents", sortOrder: 3, refId: "doc_y" }),
    ];
    const { sections } = buildSections(items);
    expect(sections[0]?.items.map((i) => i.id)).toEqual(["dup1", "unique"]);
  });

  it("never dedupes items that have no refId at all", () => {
    const items: OutputRule[] = [
      item({ id: "note1", routeId: "R", section: "documents", sortOrder: 1 }),
      item({ id: "note2", routeId: "R", section: "documents", sortOrder: 2 }),
    ];
    const { sections } = buildSections(items);
    expect(sections[0]?.items.map((i) => i.id)).toEqual(["note1", "note2"]);
  });

  it("lifts good-to-know and verification-panel items out of per-account sections", () => {
    const items: OutputRule[] = [
      item({ id: "gtk1", routeId: "GLOBAL", section: "good-to-know", sortOrder: 1, itemType: "goodToKnow" }),
      item({ id: "vp1", routeId: "GLOBAL", section: "verification-panel", sortOrder: 2, itemType: "instruction" }),
      item({ id: "doc1", routeId: "ROUTE_A", section: "documents", sortOrder: 3 }),
    ];
    const { sections, liftedGoodToKnow, liftedVerificationPanel } = buildSections(items);
    expect(sections.map((s) => s.id)).toEqual(["documents"]);
    expect(liftedGoodToKnow.map((g) => g.id)).toEqual(["gtk1"]);
    expect(liftedVerificationPanel.map((v) => v.id)).toEqual(["vp1"]);
  });
});
