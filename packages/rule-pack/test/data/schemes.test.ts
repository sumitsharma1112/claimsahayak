import { describe, expect, it } from "vitest";
import { SCHEMES } from "../../src/data/schemes.js";
import { CONSTANTS } from "../../src/data/constants.js";
import { NV_REGISTER, getNvEntry } from "../../src/data/nv-register.js";

describe("SCHEMES", () => {
  it("covers exactly the 9 in-scope schemes (SCSS added under the ClaimSahayak Official Rule Book v1.0 integration)", () => {
    expect(SCHEMES).toHaveLength(9);
    expect(SCHEMES.map((s) => s.id).sort()).toEqual(
      ["KVP", "MIS", "NSC", "PPF", "RD", "SB", "SCSS", "SSA", "TD"].sort(),
    );
  });

  it("marks MIS as minor-account eligible (handbook §7.6 row 4)", () => {
    const mis = SCHEMES.find((s) => s.id === "MIS");
    expect(mis?.canBeMinorAccount).toBe(true);
  });

  it("marks PPF as single-holder only (cannot be joint)", () => {
    const ppf = SCHEMES.find((s) => s.id === "PPF");
    expect(ppf?.canBeJoint).toBe(false);
  });

  it("marks SB and SSA and PPF as NOT bank-transfer eligible (FAQ 39)", () => {
    for (const id of ["SB", "SSA", "PPF"] as const) {
      const scheme = SCHEMES.find((s) => s.id === id);
      expect(scheme?.bankTransferEligible).toBe(false);
    }
  });
});

describe("CONSTANTS", () => {
  it("matches the handbook-specified thresholds", () => {
    expect(CONSTANTS.AFFIDAVIT_LIMIT_INR).toBe(500_000);
    expect(CONSTANTS.NO_NOMINATION_WAIT_MONTHS).toBe(6);
    expect(CONSTANTS.FREEZE_YEARS).toBe(10);
  });
});

describe("NV_REGISTER", () => {
  it("has no duplicate ids", () => {
    const ids = NV_REGISTER.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getNvEntry resolves a known id and returns undefined for an unknown one", () => {
    expect(getNvEntry("NV-01")?.id).toBe("NV-01");
    expect(getNvEntry("NV-999")).toBeUndefined();
  });
});
