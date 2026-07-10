import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { Condition, ConditionValue, Operand, VarRef } from "@claimsahayak/shared-types";
import { issue, IssueCollector, type ValidationIssue } from "./issue.js";
import { expectArray, expectRecord, isRecord } from "./primitives.js";

/**
 * Parses one node of the restricted condition language: and / or / not /
 * == / in / >= / var. The union is closed — any other key is rejected, which
 * is what keeps the language statically validatable and terminating (there
 * is no recursion through anything but these six operators).
 */
export function parseCondition(
  value: unknown,
  path: string,
): Result<Condition, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const keys = Object.keys(record);
  if (keys.length !== 1) {
    return err([
      issue(
        path,
        `expected exactly one operator key (and/or/not/==/in/>=), received [${keys.join(", ")}]`,
      ),
    ]);
  }
  const key = keys[0];
  switch (key) {
    case "and":
    case "or":
      return parseConditionList(record[key], `${path}.${key}`, key);
    case "not":
      return parseNot(record[key], `${path}.not`);
    case "==":
      return parseBinaryOperandPair(record[key], `${path}.==`, "==");
    case ">=":
      return parseBinaryOperandPair(record[key], `${path}.>=`, ">=");
    case "in":
      return parseIn(record[key], `${path}.in`);
    default:
      return err([
        issue(
          path,
          `unsupported condition operator "${key ?? "?"}" — only and/or/not/==/in/>= are permitted`,
        ),
      ]);
  }
}

function parseConditionList(
  value: unknown,
  path: string,
  operator: "and" | "or",
): Result<Condition, readonly ValidationIssue[]> {
  const arrayResult = expectArray(value, path);
  if (!arrayResult.ok) {
    return arrayResult;
  }
  const out: Condition[] = [];
  const issues: ValidationIssue[] = [];
  arrayResult.value.forEach((item, index) => {
    const result = parseCondition(item, `${path}[${String(index)}]`);
    if (result.ok) {
      out.push(result.value);
    } else {
      issues.push(...result.error);
    }
  });
  if (issues.length > 0) {
    return err(issues);
  }
  return ok(operator === "and" ? { and: out } : { or: out });
}

function parseNot(
  value: unknown,
  path: string,
): Result<Condition, readonly ValidationIssue[]> {
  const inner = parseCondition(value, path);
  if (!inner.ok) {
    return inner;
  }
  return ok({ not: inner.value });
}

function parseOperand(
  value: unknown,
  path: string,
): Result<Operand, readonly ValidationIssue[]> {
  if (isRecord(value)) {
    return parseVarRef(value, path);
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return ok(value);
  }
  return err([
    issue(
      path,
      `expected a { var } reference or a string/number/boolean literal, received ${typeof value}`,
    ),
  ]);
}

function parseVarRef(
  record: Record<string, unknown>,
  path: string,
): Result<VarRef, readonly ValidationIssue[]> {
  const raw = record["var"];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return err([issue(`${path}.var`, "expected a non-empty variable-path string")]);
  }
  return ok({ var: raw });
}

function parseBinaryOperandPair(
  value: unknown,
  path: string,
  operatorLabel: "==" | ">=",
): Result<Condition, readonly ValidationIssue[]> {
  const arrayResult = expectArray(value, path);
  if (!arrayResult.ok) {
    return arrayResult;
  }
  if (arrayResult.value.length !== 2) {
    return err([
      issue(path, `"${operatorLabel}" requires exactly a [left, right] pair`),
    ]);
  }
  const collector = new IssueCollector();
  const left = collector.field(
    parseOperand(arrayResult.value[0], `${path}[0]`),
    "" as Operand,
  );
  const right = collector.field(
    parseOperand(arrayResult.value[1], `${path}[1]`),
    "" as Operand,
  );
  if (collector.hasIssues) {
    return err(collector.all());
  }
  return ok(
    operatorLabel === "=="
      ? { "==": [left, right] }
      : { ">=": [left, right] },
  );
}

function parseIn(
  value: unknown,
  path: string,
): Result<Condition, readonly ValidationIssue[]> {
  const arrayResult = expectArray(value, path);
  if (!arrayResult.ok) {
    return arrayResult;
  }
  if (arrayResult.value.length !== 2) {
    return err([issue(path, '"in" requires exactly a [needle, haystack] pair')]);
  }
  const collector = new IssueCollector();
  const needle = collector.field(
    parseOperand(arrayResult.value[0], `${path}[0]`),
    "" as Operand,
  );
  const haystackResult = expectArray(arrayResult.value[1], `${path}[1]`);
  const haystack = collector.field(
    haystackResult.ok
      ? parseConditionValueArray(haystackResult.value, `${path}[1]`)
      : haystackResult,
    [] as readonly ConditionValue[],
  );
  if (collector.hasIssues) {
    return err(collector.all());
  }
  return ok({ in: [needle, haystack] });
}

function parseConditionValueArray(
  values: readonly unknown[],
  path: string,
): Result<readonly ConditionValue[], readonly ValidationIssue[]> {
  const out: ConditionValue[] = [];
  const issues: ValidationIssue[] = [];
  values.forEach((v, index) => {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out.push(v);
    } else {
      issues.push(
        issue(`${path}[${String(index)}]`, "expected a string, number, or boolean literal"),
      );
    }
  });
  return issues.length > 0 ? err(issues) : ok(out);
}

/**
 * Collects every `{ var: "..." }` path referenced anywhere inside a
 * condition tree. Used by the reachability validator (validate/reachability.ts)
 * to confirm every referenced answer/derived-value/constant actually exists
 * in the pack, and to enumerate a condition's free variables for the
 * validation-only satisfiability check.
 */
export function collectVarRefs(condition: Condition): readonly string[] {
  const out: string[] = [];
  const visitOperand = (operand: Operand): void => {
    if (typeof operand === "object" && operand !== null && "var" in operand) {
      out.push(operand.var);
    }
  };
  const visit = (node: Condition): void => {
    if ("and" in node) {
      node.and.forEach(visit);
    } else if ("or" in node) {
      node.or.forEach(visit);
    } else if ("not" in node) {
      visit(node.not);
    } else if ("==" in node) {
      node["=="].forEach(visitOperand);
    } else if (">=" in node) {
      node[">="].forEach(visitOperand);
    } else if ("in" in node) {
      visitOperand(node.in[0]);
    }
  };
  visit(condition);
  return out;
}
