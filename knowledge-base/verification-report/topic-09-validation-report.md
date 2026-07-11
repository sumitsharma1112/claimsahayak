# Topic 9 — Rule Validation Report (Topics 1–8 cross-validation)

**✅ LOCKED — ClaimSahayak Official Rule Book, Version 1.0, Topic 9 – Rule Validation** (approved 10.07.2026).

**Date:** 10.07.2026 · **Method:** automated integrity sweep over every knowledge-base file (ID uniqueness, cross-reference resolution, register coverage, terminology frequency) + analytical review of all 86 rule records, 39 document records and 4 registers.
**Verdict:** Rule Book is **internally consistent and engine-ready**. 0 hard defects; 14 validation findings (V-1…V-14) — all documented below with dispositions. No locked topic file was modified (lock discipline); corrective annotations are recorded here and, where they change engine behaviour, in the Master Rule Matrix.

## 1. Structural integrity (automated)

| Check | Result |
|---|---|
| Rule ID definitions | **86 unique** (`CS-NOM` 25 · `CS-NON` 11 · `CS-PRE` 8 · `CS-MNM` 9 · `CS-MIN` 13 · `CS-JNT` 11 · `CS-SCH` 9) — no duplicates |
| Dangling references | **0** — every referenced CS-ID is defined |
| Conflict register | C-1…C-13 consecutive, all referenced with resolutions |
| Supersession register | S-1…S-17 consecutive, none orphaned |
| Document library | 39 records, all source-anchored |
| Missing-documents register | M-1…M-15 (M-12/13/14 closed) |

## 2. Duplicate rules → canonical/alias map (V-1)

Layered drafting (Topic 1 captured GSPR-level rules later elaborated) created **intentional overlaps**. For the engine, one record is canonical; the other is an alias (retained — never deleted):

| Alias (earlier) | Canonical (fuller) | Subject |
|---|---|---|
| CS-NOM-002 | CS-PRE-001 / CS-PRE-002 | nomination void / share redistribution |
| CS-NOM-003, CS-NOM-006 | CS-MIN-002 | minor-nominee appointee |
| CS-NOM-013 | CS-MNM-003 | share distribution algorithm |
| CS-NOM-014 | CS-MIN-001 | payment for minor surviving nominee |
| CS-NOM-016 | CS-NON-002/003/005/006 | no-nomination pathway |
| CS-PRE-007 | CS-MIN-003/009 | appointee/guardian succession |
| CS-NOM-010 | CS-MIN-012 + **CS-SCH-009 (SSA exception)** | minor depositor's death |
| forms-catalog.md | document-library.md | forms index |

**Disposition:** matrix rows annotated "→ canonical"; no text deleted.

## 3. Contradiction audit (V-2…V-5)

- **All 13 registered conflicts re-verified** with engine resolutions intact (C-1 six months governs; C-2/C-3/C-8/C-12 gazette-later-in-time governs; C-13 scheme-specific governs; C-4/C-5/C-6 stricter/later instrument governs; C-7/C-9/C-10/C-11 documented).
- **V-2 (numbering hygiene):** OQ-21 was never assigned; OQ-2…OQ-5 existed only as prose in the Topic-1 report. **Fixed:** consolidated `open-questions-register.md` created (OQ-1…OQ-29 canonical; OQ-21 marked reserved).
- **V-3 (new latent contradiction found & resolved):** CS-NOM-010 (GSPR 10(3): minor depositor's balance → **nominee**) vs CS-SCH-009 (SSA 7(1): girl's balance → **guardian**). Already captured as C-13 for SSA, but CS-NOM-010's matrix row lacked the exception pointer. **Fixed in matrix** (SSA exception annotation).
- **V-4:** CS-JNT-004 (survivor continues) vs CS-SCH-001 (POSA survivor must close if he already holds a single account). Not a contradiction — scheme refinement; matrix row for CS-JNT-004 annotated "subject to CS-SCH-001 for POSA".
- **V-5:** no other contradictions detected across the 86 records (timelines, witness rules, payment modes, powers all mutually consistent).

## 4. Missing scenarios (V-6) — logged, not guessed

Newly registered as future research topics (OQ-26…OQ-29): adult person-of-unsound-mind depositor's death; deceased **NRI depositor**/NRI claimant mechanics; court/tax-**frozen** account release before settlement; death with a **pending premature-closure request**. Previously logged gaps remain: untraceable co-nominee (OQ-14), RD/TD multi-claimant continuation (OQ-15 residue), simultaneous-death sequencing (excluded — general law).

## 5. Citation audit (V-7…V-10)

- **V-7 (citation precision):** CS-NON-002 supports "legal evidence has no waiting period" partly via legacy 87(3) phrasing ("even before the expiry of three months"), which SB Order 31/2020's R60(3) does not repeat verbatim. Corrected basis: **structural** — R60(4)'s six-month wait attaches only to no-evidence claims; R60(3) imposes none. Conclusion unchanged.
- **V-8:** page-number fields for R60 cite the SB Order 31/2020 enclosure pagination (pp.3–20) — precise; legacy Vol I citations use extraction offsets, not print pages. Disposition: acceptable (archived-source anchored); print-page hardening optional at Topic 12 compile.
- **V-9:** every PROVISIONAL/UNVERIFIED item (CS-NOM-024/025, CS-MNM-006, stamp-paper values) is correctly excluded from VERIFIED status — no unverified statement carries a VERIFIED tag anywhere.
- **V-10:** all superseded texts (old 15(6), old limits tables, SB-3/SB-55, 1981–2004 scheme rules) are quoted only in history sections/registers — **no rule record cites superseded text as current law**.

## 6. Terminology normalization (V-11…V-14) — canonical glossary

| Canonical term | Variants found (kept only inside verbatim quotes) | Definition/authority |
|---|---|---|
| **Accounts Office** | accounts office, Account Office | GSPR 3(1)(a) |
| **eligible balance / eligible amount** | (both official) | GSPR 3(1)(c); 15(6) uses "eligible amount" — treated as synonyms |
| **appointee** | appointed payee, person appointed | ACT s.4(3)/4A(2)(a) |
| **Authorised Officer** | authorized officer | ACT s.3(c) |
| **Sanction Memo** | sanction memo | administrative-sanction conveyance only (DOC-B2) |
| **nomination track / T2-matrix** | — | engine shorthand defined in Master Rule Matrix header |
| **Joint 'A' / Joint 'B'** | Joint-A/Joint B etc. | GSPR 8(2); bank labels barred (CS-JNT-001) |
| **POSA (SB)** | SB, Savings Account | scheme G.S.R. 921(E); matrix standardized |
| **legal evidence** | — | probate / letters of administration / court succession certificate / Tahsildar+ legal-heir certificate (GSPR 15(6) as amended) |
| **guardian** | — | ACT s.3(h) hierarchy only |

**V-14:** matrix header now carries the glossary pointer; drafting rule for future topics: variants allowed **only** inside verbatim quotations.

## 7. Updated Master Rule Matrix

Annotations applied: canonical/alias map (§2), SSA-exception pointer on CS-NOM-010, POSA-refinement pointer on CS-JNT-004, glossary/validation header note. Totals: **86 rules + 39 documents + 13 conflicts + 17 supersessions + 29 OQs (12 closed/narrowed)**.

## 7A. Confidence assessment

**High.** The validation is mechanical (automated ID/link/register sweep) plus analytical review of records already individually verified; it introduces no legal content of its own. Conflicts referenced: C-1…C-13 (all resolved). Superseded references: S-1…S-17 (none relied upon as current law).

## 8. Recommendation

Validation **passes**. The Rule Book's verified layer contains no internal contradiction, no orphaned or duplicate identifier, no reliance on superseded text, and every known gap is explicitly registered rather than silently filled. Ready for **Topic 10 (Decision Matrix)**.

**STOP — awaiting approval.**
