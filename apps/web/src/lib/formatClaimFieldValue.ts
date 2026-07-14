import type { ClaimDataField } from "@claimsahayak/shared-types";
import { formatInr } from "@claimsahayak/shared-utils";

/**
 * Milestone 15 — production document quality. Purely a DISPLAY formatter:
 * it never changes what's stored in the Claim Data Model (the raw string
 * a postmaster typed), only how an already-resolved value is PRINTED on a
 * generated document — amounts as Indian currency, dates in the DD-MM-
 * YYYY civil convention government paperwork uses, everything else
 * trimmed of stray whitespace.
 *
 * Deliberately conservative: if a value doesn't parse cleanly into the
 * expected shape (e.g. a date field that isn't a clean ISO
 * `YYYY-MM-DD`, because `type="date"` inputs are the only source of that
 * shape and free-text entry from before this milestone may not match),
 * it prints the raw value UNCHANGED rather than guess at reformatting it
 * — the same never-invent, never-guess rule every other auto-fill
 * mechanism in this app follows.
 */

const AMOUNT_FIELDS: ReadonlySet<ClaimDataField> = new Set<ClaimDataField>(["account.amountClaimed"]);

const DATE_FIELDS: ReadonlySet<ClaimDataField> = new Set<ClaimDataField>([
  "deathCertificate.dateOfDeath",
  "account.nominationDate",
]);

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `type="date"` inputs always give `YYYY-MM-DD`; converts to `DD-MM-YYYY` for display. Anything else passes through unchanged. */
function formatDateForDisplay(raw: string): string {
  const match = ISO_DATE.exec(raw.trim());
  if (!match) {
    return raw.trim();
  }
  // Non-null: the regex has exactly 3 mandatory capture groups, so a
  // successful match always populates all three.
  const year = match[1] ?? "";
  const month = match[2] ?? "";
  const day = match[3] ?? "";
  return `${day}-${month}-${year}`;
}

/** Parses digits out of a free-text amount (postmaster may type "2,50,000" or "₹250000"); falls back to the raw text if nothing digit-like is found. */
function formatAmountForDisplay(raw: string): string {
  const trimmed = raw.trim();
  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  if (digitsOnly.length === 0) {
    return trimmed;
  }
  const parsed = Number(digitsOnly);
  if (!Number.isFinite(parsed)) {
    return trimmed;
  }
  return formatInr(parsed);
}

export function formatClaimFieldValue(field: ClaimDataField, raw: string): string {
  if (AMOUNT_FIELDS.has(field)) {
    return formatAmountForDisplay(raw);
  }
  if (DATE_FIELDS.has(field)) {
    return formatDateForDisplay(raw);
  }
  return raw.trim();
}
