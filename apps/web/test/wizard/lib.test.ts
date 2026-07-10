import { describe, expect, it } from "vitest";
import { pickText } from "@/lib/locale";
import { toAnswerMap } from "@/lib/wizardAnswers";

describe("pickText", () => {
  it("returns the requested locale's string when present", () => {
    expect(pickText({ en: "Hello", hi: "नमस्ते" }, "hi")).toBe("नमस्ते");
  });

  it("falls back to English when the locale has no translation", () => {
    expect(pickText({ en: "Hello" }, "hi")).toBe("Hello");
  });
});

describe("toAnswerMap", () => {
  it("translates single/boolean answers to bare keys", () => {
    expect(
      toAnswerMap({
        q2_who_died: { kind: "single", optionId: "adult" },
        q_flag: { kind: "boolean", value: true },
      }),
    ).toEqual({ q2_who_died: "adult", q_flag: true });
  });

  it("translates multi answers to dotted per-option keys", () => {
    expect(
      toAnswerMap({
        q10_docs_check: { kind: "multi", optionIds: ["passbook_lost", "someone_abroad"] },
      }),
    ).toEqual({
      "q10_docs_check.passbook_lost": true,
      "q10_docs_check.someone_abroad": true,
    });
  });

  it("omits monthYear answers (no direct condition variable — privacy)", () => {
    expect(
      toAnswerMap({
        q4_death_month: { kind: "monthYear", month: 3, year: 2024 },
      }),
    ).toEqual({});
  });
});
