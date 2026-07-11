import { describe, expect, it } from "vitest";
import { RULE_PACK } from "../../src/data/index.js";
import { TRUTH_TABLE_FIXTURES } from "../../src/fixtures/index.js";
import { checkTruthTableFixturesReferentialIntegrity } from "../../src/validate/truth-table.js";

describe("truth-table fixtures", () => {
  it("cover all 9 schemes (SCSS added under the ClaimSahayak Official Rule Book v1.0 integration)", () => {
    const schemesCovered = new Set(TRUTH_TABLE_FIXTURES.map((f) => f.schemeId));
    expect(schemesCovered.size).toBe(9);
  });

  it("cover every T-rule id at least once (T1-T20 plus T18A)", () => {
    const covered = new Set(TRUTH_TABLE_FIXTURES.flatMap((f) => f.expected.firedRouteIds));
    const expectedTRuleIds = RULE_PACK.routes
      .map((r) => r.id)
      .filter((id) => id.startsWith("T"));
    const missing = expectedTRuleIds.filter((id) => !covered.has(id));
    expect(missing).toEqual([]);
  });

  it("have no duplicate fixture ids", () => {
    const ids = TRUTH_TABLE_FIXTURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("pass referential integrity against the authored pack", () => {
    const issues = checkTruthTableFixturesReferentialIntegrity(RULE_PACK, TRUTH_TABLE_FIXTURES);
    if (issues.length > 0) {
      throw new Error(
        `fixture referential integrity failed:\n${issues
          .map((i) => `${i.severity} ${i.path}: ${i.message}`)
          .join("\n")}`,
      );
    }
    expect(issues).toEqual([]);
  });

  it("rejects a fixture referencing a non-existent question id", () => {
    const badFixture = {
      ...TRUTH_TABLE_FIXTURES[0]!,
      id: "test_bad_fixture",
      answers: { does_not_exist_question: "no" },
    };
    const issues = checkTruthTableFixturesReferentialIntegrity(RULE_PACK, [badFixture]);
    expect(issues.length).toBeGreaterThan(0);
  });
});
