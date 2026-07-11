import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { RouteKind, RouteRule } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectNonEmptyString,
  expectNumber,
  expectOneOf,
  expectOptional,
  expectRecord,
  parseOptionalStringArray,
} from "./primitives.js";
import { parseLocalizedText } from "./locale.schema.js";
import { parseCondition } from "./condition.schema.js";

const ROUTE_KINDS: readonly RouteKind[] = ["route", "card", "reroute"];

export function parseRouteRule(
  value: unknown,
  path: string,
): Result<RouteRule, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const id = collector.field(expectNonEmptyString(record["id"], `${path}.id`), "");
  const priority = collector.field(
    expectNumber(record["priority"], `${path}.priority`),
    0,
  );
  const when = collector.field(
    parseCondition(record["when"], `${path}.when`),
    { and: [] },
  );
  const kind = collector.field(
    expectOneOf(record["kind"], ROUTE_KINDS, `${path}.kind`),
    "route" as RouteKind,
  );
  const target = collector.field(
    expectNonEmptyString(record["target"], `${path}.target`),
    "",
  );
  const banner = collector.field(
    expectOptional(record["banner"], `${path}.banner`, parseLocalizedText),
    undefined,
  );
  const handbookRef = collector.field(
    expectNonEmptyString(record["handbookRef"], `${path}.handbookRef`),
    "",
  );
  const nvRef = collector.field(
    expectOptional(record["nvRef"], `${path}.nvRef`, expectNonEmptyString),
    undefined,
  );
  const sourceRefs = collector.field(
    parseOptionalStringArray(record["sourceRefs"], `${path}.sourceRefs`),
    undefined,
  );

  if (kind === "reroute" && banner === undefined) {
    collector.push({
      path: `${path}.banner`,
      message:
        "reroute routes must declare a banner (V2 R-14: contradictions reroute with an explanation, never a silent jump)",
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const route: RouteRule = {
    id,
    priority,
    when,
    kind,
    target,
    ...(banner !== undefined ? { banner } : {}),
    handbookRef,
    ...(nvRef !== undefined ? { nvRef } : {}),
    ...(sourceRefs !== undefined ? { sourceRefs } : {}),
  };
  return ok(route);
}
