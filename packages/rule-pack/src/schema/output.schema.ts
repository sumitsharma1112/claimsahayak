import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type {
  OutputItemAttributes,
  OutputItemType,
  OutputRule,
} from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectNumber,
  expectOneOf,
  expectOptional,
  expectRecord,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";

const OUTPUT_ITEM_TYPES: readonly OutputItemType[] = [
  "form",
  "document",
  "people",
  "instruction",
  "warning",
  "goodToKnow",
];

/**
 * The four attributes every checklist item must carry (V2 FR-5a): why it's
 * needed, whether an original or a copy is required, whether self-attestation
 * applies, and who verifies it. "instruction"/"warning"/"goodToKnow" items
 * still populate all four fields — the schema does not special-case them —
 * so the result page and PDF renderer (M5/M6) never need type-specific
 * layout logic to decide whether an attribute exists.
 */
export function parseOutputItemAttributes(
  value: unknown,
  path: string,
): Result<OutputItemAttributes, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const why = collector.field(
    parseLocalizedText(record["why"], `${path}.why`),
    { en: "" },
  );
  const originalOrCopy = collector.field(
    parseLocalizedText(record["originalOrCopy"], `${path}.originalOrCopy`),
    { en: "" },
  );
  const selfAttest = collector.field(
    parseLocalizedText(record["selfAttest"], `${path}.selfAttest`),
    { en: "" },
  );
  const verifiedBy = collector.field(
    parseLocalizedText(record["verifiedBy"], `${path}.verifiedBy`),
    { en: "" },
  );

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const attrs: OutputItemAttributes = {
    why,
    originalOrCopy,
    selfAttest,
    verifiedBy,
  };
  return ok(attrs);
}

export function parseOutputRule(
  value: unknown,
  path: string,
): Result<OutputRule, readonly ValidationIssue[]> {
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
  const itemType = collector.field(
    expectOneOf(record["itemType"], OUTPUT_ITEM_TYPES, `${path}.itemType`),
    "instruction" as OutputItemType,
  );
  const refId = collector.field(
    expectOptional(record["refId"], `${path}.refId`, expectNonEmptyString),
    undefined,
  );
  const label = collector.field(
    parseLocalizedText(record["label"], `${path}.label`),
    { en: "" },
  );
  const attrs = collector.field(
    parseOutputItemAttributes(record["attrs"], `${path}.attrs`),
    {
      why: { en: "" },
      originalOrCopy: { en: "" },
      selfAttest: { en: "" },
      verifiedBy: { en: "" },
    },
  );
  const section = collector.field(
    expectNonEmptyString(record["section"], `${path}.section`),
    "",
  );
  const sortOrder = collector.field(
    expectNumber(record["sortOrder"], `${path}.sortOrder`),
    0,
  );
  const handbookRef = collector.field(
    expectNonEmptyString(record["handbookRef"], `${path}.handbookRef`),
    "",
  );
  const nvRef = collector.field(
    expectOptional(record["nvRef"], `${path}.nvRef`, expectNonEmptyString),
    undefined,
  );

  if ((itemType === "form" || itemType === "document") && refId === undefined) {
    collector.push({
      path: `${path}.refId`,
      message: `"${itemType}" outputs must reference a documents[]/forms[] entry via refId`,
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const rule: OutputRule = {
    id,
    routeId,
    itemType,
    ...(refId !== undefined ? { refId } : {}),
    label,
    attrs,
    section,
    sortOrder,
    handbookRef,
    ...(nvRef !== undefined ? { nvRef } : {}),
  };
  return ok(rule);
}
