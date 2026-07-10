import { describe, expect, it } from "vitest";
import {
  assertNever,
  cn,
  contrastRatio,
  formatIndianNumber,
  formatInr,
  invariant,
  isDefined
} from "../src/index.js";

describe("invariant / assertNever / isDefined", () => {
  it("invariant throws on falsy", () => {
    expect(() => {
      invariant(false, "boom");
    }).toThrow(/boom/);
    expect(() => {
      invariant(1, "ok");
    }).not.toThrow();
  });

  it("assertNever throws with context", () => {
    expect(() => assertNever("x" as never, "test-union")).toThrow(/test-union/);
  });

  it("isDefined narrows", () => {
    expect([1, null, 2, undefined].filter(isDefined)).toEqual([1, 2]);
  });
});

describe("cn", () => {
  it("joins truthy strings", () => {
    expect(cn("a", false, "b", null, undefined, "", "c")).toBe("a b c");
  });
});

describe("contrastRatio", () => {
  it("black on white is 21:1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });
  it("same color is 1:1", () => {
    expect(contrastRatio("#14555A", "#14555A")).toBeCloseTo(1, 5);
  });
  it("rejects malformed colors", () => {
    expect(() => contrastRatio("teal", "#FFFFFF")).toThrow(/RRGGBB/);
  });
});

describe("Indian number formatting", () => {
  it("groups per the Indian system", () => {
    expect(formatIndianNumber(500)).toBe("500");
    expect(formatIndianNumber(5000)).toBe("5,000");
    expect(formatIndianNumber(500000)).toBe("5,00,000");
    expect(formatIndianNumber(12345678)).toBe("1,23,45,678");
    expect(formatIndianNumber(-500000)).toBe("-5,00,000");
  });
  it("formats rupees with the ₹ sign", () => {
    expect(formatInr(500000)).toBe("\u20B95,00,000");
  });
  it("rejects non-finite input", () => {
    expect(() => formatIndianNumber(Number.NaN)).toThrow(/non-finite/);
  });
});
