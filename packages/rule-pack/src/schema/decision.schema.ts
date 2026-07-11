import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type {
  CompetentAuthority,
  DecisionRecord,
  OfficialReference,
} from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectNumber,
  expectOptional,
  expectRecord,
  parseArrayOf,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";

/** CS-ID shape, e.g. "CS-NON-003" or "CS-SCH-005". */
const CS_ID_PATTERN = /^CS-[A-Z]{3}-\d{3}$/;

export function parseOfficialReference(
  value: unknown,
  path: string,
): Result<OfficialReference, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const csId = collector.field(
    expectNonEmptyString(record["csId"], `${path}.csId`),
    "",
  );
  if (csId.length > 0 && !CS_ID_PATTERN.test(csId)) {
    collector.push({
      path: `${path}.csId`,
      message: `must match "CS-XXX-000" (Rule Book CS-ID), received "${csId}"`,
      severity: "error",
    });
  }
  const citation = collector.field(
    parseLocalizedText(record["citation"], `${path}.citation`),
    { en: "" },
  );

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const ref: OfficialReference = { csId, citation };
  return ok(ref);
}

export function parseCompetentAuthority(
  value: unknown,
  path: string,
): Result<CompetentAuthority, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const authorityLabel = collector.field(
    parseLocalizedText(record["authorityLabel"], `${path}.authorityLabel`),
    { en: "" },
  );
  const monetaryLimitInr = collector.field(
    expectOptional(record["monetaryLimitInr"], `${path}.monetaryLimitInr`, expectNumber),
    undefined,
  );
  const timelineWorkingDays = collector.field(
    expectOptional(
      record["timelineWorkingDays"],
      `${path}.timelineWorkingDays`,
      expectNumber,
    ),
    undefined,
  );
  const escalatesTo = collector.field(
    expectOptional(record["escalatesTo"], `${path}.escalatesTo`, parseLocalizedText),
    undefined,
  );

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const authority: CompetentAuthority = {
    authorityLabel,
    ...(monetaryLimitInr !== undefined ? { monetaryLimitInr } : {}),
    ...(timelineWorkingDays !== undefined ? { timelineWorkingDays } : {}),
    ...(escalatesTo !== undefined ? { escalatesTo } : {}),
  };
  return ok(authority);
}

export function parseDecisionRecord(
  value: unknown,
  path: string,
): Result<DecisionRecord, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const routeId = collector.field(
    expectNonEmptyString(record["routeId"], `${path}.routeId`),
    "",
  );
  const decision = collector.field(
    parseLocalizedText(record["decision"], `${path}.decision`),
    { en: "" },
  );
  const reason = collector.field(
    parseLocalizedText(record["reason"], `${path}.reason`),
    { en: "" },
  );
  const competentAuthority = collector.field(
    parseArrayOf(
      record["competentAuthority"],
      `${path}.competentAuthority`,
      parseCompetentAuthority,
    ),
    [],
  );
  const officialReferences = collector.field(
    parseArrayOf(
      record["officialReferences"],
      `${path}.officialReferences`,
      parseOfficialReference,
    ),
    [],
  );
  const rulebookRefs = collector.field(
    parseArrayOf(record["rulebookRefs"], `${path}.rulebookRefs`, expectNonEmptyString),
    [],
  );

  if (competentAuthority.length === 0) {
    collector.push({
      path: `${path}.competentAuthority`,
      message: "every decision must name at least one competent authority",
      severity: "error",
    });
  }
  if (officialReferences.length === 0) {
    collector.push({
      path: `${path}.officialReferences`,
      message: "every decision must cite at least one official reference",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const record_: DecisionRecord = {
    id,
    routeId,
    decision,
    reason,
    competentAuthority,
    officialReferences,
    rulebookRefs,
  };
  return ok(record_);
}
