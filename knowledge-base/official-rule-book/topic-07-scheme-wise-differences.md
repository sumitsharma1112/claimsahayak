# Topic 7 — Scheme-wise Differences in Deceased Claim Settlement (Official Rule Book)

**Status:** ✅ **LOCKED — ClaimSahayak Official Rule Book, Version 1.0, Topic 7 – Scheme-wise Differences** (approved 10.07.2026). Changes only via a new approved amendment entry; verification report retained at `verification-report/topic-07-scheme-wise-verification.md`.
**Major event this topic:** all nine **2019 Scheme Rules** obtained in official copy from the National Savings Institute (Min. of Finance) — G.S.R. 914(E)–922(E), all dated 12.12.2019, as consolidated by NSI with 2020–21 amendments (archived at `sources/scheme-rules-2019/`). 2023 amendments (G.S.R. 488/489/490(E)) layered from the SB Order 16/2023 annexures already in hand. **Register gap M-12 is closed.**
**Baseline:** every scheme applies the GSPR/R60 framework (each scheme's "Application of General Rules" paragraph) — nomination track (no limit, 1 day), no-nomination tracks (Topic 2), nominee-death doctrine (Topic 3), share mechanics (Topic 4), minor rules (Topic 5), survivorship (Topic 6). The records below capture only the **differences**.

---

### CS-SCH-001 — Savings Account (POSA), G.S.R. 921(E)
- **Death provisions:** interest paid **up to the end of the month preceding closure** on death (para 5(5); "in the end" → "till the end" by G.S.R. 489(E) 03.07.2023). Joint accounts: max **3 adults** (2023); **equal share presumption** (para 3(2)); on death of one holder, **survivor is sole owner and may continue ONLY if he holds no other single POSA account — if he does, the account must be closed** (para 3(2), verbatim: "…he may continue the account… provided another single account is not held in his name. In case a single account exists in the name of the surviving holder, the account shall have to be closed"). One-single-account-per-individual cap drives this.
- **Continuation by nominee/heirs:** none (closure only).
- **Nomination/minor/no-nomination:** GSPR baseline; scheme silent → General Rules apply (para 8-equivalent).
- **Verification Status:** **VERIFIED** · refines locked CS-JNT-004 for POSA (recorded here; Topic 6 unchanged per lock discipline, cross-ref annotation in matrix).

### CS-SCH-002 — Recurring Deposit (NS-RD), G.S.R. 918(E)
- **Death provisions (para 12):** on death of the sole holder / all joint holders — no further deposits; repayment to nominee/legal heirs per **Table-1** (amount by number of deposits: <60 deposits → Table-2/2.1 death-value tables; 60 deposits/discontinued/extended → maturity-based amounts per paras 9–11).
- **Continuation:** nominee/legal heir **may continue the account to maturity** and receive full value "as if the account had been opened themselves", by application; account transferred into their name with record remarks (para 12(2)).
- **Joint survivor:** sole owner; may deal with account fully; if <60 deposits made, may alternatively **close immediately** at Table-1 value (para 12(3)).
- **Guardian death:** on death of the guardian of a minor/unsound-mind holder, the **new guardian may close** the account (values per paras 9–11) if in the holder's interest (para 12(4)).
- **⭐ Protected Savings Scheme (para 13):** if the holder (or surviving holder) dies during the maturity period/extension, the nominee/heir receives **FULL maturity value** of a ₹100-denomination account (proportionate/capped for other denominations, para 13(5)-(6)) subject to: account not discontinued; **≥2 years** from opening to death; holder aged **18–55 at opening** (age proof by birth certificate/school certificate/PAN/voter ID/passport/DL of the deceased if no declaration); **first 24 deposits default-free** (revived defaults before death don't count); post-24-month defaults deducted with revival fee; **no loan in first 24 months** (condition (vii) as printed); **claim within ONE YEAR of death** with death certificate; declaration that the benefit was not previously availed for any account of the deceased; advance deposits refunded in addition. Multiple accounts with different nominations: benefit to nominees of the **earlier accounts** that qualify.
- **Verification Status:** **VERIFIED** (verbatim gazette text)
- **Engine note:** RD death claims therefore need TWO extra inputs: deposits count/default history and PSS eligibility; and carry a **1-year limitation** for the PSS benefit only (the ordinary claim has no such limit).

### CS-SCH-003 — Time Deposit (NS-TD), G.S.R. 922(E)
- **Death provisions (para 10):** mirrors GSPR 15 (nominee shares (2)-(4), minor nominee (5), no-nomination clause). Interest where account runs past events: **TD-rate for completed years (not beyond deposit tenor) + POSA rate for completed months thereafter** (para 10(6)); joint survivor(s) treated as owner(s), may **continue or close** (para 10(7)).
- **Continuation:** nominee/heir may retain to maturity (R60(10) row 3; sanction-memo liberty clause).
- **Verification Status:** **VERIFIED**

### CS-SCH-004 — Monthly Income Scheme (NS-MIS), G.S.R. 917(E)
- **Death provisions (para 7(2)):** account **may be closed**, deposit refunded per General Rules, interest **up to the month preceding refund**. No continuation by nominee/heirs.
- **Joint:** ceilings **₹9L single / ₹15L joint** (G.S.R. 490(E), 03.07.2023); on death of a joint holder, survivor's holding is re-tested against the **single ceiling** — excess refunded with **MIS→POSA interest adjustment** per SB Order 29/2021 (+Addendum, Finacle HINTTM/HCAACTD, SBINT/MISGN).
- **Verification Status:** **VERIFIED** (equal-share attribution wording in the abridged NSI copy not visible — OQ-24 narrowed to that single citation)

### CS-SCH-005 — Senior Citizens' Savings Scheme (SCSS), G.S.R. 916(E)
- **Death provisions (para 7(2)-(3)):** close on **Form-3**; **SCSS-rate interest to the date of death**, thereafter **POSA rate to final closure**. **Continuation:** "in case of a **joint account, or where the spouse is the sole nominee**, the spouse may continue the account on the same terms… **if the spouse meets the eligibility conditions on the date of death**" — the full statutory continuation rule (OQ-8 CLOSED; confirms and completes R60(10) row 5). Where **both spouses held separate SCSS accounts**, the deceased spouse's account(s) **cannot be continued** — must be closed (para 7(3)).
- **Special restrictions:** legal heir/successor **cannot deposit terminal benefits of deceased serving personnel** into SCSS (para 3(2)); joint account **with spouse only**; no premature-closure penalty applies to death closures (death closure is its own para; penalty paras apply to voluntary closure).
- **Verification Status:** **VERIFIED**

### CS-SCH-006 — Public Provident Fund (PPF), G.S.R. 915(E)
- **Death provisions (para 14):** account **closed; nominee/legal heir NOT allowed to continue**; balance earns **PPF-rate interest till the end of the month preceding payment** (para 14(2)).
- **Loan offset (para 9(6)):** nominee/heir is **liable for unpaid interest on any loan** taken by the holder — adjusted at final closure ("eligible balance" arithmetic).
- **Attachment protection:** credit balance protected from court attachment (para 15; ACT s.14A) — does not bar payment to heirs.
- **Structure:** individual accounts only (no joint facility in the scheme; single-account cap).
- **Verification Status:** **VERIFIED**

### CS-SCH-007 — National Savings Certificates (NSC VIII), G.S.R. 919(E)
- **Premature closure on death** (para 7(1)(a)); interest: **<1 year → principal only**; thereafter slabs per para 7(3)-(4) (POSA simple interest 1–3 years; proportionate table beyond — R60(10) row 9 gist confirmed).
- **Payment on death (para 9):** full GSPR-15 mirror, including the scheme's own no-nomination clause (para 9(6): ₹5L / succession-certificate text as notified 2019 — **not updated** for the 2023 Tahsildar-LHC/ID-proof amendments → **conflict C-12**, GSPR-as-amended governs via later-in-time gazette + para 10 General-Rules bridge; DEA interpretation flagged).
- **⭐ Continuation (para 9(2)):** "Where there are **not more than three surviving nominees or legal heirs**, they may, at their option, **continue the account** and receive deposit+interest on maturity as if they had opened it themselves." — **joint continuation by up to 3 claimants is officially permitted** (OQ-15 CLOSED for NSC).
- **Transfer (para 8):** to heirs/nominees on death; **to the court/court-directed person on court order**; to surviving joint holder(s).
- **Verification Status:** **VERIFIED**

### CS-SCH-008 — Kisan Vikas Patra (KVP), G.S.R. 920(E)
- Same architecture as NSC: premature closure on death (para 6(1)(a)) — **POSA simple interest for completed months if closed before 2½ years** (para 6(2)); **continuation by ≤3 surviving nominees/heirs** (para 9(2)); transfer rules (para 8) incl. court orders and joint survivors; joint survivor owner rule (para 9(4)).
- **Verification Status:** **VERIFIED**

### CS-SCH-009 — Sukanya Samriddhi Account (SSA), G.S.R. 914(E)
- **Death of the account holder (girl child), para 7(1)-(2):** account closed **immediately** on Form-2 with death certificate; **balance + interest to the date of death paid to the GUARDIAN** (scheme-specific payee — see conflict C-13 vs GSPR 10(3) "nominee"; scheme provision is specific and later → engine pays guardian per SSA text); **POSA-rate interest from date of death to closure**.
- **Death of the GUARDIAN, para 7(3):** ground for **compassionate premature closure** (with medical-hardship cases) — complete documentation, reasons recorded in writing, order by the accounts office; payout to account holder or guardian.
- **Structure:** girl-child single account, guardian-operated until she is 18; no joint facility; no nominee-continuation questions arise.
- **Verification Status:** **VERIFIED**

---

## Cross-scheme synthesis (engine view)

| Scheme | Continuation by claimant | Death interest rule | Special death features |
|---|---|---|---|
| POSA | ✗ | to end of month preceding closure | survivor single-account test (close if second single account) |
| RD | ✓ nominee/heir to maturity | Table-1/2 values; full value if continued | **Protected Savings Scheme** (full maturity value; 1-year claim window); guardian-death closure option |
| TD | ✓ to maturity | TD rate completed years + POSA thereafter | joint survivor continue/close |
| MIS | ✗ | to month preceding refund | joint-death ceiling re-test + interest adjustment (29/2021) |
| SCSS | ✓ spouse only (joint holder or sole nominee; eligibility at date of death) | SCSS to date of death, POSA thereafter | terminal-benefits bar; separate-spouse-accounts closure |
| PPF | ✗ (statutory bar) | PPF rate to end of month preceding payment | loan-interest offset; attachment protection |
| NSC | ✓ up to **3** nominees/heirs jointly | principal only <1 yr; POSA 1–3 yrs; table beyond | court-order transfer; scheme's own 15(6)-clone (C-12) |
| KVP | ✓ up to **3** nominees/heirs jointly | POSA <2½ yrs; table beyond | as NSC |
| SSA | ✗ (account dies with the girl) | scheme rate to death, POSA to closure | **payee = guardian**; guardian-death compassionate closure |

**Financial authority & limits:** unchanged by scheme — nomination track no-limit/1-day; Topic-2 matrix otherwise; per-account/per-registration application (R60(1) Note 1). **Court requirements:** unchanged; plus NSC/KVP transfer-on-court-order provisions.

## Superseded / conflicts / gaps (this topic)

- **S-17 (new):** pre-2019 scheme rules (POSA Rules 1981, PORD 1981, POTD 1981, MIS Rules 1987, SCSS Rules 2004, PPF Scheme 1968/2014 etc., compiled in POSB Manual Vol III 2006 ed.) → replaced by the nine 2019 Schemes (G.S.R. 914–922(E), 12.12.2019).
- **C-12 (new):** NSC/KVP schemes' internal no-nomination clauses (9(6)) retain the 2019 text (succession certificate only, no heir-ID item) vs GSPR 15(6) as amended 2023 → GSPR-as-amended governs; harmonising amendment awaited.
- **C-13 (new):** SSA 7(1) pays the **guardian** on the girl's death vs GSPR 10(3) pays the **nominee** — scheme-specific text controls for SSA (Act s.3A schemes; scheme para is the specific provision); flagged for DEA confirmation.
- **OQ-8 closed** (SCSS continuation verbatim). **OQ-15 closed for NSC/KVP** (≤3 continuation), remains open for RD/TD multi-claimant continuation wording. **OQ-24 narrowed** (MIS equal-share citation). **OQ-20 narrowed** (PPF/SSA no-joint is structural in the 2019 texts; explicit "one account/individual" citation to be pinned when full gazette page images are archived).
- **Version caveat:** NSI consolidations incorporate amendments to ~2020-21 (G.S.R. 257/283/285/287/288/290(E) etc.); the 2023 amendments are layered from SB Order 16/2023. Any post-2023 scheme amendments not yet located → standing procurement item **M-15** (e-Gazette sweep for scheme amendments 2024–2026).
