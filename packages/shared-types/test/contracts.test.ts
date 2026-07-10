/**
 * Contract shape tests: compile-time-oriented checks that the frozen
 * contracts express the specification's guarantees —
 *  - the restricted condition subset rejects unsupported operators,
 *  - analytics events are anonymous by construction,
 *  - LocalizedText always requires English,
 *  - ChecklistDocument is determinism-compatible (no wall-clock field),
 *  - provenance fields are mandatory on normative rows.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  AnalyticsEvent,
  ChecklistDocument,
  Condition,
  LocalizedText,
  RulePack,
  SessionState,
} from "../src/index.js";
import {
  ALWAYS,
  LOCALE_CODES,
  SCHEME_IDS,
  SESSION_TTL_MS,
} from "../src/index.js";

describe("locale contract", () => {
  it("requires English in LocalizedText; Hindi is parity-gated, not type-forced", () => {
    expectTypeOf<LocalizedText>().toMatchTypeOf<{ en: string }>();
    const enOnly: LocalizedText = { en: "English only during authoring" };
    expect(enOnly.en).toBeTruthy();
    // @ts-expect-error — English is mandatory.
    const missingEn: LocalizedText = { hi: "केवल हिंदी" };
    void missingEn;
  });

  it("enumerates launch locales", () => {
    expect(LOCALE_CODES).toEqual(["en", "hi"]);
  });
});

describe("condition contract (restricted JSON-logic, V3 §2.3)", () => {
  it("accepts the approved operator subset with var refs on either side", () => {
    const c: Condition = {
      and: [
        { "==": [{ var: "answers.q_nomination" }, "no"] },
        {
          ">=": [
            { var: "derived.monthsSinceDeath" },
            { var: "constants.NO_NOMINATION_WAIT_MONTHS" },
          ],
        },
        { in: [{ var: "account.schemeId" }, ["RD", "TD", "NSC", "KVP"]] },
        { not: { "==": [{ var: "answers.q7b_heirs" }, "no"] } },
        { or: [ALWAYS] },
      ],
    };
    expect(c).toBeTruthy();
  });

  it("rejects operators outside the subset", () => {
    // @ts-expect-error — "<" is not part of the restricted subset.
    const bad: Condition = { "<": [{ var: "x" }, 5] };
    void bad;
  });
});

describe("analytics contract (anonymous by construction, V3 §4.1)", () => {
  it("answer events carry a closed optionId or derived booleans — never raw month/year", () => {
    const e: AnalyticsEvent = {
      type: "answer",
      sessionId: "00000000-0000-4000-8000-000000000000",
      occurredAtIso: "2026-07-09T00:00:00.000Z",
      rulePackVersion: "2026.07.0",
      questionId: "q_death_month",
      over6Months: true,
      over10Years: false,
    };
    expect("optionId" in e).toBe(false);
    // @ts-expect-error — raw month values must never be transmissible.
    const bad: AnalyticsEvent = {
      type: "answer",
      sessionId: "00000000-0000-4000-8000-000000000000",
      occurredAtIso: "2026-07-09T00:00:00.000Z",
      rulePackVersion: "2026.07.0",
      questionId: "q_death_month",
      month: 3,
    };
    void bad;
  });

  it("is a closed union with no free-text-capable event", () => {
    expectTypeOf<AnalyticsEvent["type"]>().toEqualTypeOf<
      | "session_start"
      | "step_view"
      | "answer"
      | "route_assigned"
      | "overlay_flagged"
      | "card_shown"
      | "checklist_generated"
      | "pdf_download"
      | "print"
      | "fix_view"
      | "learn_view"
      | "claims_view"
      | "resume"
      | "clear_answers"
      | "abandon"
    >();
  });
});

describe("determinism-supporting contracts (V3 I-1, Roadmap M3)", () => {
  it("ChecklistDocument carries version stamps and no wall-clock field", () => {
    expectTypeOf<ChecklistDocument>().toMatchTypeOf<{
      rulePackVersion: string;
      engineVersion: string;
    }>();
    expectTypeOf<ChecklistDocument>().not.toHaveProperty("generatedAtIso");
  });

  it("RulePack routes and outputs require provenance (V3 I-4)", () => {
    expectTypeOf<RulePack["routes"][number]>().toMatchTypeOf<{
      handbookRef: string;
    }>();
    expectTypeOf<RulePack["outputs"][number]>().toMatchTypeOf<{
      handbookRef: string;
    }>();
  });
});

describe("session contract (device-only, V2 FR-8 / V3 I-2)", () => {
  it("pins the rule-pack version and expires after 24 hours", () => {
    expect(SESSION_TTL_MS).toBe(24 * 60 * 60 * 1000);
    const s: SessionState = {
      schemaVersion: 1,
      rulePackVersion: "2026.07.0",
      locale: "en",
      startedAtIso: "2026-07-09T00:00:00.000Z",
      updatedAtIso: "2026-07-09T00:00:00.000Z",
      answers: {},
      currentStepId: "s1_schemes",
    };
    expectTypeOf<SessionState["schemaVersion"]>().toEqualTypeOf<1>();
    expect(s.schemaVersion).toBe(1);
  });

  it("covers exactly the eight in-scope schemes", () => {
    expect(SCHEME_IDS).toEqual([
      "SB",
      "RD",
      "TD",
      "MIS",
      "PPF",
      "SSA",
      "NSC",
      "KVP",
    ]);
  });
});
