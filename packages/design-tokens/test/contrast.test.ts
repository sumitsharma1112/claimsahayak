/**
 * WCAG 2.1 AA contrast verification for every declared text/background pair
 * (Blueprint v2 §5.2: "all text pairs ≥ 4.5:1"). This test makes the
 * accessibility standard a build-time guarantee: a token change that breaks
 * contrast fails CI.
 */
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@claimsahayak/shared-utils";
import { color, contrastPairs } from "../src/tokens.js";

describe("design-token contrast (WCAG AA)", () => {
  for (const pair of contrastPairs) {
    it(`${pair.name} is ≥ 4.5:1`, () => {
      expect(contrastRatio(pair.fg, pair.bg)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("peacock on paper comfortably exceeds AA (spec cites ~7.2:1)", () => {
    expect(contrastRatio(color.peacock, color.paper)).toBeGreaterThanOrEqual(7);
  });
});
