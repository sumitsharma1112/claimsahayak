import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type {
  QuestionDefinition,
  QuestionInputType,
  QuestionOption,
} from "@claimsahayak/shared-types";
import { issue, IssueCollector, type ValidationIssue } from "./issue.js";
import {
  checkNoDuplicateIds,
  expectBoolean,
  expectNonEmptyString,
  expectOneOf,
  expectOptional,
  expectRecord,
  parseArrayOf,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";
import { ALWAYS, type Condition } from "@claimsahayak/shared-types";
import { parseCondition } from "./condition.schema.js";

const QUESTION_INPUT_TYPES: readonly QuestionInputType[] = [
  "single",
  "multi",
  "boolean",
  "monthYear",
];

export function parseQuestionOption(
  value: unknown,
  path: string,
): Result<QuestionOption, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(
    expectNonEmptyString(record["id"], `${path}.id`),
    "",
  );
  const label = collector.field(
    parseLocalizedText(record["label"], `${path}.label`),
    { en: "" },
  );
  const help = collector.field(
    expectOptional(record["help"], `${path}.help`, parseLocalizedText),
    undefined,
  );
  const exclusive = collector.field(
    expectOptional(record["exclusive"], `${path}.exclusive`, expectBoolean),
    undefined,
  );

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const option: QuestionOption = {
    id,
    label,
    ...(help !== undefined ? { help } : {}),
    ...(exclusive !== undefined ? { exclusive } : {}),
  };
  return ok(option);
}

export function parseQuestionDefinition(
  value: unknown,
  path: string,
): Result<QuestionDefinition, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const stepId = collector.field(
    expectNonEmptyString(record["stepId"], `${path}.stepId`),
    "",
  );
  const text = collector.field(
    parseLocalizedText(record["text"], `${path}.text`),
    { en: "" },
  );
  const whyStrip = collector.field(
    parseLocalizedText(record["whyStrip"], `${path}.whyStrip`),
    { en: "" },
  );
  const inputType = collector.field(
    expectOneOf(record["inputType"], QUESTION_INPUT_TYPES, `${path}.inputType`),
    "single" as QuestionInputType,
  );
  const options = collector.field(
    parseArrayOf(record["options"], `${path}.options`, parseQuestionOption),
    [] as readonly QuestionOption[],
  );
  const visibleWhen = collector.field(
    expectOptional(record["visibleWhen"], `${path}.visibleWhen`, parseCondition),
    ALWAYS,
  ) as Condition;
  const invalidates = collector.field(
    parseArrayOf(record["invalidates"], `${path}.invalidates`, expectNonEmptyString),
    [] as readonly string[],
  );
  const handbookRef = collector.field(
    expectNonEmptyString(record["handbookRef"], `${path}.handbookRef`),
    "",
  );

  if (inputType !== "monthYear" && options.length === 0) {
    collector.push(
      issue(`${path}.options`, `"${inputType}" questions require at least one option`),
    );
  }
  if (inputType === "monthYear" && options.length > 0) {
    collector.push(
      issue(`${path}.options`, "monthYear questions must not declare options"),
    );
  }
  collector.push(...checkNoDuplicateIds(options, (o) => o.id, `${path}.options`));

  const exclusiveCount = options.filter((o) => o.exclusive === true).length;
  if (exclusiveCount > 1) {
    collector.push(
      issue(`${path}.options`, "at most one option may be marked exclusive (e.g. \"none of these\")"),
    );
  }
  if (exclusiveCount > 0 && inputType !== "multi") {
    collector.push(
      issue(
        `${path}.options`,
        "\"exclusive\" only makes sense on a \"multi\" question",
      ),
    );
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const question: QuestionDefinition = {
    id,
    stepId,
    text,
    whyStrip,
    inputType,
    options,
    visibleWhen,
    invalidates,
    handbookRef,
  };
  return ok(question);
}
