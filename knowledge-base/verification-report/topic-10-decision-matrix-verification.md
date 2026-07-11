# Verification Report — Topic 10: Decision Matrix

**Date:** 10.07.2026 · **Verdict:** recommended **COMPLETE for v1.0**.

## What was built

`official-rule-book/decision-matrix.md` — the canonical scenario→decision table:
- **11 canonical input variables** (the wizard's question set) including per-nominee status vectors and 11 situational flags;
- **20 primary rows** (D-01…D-19 + D-07X) covering: survivorship; nomination-track payment (majors/minors/predeceased/none-alive); disclaimer route; the untraceable-co-nominee gap (surfaced, not guessed); legal-evidence route; ≤₹5L discretionary route; >₹5L bar with court-fee certificate; dispute override; six-month wait row; minor/unsound-mind depositor (with SSA guardian-payee exception); armed-forces requisition; presumed death; foreign claimants; continuation elections; RD-PSS benefit; MIS excess re-test;
- **10 modifier rows** (M-A…M-J) composable with any primary row (name mismatch, pledge/freeze, lost passbook, other-PO filing, majority attained, guardian succession, posthumous registration, NRI shares, discontinued schemes, absent witnesses);
- **authority-resolution function** and **timeline/payment constants**.

## Validation of the matrix itself

- Every row cites CS-rule IDs (validated at Topic 9) which cite archived instruments — full three-layer traceability (row → rule → instrument).
- Coverage check against the 86 rules: every VERIFIED rule with decision content maps into ≥1 row/modifier; provisions that are record-keeping only (registers, acknowledgment) appear as constants.
- The three known gaps are represented **in-row as gaps** (D-07X/OQ-14; D-06 authority/OQ-11; M-B freeze release/OQ-28) so the engine can route them to human referral rather than fabricate an answer.
- Input model supports every scenario distinction the corpus makes (sequence of deaths, minority at payment vs at nomination, dispute timing "before payment", six-month gate, per-registration amounts).

## Confidence assessment & registers

**High** — the matrix is a derivation with zero new legal content; every row inherits the confidence of its cited CS-rules. Conflict register: relevant conflicts (C-1, C-2, C-10, C-13) are embedded in-row with their approved resolutions; no new conflicts arise. Superseded-rule register: unchanged (S-1…S-17); no superseded text is used in any row.

## Recommendation

**Topic 10 complete.** The matrix is the engine-facing contract; Topic 11 will map it to a machine-readable Rule Pack specification (logic only, no code).

**STOP — awaiting approval.**
