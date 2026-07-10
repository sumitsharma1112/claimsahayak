import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import { SCHEME_IDS, type SchemeDefinition, type SchemeId } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectBoolean,
  expectNumber,
  expectOneOf,
  expectOptional,
  expectRecord,
  expectString,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";

export function parseSchemeDefinition(
  value: unknown,
  path: string,
): Result<SchemeDefinition, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(
    expectOneOf(record["id"], SCHEME_IDS, `${path}.id`),
    "SB" as SchemeId,
  );
  const displayName = collector.field(
    parseLocalizedText(record["displayName"], `${path}.displayName`),
    { en: "" },
  );
  const description = collector.field(
    parseLocalizedText(record["description"], `${path}.description`),
    { en: "" },
  );
  const canBeJoint = collector.field(
    expectBoolean(record["canBeJoint"], `${path}.canBeJoint`),
    false,
  );
  const canBeMinorAccount = collector.field(
    expectBoolean(record["canBeMinorAccount"], `${path}.canBeMinorAccount`),
    false,
  );
  const continuableByClaimant = collector.field(
    expectBoolean(record["continuableByClaimant"], `${path}.continuableByClaimant`),
    false,
  );
  const bankTransferEligible = collector.field(
    expectBoolean(record["bankTransferEligible"], `${path}.bankTransferEligible`),
    false,
  );
  const illustrationId = collector.field(
    expectOptional(record["illustrationId"], `${path}.illustrationId`, expectString),
    undefined,
  );
  const sortOrder = collector.field(
    expectNumber(record["sortOrder"], `${path}.sortOrder`),
    0,
  );

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const scheme: SchemeDefinition = {
    id,
    displayName,
    description,
    canBeJoint,
    canBeMinorAccount,
    continuableByClaimant,
    bankTransferEligible,
    ...(illustrationId !== undefined ? { illustrationId } : {}),
    sortOrder,
  };
  return ok(scheme);
}
