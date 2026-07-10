import { describe, expect, it } from "vitest";
import { ENGINE_VERSION, satisfiesEngineMin } from "../src/version.js";

describe("engine version scaffold", () => {
  it("exposes a semver-shaped version", () => {
    expect(ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("compares engineMin on major.minor", () => {
    expect(satisfiesEngineMin("0.1")).toBe(true);
    expect(satisfiesEngineMin("0.0")).toBe(true);
    expect(satisfiesEngineMin("0.2")).toBe(false);
    expect(satisfiesEngineMin("1.0")).toBe(false);
  });

  it("rejects malformed version strings", () => {
    expect(() => satisfiesEngineMin("abc")).toThrow(/Invalid engine version/);
  });
});
