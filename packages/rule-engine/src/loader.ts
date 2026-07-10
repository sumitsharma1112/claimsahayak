import type { RulePack } from "@claimsahayak/shared-types";
import { computeContentHash, isPlaceholderHash } from "./hash.js";
import { satisfiesEngineMin } from "./version.js";
import { FALLBACK_RULE_PACK } from "./fallback-pack.js";
import { engineIssue, type EngineIssue } from "./errors.js";

export interface LoadedRulePack {
  readonly pack: RulePack;
  readonly usedFallback: boolean;
  readonly issues: readonly EngineIssue[];
}

/**
 * Loads a Rule Pack for use by the engine (Milestone 3 §2): verifies its
 * content hash (skipping the check for the documented all-zeros
 * placeholder — see `hash.ts`) and that this engine build satisfies the
 * pack's declared `engineMin`. On EITHER failure, falls back to the
 * engine's own bundled `FALLBACK_RULE_PACK` rather than throwing, so a
 * corrupted or incompatible pack never crashes the caller — it just
 * degrades to a single "please try again" card.
 *
 * This is the one place in the engine that is genuinely asynchronous
 * (content hashing uses `crypto.subtle`, which is Promise-based); the
 * core `evaluate()`/`evaluateChecklist()` entry points remain fully
 * synchronous and pure once a `RulePack` has been loaded.
 */
export async function loadRulePack(candidate: RulePack): Promise<LoadedRulePack> {
  const issues: EngineIssue[] = [];

  if (!satisfiesEngineMin(candidate.meta.engineMin)) {
    issues.push(
      engineIssue(
        "engine_incompatible",
        `This engine does not satisfy the pack's declared engineMin "${candidate.meta.engineMin}".`,
        "meta.engineMin",
      ),
    );
    issues.push(engineIssue("fallback_used", "Falling back to the bundled Rule Pack."));
    return { pack: FALLBACK_RULE_PACK, usedFallback: true, issues };
  }

  if (!isPlaceholderHash(candidate.meta.contentHash)) {
    const actualHash = await computeContentHash(candidate);
    if (actualHash !== candidate.meta.contentHash) {
      issues.push(
        engineIssue(
          "hash_mismatch",
          `Computed content hash "${actualHash}" does not match declared "${candidate.meta.contentHash}".`,
          "meta.contentHash",
        ),
      );
      issues.push(engineIssue("fallback_used", "Falling back to the bundled Rule Pack."));
      return { pack: FALLBACK_RULE_PACK, usedFallback: true, issues };
    }
  }

  return { pack: candidate, usedFallback: false, issues };
}
