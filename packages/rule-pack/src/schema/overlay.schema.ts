import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { OverlayRule } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectRecord,
  parseArrayOf,
  parseOptionalStringArray,
} from "./primitives.js";
import { parseOutputRule } from "./output.schema.js";

/** Slugs are used as URL path segments under /fix — keep them URL-safe. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function parseOverlayRule(
  value: unknown,
  path: string,
): Result<OverlayRule, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const flagId = collector.field(
    expectNonEmptyString(record["flagId"], `${path}.flagId`),
    "",
  );
  const items = collector.field(
    parseArrayOf(record["items"], `${path}.items`, parseOutputRule),
    [],
  );
  const fixSlug = collector.field(
    expectNonEmptyString(record["fixSlug"], `${path}.fixSlug`),
    "",
  );
  if (fixSlug.length > 0 && !SLUG_PATTERN.test(fixSlug)) {
    collector.push({
      path: `${path}.fixSlug`,
      message: `must be a lower-case, hyphen-separated URL slug, received "${fixSlug}"`,
      severity: "error",
    });
  }
  const handbookRef = collector.field(
    expectNonEmptyString(record["handbookRef"], `${path}.handbookRef`),
    "",
  );
  const sourceRefs = collector.field(
    parseOptionalStringArray(record["sourceRefs"], `${path}.sourceRefs`),
    undefined,
  );

  if (items.length === 0) {
    collector.push({
      path: `${path}.items`,
      message: "an overlay with no items adds nothing to the checklist — remove it or add items",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const overlay: OverlayRule = {
    flagId,
    items,
    fixSlug,
    handbookRef,
    ...(sourceRefs !== undefined ? { sourceRefs } : {}),
  };
  return ok(overlay);
}
