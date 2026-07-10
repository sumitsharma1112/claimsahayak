import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { resolveOverlays } from "../src/index.js";

describe("overlay engine — flags beyond the truth-table fixtures", () => {
  it("name_mismatch_depositor overlay adds its items and one extra deep link", () => {
    const result = resolveOverlays(RULE_PACK, { "q10_docs_check.name_mismatch_depositor": true }, undefined);
    expect(result.matchedFlagIds).toEqual(["name_mismatch_depositor"]);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((i) => i.routeId === "OVERLAY_name_mismatch_depositor")).toBe(true);
    expect(result.extras).toHaveLength(1);
    expect(result.extras[0]?.fixSlug).toBe("reconciliation-depositor");
  });

  it("name_mismatch_own overlay is distinct from name_mismatch_depositor", () => {
    const result = resolveOverlays(RULE_PACK, { "q10_docs_check.name_mismatch_own": true }, undefined);
    expect(result.matchedFlagIds).toEqual(["name_mismatch_own"]);
    expect(result.items.every((i) => i.routeId === "OVERLAY_name_mismatch_own")).toBe(true);
    expect(result.extras[0]?.fixSlug).toBe("reconciliation-claimant");
  });

  it("cannot_leave_original_death_cert overlay resolves", () => {
    const result = resolveOverlays(
      RULE_PACK,
      { "q10_docs_check.cannot_leave_original_death_cert": true },
      undefined,
    );
    expect(result.matchedFlagIds).toEqual(["cannot_leave_original_death_cert"]);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("ticking 'none' contributes no overlay", () => {
    const result = resolveOverlays(RULE_PACK, { "q10_docs_check.none": true }, undefined);
    expect(result.matchedFlagIds).toEqual([]);
    expect(result.items).toEqual([]);
    expect(result.extras).toEqual([]);
  });

  it("multiple ticked flags all apply together, without duplicating each other's items", () => {
    const result = resolveOverlays(
      RULE_PACK,
      {
        "q10_docs_check.passbook_lost": true,
        "q10_docs_check.someone_abroad": true,
      },
      undefined,
    );
    expect(new Set(result.matchedFlagIds)).toEqual(new Set(["passbook_lost", "someone_abroad"]));
    expect(result.extras).toHaveLength(2);
    const ids = result.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length); // no internal duplicate ids
  });

  it("system_frozen_10_years fires from a date-derived freezeRequired even without the direct q8_maturity answer", () => {
    const result = resolveOverlays(RULE_PACK, {}, { freezeRequired: true });
    expect(result.matchedFlagIds).toEqual(["system_frozen_10_years"]);
  });

  it("an unknown ticked flag with no matching overlay is silently ignored (no crash)", () => {
    // q10_docs_check has no option "not_a_real_flag"; this exercises the
    // "overlay not found for a flag" branch defensively.
    const result = resolveOverlays(RULE_PACK, { "q10_docs_check.not_a_real_flag": true }, undefined);
    expect(result.items).toEqual([]);
  });
});
