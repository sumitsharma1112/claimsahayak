#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { RULE_PACK } from "../data/index.js";
import { TRUTH_TABLE_FIXTURES } from "../fixtures/index.js";
import { formatPipelineResult, runValidationPipeline } from "../validate/pipeline.js";

/**
 * Runs every Milestone 2 validation gate against either the pack authored
 * in this repository (default) or a JSON file on disk (e.g. a published
 * artifact fetched from the CDN, or a candidate `build-pack` output) —
 *
 *   tsx src/cli/validate-pack.ts               # validates the authored pack
 *   tsx src/cli/validate-pack.ts ./some.json    # validates a JSON artifact
 *
 * Exit code 0 on pass (no ERROR-severity issues across any stage), 1 on
 * fail. This is the same pipeline the Admin Portal (Milestone 10) reuses
 * server-side before allowing a publish (V3 §2.5 — "a pack cannot be
 * published unless it passes...").
 */
function main(): void {
  const filePath = process.argv[2];
  const raw: unknown = filePath
    ? (JSON.parse(readFileSync(filePath, "utf-8")) as unknown)
    : RULE_PACK;

  const result = runValidationPipeline(raw, TRUTH_TABLE_FIXTURES);
  console.log(formatPipelineResult(result));

  process.exit(result.ok ? 0 : 1);
}

main();
