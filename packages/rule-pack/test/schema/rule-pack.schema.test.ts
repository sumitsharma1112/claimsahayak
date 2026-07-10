import { describe, expect, it } from "vitest";
import { RULE_PACK } from "../../src/data/index.js";
import { parseRulePack } from "../../src/schema/rule-pack.schema.js";

describe("parseRulePack (schema round-trip)", () => {
  it("accepts the authored pack after a JSON round-trip", () => {
    // A JSON round-trip is the same transformation the pack undergoes when
    // published to and re-fetched from the CDN (V3 §2.6) — parsing the
    // ROUND-TRIPPED value, not the original in-memory object, is what
    // proves the schema layer works against real serialized data.
    const roundTripped: unknown = JSON.parse(JSON.stringify(RULE_PACK));
    const result = parseRulePack(roundTripped);
    if (!result.ok) {
      throw new Error(
        `expected the authored pack to parse cleanly, got issues:\n${result.error
          .map((i) => `${i.severity} ${i.path}: ${i.message}`)
          .join("\n")}`,
      );
    }
    expect(result.ok).toBe(true);
  });

  it("rejects a pack missing a required top-level field", () => {
    const { meta: _meta, ...withoutMeta } = RULE_PACK;
    const result = parseRulePack(withoutMeta);
    expect(result.ok).toBe(false);
  });

  it("rejects a pack that does not have exactly 8 schemes", () => {
    const tampered = { ...RULE_PACK, schemes: RULE_PACK.schemes.slice(0, 3) };
    const result = parseRulePack(tampered);
    expect(result.ok).toBe(false);
  });

  it("rejects a duplicate id within routes", () => {
    const firstRoute = RULE_PACK.routes[0];
    if (!firstRoute) {
      throw new Error("expected at least one route in the authored pack");
    }
    const tampered = {
      ...RULE_PACK,
      routes: [...RULE_PACK.routes, { ...firstRoute }],
    };
    const result = parseRulePack(tampered);
    expect(result.ok).toBe(false);
  });
});
