import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { FormDefinition, StampPaperSpec } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectBoolean,
  expectNonEmptyString,
  expectNumber,
  expectOptional,
  expectRecord,
  parseOptionalStringArray,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";

/** Portable https:// URL check (no runtime dependency on Node's URL global). */
const HTTPS_URL_PATTERN = /^https:\/\/[^\s]+\.[^\s]{2,}[^\s]*$/;

export function parseStampPaperSpec(
  value: unknown,
  path: string,
): Result<StampPaperSpec, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const required = collector.field(
    expectBoolean(record["required"], `${path}.required`),
    true,
  );
  const commonValueInr = collector.field(
    expectNumber(record["commonValueInr"], `${path}.commonValueInr`),
    0,
  );
  const validityMonths = collector.field(
    expectNumber(record["validityMonths"], `${path}.validityMonths`),
    0,
  );
  const stateVariationNote = collector.field(
    parseLocalizedText(record["stateVariationNote"], `${path}.stateVariationNote`),
    { en: "" },
  );

  if (commonValueInr <= 0) {
    collector.push({
      path: `${path}.commonValueInr`,
      message: "must be a positive rupee amount",
      severity: "error",
    });
  }
  if (validityMonths <= 0) {
    collector.push({
      path: `${path}.validityMonths`,
      message: "must be a positive number of months",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const spec: StampPaperSpec = {
    required,
    commonValueInr,
    validityMonths,
    stateVariationNote,
  };
  return ok(spec);
}

export function parseFormDefinition(
  value: unknown,
  path: string,
): Result<FormDefinition, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const name = collector.field(
    parseLocalizedText(record["name"], `${path}.name`),
    { en: "" },
  );
  const purpose = collector.field(
    parseLocalizedText(record["purpose"], `${path}.purpose`),
    { en: "" },
  );
  const stampPaper = collector.field(
    expectOptional(record["stampPaper"], `${path}.stampPaper`, parseStampPaperSpec),
    undefined,
  );
  const signatories = collector.field(
    parseLocalizedText(record["signatories"], `${path}.signatories`),
    { en: "" },
  );
  const executedBefore = collector.field(
    parseLocalizedText(record["executedBefore"], `${path}.executedBefore`),
    { en: "" },
  );
  const copies = collector.field(
    expectNumber(record["copies"], `${path}.copies`),
    1,
  );
  if (copies <= 0 || !Number.isInteger(copies)) {
    collector.push({
      path: `${path}.copies`,
      message: "must be a positive integer",
      severity: "error",
    });
  }
  const officialSourceUrl = collector.field(
    expectOptional(record["officialSourceUrl"], `${path}.officialSourceUrl`, expectNonEmptyString),
    undefined,
  );
  if (officialSourceUrl !== undefined && !HTTPS_URL_PATTERN.test(officialSourceUrl)) {
    collector.push({
      path: `${path}.officialSourceUrl`,
      message: `must be an absolute https:// URL, received "${officialSourceUrl}"`,
      severity: "error",
    });
  }
  const sourceRefs = collector.field(
    parseOptionalStringArray(record["sourceRefs"], `${path}.sourceRefs`),
    undefined,
  );

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const form: FormDefinition = {
    id,
    name,
    purpose,
    ...(stampPaper !== undefined ? { stampPaper } : {}),
    signatories,
    executedBefore,
    copies,
    ...(officialSourceUrl !== undefined ? { officialSourceUrl } : {}),
    ...(sourceRefs !== undefined ? { sourceRefs } : {}),
  };
  return ok(form);
}
