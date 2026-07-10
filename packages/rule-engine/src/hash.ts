import type { RulePack } from "@claimsahayak/shared-types";
import { stableStringify } from "@claimsahayak/shared-utils";

/**
 * SHA-256 over the canonical (stably-stringified) pack body, EXCLUDING
 * `meta.contentHash` itself (a field can't hash over its own value).
 * Uses the Web Crypto API (`crypto.subtle`), not Node's `crypto` module,
 * so this works unchanged in the browser (apps/web) as well as in tests
 * (Node 20+ exposes the same `globalThis.crypto.subtle`) — see
 * `docs/rule-pack.md`'s note on keeping the data layer runtime-agnostic.
 */
export async function computeContentHash(rulePack: RulePack): Promise<string> {
  const { contentHash: _omit, ...metaWithoutHash } = rulePack.meta;
  const canonical = stableStringify({ ...rulePack, meta: metaWithoutHash });
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const PLACEHOLDER_HASH = "0".repeat(64);

/**
 * The all-zeros hash is the documented placeholder `data/index.ts` stamps
 * on an unpublished pack (the real digest is only computed by the
 * `build-pack` CLI at publish time — see `docs/rule-pack.md`). Treating it
 * as "not yet stamped, trust the structure" — rather than a verification
 * failure — lets an in-development pack (like this repo's current M2
 * pack) load without the loader immediately falling back on every run;
 * a REAL stamped hash that doesn't match its own body is still rejected.
 */
export function isPlaceholderHash(hash: string): boolean {
  return hash === PLACEHOLDER_HASH;
}
