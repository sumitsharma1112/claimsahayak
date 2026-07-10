import { describe, expect, it } from "vitest";
import type { RulePack } from "@claimsahayak/shared-types";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { FALLBACK_RULE_PACK, computeContentHash, isPlaceholderHash, loadRulePack } from "../src/index.js";

describe("content hash", () => {
  it("is deterministic: hashing the same pack twice yields the same digest", async () => {
    const a = await computeContentHash(RULE_PACK);
    const b = await computeContentHash(RULE_PACK);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes when the pack body changes", async () => {
    const mutated: RulePack = { ...RULE_PACK, constants: { ...RULE_PACK.constants, FREEZE_YEARS: 11 } };
    const original = await computeContentHash(RULE_PACK);
    const changed = await computeContentHash(mutated);
    expect(changed).not.toBe(original);
  });

  it("recognises the documented all-zeros placeholder", () => {
    expect(isPlaceholderHash("0".repeat(64))).toBe(true);
    expect(isPlaceholderHash("a".repeat(64))).toBe(false);
  });
});

describe("Rule Pack loader", () => {
  it("loads the real (currently placeholder-hashed) authored pack unchanged", async () => {
    const result = await loadRulePack(RULE_PACK);
    expect(result.usedFallback).toBe(false);
    expect(result.pack).toBe(RULE_PACK);
    expect(result.issues).toEqual([]);
  });

  it("falls back when the declared content hash does not match the actual pack body", async () => {
    const tampered: RulePack = {
      ...RULE_PACK,
      meta: { ...RULE_PACK.meta, contentHash: "f".repeat(64) },
    };
    const result = await loadRulePack(tampered);
    expect(result.usedFallback).toBe(true);
    expect(result.pack).toBe(FALLBACK_RULE_PACK);
    expect(result.issues.some((i) => i.code === "hash_mismatch")).toBe(true);
    expect(result.issues.some((i) => i.code === "fallback_used")).toBe(true);
  });

  it("falls back when the pack declares an engineMin this engine build cannot satisfy", async () => {
    const incompatible: RulePack = {
      ...RULE_PACK,
      meta: { ...RULE_PACK.meta, engineMin: "99.0" },
    };
    const result = await loadRulePack(incompatible);
    expect(result.usedFallback).toBe(true);
    expect(result.pack).toBe(FALLBACK_RULE_PACK);
    expect(result.issues.some((i) => i.code === "engine_incompatible")).toBe(true);
  });

  it("a hash that DOES match a real (non-placeholder) stamped body loads successfully", async () => {
    const realHash = await computeContentHash(RULE_PACK);
    const stamped: RulePack = { ...RULE_PACK, meta: { ...RULE_PACK.meta, contentHash: realHash } };
    const result = await loadRulePack(stamped);
    expect(result.usedFallback).toBe(false);
    expect(result.issues).toEqual([]);
  });

  it("the bundled fallback pack itself is schema-shaped and resolves to one safe card", () => {
    expect(FALLBACK_RULE_PACK.cards).toHaveLength(1);
    expect(FALLBACK_RULE_PACK.routes).toHaveLength(1);
  });
});
