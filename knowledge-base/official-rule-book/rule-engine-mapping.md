# Topic 11 — Rule Engine Mapping (Official Rule Book → Rule Pack logical specification)

**Status:** ✅ **LOCKED — ClaimSahayak Official Rule Book, Version 1.0, Topic 11 – Rule Engine Mapping** (approved 10.07.2026).
**Nature:** logical mapping only — **no application code**. This document specifies, in machine-readable form, how every validated Rule Book element (86 CS-rules · 39 DOC-records · decision matrix D/M-rows · registers) becomes Rule Pack data. It is aligned with the pack architecture already documented in the repository (`docs/rule-pack.md`: questions → priority-ordered routes → overlays → outputs, documents/forms, NV-register, provenance validation) so a future **Rule Pack v2 ("rulebook-v1.0" provenance)** can be authored directly from it. The existing pack and engine are untouched.

---

## 1. Mapping philosophy & invariants

1. **Provenance-first:** every pack element carries `sourceRefs: [CS-ID…]`; each CS-ID resolves (via the Master Rule Matrix) to instrument + paragraph + archived PDF in `knowledge-base/sources/`. A provenance gate must fail the pack if any route/output/overlay lacks a resolvable CS-ID, mirroring the existing `validate-pack` provenance step.
2. **Gaps become referrals, never answers:** rows flagged OQ (D-07X, D-06 authority, M-B freeze release…) map to `referral` outputs citing the OQ register — the Rule-Book analogue of the pack's existing **NV-register** pattern (`nvRef`).
3. **Supersession semantics:** rules carry `effectiveFrom` (and `supersededBy` when applicable) from the S-register; the pack ships only current law but must keep S-refs so an as-on-date audit is possible.
4. **UNVERIFIED exclusion:** CS-NOM-024/025 and all 🔶 items are barred from pack data; they may exist only as NV entries.
5. **Terminology:** canonical glossary of the Topic-9 validation report is normative for ids and copy keys.

## 2. Fact model → Questions

Decision-matrix §0 inputs map to the pack's question layer. Logical spec (authoring format; ids stable):

```yaml
facts:
  scheme:            {type: enum, values: [POSA, RD, TD, MIS, SCSS, PPF, NSC, KVP, SSA, DISCONTINUED], ask: Q_SCHEME}
  holders_deceased:  {type: enum, values: [SINGLE_DEAD, JOINT_PARTIAL_DEAD, JOINT_ALL_DEAD], ask: Q_HOLDERS}
  nomination_state:  {type: enum, values: [IN_FORCE, NONE, VOID_ALL_PREDECEASED, CANCELLED_NOT_RENEWED,
                                           UNREGISTERED_VALID, PRE2018_MINOR_ACCOUNT], ask: Q_NOMINATION}
  nominees:          {type: list, item: {alive_at_death: bool, alive_now: bool, minor_now: bool, nri: bool,
                                         share_pct: number?, capacity: [OWNER, TRUSTEE], appointee_named: bool},
                      ask: Q_NOMINEE_TABLE}
  evidence:          {type: enum, values: [NONE, PROBATE, LOA, COURT_SUCCESSION_CERT, TAHSILDAR_LHC], ask: Q_EVIDENCE}
  amount_eligible:   {type: money, note: per account / per certificate registration (R60(1) N1), ask: Q_AMOUNT}
  months_since_death:{type: int, ask: Q_DEATH_DATE (derived)}
  dispute_raised:    {type: bool, ask: Q_DISPUTE}
  flags:             {type: set, values: [ARMED_FORCES, PRESUMED_DEATH_7Y, CLAIMANT_ABROAD, PLEDGE_OR_FREEZE,
                                          NAME_MISMATCH, LOST_PASSBOOK, RD_PSS_CANDIDATE, SCSS_SPOUSE,
                                          MIS_EXCESS, MINOR_ATTAINED_MAJORITY, GUARDIAN_DIED], ask: Q_FLAGS}
derived:
  survivors_exist        = holders_deceased == JOINT_PARTIAL_DEAD
  nominee_alive_now      = any(nominees[].alive_now)
  all_nominees_predeceased = nomination_state == VOID_ALL_PREDECEASED or none(nominees[].alive_at_death)
  minor_share_present    = any(nominees[].alive_now and minor_now)
  gate_6m                = months_since_death >= 6        # C-1: six months governs (GSPR 15(6)); Act 3-month noted
```

## 3. D-rows → Route rules (priority-ordered)

Routing pass evaluates in this order; first match wins; overlays layer afterwards (mirrors existing T-rule/OverlayRule split).

```yaml
routes:
  - id: RB-D14  # armed forces requisition overrides everything incl. nomination
    when: flags.ARMED_FORCES and requisition_received
    outcome: PAY_CO_COMMITTEE            # bound
    sourceRefs: [CS-NOM-017]
  - id: RB-D01
    when: survivors_exist
    outcome: SURVIVORSHIP_NO_CLAIM       # + POSA single-account test (CS-SCH-001); MIS → overlay OV-MIS-EXCESS
    sourceRefs: [CS-JNT-004, CS-JNT-002, CS-SCH-001]
  - id: RB-D13
    when: deceased_is_minor_or_unsound   # incl. SSA account holder
    outcome: scheme == SSA ? PAY_GUARDIAN_SSA : (nomination IN_FORCE ? RB-D02 : PAY_GUARDIAN)
    sourceRefs: [CS-SCH-009, CS-NOM-010, CS-MIN-012]   # C-13 resolution embedded
  - id: RB-D02..D04  # nomination track (family; same bucket, distinct extras)
    when: nomination_state == IN_FORCE and nominee_alive_now
    outcome: PAY_NOMINEES_PER_SHARE
    variants:
      - {id: RB-D03, when: minor_share_present,     extras: [MINOR_SHARE_ROUTING], sourceRefs: [CS-MIN-001..008]}
      - {id: RB-D04, when: any predeceased nominee, extras: [REDISTRIBUTE_PRO_RATA, DEATH_PROOF_EACH_DEAD_NOMINEE],
         sourceRefs: [CS-PRE-002]}
      - {id: RB-D07, when: disclaimer_offered,      extras: [FORM14_KYC_ROUTE], sourceRefs: [CS-MNM-005]}
    sourceRefs: [CS-NOM-019, CS-NOM-020, CS-MNM-003, CS-MNM-004]
  - id: RB-D07X
    when: nomination IN_FORCE and co_nominee_uncooperative and no disclaimer
    outcome: REFERRAL_DIVISIONAL          # regulatory gap
    nvRef: OQ-14
    sourceRefs: [CS-MNM-006]
  - id: RB-D06
    when: nomination IN_FORCE and not nominee_alive_now and any(nominees[].alive_at_death)
    outcome: PAY_HEIRS_OF_LAST_DEAD_NOMINEE   # evidence-based track for heirship of the NOMINEE
    authority: follow_evidence_track          # nvRef: OQ-11
    sourceRefs: [CS-PRE-004, CS-PRE-005]
  - id: RB-D05
    when: all_nominees_predeceased
    goto: NO_NOMINATION_FAMILY
    sourceRefs: [CS-PRE-001]
  - id: NO_NOMINATION_FAMILY   # nomination_state in [NONE, VOID…, CANCELLED…] etc.
    order:
      - {id: RB-D11, when: dispute_raised,                 outcome: REQUIRE_COURT_SUCCESSION_CERT, sourceRefs: [CS-NON-006]}
      - {id: RB-D08, when: evidence != NONE,               outcome: PAY_HEIRS_ON_EVIDENCE,  sourceRefs: [CS-NON-002, CS-NON-005]}
      - {id: RB-D10, when: amount > 500000,                outcome: REQUIRE_EVIDENCE + ISSUE_COURT_FEE_CERT, sourceRefs: [CS-NON-005, CS-NON-010]}
      - {id: RB-D12, when: not gate_6m,                    outcome: WAIT_OR_OBTAIN_EVIDENCE, sourceRefs: [CS-NON-002]}
      - {id: RB-D09, when: gate_6m and amount <= 500000,   outcome: DISCRETIONARY_13_14_15,  sourceRefs: [CS-NON-003, CS-NON-004, CS-NON-008]}
post_routes:   # elections after sanction (like CONTINUE_ADDON bucket)
  - {id: RB-D17, continuation: {RD: single_claimant, TD: single_claimant, NSC: max3, KVP: max3,
       SCSS: spouse_joint_or_sole_nominee_eligible_at_death, PPF: none, POSA: none, MIS: none, SSA: none},
     sourceRefs: [CS-SCH-002, CS-SCH-003, CS-SCH-005, CS-SCH-007, CS-SCH-008]}
  - {id: RB-D18, when: scheme == RD and flags.RD_PSS_CANDIDATE and months_since_death <= 12,
     outcome: PSS_FULL_MATURITY_CHECK, sourceRefs: [CS-SCH-002], deadline: 1y_from_death}
```

## 4. M-rows → Overlays

```yaml
overlays:
  - {id: OV-NAME-MISMATCH,   flag: NAME_MISMATCH,   require: [DOC-B5],  sourceRefs: [CS-NOM-022]}
  - {id: OV-PLEDGE-FREEZE,   flag: PLEDGE_OR_FREEZE, require: [DOC-D8], block_until_released: true, nvRef: OQ-28,
     sourceRefs: [CS-NON-008]}
  - {id: OV-LOST-PASSBOOK,   flag: LOST_PASSBOOK,   procedure: duplicate_after_sanction / divisional_orders,
     sourceRefs: [CS-NOM-020]}
  - {id: OV-OTHER-PO,        trigger: filed_at_other_po, procedure: SERVICE_INSURED_POST_SAME_DAY, sourceRefs: [CS-NOM-020]}
  - {id: OV-MAJORITY,        flag: MINOR_ATTAINED_MAJORITY, effect: pay_directly_own_kyc, nvRef: OQ-17, sourceRefs: [CS-MIN-010]}
  - {id: OV-GUARDIAN-SUCC,   flag: GUARDIAN_DIED,   effect: succeeding_guardian_s3h, sourceRefs: [CS-MIN-009]}
  - {id: OV-POSTHUMOUS-REG,  trigger: UNREGISTERED_VALID, effect: register_with_divisional_approval → nomination track,
     sourceRefs: [CS-NOM-020]}
  - {id: OV-NRI-SHARE,       trigger: nominees[].nri, effect: non_repatriation_payment, sourceRefs: [CS-NOM-011]}
  - {id: OV-DISCONTINUED,    trigger: scheme == DISCONTINUED, effect: sanction_at_HPO_GPO, sourceRefs: [CS-NOM-019]}
  - {id: OV-ABSENT-WITNESS,  default: true, effect: self_attested_witness_id_suffices, sourceRefs: [CS-NOM-020]}
  - {id: OV-ABROAD,          flag: CLAIMANT_ABROAD, require: [DOC-D6], payee: POA_HOLDER_IN_INDIA, sourceRefs: [CS-NOM-023]}
  - {id: OV-PRESUMED-DEATH,  flag: PRESUMED_DEATH_7Y, require: [DOC-D5], sourceRefs: [CS-NOM-023]}
  - {id: OV-MIS-EXCESS,      flag: MIS_EXCESS, effect: refund_excess_adjust_interest, sourceRefs: [CS-JNT-010]}
```

## 5. Outputs — requirement sets (documents/forms per route)

Each route resolves to output groups referencing DOC-IDs (library is the single source of document truth):

```yaml
outputs:
  PAY_NOMINEES_PER_SHARE:   {forms: [DOC-B1/A3], docs: [DOC-E1(all holders + each dead nominee), E2, E3, E5],
                             witnesses: 2(DOC-B6), extras_by_variant: {MINOR: [DOC-D1, D2?], DISCLAIMER: [DOC-A6+KYC]}}
  DISCRETIONARY_13_14_15:   {forms: [A3, A5, A6, A7], docs: [E1, E2, E3(heir ID mandatory), E5],
                             stamp_paper: STATE_STAMP_ACT, notarised: true, reasons_in_writing: true}
  PAY_HEIRS_ON_EVIDENCE:    {forms: [A3], docs: [E1, E2, E3, E4, E5]}
  REQUIRE_COURT_SUCCESSION_CERT: {docs: [E4=COURT_SUCCESSION_CERT only]}
  PAY_GUARDIAN_SSA:         {forms: [DOC-C3], docs: [E1(girl), guardian ID], immediate: true}
  SURVIVORSHIP_NO_CLAIM:    {docs: [E1(deceased holder), survivor KYC], optional: conversion_application}
  CONTINUATION_ELECTION:    {forms: [DOC-C12 + scheme form], per RB-D17 constraints}
  REFERRAL_*:               {action: divisional/directorate referral, cite nvRef}
constants:
  timelines: {ack: same_day, nomination_track: 1_working_day, other: 7_working_days}
  payment:   {modes: [CROSSED_CHEQUE, ACCOUNT_CREDIT], cash: never}
  sanction:  {on_claim_form: true, memo_only_administrative: true, memo_validity: 1_year}
  authority_ladder: {TS_LSG: 50000, HSG: 100000, GAZ_AB: 500000, personal_beyond: 10000,
                     divisional: no_limit_evidence_track, above_5L_no_discretion: true}
  interest_by_scheme: per CS-SCH-001..009 table (R60(10) + scheme gazettes)
```

## 6. NV-register mapping (gaps & provisionals)

| Pack NV entry | Source |
|---|---|
| NV-RB-1 untraceable/unwilling co-nominee | OQ-14 (D-07X) |
| NV-RB-2 authority for heirs-of-nominee claims | OQ-11 (D-06) |
| NV-RB-3 freeze-release procedure | OQ-28 (OV-PLEDGE-FREEZE) |
| NV-RB-4 majority-attained express confirmation | OQ-17 |
| NV-RB-5 RD/TD multi-claimant continuation wording | OQ-15 residue |
| NV-RB-6 fee-abolition 2025 (₹50) — provisional | CS-NOM-024 / M-1 |
| NV-RB-7 Internet-Banking nomination — provisional | CS-NOM-025 / M-2 |
| NV-RB-8 stamp-paper denominations (state practice) | Topic 2 §G |
| NV-RB-9 Act-vs-GSPR 3/6-month discrepancy (legal review) | C-1 |
| NV-RB-10 RD-PSS clause (vii) text confirmation | OQ-25 |

## 7. Versioning & supersession semantics

- Pack metadata: `rulebookVersion: 1.0`, `asOnDate: 2026-07-10`, `sources: knowledge-base/sources/ manifest hashes`.
- Each rule spec: `effectiveFrom` (e.g., RB-D09 limits `2020-11-06` per SB 36/2020; GSPR 15(6) text `2023-07-06`), optional `supersedes: S-n`.
- Amendment protocol: new instrument → new CS-rule via an approved topic amendment → S-register entry → pack delta with both records retained (never delete; the S-register is the diff log).

## 8. Acceptance criteria for the future Rule Pack v2 authoring (specification, not implementation)

1. Every route/overlay/output in the pack carries ≥1 CS-ID; a provenance validator resolves all CS-IDs against the Master Rule Matrix export.
2. Truth-table fixtures must cover at minimum: the 20 D-rows × representative schemes, each modifier at least once, the 6-month gate boundary (5 vs 6 months), the ₹5,00,000 boundary (at/above), dispute-before-payment, sequence-of-death permutations (predecease vs post-decease), SSA guardian payee, SCSS multi-nominee-no-continuation, NSC 4-claimant rejection (max 3), RD-PSS 1-year deadline boundary.
3. UNVERIFIED material must fail the publish gate if referenced anywhere outside the NV register.
4. Copy shown to users must cite the human-readable source ("GSPR 2018, Rule 15(6)…") derived from the same CS-ID chain — no hand-typed citations.

---

**Traceability:** this mapping introduces **no new legal content** — every element above is a re-expression of locked Topics 1–10; the CS-IDs are the join keys back to instruments and archived PDFs.
