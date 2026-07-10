import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { CardDefinition, CardKind } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectOneOf,
  expectOptional,
  expectRecord,
  parseArrayOf,
} from "./primitives.js";
import { parseLocalizedText, parsePortableTextBlock } from "./locale.schema.js";

const CARD_KINDS: readonly CardKind[] = ["pause", "stop", "wait", "dual", "info"];

export function parseCardDefinition(
  value: unknown,
  path: string,
): Result<CardDefinition, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const kind = collector.field(
    expectOneOf(record["kind"], CARD_KINDS, `${path}.kind`),
    "info" as CardKind,
  );
  const title = collector.field(
    parseLocalizedText(record["title"], `${path}.title`),
    { en: "" },
  );
  const body = collector.field(
    parseArrayOf(record["body"], `${path}.body`, parsePortableTextBlock),
    [],
  );
  // No-dead-end invariant (V3 §2.5): every terminal card MUST declare a
  // next physical step. Enforced here at parse time, and re-checked
  // pack-wide by validate/no-dead-end.ts against every route that resolves
  // to a card, so a card added but never wired to a route is still caught.
  const nextPhysicalStep = collector.field(
    parseLocalizedText(record["nextPhysicalStep"], `${path}.nextPhysicalStep`),
    { en: "" },
  );
  const templateId = collector.field(
    expectOptional(record["templateId"], `${path}.templateId`, expectNonEmptyString),
    undefined,
  );

  if (body.length === 0) {
    collector.push({
      path: `${path}.body`,
      message: "a card must have at least one body block",
      severity: "error",
    });
  }
  if (nextPhysicalStep.en.trim().length === 0) {
    collector.push({
      path: `${path}.nextPhysicalStep`,
      message: "every card must state a concrete next physical step (no-dead-end invariant)",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const card: CardDefinition = {
    id,
    kind,
    title,
    body,
    nextPhysicalStep,
    ...(templateId !== undefined ? { templateId } : {}),
  };
  return ok(card);
}
