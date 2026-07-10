import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { ContentPage, VocabEntry } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectOneOf,
  expectOptional,
  expectRecord,
  parseArrayOf,
} from "./primitives.js";
import { parseLocalizedText, parsePortableTextBlock } from "./locale.schema.js";

const CONTENT_TIERS: readonly ContentPage["tier"][] = [
  "learn",
  "fix",
  "claims",
  "faq",
  "glossary",
];

/** Slugs are used as URL path segments — keep them URL-safe. */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function parseContentPage(
  value: unknown,
  path: string,
): Result<ContentPage, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const tier = collector.field(
    expectOneOf(record["tier"], CONTENT_TIERS, `${path}.tier`),
    "learn" as ContentPage["tier"],
  );
  const slug = collector.field(expectNonEmptyString(record["slug"], `${path}.slug`), "");
  if (slug.length > 0 && !SLUG_PATTERN.test(slug)) {
    collector.push({
      path: `${path}.slug`,
      message: `must be a lower-case, hyphen-separated URL slug, received "${slug}"`,
      severity: "error",
    });
  }
  const title = collector.field(
    parseLocalizedText(record["title"], `${path}.title`),
    { en: "" },
  );
  const summary = collector.field(
    parseLocalizedText(record["summary"], `${path}.summary`),
    { en: "" },
  );
  const blocks = collector.field(
    parseArrayOf(record["blocks"], `${path}.blocks`, parsePortableTextBlock),
    [],
  );
  const handbookRef = collector.field(
    expectOptional(record["handbookRef"], `${path}.handbookRef`, expectNonEmptyString),
    undefined,
  );
  const lastReviewed = collector.field(
    expectNonEmptyString(record["lastReviewed"], `${path}.lastReviewed`),
    "1970-01-01",
  );
  if (Number.isNaN(Date.parse(lastReviewed))) {
    collector.push({
      path: `${path}.lastReviewed`,
      message: "must be a parseable date (YYYY-MM-DD)",
      severity: "error",
    });
  }

  if (blocks.length === 0) {
    collector.push({
      path: `${path}.blocks`,
      message: "a content page must have at least one body block",
      severity: "error",
    });
  }
  // V2 R-22 / child-safety-adjacent legal caution: pages that discuss legal
  // heirs or court routes must be citable to the handbook, never invented.
  if ((tier === "learn" || tier === "faq") && handbookRef === undefined) {
    collector.push({
      path: `${path}.handbookRef`,
      message:
        "learn/faq pages should cite a handbook section; omit only for purely navigational pages",
      severity: "warning",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const page: ContentPage = {
    id,
    tier,
    slug,
    title,
    summary,
    blocks,
    ...(handbookRef !== undefined ? { handbookRef } : {}),
    lastReviewed,
  };
  return ok(page);
}

export function parseVocabEntry(
  value: unknown,
  path: string,
): Result<VocabEntry, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const forbidden = collector.field(
    expectNonEmptyString(record["forbidden"], `${path}.forbidden`),
    "",
  );
  const preferred = collector.field(
    parseLocalizedText(record["preferred"], `${path}.preferred`),
    { en: "" },
  );

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const entry: VocabEntry = { forbidden, preferred };
  return ok(entry);
}
