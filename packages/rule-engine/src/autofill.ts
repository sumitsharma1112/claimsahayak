import type { ClaimDataField, ClaimDataModel } from "@claimsahayak/shared-types";

/**
 * Milestone 7 Part 3 — auto-fill. A plain, exhaustive switch over the
 * closed `ClaimDataField` union — deliberately NOT a dynamic dotted-path
 * resolver (no `eval`, no string-keyed reflection): an invalid field
 * reference is a compile error here, not a runtime typo that silently
 * prints nothing on a real claim form.
 *
 * Returns `undefined` (never an empty string) when nothing has been
 * entered yet, so a renderer can distinguish "not filled in" from "filled
 * in with an empty value" and fall back to a blank line / manual-fill
 * affordance exactly as it did before Milestone 7.
 */
export function resolveClaimDataValue(
  model: ClaimDataModel,
  field: ClaimDataField,
): string | undefined {
  const empty = (value: string | undefined): string | undefined =>
    value === undefined || value.trim().length === 0 ? undefined : value;

  switch (field) {
    case "claimant.name":
      return empty(model.claimant.name);
    case "claimant.address":
      return empty(model.claimant.address);
    case "claimant.relationship":
      return empty(model.claimant.relationship);
    case "depositor.name":
      return empty(model.depositor.name);
    case "guardian.name":
      return empty(model.guardian?.name);
    case "nominee.0.name":
      return empty(model.nominees[0]?.name);
    case "nominee.1.name":
      return empty(model.nominees[1]?.name);
    case "nominee.2.name":
      return empty(model.nominees[2]?.name);
    case "nominee.3.name":
      return empty(model.nominees[3]?.name);
    case "legalHeir.0.name":
      return empty(model.legalHeirs[0]?.name);
    case "legalHeir.1.name":
      return empty(model.legalHeirs[1]?.name);
    case "legalHeir.2.name":
      return empty(model.legalHeirs[2]?.name);
    case "legalHeir.3.name":
      return empty(model.legalHeirs[3]?.name);
    case "witness.0.name":
      return empty(model.witnesses[0]?.name);
    case "witness.1.name":
      return empty(model.witnesses[1]?.name);
    case "office.name":
      return empty(model.officeName);
    case "account.number":
      // Resolved per-account by the caller (accountNumbers is keyed by
      // AccountChecklist.accountIndex, which this function has no access
      // to) — see resolveAccountNumber below.
      return undefined;
  }
}

/** `account.number` needs the account index, so it's resolved separately from the closed-field switch above. */
export function resolveAccountNumber(
  model: ClaimDataModel,
  accountIndex: number,
): string | undefined {
  const value = model.accountNumbers[accountIndex];
  return value === undefined || value.trim().length === 0 ? undefined : value;
}
