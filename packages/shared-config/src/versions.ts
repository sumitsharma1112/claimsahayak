/**
 * Rule-pack version format: YYYY.MM.patch (V3 §2.6). Packs are immutable
 * once published; rollback repoints, never rewrites.
 * The engine's own version lives in @claimsahayak/rule-engine — single
 * source of truth for each stamp in V3 invariant I-1.
 */
export const RULE_PACK_VERSION_PATTERN = /^\d{4}\.(0[1-9]|1[0-2])\.\d+$/;
