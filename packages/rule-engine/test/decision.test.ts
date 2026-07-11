import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { resolveClaimDecision } from "../src/index.js";
import type { RulePack } from "@claimsahayak/shared-types";

describe("resolveClaimDecision", () => {
  it("resolves the real ROUTE_A decision from the authored pack", () => {
    const { decision, issue } = resolveClaimDecision(RULE_PACK, "ROUTE_A");
    expect(issue).toBeUndefined();
    expect(decision).toBeDefined();
    expect(decision?.decisionRecordId).toBe("DEC_ROUTE_A");
    expect(decision?.decisionStatus).toBe("payable");
    expect(decision?.courtOrderRequired).toBe("no");
  });

  it("derives applicableRuleIds as the deduped union of officialReferences csIds and rulebookRefs", () => {
    const { decision } = resolveClaimDecision(RULE_PACK, "ROUTE_A");
    expect(decision?.applicableRuleIds).toContain("CS-NOM-019");
    expect(decision?.applicableRuleIds).toContain("D-02");
    expect(new Set(decision?.applicableRuleIds).size).toBe(decision?.applicableRuleIds.length);
  });

  it("derives monetaryLimitInr as the max of the competent-authority ladder when every rung declares one", () => {
    const { decision } = resolveClaimDecision(RULE_PACK, "ROUTE_C");
    // ROUTE_C's ladder is 50,000 / 100,000 / 500,000 (Gazetted officer) — max is 500,000.
    expect(decision?.monetaryLimitInr).toBe(500000);
  });

  it("derives monetaryLimitInr as undefined ('no fixed limit') when any rung is open-ended", () => {
    const { decision } = resolveClaimDecision(RULE_PACK, "ROUTE_A");
    // ROUTE_A's single rung (post office staff) declares no monetaryLimitInr at all.
    expect(decision?.monetaryLimitInr).toBeUndefined();
  });

  it("returns undefined with no issue for a genuinely unresolved route", () => {
    const { decision, issue } = resolveClaimDecision(RULE_PACK, "UNRESOLVED");
    expect(decision).toBeUndefined();
    expect(issue).toBeUndefined();
  });

  it("returns undefined with a non-fatal missing_decision issue for a routeId with no matching DecisionRecord", () => {
    const { decision, issue } = resolveClaimDecision(RULE_PACK, "NOT_A_REAL_ROUTE_ID");
    expect(decision).toBeUndefined();
    expect(issue?.code).toBe("missing_decision");
  });

  it("returns undefined with no issue when the pack declares no decisions array at all", () => {
    const { decisions: _decisions, ...rest } = RULE_PACK;
    const packWithoutDecisions: RulePack = rest;
    const { decision, issue } = resolveClaimDecision(packWithoutDecisions, "ROUTE_A");
    expect(decision).toBeUndefined();
    expect(issue).toBeUndefined();
  });

  it("carries processingNotes through when the record declares one, omits it when absent", () => {
    const withNotes = resolveClaimDecision(RULE_PACK, "ROUTE_A").decision;
    expect(withNotes?.processingNotes).toBeDefined();
    const withoutNotes = resolveClaimDecision(RULE_PACK, "card_pause_nomination").decision;
    expect(withoutNotes?.processingNotes).toBeUndefined();
  });
});
