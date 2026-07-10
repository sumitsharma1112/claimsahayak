import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { RulePackConstants } from "@claimsahayak/shared-types";
import { issue, IssueCollector, type ValidationIssue } from "./issue.js";
import { expectNumber, expectRecord } from "./primitives.js";

/**
 * The mandatory constants named in V3 §2.2/§2.3 and the Roadmap (Master
 * Prompt 2 item 2). Any additional SB-Order-driven threshold a future pack
 * revision needs is still validated: every remaining key must be a finite
 * number (RulePackConstants' index signature), so a typo'd or non-numeric
 * extra constant fails validation instead of silently authoring a string
 * threshold that would break arithmetic comparisons downstream.
 */
const REQUIRED_CONSTANT_KEYS = [
  "AFFIDAVIT_LIMIT_INR",
  "NO_NOMINATION_WAIT_MONTHS",
  "FREEZE_YEARS",
] as const;

export function parseRulePackConstants(
  value: unknown,
  path: string,
): Result<RulePackConstants, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();
  const out: Record<string, number> = {};

  for (const key of REQUIRED_CONSTANT_KEYS) {
    out[key] = collector.field(
      expectNumber(record[key], `${path}.${key}`),
      0,
    );
  }
  for (const [key, rawValue] of Object.entries(record)) {
    if ((REQUIRED_CONSTANT_KEYS as readonly string[]).includes(key)) {
      continue;
    }
    out[key] = collector.field(expectNumber(rawValue, `${path}.${key}`), 0);
  }

  if (out["AFFIDAVIT_LIMIT_INR"] !== undefined && out["AFFIDAVIT_LIMIT_INR"] <= 0) {
    collector.push(
      issue(`${path}.AFFIDAVIT_LIMIT_INR`, "must be a positive amount in rupees"),
    );
  }
  if (
    out["NO_NOMINATION_WAIT_MONTHS"] !== undefined &&
    out["NO_NOMINATION_WAIT_MONTHS"] < 0
  ) {
    collector.push(
      issue(`${path}.NO_NOMINATION_WAIT_MONTHS`, "must not be negative"),
    );
  }
  if (out["FREEZE_YEARS"] !== undefined && out["FREEZE_YEARS"] <= 0) {
    collector.push(issue(`${path}.FREEZE_YEARS`, "must be a positive number of years"));
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  return ok(out as unknown as RulePackConstants);
}
