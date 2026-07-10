import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { TemplateDefinition, TemplateField } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectOneOf,
  expectOptional,
  expectRecord,
  parseArrayOf,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";

const TEMPLATE_FIELD_KINDS: readonly TemplateField["kind"][] = [
  "staticText",
  "blankLine",
  "checkboxRow",
];

export function parseTemplateField(
  value: unknown,
  path: string,
): Result<TemplateField, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const label = collector.field(
    parseLocalizedText(record["label"], `${path}.label`),
    { en: "" },
  );
  const kind = collector.field(
    expectOneOf(record["kind"], TEMPLATE_FIELD_KINDS, `${path}.kind`),
    "blankLine" as TemplateField["kind"],
  );
  const text = collector.field(
    expectOptional(record["text"], `${path}.text`, parseLocalizedText),
    undefined,
  );

  if (kind === "staticText" && text === undefined) {
    collector.push({
      path: `${path}.text`,
      message: "\"staticText\" fields must provide the text to print",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const field: TemplateField = {
    id,
    label,
    kind,
    ...(text !== undefined ? { text } : {}),
  };
  return ok(field);
}

export function parseTemplateDefinition(
  value: unknown,
  path: string,
): Result<TemplateDefinition, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const title = collector.field(
    parseLocalizedText(record["title"], `${path}.title`),
    { en: "" },
  );
  const fields = collector.field(
    parseArrayOf(record["fields"], `${path}.fields`, parseTemplateField),
    [],
  );
  const handbookRef = collector.field(
    expectNonEmptyString(record["handbookRef"], `${path}.handbookRef`),
    "",
  );

  if (fields.length === 0) {
    collector.push({
      path: `${path}.fields`,
      message: "a printable template must declare at least one field",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const template: TemplateDefinition = { id, title, fields, handbookRef };
  return ok(template);
}
