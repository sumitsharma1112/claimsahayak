# Topic 10 — Canonical Decision Matrix (Official Rule Book)

**Status:** ✅ **LOCKED — ClaimSahayak Official Rule Book, Version 1.0, Topic 10 – Decision Matrix** (approved 10.07.2026).
**Purpose:** the single scenario→decision table the ClaimSahayak Rule Engine, Wizard and checklists derive from. Every row cites the governing rule records (CS-IDs) and instruments. Documents referenced by DOC-IDs (`forms/document-library.md`).

## 0. Canonical inputs (wizard variables)

| Var | Meaning | Values |
|---|---|---|
| `scheme` | Scheme of the holding | POSA · RD · TD · MIS · SCSS · PPF · NSC · KVP · SSA · discontinued |
| `holders` | Account holders (1–3/4) & who is deceased | single-dead · joint-partial-dead · joint-all-dead |
| `nomination` | Status at death of last holder | in-force · none-ever · void-all-predeceased · cancelled-not-renewed · unregistered-but-valid · pre-2018-minor-account |
| `nominees[]` | Per nominee: alive-at-death? alive-at-settlement? minor? NRI? share%; owner/trustee; appointee named? | — |
| `claimant` | nominee · appointee · guardian · succeeding-guardian · heir-of-depositor · heir-of-last-dead-nominee · CO/Committee (forces) · POA-holder | — |
| `evidence` | none · probate · LoA · succession-certificate · legal-heir-certificate(Tahsildar+) | — |
| `amount` | eligible balance/amount (per account / per certificate registration) | ₹ |
| `months_since_death` | integer | — |
| `dispute` | any dispute raised before payment? | y/n |
| flags | armed-forces · presumed-death-7yr · claimant-abroad · pledge/freeze · name-mismatch · lost-passbook · RD-PSS-candidate · SCSS-spouse · MIS-excess · minor-attained-majority · guardian-died | — |

## 1. Primary scenario rows

| # | Scenario (inputs) | Decision | Documents | Forms | Competent authority (limit / timeline) | References |
|---|---|---|---|---|---|---|
| D-01 | `joint-partial-dead` (any scheme with joint facility) | **No claim.** Survivorship — survivors continue; sole survivor may convert to single and re-nominate. POSA: survivor holding another single account must **close** instead. MIS: run **D-19** ceiling re-test | DOC-E1 (death cert of deceased holder), survivor KYC | conversion application | Post office (record action; no sanction) | CS-JNT-004/002; CS-SCH-001; GSPR 8(2)-(3) |
| D-02 | `single-dead` or `joint-all-dead`; `nomination=in-force`; all nominees alive, all majors | Pay **all nominees per specified % (equal if unspecified)**; per-nominee crossed cheque/credit; optional continuation → D-17 | DOC-E1 (all holders + none for nominees), E2, E3 (nominees' ID), E5; 2 witnesses (DOC-B6) | DOC-B1/Form 11 (duplicate) | **Any SPM/PM — no limit; 1 working day** | CS-NOM-019/020; CS-MNM-003/004; GSPR 15(2)-(3); R60(2) |
| D-03 | D-02 + some nominee(s) **minor** | Majors paid directly; each minor's share → **appointee**, else **guardian** (natural guardian: no certificate; others: guardianship certificate/court order); "minor alive" declaration; never pay minor directly | + DOC-D1, D2 (conditional); appointee/guardian ID | Form 11 signed by appointee/guardian for minor share | same as D-02 | CS-MIN-001…008; CS-MNM-007; ACT 4A(2) |
| D-04 | D-02 + some nominee(s) **predeceased the depositor** (≥1 survivor) | Survivors take; predeceased shares **redistribute pro-rata**; predeceased nominee's heirs get nothing | + DOC-E1 **original death proof of each dead nominee** | Form 11 (strike-outs) | same as D-02 | CS-PRE-002; GSPR 15(3)-(4); R60(2)(iii)-(v) |
| D-05 | nomination was made but **all nominees predeceased depositor** (`nomination=void-all-predeceased`) | Nomination **void** → run **D-08/D-09/D-10** (no-nomination flow) with depositor's heirs | as per target row + death proofs of all nominees | as per target row | as per target row | CS-PRE-001; ACT s.4(2) |
| D-06 | nominee(s) survived depositor but **none alive at settlement** | Settle for **legal heirs of the LAST deceased nominee** (never depositor's heirs); heirship evidence relates to the **nominee** | DOC-E1 (depositor + nominee), E2, E3; heirship: E4 or Forms 13/14/15 route (≤₹5L, 6 months) | Form 11 + (13/14/15 if no evidence) | follows evidence route (OQ-11): E4 → legal-evidence powers; else T2-matrix | CS-PRE-004/005; R60(2)(iv) |
| D-07 | D-02 + a co-nominee **renounces / cannot attend** | Claimant nominee(s) take whole incl. disclaimed shares on **Form 14 disclaimer + KYC of disclaimer** | + DOC-A6 (Form 14, notarised, stamp paper) + disclaiming nominee's KYC | Form 11 + Form 14 | same as D-02 | CS-MNM-005; R60(2)(xi) Note |
| D-07X | co-nominee **untraceable/unwilling, no disclaimer** | **No official procedure** — treat as doubtful/special case → inquire, record, refer to Divisional Head/Directorate | case record | — | referral (R60(4)(C)-(D) principle) | CS-MNM-006; OQ-14 |
| D-08 | **no nomination in force**; claimant produces **legal evidence** (probate/LoA/court SC/Tahsildar+ LHC) | Pay heirs per the instrument — **any amount, no waiting period** | DOC-E1, E2, E3, **E4**; heir ID mandatory | Form 11 (evidence enclosure) | TS/LSG/HSG-II SPM up to ₹50k/₹1L else → **Divisional Head (no limit)**; HSG-I/MDG/HO/GPO PM — **no limit**; 7 working days | CS-NON-002/005; R60(3); GSPR 15(6) (2023) |
| D-09 | no nomination; **no evidence**; `amount ≤ ₹5,00,000`; `months_since_death ≥ 6`; `dispute=n` | **Discretionary settlement** to rightful claimant (personal-law heir), reasons recorded in writing | DOC-E1, E2, E3 + **Form 13 affidavit + Form 14 disclaimer + Form 15 indemnity** (notarised, State stamp paper) + heir ID; guardianship certificate for minor heirs if claimant not their guardian | Form 11 + 13 + 14 + 15 | **₹50,000** TS/LSG · **₹1,00,000** HSG · **₹5,00,000** Gaz. A/B; above own limit → Divisional Office; personal exercise >₹10k; 7 working days | CS-NON-003/004/007/008; GSPR 15(6)(i); R60(4)(A)-(B); SB 36/2020 |
| D-10 | no nomination; no evidence; `amount > ₹5,00,000` | **No discretionary power** — require E4 (probate/LoA/court SC/Tahsildar+ LHC) → D-08 | advise claimant; issue **court-fee balance certificate** on request | — | any level (advice); DOC-D7 by Authorised Officer | CS-NON-005/010; GSPR 15(6)(ii); ACT s.8 |
| D-11 | `dispute=y` (raised before payment, any slab) | Pay **only** on **court succession certificate** | DOC-E1, E2, E3 + court SC | claim form | per powers; typically Divisional level | CS-NON-006; GSPR 15(6) provisos |
| D-12 | `months_since_death < 6`; no nomination; no evidence | **Wait** (advise heirs: obtain evidence for immediate payment, or return at 6 months if ≤₹5L) | advisory + acknowledgment | DOC-B3 | PO of account | CS-NON-002; R60(4)(A); C-1 note |
| D-13 | **minor/unsound-mind depositor dies** | Nomination (guardian-made) → D-02; none/pre-2018 → pay **guardian** on claim + death certificate. **SSA always: pay guardian, immediate closure** | DOC-E1 (of the minor), E2; guardian ID | Form 11 / **SSA Form-2** | nomination-equivalent (no limit); 1–7 days | CS-NOM-010; CS-MIN-012; CS-SCH-009 (C-13) |
| D-14 | `armed-forces` flag: serving Army/AF/Navy depositor dies/deserts + CO/Committee **requisition** | Pay **CO/Committee of Adjustment** — overrides nomination | requisition under 1950/1957 Acts | — | Accounts Office **bound** | CS-NOM-017; GSPR 17 |
| D-15 | `presumed-death-7yr` | Treat as dead if disappearance established; settle per applicable row + **indemnity** | + DOC-D5 evidence of disappearance + indemnity | per row + Form 15 pattern | per row | CS-NOM-023; R60(8) |
| D-16 | `claimant-abroad` | Documents executed abroad need consular authentication / Notaries-reciprocity / **Hague apostille**; pay only **POA holder in India** | + DOC-D6 | per row | per row | CS-NOM-023; R60(9) |
| D-17 | continuation election (after sanction): RD/TD any single claimant; **NSC/KVP ≤3 claimants**; **SCSS spouse** (joint holder or sole nominee, eligible at date of death) | Transfer holding to claimant name(s) till maturity; **PPF/POSA/MIS/SSA: closure only** | + DOC-C12 (new AOF + Annexure-II + KYC) | scheme form + AOF | PO (post-sanction action); memo liberty clause | CS-SCH-002/003/005/007/008; R60(10)-(11) |
| D-18 | `RD-PSS-candidate`: RD holder died in term; ₹100-denomination tests | Pay **full maturity value** if eligibility met and claim within **1 YEAR of death** (else ordinary Table-1/2 values) | + DOC-D3 declaration + D4 age proof | RD claim + PSS declaration | RD claim powers | CS-SCH-002; RD para 13 |
| D-19 | `MIS-excess`: MIS joint holder died, survivor over single ceiling | Refund excess; adjust interest MIS→POSA (Finacle HINTTM/HCAACTD) | office computation | — | CBS post office / SBCO | CS-JNT-010; SB 29/2021 |

## 2. Modifier rows (compose with any primary row)

| Mod | Trigger | Effect | Reference |
|---|---|---|---|
| M-A | `name-mismatch` | Obtain **Reconciliation Certificate** (Divisional Head/GPO/Gazetted HO) before sanction | CS-NOM-022; DOC-B5 |
| M-B | `pledge/freeze` | Pledgee paid first / release certificate; court/tax freeze blocks settlement (release procedure = OQ-28) | R60(2)(viii)(d), (4)(D)(vi); DOC-D8 |
| M-C | `lost-passbook` | Duplicate after claim admitted; missing passbook → Divisional Head orders | R60(2)(xii), (6)(iv) |
| M-D | claim filed at another PO | Accept + accept witnesses + forward by **Service Insured Post same day**; acquittance relay procedure | R60(2)(vii) + Notes |
| M-E | `minor-attained-majority` | Pay the (former) minor **directly** with own KYC + DOB proof | CS-MIN-010 (OQ-17) |
| M-F | `guardian-died`/changed | **Succeeding guardian** (s.3(h) hierarchy / court order) acts | CS-MIN-009; GSPR 10(4) |
| M-G | unregistered-but-valid nomination found | Register posthumously with **Divisional Superintendent approval** → treat as nomination track | CS-NOM-020(12); R60(2) Note 5 |
| M-H | NRI nominee/share | Payment on **non-repatriation basis** | CS-NOM-011; GSPR 14(9) |
| M-I | discontinued scheme holding | Sanction at **HPO/GPO** | R60(2) Note 2 / (3)(v) |
| M-J | witnesses cannot attend | Self-attested witness ID/address photocopies with signature suffice | Addendum 16.09.2020 |

## 3. Authority resolution (function)

```
authority(track, office_status, amount):
  nomination-track            → PM/SPM of PO of account (GDS BO → Account Office). No limit. 1 working day.
  legal-evidence-track        → HSG-I/MDG/HO/GPO PM: no limit.
                                TS/LSG SPM ≤ 50,000; HSG-II SPM ≤ 1,00,000; beyond → Divisional Head (no limit). 7 days.
  no-evidence-track (≥6 mo)   → TS/LSG ≤ 50,000; HSG ≤ 1,00,000; Gaz-A/B ≤ 5,00,000 (personal beyond 10k);
                                beyond own limit → Divisional Office; > 5,00,000 → impossible (D-10). 7 days.
  special-features/lacunae    → Directorate. doubtful/contested → inquire + refer upward.
  every claim: same-day acknowledgment; register entry; monthly register review.
"amount" = balance at death + prior-FY accrued interest (accounts) / maturity value (certificates); per account / per certificate registration number.
```

## 4. Timeline & payment constants

- Acknowledgment: same day. Sanction: **1 working day** (nomination) / **7 working days** (others; Divisional Office 7).
- Payment: **crossed cheque or credit to claimant's POSB/bank account only** — never cash; collect payee details + acquittance at submission.
- Sanction memo (administrative sanctions only): valid **1 year**; carries the continuation liberty for RD/TD/certificates.
- Interest on the deceased holding: scheme-specific table (CS-SCH-001…009; R60(10)).

## 5. Traceability

Every D-row/M-row cites CS-rules which cite instruments (Act/GSPR/G.S.R./SB Orders/scheme gazettes) with archived copies in `sources/`. Gaps intentionally surfaced in-row: D-07X (OQ-14), D-06 authority (OQ-11), M-B freeze release (OQ-28).
