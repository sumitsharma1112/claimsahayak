import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { TRUTH_TABLE_FIXTURES } from "@claimsahayak/rule-pack/fixtures";
import {
  buildVarAssignment,
  collectOutputBucketIds,
  collectOutputItems,
  resolveOverlays,
  resolveRoute,
} from "../src/index.js";

/**
 * Milestone 2 authored 25 truth-table fixtures spanning every T1-T20 route
 * (T21 is the system overlay, exercised by fx25) and every overlay, with
 * the explicit expectation ("100% truth-table fixtures pass") that
 * Milestone 3's engine would be scored against them. This file runs every
 * one of them against the real, unmodified authored Rule Pack.
 */
describe("truth-table acceptance (Milestone 2 fixtures)", () => {
  for (const fixture of TRUTH_TABLE_FIXTURES) {
    it(`${fixture.id}: ${fixture.description}`, () => {
      const scheme = RULE_PACK.schemes.find((s) => s.id === fixture.schemeId);
      if (!scheme) {
        throw new Error(`scheme "${fixture.schemeId}" must exist in the pack`);
      }

      const vars = buildVarAssignment(RULE_PACK, scheme, fixture.answers, fixture.derived);
      const resolution = resolveRoute(RULE_PACK, vars);

      expect(resolution.firedRouteIds).toEqual(fixture.expected.firedRouteIds);

      if (fixture.expected.cardId !== undefined) {
        expect(resolution.terminal?.kind).toBe("card");
        expect(resolution.terminal?.target).toBe(fixture.expected.cardId);
      } else {
        expect(resolution.terminal?.kind).toBe("route");
      }

      const includeGlobal = resolution.terminal?.id !== "T1";
      const bucketIds = collectOutputBucketIds(resolution, fixture.answers, includeGlobal);
      const outputItems = collectOutputItems(RULE_PACK, bucketIds);
      const overlays = resolveOverlays(RULE_PACK, fixture.answers, fixture.derived);

      const actualBuckets = new Set<string>([
        ...outputItems.map((o) => o.routeId),
        ...overlays.items.map((o) => o.routeId),
      ]);

      expect(Array.from(actualBuckets).sort()).toEqual([...fixture.expected.outputBuckets].sort());

      if (fixture.expected.overlayFlags !== undefined) {
        expect([...overlays.matchedFlagIds].sort()).toEqual([...fixture.expected.overlayFlags].sort());
      } else {
        expect(overlays.matchedFlagIds).toEqual([]);
      }
    });
  }
});
