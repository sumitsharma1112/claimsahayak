import { describe, expect, it } from "vitest";
import { EMPTY_CLAIM_DATA, type ClaimDataModel } from "@claimsahayak/shared-types";
import { resolveAccountNumber, resolveClaimDataValue } from "../src/index.js";

/**
 * Milestone 7 — resolveClaimDataValue is a plain, exhaustive switch: every
 * ClaimDataField resolves to either the entered value or undefined (never
 * an empty string), so a renderer can tell "not filled in" apart from
 * "filled in blank."
 */
describe("resolveClaimDataValue", () => {
  it("returns undefined for every field on an empty Claim Data Model", () => {
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "claimant.name")).toBeUndefined();
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "guardian.name")).toBeUndefined();
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "nominee.0.name")).toBeUndefined();
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "witness.1.name")).toBeUndefined();
  });

  it("resolves entered claimant/depositor/office values", () => {
    const model: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      claimant: { name: "Asha Devi", address: "12 MG Road", relationship: "Daughter" },
      depositor: { name: "Ram Prasad" },
      officeName: "Connaught Place HO",
    };
    expect(resolveClaimDataValue(model, "claimant.name")).toBe("Asha Devi");
    expect(resolveClaimDataValue(model, "claimant.address")).toBe("12 MG Road");
    expect(resolveClaimDataValue(model, "claimant.relationship")).toBe("Daughter");
    expect(resolveClaimDataValue(model, "depositor.name")).toBe("Ram Prasad");
    expect(resolveClaimDataValue(model, "office.name")).toBe("Connaught Place HO");
  });

  it("resolves bounded nominee/legalHeir/witness slots by index, undefined past what was entered", () => {
    const model: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      nominees: [{ name: "Nominee One" }, { name: "Nominee Two" }],
      witnesses: [{ name: "Witness One" }],
    };
    expect(resolveClaimDataValue(model, "nominee.0.name")).toBe("Nominee One");
    expect(resolveClaimDataValue(model, "nominee.1.name")).toBe("Nominee Two");
    expect(resolveClaimDataValue(model, "nominee.2.name")).toBeUndefined();
    expect(resolveClaimDataValue(model, "witness.0.name")).toBe("Witness One");
    expect(resolveClaimDataValue(model, "witness.1.name")).toBeUndefined();
  });

  it("treats a whitespace-only entry as not filled in", () => {
    const model: ClaimDataModel = { ...EMPTY_CLAIM_DATA, claimant: { name: "   " } };
    expect(resolveClaimDataValue(model, "claimant.name")).toBeUndefined();
  });

  it("always returns undefined for account.number (resolved separately by accountIndex)", () => {
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "account.number")).toBeUndefined();
  });
});

describe("resolveAccountNumber", () => {
  it("resolves the number entered for a specific account index, undefined for others", () => {
    const model: ClaimDataModel = { ...EMPTY_CLAIM_DATA, accountNumbers: { 0: "SB-12345" } };
    expect(resolveAccountNumber(model, 0)).toBe("SB-12345");
    expect(resolveAccountNumber(model, 1)).toBeUndefined();
  });
});
