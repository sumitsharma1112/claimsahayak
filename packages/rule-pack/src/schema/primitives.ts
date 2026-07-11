import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import { issue, type ValidationIssue } from "./issue.js";

export function describeType(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function expectRecord(
  value: unknown,
  path: string,
): Result<Record<string, unknown>, readonly ValidationIssue[]> {
  if (!isRecord(value)) {
    return err([
      issue(path, `expected an object, received ${describeType(value)}`),
    ]);
  }
  return ok(value);
}

export function expectArray(
  value: unknown,
  path: string,
): Result<readonly unknown[], readonly ValidationIssue[]> {
  if (!Array.isArray(value)) {
    return err([
      issue(path, `expected an array, received ${describeType(value)}`),
    ]);
  }
  return ok(value);
}

export function expectString(
  value: unknown,
  path: string,
): Result<string, readonly ValidationIssue[]> {
  if (typeof value !== "string") {
    return err([
      issue(path, `expected a string, received ${describeType(value)}`),
    ]);
  }
  return ok(value);
}

export function expectNonEmptyString(
  value: unknown,
  path: string,
): Result<string, readonly ValidationIssue[]> {
  const stringResult = expectString(value, path);
  if (!stringResult.ok) {
    return stringResult;
  }
  if (stringResult.value.trim().length === 0) {
    return err([issue(path, "expected a non-empty string")]);
  }
  return ok(stringResult.value);
}

export function expectNumber(
  value: unknown,
  path: string,
): Result<number, readonly ValidationIssue[]> {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return err([
      issue(path, `expected a finite number, received ${describeType(value)}`),
    ]);
  }
  return ok(value);
}

export function expectBoolean(
  value: unknown,
  path: string,
): Result<boolean, readonly ValidationIssue[]> {
  if (typeof value !== "boolean") {
    return err([
      issue(path, `expected a boolean, received ${describeType(value)}`),
    ]);
  }
  return ok(value);
}

export function expectOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
): Result<T, readonly ValidationIssue[]> {
  const stringResult = expectString(value, path);
  if (!stringResult.ok) {
    return stringResult;
  }
  if (!(allowed as readonly string[]).includes(stringResult.value)) {
    return err([
      issue(
        path,
        `expected one of [${allowed.join(", ")}], received "${stringResult.value}"`,
      ),
    ]);
  }
  return ok(stringResult.value as T);
}

export function expectOptional<T>(
  value: unknown,
  path: string,
  parse: (v: unknown, p: string) => Result<T, readonly ValidationIssue[]>,
): Result<T | undefined, readonly ValidationIssue[]> {
  if (value === undefined) {
    return ok(undefined);
  }
  return parse(value, path);
}

/**
 * Parses every element of an array with the same item parser, accumulating
 * issues across ALL elements (rather than stopping at the first bad one) so
 * a single validation run surfaces every problem in the pack at once.
 */
export function parseArrayOf<T>(
  value: unknown,
  path: string,
  parseItem: (
    item: unknown,
    itemPath: string,
  ) => Result<T, readonly ValidationIssue[]>,
): Result<readonly T[], readonly ValidationIssue[]> {
  const arrayResult = expectArray(value, path);
  if (!arrayResult.ok) {
    return arrayResult;
  }
  const out: T[] = [];
  const issues: ValidationIssue[] = [];
  arrayResult.value.forEach((item, index) => {
    const result = parseItem(item, `${path}[${String(index)}]`);
    if (result.ok) {
      out.push(result.value);
    } else {
      issues.push(...result.error);
    }
  });
  if (issues.length > 0) {
    return err(issues);
  }
  return ok(out);
}

/**
 * Parses an optional array of non-empty strings — the shape of every
 * `sourceRefs?: readonly string[]` field added for the ClaimSahayak
 * Official Rule Book v1.0 integration (CS-IDs). Absent ⇒ undefined, never
 * an empty array, so downstream code can treat "no sourceRefs" and "opted
 * out of Rule Book provenance" identically.
 */
export function parseOptionalStringArray(
  value: unknown,
  path: string,
): Result<readonly string[] | undefined, readonly ValidationIssue[]> {
  return expectOptional(value, path, (v, p) => parseArrayOf(v, p, expectNonEmptyString));
}

/** Fails if an array (by id-extractor) contains duplicate ids. */
export function checkNoDuplicateIds<T>(
  items: readonly T[],
  getId: (item: T) => string,
  path: string,
): readonly ValidationIssue[] {
  const seen = new Map<string, number>();
  const issues: ValidationIssue[] = [];
  items.forEach((item, index) => {
    const id = getId(item);
    const firstIndex = seen.get(id);
    if (firstIndex !== undefined) {
      issues.push(
        issue(
          `${path}[${String(index)}].id`,
          `duplicate id "${id}" (first declared at ${path}[${String(firstIndex)}])`,
        ),
      );
    } else {
      seen.set(id, index);
    }
  });
  return issues;
}
