import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import { RULE_PACK_VERSION_PATTERN } from "@claimsahayak/shared-config";
import type { RulePackMeta } from "@claimsahayak/shared-types";
import { issue, IssueCollector, type ValidationIssue } from "./issue.js";
import { expectNonEmptyString, expectOptional, expectRecord } from "./primitives.js";

const ENGINE_MIN_PATTERN = /^\d+\.\d+$/;
/** Matches a lower-case hex SHA-256 digest (64 characters). */
const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;

export function parseRulePackMeta(
  value: unknown,
  path: string,
): Result<RulePackMeta, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const version = collector.field(
    expectNonEmptyString(record["version"], `${path}.version`),
    "0.0.0",
  );
  if (!RULE_PACK_VERSION_PATTERN.test(version)) {
    collector.push(
      issue(
        `${path}.version`,
        `must match YYYY.MM.patch (e.g. "2026.07.0"), received "${version}"`,
      ),
    );
  }

  const engineMin = collector.field(
    expectNonEmptyString(record["engineMin"], `${path}.engineMin`),
    "0.0",
  );
  if (!ENGINE_MIN_PATTERN.test(engineMin)) {
    collector.push(
      issue(`${path}.engineMin`, `must be "major.minor" (e.g. "1.0"), received "${engineMin}"`),
    );
  }

  const publishedAt = collector.field(
    expectNonEmptyString(record["publishedAt"], `${path}.publishedAt`),
    "1970-01-01T00:00:00.000Z",
  );
  if (Number.isNaN(Date.parse(publishedAt))) {
    collector.push(issue(`${path}.publishedAt`, "must be a parseable ISO 8601 timestamp"));
  }

  const publishedBy = collector.field(
    expectNonEmptyString(record["publishedBy"], `${path}.publishedBy`),
    "unknown-role",
  );
  // V3 §3.2: the published artifact records a ROLE, never a personal identity.
  if (/@|\s/.test(publishedBy)) {
    collector.push(
      issue(
        `${path}.publishedBy`,
        "must be a role identifier (e.g. \"publisher\"), not an email address or free-text name",
      ),
    );
  }

  const changelog = collector.field(
    expectNonEmptyString(record["changelog"], `${path}.changelog`),
    "",
  );

  const contentHash = collector.field(
    expectNonEmptyString(record["contentHash"], `${path}.contentHash`),
    "0".repeat(64),
  );
  if (!SHA256_HEX_PATTERN.test(contentHash)) {
    collector.push(
      issue(`${path}.contentHash`, "must be a 64-character lower-case hex SHA-256 digest"),
    );
  }

  const rulebookVersion = collector.field(
    expectOptional(record["rulebookVersion"], `${path}.rulebookVersion`, expectNonEmptyString),
    undefined,
  );
  const rulebookAsOnDate = collector.field(
    expectOptional(record["rulebookAsOnDate"], `${path}.rulebookAsOnDate`, expectNonEmptyString),
    undefined,
  );
  if (rulebookAsOnDate !== undefined && Number.isNaN(Date.parse(rulebookAsOnDate))) {
    collector.push(issue(`${path}.rulebookAsOnDate`, "must be a parseable ISO date"));
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const meta: RulePackMeta = {
    version,
    engineMin,
    publishedAt,
    publishedBy,
    changelog,
    contentHash,
    ...(rulebookVersion !== undefined ? { rulebookVersion } : {}),
    ...(rulebookAsOnDate !== undefined ? { rulebookAsOnDate } : {}),
  };
  return ok(meta);
}
