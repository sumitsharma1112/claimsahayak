import { describe, expect, it } from "vitest";
import { computeDerivedValues, monthsBetween } from "../src/derived.js";

const CONSTANTS = { AFFIDAVIT_LIMIT_INR: 500_000, NO_NOMINATION_WAIT_MONTHS: 6, FREEZE_YEARS: 10 };

describe("derived values", () => {
  it("monthsBetween counts whole months, never negative", () => {
    expect(monthsBetween({ month: 1, year: 2026 }, "2026-07-10T00:00:00.000Z")).toBe(6);
    expect(monthsBetween({ month: 7, year: 2026 }, "2026-07-10T00:00:00.000Z")).toBe(0);
    // A "death" recorded after "asOf" clamps to zero rather than going negative.
    expect(monthsBetween({ month: 12, year: 2026 }, "2026-07-10T00:00:00.000Z")).toBe(0);
  });

  it("computeDerivedValues uses the pack's own constants, not hardcoded thresholds", () => {
    const result = computeDerivedValues({ month: 1, year: 2026 }, "2026-07-10T00:00:00.000Z", CONSTANTS);
    expect(result.monthsSinceDeath).toBe(6);
    expect(result.yearsSinceDeath).toBe(0);
    expect(result.overSixMonths).toBe(true);
    expect(result.overTenYears).toBe(false);
    expect(result.freezeRequired).toBe(false);
  });

  it("overTenYears/freezeRequired flip once yearsSinceDeath reaches FREEZE_YEARS", () => {
    const result = computeDerivedValues({ month: 1, year: 2010 }, "2026-07-10T00:00:00.000Z", CONSTANTS);
    expect(result.yearsSinceDeath).toBeGreaterThanOrEqual(10);
    expect(result.overTenYears).toBe(true);
    expect(result.freezeRequired).toBe(true);
  });

  it("a different NO_NOMINATION_WAIT_MONTHS constant changes overSixMonths without any code change", () => {
    const looserConstants = { ...CONSTANTS, NO_NOMINATION_WAIT_MONTHS: 8 };
    const result = computeDerivedValues({ month: 1, year: 2026 }, "2026-07-10T00:00:00.000Z", looserConstants);
    expect(result.monthsSinceDeath).toBe(6);
    expect(result.overSixMonths).toBe(false);
  });
});
