import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { pickText } from "@/lib/locale";
import { answerToPatch, toAnswerMap, withoutQuestionKeys } from "@/lib/wizardAnswers";
import { getCurrentQuestion } from "@/lib/wizardCurrentQuestion";
import { detectRerouteBanner } from "@/lib/wizardReroute";

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

describe("withoutQuestionKeys", () => {
  it("strips a question's bare key and every multi sub-key, leaving everything else", () => {
    const flat = {
      q2_who_died: "adult",
      "q10_docs_check.passbook_lost": true,
      "q10_docs_check.none": false,
    };
    expect(withoutQuestionKeys(flat, "q10_docs_check")).toEqual({ q2_who_died: "adult" });
  });
});

describe("answerToPatch", () => {
  it("matches toAnswerMap's own convention for every input kind", () => {
    expect(answerToPatch("q2_who_died", { kind: "single", optionId: "adult" })).toEqual({
      q2_who_died: "adult",
    });
    expect(answerToPatch("q10_docs_check", { kind: "multi", optionIds: ["none"] })).toEqual({
      "q10_docs_check.none": true,
    });
    expect(answerToPatch("q4_death_month", { kind: "monthYear", month: 3, year: 2024 })).toEqual({});
  });
});

describe("getCurrentQuestion — determinism", () => {
  const sb = RULE_PACK.schemes.find((s) => s.id === "SB");
  if (!sb) throw new Error("Fixture assumption broken: SB scheme missing.");

  it("is a pure function: the same answers always resolve to the same current question", () => {
    const answers = {
      q1_schemes: { kind: "multi" as const, optionIds: ["SB"] },
      q2_who_died: { kind: "single" as const, optionId: "adult" },
    };
    const flat = toAnswerMap(answers);
    const results = Array.from({ length: 5 }, () => getCurrentQuestion(RULE_PACK, sb, flat, answers)?.id);
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe("q_armed_forces");
  });

  it("resolves monthYear questions as answered from the rich state alone (no flat-map entry needed)", () => {
    const answers = {
      q1_schemes: { kind: "multi" as const, optionIds: ["SB"] },
      q2_who_died: { kind: "single" as const, optionId: "adult" },
      q_armed_forces: { kind: "boolean" as const, value: false },
      q3_holding: { kind: "single" as const, optionId: "one_name" },
      q4_death_month: { kind: "monthYear" as const, month: 3, year: 2024 },
    };
    const flat = toAnswerMap(answers);
    expect(flat).not.toHaveProperty("q4_death_month");
    expect(getCurrentQuestion(RULE_PACK, sb, flat, answers)?.id).toBe("q5_nomination");
  });
});

describe("detectRerouteBanner", () => {
  const sb = RULE_PACK.schemes.find((s) => s.id === "SB");
  if (!sb) throw new Error("Fixture assumption broken: SB scheme missing.");

  const t5 = RULE_PACK.routes.find((r) => r.id === "T5");
  if (!t5?.banner) throw new Error("Fixture assumption broken: T5 has no banner.");

  it("returns the newly-fired reroute rule's banner when the terminal route changes", () => {
    const before = {
      "q1_schemes.SB": true,
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    };
    const after = { "q1_schemes.SB": true, q2_who_died: "child" };
    expect(detectRerouteBanner(RULE_PACK, sb, before, after)).toEqual(t5.banner);
  });

  it("returns undefined when the terminal route is unchanged", () => {
    const before = {
      "q1_schemes.SB": true,
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    };
    const after = { ...before };
    expect(detectRerouteBanner(RULE_PACK, sb, before, after)).toBeUndefined();
  });
});
