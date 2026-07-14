import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type {
  ClaimDataField,
  FormSegment,
  TemplateDefinition,
  TemplateField,
} from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectOneOf,
  expectOptional,
  expectRecord,
  expectString,
  parseArrayOf,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";

const TEMPLATE_FIELD_KINDS: readonly TemplateField["kind"][] = [
  "staticText",
  "blankLine",
  "checkboxRow",
  "richParagraph",
];

const FORM_SEGMENT_KINDS = ["text", "blank"] as const;
const FORM_SEGMENT_COMPUTED_VALUES = ["schemeName"] as const;

/**
 * Milestone 16 — validates a `richParagraph` template field's `segments`:
 * the same flowing text/blank shape `OfficialFormBody` uses for Tier A
 * forms (see `claim-data.ts`'s `FormSegment`), reused here for Tier B
 * documents whose real specimen wording is a paragraph rather than a list
 * of label:value rows. `claimDataField` isn't cross-checked against the
 * `ClaimDataField` union here (that's a compile-time guarantee from the
 * authored TS data, not a hand-authored-JSON concern this validator
 * exists for) — only structural shape is checked, same as `blankLine`'s
 * `claimDataField` above.
 */
function parseFormSegment(
  value: unknown,
  path: string,
): Result<FormSegment, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const kind = collector.field(
    expectOneOf(record["kind"], FORM_SEGMENT_KINDS, `${path}.kind`),
    "text" as (typeof FORM_SEGMENT_KINDS)[number],
  );

  if (kind === "text") {
    const text = collector.field(expectString(record["text"], `${path}.text`), "");
    if (collector.hasIssues) {
      return err(collector.all());
    }
    return ok({ kind: "text", text });
  }

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const computed = collector.field(
    expectOptional(record["computed"], `${path}.computed`, (v, p) =>
      expectOneOf(v, FORM_SEGMENT_COMPUTED_VALUES, p),
    ),
    undefined,
  );
  if (collector.hasIssues) {
    return err(collector.all());
  }
  return ok({
    kind: "blank",
    id,
    // `claimDataField` is a closed compile-time union authored directly in
    // the TS data files — trusted as-is, same as `blankLine.claimDataField`.
    ...(record["claimDataField"] !== undefined
      ? { claimDataField: record["claimDataField"] as ClaimDataField }
      : {}),
    ...(computed !== undefined ? { computed } : {}),
  });
}

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
  const segments = collector.field(
    expectOptional(record["segments"], `${path}.segments`, (v, p) =>
      parseArrayOf(v, p, parseFormSegment),
    ),
    undefined,
  );

  if (kind === "staticText" && text === undefined) {
    collector.push({
      path: `${path}.text`,
      message: "\"staticText\" fields must provide the text to print",
      severity: "error",
    });
  }
  if (kind === "richParagraph" && (segments === undefined || segments.length === 0)) {
    collector.push({
      path: `${path}.segments`,
      message: "\"richParagraph\" fields must provide at least one segment",
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
    ...(segments !== undefined ? { segments } : {}),
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
