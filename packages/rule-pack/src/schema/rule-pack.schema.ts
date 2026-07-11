import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import type { RulePack } from "@claimsahayak/shared-types";
import { IssueCollector, type ValidationIssue } from "./issue.js";
import {
  checkNoDuplicateIds,
  expectOptional,
  expectRecord,
  parseArrayOf,
} from "./primitives.js";
import { parseRulePackMeta } from "./meta.schema.js";
import { parseRulePackConstants } from "./constants.schema.js";
import { parseSchemeDefinition } from "./scheme.schema.js";
import { parseQuestionDefinition } from "./question.schema.js";
import { parseRouteRule } from "./route.schema.js";
import { parseOutputRule } from "./output.schema.js";
import { parseOverlayRule } from "./overlay.schema.js";
import { parseDocumentDefinition } from "./document.schema.js";
import { parseFormDefinition } from "./form.schema.js";
import { parseCardDefinition } from "./card.schema.js";
import { parseTemplateDefinition } from "./template.schema.js";
import { parseContentPage, parseVocabEntry } from "./content.schema.js";
import { parseDecisionRecord } from "./decision.schema.js";

/**
 * Parses and structurally validates a full Rule Pack from unknown JSON.
 * This is "schema validation" only (V3 §2.5 gate 1 of 7) — it guarantees
 * every field has the right shape and every entity-local invariant holds
 * (e.g. a card has a nextPhysicalStep, a route has a handbookRef). It does
 * NOT check cross-references between sections (reachability, orphans,
 * provenance completeness pack-wide, locale parity, copy lint, or the
 * truth table) — those live in ../validate and are run in sequence by the
 * CLI (validate-pack) after this parse succeeds.
 */
export function parseRulePack(
  value: unknown,
  path = "$",
): Result<RulePack, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();

  const meta = collector.field(
    parseRulePackMeta(record["meta"], `${path}.meta`),
    {
      version: "0.0.0",
      engineMin: "0.0",
      publishedAt: "1970-01-01T00:00:00.000Z",
      publishedBy: "unknown",
      changelog: "",
      contentHash: "0".repeat(64),
    },
  );
  const constants = collector.field(
    parseRulePackConstants(record["constants"], `${path}.constants`),
    {
      AFFIDAVIT_LIMIT_INR: 1,
      NO_NOMINATION_WAIT_MONTHS: 1,
      FREEZE_YEARS: 1,
    },
  );
  const schemes = collector.field(
    parseArrayOf(record["schemes"], `${path}.schemes`, parseSchemeDefinition),
    [],
  );
  const questions = collector.field(
    parseArrayOf(record["questions"], `${path}.questions`, parseQuestionDefinition),
    [],
  );
  const routes = collector.field(
    parseArrayOf(record["routes"], `${path}.routes`, parseRouteRule),
    [],
  );
  const outputs = collector.field(
    parseArrayOf(record["outputs"], `${path}.outputs`, parseOutputRule),
    [],
  );
  const overlays = collector.field(
    parseArrayOf(record["overlays"], `${path}.overlays`, parseOverlayRule),
    [],
  );
  const documents = collector.field(
    parseArrayOf(record["documents"], `${path}.documents`, parseDocumentDefinition),
    [],
  );
  const forms = collector.field(
    parseArrayOf(record["forms"], `${path}.forms`, parseFormDefinition),
    [],
  );
  const cards = collector.field(
    parseArrayOf(record["cards"], `${path}.cards`, parseCardDefinition),
    [],
  );
  const templates = collector.field(
    parseArrayOf(record["templates"], `${path}.templates`, parseTemplateDefinition),
    [],
  );
  const content = collector.field(
    parseArrayOf(record["content"], `${path}.content`, parseContentPage),
    [],
  );
  const vocab = collector.field(
    parseArrayOf(record["vocab"], `${path}.vocab`, parseVocabEntry),
    [],
  );
  const decisions = collector.field(
    expectOptional(record["decisions"], `${path}.decisions`, (v, p) =>
      parseArrayOf(v, p, parseDecisionRecord),
    ),
    undefined,
  );

  collector.push(...checkNoDuplicateIds(schemes, (s) => s.id, `${path}.schemes`));
  collector.push(...checkNoDuplicateIds(questions, (q) => q.id, `${path}.questions`));
  collector.push(...checkNoDuplicateIds(routes, (r) => r.id, `${path}.routes`));
  collector.push(...checkNoDuplicateIds(outputs, (o) => o.id, `${path}.outputs`));
  collector.push(...checkNoDuplicateIds(overlays, (o) => o.flagId, `${path}.overlays`));
  collector.push(...checkNoDuplicateIds(documents, (d) => d.id, `${path}.documents`));
  collector.push(...checkNoDuplicateIds(forms, (f) => f.id, `${path}.forms`));
  collector.push(...checkNoDuplicateIds(cards, (c) => c.id, `${path}.cards`));
  collector.push(...checkNoDuplicateIds(templates, (t) => t.id, `${path}.templates`));
  collector.push(...checkNoDuplicateIds(content, (c) => c.id, `${path}.content`));
  if (decisions !== undefined) {
    collector.push(...checkNoDuplicateIds(decisions, (d) => d.id, `${path}.decisions`));
  }

  if (schemes.length !== 9) {
    collector.push({
      path: `${path}.schemes`,
      message: `expected exactly the 9 in-scope schemes (SRS v1 §1.3 + SCSS added under the ClaimSahayak Official Rule Book v1.0 integration), received ${String(schemes.length)}`,
      severity: "error",
    });
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }

  const pack: RulePack = {
    meta,
    constants,
    schemes,
    questions,
    routes,
    outputs,
    overlays,
    documents,
    forms,
    cards,
    templates,
    content,
    vocab,
    ...(decisions !== undefined ? { decisions } : {}),
  };
  return ok(pack);
}
