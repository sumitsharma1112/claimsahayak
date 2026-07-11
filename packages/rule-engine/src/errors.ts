/**
 * Structured error/issue reporting (Milestone 3 §13): the engine never
 * throws UI-specific errors. Every public entry point that can fail
 * returns its result alongside a (possibly empty) `issues` array instead
 * of throwing, so a consuming UI can render something safe even when a
 * Rule Pack is malformed or an answer set is incomplete.
 *
 * Genuine programmer errors (e.g. calling an internal helper with a shape
 * that TypeScript itself would have rejected) still use `invariant` from
 * shared-utils and DO throw — those are bugs, not data problems, and V3's
 * "never throw UI-specific errors" is about the data path, not defending
 * against broken calling code.
 */

export type EngineIssueCode =
  | "hash_mismatch"
  | "engine_incompatible"
  | "fallback_used"
  | "unknown_question"
  | "unknown_option"
  | "unanswered_question"
  | "unresolved_route"
  | "unknown_card"
  | "unknown_scheme"
  | "missing_decision";

export interface EngineIssue {
  readonly code: EngineIssueCode;
  readonly message: string;
  readonly path?: string;
}

export function engineIssue(
  code: EngineIssueCode,
  message: string,
  path?: string,
): EngineIssue {
  return path === undefined ? { code, message } : { code, message, path };
}
