import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { DocumentDefinition } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectBoolean,
  expectNonEmptyString,
  expectNumber,
  expectOneOf,
  expectRecord,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";

const DOCUMENT_CATEGORIES: readonly DocumentDefinition["category"][] = [
  "core",
  "identity",
  "legal",
  "witness",
  "exception",
];

export function parseDocumentDefinition(
  value: unknown,
  path: string,
): Result<DocumentDefinition, readonly ValidationIssue[]> {
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
  const detail = collector.field(
    parseLocalizedText(record["detail"], `${path}.detail`),
    { en: "" },
  );
  const category = collector.field(
    expectOneOf(record["category"], DOCUMENT_CATEGORIES, `${path}.category`),
    "core" as DocumentDefinition["category"],
  );
  const originalRequired = collector.field(
    expectBoolean(record["originalRequired"], `${path}.originalRequired`),
    false,
  );
  const copiesRequired = collector.field(
    expectNumber(record["copiesRequired"], `${path}.copiesRequired`),
    0,
  );
  if (copiesRequired < 0 || !Number.isInteger(copiesRequired)) {
    collector.push({
      path: `${path}.copiesRequired`,
      message: "must be a non-negative integer",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const doc: DocumentDefinition = {
    id,
    name,
    detail,
    category,
    originalRequired,
    copiesRequired,
  };
  return ok(doc);
}
