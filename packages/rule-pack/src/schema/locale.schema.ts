import type { Result } from "@claimsahayak/shared-utils";
import { err, ok } from "@claimsahayak/shared-utils";
import { LOCALE_CODES, type LocaleCode, type LocalizedText, type PortableTextBlock } from "@claimsahayak/shared-types";
import { issue, IssueCollector, type ValidationIssue } from "./issue.js";
import {
  expectArray,
  expectNonEmptyString,
  expectOneOf,
  expectOptional,
  expectRecord,
  isRecord,
} from "./primitives.js";

const NON_ENGLISH_LOCALES: readonly LocaleCode[] = LOCALE_CODES.filter(
  (l): l is Exclude<LocaleCode, "en"> => l !== "en",
);

/**
 * Parses a LocalizedText: mandatory `en`, optional strings for every other
 * launch locale (V3 §2.5 locale-parity is a SEPARATE, pack-wide check — a
 * missing `hi` here is not itself a structural error, since a pack in
 * authoring may still be adding a translation; the parity gate in
 * validate/locale-parity.ts is what enforces completeness before publish).
 */
export function parseLocalizedText(
  value: unknown,
  path: string,
): Result<LocalizedText, readonly ValidationIssue[]> {
  if (!isRecord(value)) {
    return err([issue(path, "expected a localized-text object with at least an \"en\" key")]);
  }
  const collector = new IssueCollector();
  const en = collector.field(expectNonEmptyString(value["en"], `${path}.en`), "");
  const out: { en: string } & Partial<Record<Exclude<LocaleCode, "en">, string>> = { en };
  for (const locale of NON_ENGLISH_LOCALES) {
    const raw = value[locale];
    if (raw === undefined) {
      continue;
    }
    const parsed = collector.field(
      expectNonEmptyString(raw, `${path}.${locale}`),
      "",
    );
    if (parsed.length > 0) {
      out[locale] = parsed;
    }
  }
  if (collector.hasIssues) {
    return err(collector.all());
  }
  return ok(out as LocalizedText);
}

const PORTABLE_TEXT_KINDS = [
  "paragraph",
  "heading",
  "list",
  "summaryBox",
  "warningChip",
  "table",
] as const;

export function parsePortableTextBlock(
  value: unknown,
  path: string,
): Result<PortableTextBlock, readonly ValidationIssue[]> {
  const recordResult = expectRecord(value, path);
  if (!recordResult.ok) {
    return recordResult;
  }
  const record = recordResult.value;
  const collector = new IssueCollector();
  const kind = collector.field(
    expectOneOf(record["kind"], PORTABLE_TEXT_KINDS, `${path}.kind`),
    "paragraph" as const,
  );
  const text = collector.field(
    expectOptional(record["text"], `${path}.text`, parseLocalizedText),
    undefined,
  );
  const items = collector.field(
    expectOptional(record["items"], `${path}.items`, (v, p) =>
      parseArrayOfLocalizedText(v, p),
    ),
    undefined,
  );
  const rows = collector.field(
    expectOptional(record["rows"], `${path}.rows`, (v, p) =>
      parseArrayOfLocalizedTextRows(v, p),
    ),
    undefined,
  );
  const level = collector.field(
    expectOptional(record["level"], `${path}.level`, parseLevel),
    undefined,
  );

  if (kind === "paragraph" || kind === "warningChip") {
    if (text === undefined) {
      collector.push(
        issue(`${path}.text`, `"${kind}" blocks require a "text" field`),
      );
    }
  }
  if (kind === "heading") {
    if (text === undefined) {
      collector.push(issue(`${path}.text`, "heading blocks require a \"text\" field"));
    }
    if (level === undefined) {
      collector.push(
        issue(`${path}.level`, "heading blocks require a \"level\" of 2 or 3"),
      );
    }
  }
  if (kind === "list" && (items === undefined || items.length === 0)) {
    collector.push(issue(`${path}.items`, "list blocks require at least one item"));
  }
  if (kind === "summaryBox" && text === undefined) {
    collector.push(issue(`${path}.text`, "summaryBox blocks require a \"text\" field"));
  }
  if (kind === "table" && (rows === undefined || rows.length === 0)) {
    collector.push(issue(`${path}.rows`, "table blocks require at least one row"));
  }

  if (collector.hasIssues) {
    return err(collector.all());
  }
  const block: PortableTextBlock = {
    kind,
    ...(text !== undefined ? { text } : {}),
    ...(items !== undefined ? { items } : {}),
    ...(rows !== undefined ? { rows } : {}),
    ...(level !== undefined ? { level } : {}),
  };
  return ok(block);
}

function parseLevel(
  value: unknown,
  path: string,
): Result<2 | 3, readonly ValidationIssue[]> {
  if (value === 2 || value === 3) {
    return ok(value);
  }
  return err([issue(path, "expected 2 or 3")]);
}

function parseArrayOfLocalizedText(
  value: unknown,
  path: string,
): Result<readonly LocalizedText[], readonly ValidationIssue[]> {
  const arrayResult = expectArray(value, path);
  if (!arrayResult.ok) {
    return arrayResult;
  }
  const out: LocalizedText[] = [];
  const issues: ValidationIssue[] = [];
  arrayResult.value.forEach((item, index) => {
    const result = parseLocalizedText(item, `${path}[${String(index)}]`);
    if (result.ok) {
      out.push(result.value);
    } else {
      issues.push(...result.error);
    }
  });
  return issues.length > 0 ? err(issues) : ok(out);
}

function parseArrayOfLocalizedTextRows(
  value: unknown,
  path: string,
): Result<readonly (readonly LocalizedText[])[], readonly ValidationIssue[]> {
  const arrayResult = expectArray(value, path);
  if (!arrayResult.ok) {
    return arrayResult;
  }
  const out: (readonly LocalizedText[])[] = [];
  const issues: ValidationIssue[] = [];
  arrayResult.value.forEach((row, index) => {
    const rowResult = parseArrayOfLocalizedText(row, `${path}[${String(index)}]`);
    if (rowResult.ok) {
      out.push(rowResult.value);
    } else {
      issues.push(...rowResult.error);
    }
  });
  return issues.length > 0 ? err(issues) : ok(out);
}
