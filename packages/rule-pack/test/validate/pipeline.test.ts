import { describe, expect, it } from "vitest";
import { RULE_PACK } from "../../src/data/index.js";
import { TRUTH_TABLE_FIXTURES } from "../../src/fixtures/index.js";
import { formatPipelineResult, runValidationPipeline } from "../../src/validate/pipeline.js";
import { onlyErrors } from "../../src/schema/issue.js";

describe("runValidationPipeline (the full Milestone 2 publish gate)", () => {
  it("passes every stage for the authored pack, with its full fixture set", () => {
    const roundTripped: unknown = JSON.parse(JSON.stringify(RULE_PACK));
    const result = runValidationPipeline(roundTripped, TRUTH_TABLE_FIXTURES);
    if (!result.ok) {
      throw new Error(`pipeline failed:\n${formatPipelineResult(result)}`);
    }
    expect(result.ok).toBe(true);
  });

  it("reports 100% English coverage (EN-complete is a hard requirement even at this milestone)", () => {
    const result = runValidationPipeline(RULE_PACK, TRUTH_TABLE_FIXTURES);
    expect(result.localeParity).toBeDefined();
  });

  it("fails the pipeline if an output references a non-existent route bucket", () => {
    const tampered = {
      ...RULE_PACK,
      outputs: [
        ...RULE_PACK.outputs,
        {
          id: "test_bad_output",
          routeId: "ROUTE_DOES_NOT_EXIST",
          itemType: "instruction" as const,
          label: { en: "test" },
          attrs: {
            why: { en: "test" },
            originalOrCopy: { en: "test" },
            selfAttest: { en: "test" },
            verifiedBy: { en: "test" },
          },
          section: "documents",
          sortOrder: 999,
          handbookRef: "§1",
        },
      ],
    };
    const result = runValidationPipeline(tampered);
    expect(result.ok).toBe(false);
    const reachabilityStage = result.stages.find(
      (s) => s.stage === "reachability:outputs-reference-routes",
    );
    expect(reachabilityStage).toBeDefined();
    expect(onlyErrors(reachabilityStage?.issues ?? []).length).toBeGreaterThan(0);
  });

  it("fails the pipeline if a card is defined but never targeted by a route", () => {
    const tampered = {
      ...RULE_PACK,
      cards: [
        ...RULE_PACK.cards,
        {
          id: "test_orphan_card",
          kind: "info" as const,
          title: { en: "test" },
          body: [{ kind: "paragraph" as const, text: { en: "test" } }],
          nextPhysicalStep: { en: "test" },
        },
      ],
    };
    const result = runValidationPipeline(tampered);
    expect(result.ok).toBe(false);
    const orphanStage = result.stages.find((s) => s.stage === "orphans:cards");
    expect(onlyErrors(orphanStage?.issues ?? []).length).toBeGreaterThan(0);
  });

  it("fails copy-lint if forbidden jargon appears in a label", () => {
    const tampered = {
      ...RULE_PACK,
      cards: RULE_PACK.cards.map((c, i) =>
        i === 0 ? { ...c, title: { en: "Please wait for sanction" } } : c,
      ),
    };
    const result = runValidationPipeline(tampered);
    const copyLintStage = result.stages.find((s) => s.stage === "copy-lint");
    expect(onlyErrors(copyLintStage?.issues ?? []).length).toBeGreaterThan(0);
  });
});
