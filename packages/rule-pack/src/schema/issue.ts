/**
 * Validation issue type shared by every hand-written parser in this package.
 *
 * Design note: the Rule Pack schema is validated with hand-written
 * TypeScript parsers rather than a third-party schema library. The pack's
 * shape is closed and frozen (packages/shared-types), the input is always
 * trusted authoring data (never arbitrary user input), and hand-written
 * parsers let every check below compose with the same `Result<T, E>` type
 * already used across the workspace (@claimsahayak/shared-utils) — no new
 * runtime dependency, no schema-DSL to learn, and every rule stays a plain,
 * readable TypeScript function.
 */

export type IssueSeverity = "error" | "warning";

export interface ValidationIssue {
  /** Dot/bracket path to the offending value, e.g. "routes[3].when". */
  readonly path: string;
  readonly message: string;
  readonly severity: IssueSeverity;
}

export function issue(
  path: string,
  message: string,
  severity: IssueSeverity = "error",
): ValidationIssue {
  return { path, message, severity };
}

export function warning(path: string, message: string): ValidationIssue {
  return issue(path, message, "warning");
}

export function formatIssues(issues: readonly ValidationIssue[]): string {
  if (issues.length === 0) {
    return "(no issues)";
  }
  return issues
    .map((i) => `[${i.severity}] ${i.path}: ${i.message}`)
    .join("\n");
}

export function onlyErrors(
  issues: readonly ValidationIssue[],
): readonly ValidationIssue[] {
  return issues.filter((i) => i.severity === "error");
}

/**
 * Accumulates issues across many independent field parses so a caller can
 * report every problem in one pass instead of failing on the first one.
 * `field` records a fallback value when a sub-parse fails so downstream
 * fields can still be checked (better diagnostics per validation run).
 */
export class IssueCollector {
  private readonly issues: ValidationIssue[] = [];

  field<T>(result: { ok: true; value: T } | { ok: false; error: readonly ValidationIssue[] }, fallback: T): T {
    if (result.ok) {
      return result.value;
    }
    this.issues.push(...result.error);
    return fallback;
  }

  push(...items: readonly ValidationIssue[]): void {
    this.issues.push(...items);
  }

  get hasIssues(): boolean {
    return this.issues.length > 0;
  }

  all(): readonly ValidationIssue[] {
    return this.issues;
  }
}
