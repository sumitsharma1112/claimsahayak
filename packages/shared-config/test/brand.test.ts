import { describe, expect, it } from "vitest";
import { BRAND, FORBIDDEN_BRAND_WORDS, ROUTES } from "../src/index.js";

describe("brand guardrails", () => {
  it("independence strip exists in both launch locales", () => {
    expect(BRAND.independenceStrip.en).toMatch(/Not an official India Post website/);
    expect(BRAND.independenceStrip.hi).toBeTruthy();
  });

  it("brand strings never claim official status", () => {
    const selfDescriptions = [
      BRAND.name,
      BRAND.tagline.en,
      BRAND.wordmark.en
    ].map((s) => s.toLowerCase());
    for (const word of FORBIDDEN_BRAND_WORDS) {
      for (const text of selfDescriptions) {
        expect(text).not.toContain(word);
      }
    }
  });

  it("declares every specified public route", () => {
    expect(Object.values(ROUTES)).toEqual(
      expect.arrayContaining([
        "/",
        "/start",
        "/learn",
        "/fix",
        "/claims",
        "/privacy",
        "/about",
        "/disclaimer",
        "/find-help",
        "/offline"
      ])
    );
  });
});
