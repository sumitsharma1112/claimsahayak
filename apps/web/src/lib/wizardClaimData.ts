import type { ClaimDataModel, Party } from "@claimsahayak/shared-types";

/**
 * Milestone 7 — pure, generic helpers for editing the bounded Party arrays
 * (nominees/legalHeirs/witnesses) inside a `ClaimDataModel`. The model
 * itself lives in `Wizard.tsx`'s own React state, session-memory only
 * (never passed to `saveSession`/`localStorage` — see claim-data.ts's
 * privacy note) — these helpers never read or write storage themselves.
 */
export function setPartyAt(
  list: readonly Party[],
  index: number,
  party: Party,
): readonly Party[] {
  const next = [...list];
  next[index] = party;
  return next;
}

export function removePartyAt(list: readonly Party[], index: number): readonly Party[] {
  return list.filter((_, i) => i !== index);
}

export function addEmptyParty(list: readonly Party[], max: number): readonly Party[] {
  return list.length >= max ? list : [...list, { name: "" }];
}
