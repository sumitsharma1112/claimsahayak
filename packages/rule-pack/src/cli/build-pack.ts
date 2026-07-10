#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RulePack } from "@claimsahayak/shared-types";
import { stableStringify } from "@claimsahayak/shared-utils";
import { RULE_PACK } from "../data/index.js";
import { formatPipelineResult, runValidationPipeline } from "../validate/pipeline.js";

/**
 * Produces a publishable, immutable Rule Pack artifact (V3 §2.6):
 *   1. Refuses to build an invalid pack (runs the same gate as validate-pack).
 *   2. Computes the REAL SHA-256 content hash over the pack's content,
 *      EXCLUDING meta.contentHash itself (hashing a field that contains its
 *      own hash would be circular) — stable-stringified so the digest is
 *      deterministic regardless of key insertion order.
 *   3. Stamps that hash into a final meta object and writes
 *      dist/rule-pack.<version>.json.
 *
 * This is a LOCAL/dev build for testing the artifact shape; the actual
 * CDN publish pipeline (packages/rule-pack served from /rules/{version}.json
 * plus a mutable /rules/current.json pointer) is Milestone 10 scope.
 */
function computeContentHash(pack: RulePack): string {
  const { meta, ...rest } = pack;
  const { contentHash: _omit, ...metaWithoutHash } = meta;
  const body = { meta: metaWithoutHash, ...rest };
  return createHash("sha256").update(stableStringify(body)).digest("hex");
}

function main(): void {
  const preValidation = runValidationPipeline(RULE_PACK);
  if (!preValidation.ok) {
    console.error("build-pack: refusing to build — the pack fails validation.\n");
    console.error(formatPipelineResult(preValidation));
    process.exit(1);
  }

  const contentHash = computeContentHash(RULE_PACK);
  const finalPack: RulePack = {
    ...RULE_PACK,
    meta: { ...RULE_PACK.meta, contentHash },
  };

  const here = dirname(fileURLToPath(import.meta.url));
  const distDir = join(here, "..", "..", "dist");
  mkdirSync(distDir, { recursive: true });
  const outPath = join(distDir, `rule-pack.${finalPack.meta.version}.json`);
  writeFileSync(outPath, JSON.stringify(finalPack, null, 2), "utf-8");

  console.log(`Built ${outPath}`);
  console.log(`  version:      ${finalPack.meta.version}`);
  console.log(`  engineMin:    ${finalPack.meta.engineMin}`);
  console.log(`  contentHash:  ${finalPack.meta.contentHash}`);
}

main();
