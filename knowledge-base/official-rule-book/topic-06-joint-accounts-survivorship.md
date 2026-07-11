# Topic 6 — Joint Accounts & Survivorship (Official Rule Book)

**Status:** ✅ **LOCKED — ClaimSahayak Official Rule Book, Version 1.0, Topic 6 – Joint Accounts & Survivorship** (approved 10.07.2026). Changes only via a new approved amendment entry; verification report retained at `verification-report/topic-06-joint-accounts-verification.md`.
**Scope:** Joint account types in POSB, survivorship on death of one/both/all holders, survivor dying before settlement, interplay with nomination (incl. multiple nominees), minor/guardian questions, forms/documents/declarations, powers/limits/court requirements, scheme-wise differences.

**Terminology finding (items 3–6 of the approved scope):** POSB law recognises **only two joint-account types** — **Joint 'A'** and **Joint 'B'** (GSPR 8(2)). There is **no "Joint C"**, and the banking labels **"Either or Survivor" / "Former or Survivor" / "Anyone or Survivor" do not exist** in any official India Post instrument. Functionally, Joint 'B' corresponds to either/any-or-survivor operation; nothing corresponds to "Former or Survivor". Any wizard input using bank-style labels must be mapped to Joint A/Joint B or rejected.

---

## A. Joint account architecture

### CS-JNT-001 — Joint account: definition and types
- **Scenario:** Classifying a joint holding
- **Rule statement:** A **Joint Account** is an account opened in the names of **more than one and up to four individuals** (GSPR 3(1)(e)). By mode of operation there are two types (GSPR 8(2)): **Joint 'A'** — operated by **all** the depositors **or the surviving depositors jointly**; **Joint 'B'** — operated by **any** of the depositors **or the surviving depositors severally**. Scheme rules cap the number of joint holders below the GSPR-definition ceiling (e.g., POSA: **maximum three adults**, G.S.R. 489(E) dt. 03.07.2023; SCSS: **spouse only**).
- **Official Source:** GSPR 3(1)(e), 8(1)–(2) (G.S.R. 1003(E), p.35/PDF p.3); G.S.R. 489(E) (SB Order 16/2023, official annexure)
- **Applicable Schemes:** joint facility exists scheme-wise (see CS-JNT-011) · **Effective:** 12.10.2018; POSA 3-adult cap 06.07.2023
- **Verification Status:** **VERIFIED** · **Conflict C-11:** GSPR definitional ceiling (4) vs scheme caps (3/2/spouse-only) — scheme rules control per ACT s.3A; engine uses scheme caps.

### CS-JNT-002 — Conversion rules; sole-survivor conversion to single account
- **Scenario:** Changing account composition after a death
- **Rule statement:** An account opened as single **cannot** be converted to joint or vice versa (GSPR 8(3)). **Proviso (w.e.f. 06.07.2023):** "conversion of Joint Account into single account shall be allowed only in case of a **single surviving Joint Account holder**."
- **Official Source:** GSPR 8(3) as substituted by **G.S.R. 488(E)** dt. 03.07.2023 (SB Order 16/2023, PDF pp.2/12)
- **Required Forms/Documents:** application by the surviving holder with death certificate of the deceased holder(s) (departmental application; legacy plain-paper applications under Vol I Rule on conversions — superseded procedure, CBS operation now)
- **Court Order:** None · **Verification Status:** **VERIFIED**

### CS-JNT-003 — Nomination in joint accounts: made jointly; operative only when ALL depositors die
- **Scenario:** Interplay of nomination and joint holding (scope items 10–12)
- **Rule statement:** In a joint account, the nomination (1–4 nominees, shares, owner/trustee) is made by **the depositors** together (GSPR 14(1); ACT s.4(1)); the nominee(s) become entitled **only "in the event of the death of … all the depositors in a joint account."** While any holder survives, the nomination confers **no rights** — survivorship governs. Multiple-nominee mechanics (shares, predecease, minors) then apply exactly per locked Topics 3–5. Variation of the nomination requires a fresh Form 10 — by the depositors (Joint-A signature discipline: all sign; Form 1 item 14/Form 10 executed by "depositor(s)").
- **Official Source:** ACT s.4(1); GSPR 14(1), 15(1); Forms 1 ¶14/¶17, 10
- **Applicable Schemes:** all schemes offering joint accounts
- **Verification Status:** **VERIFIED**
- **Note (OQ-22):** no official text states whether a **surviving holder alone** may vary the joint nomination after a co-holder's death (pre-2023 he could not convert the account; post-2023 conversion to single is allowed, after which he nominates as sole depositor). Engine default: **convert to single, then re-nominate** — fully supported by 8(3) proviso + 14.

---

## B. Death events and survivorship

### CS-JNT-004 — Death of one (or some) joint holders: survivorship, no claim settlement
- **Scenario:** One holder of a Joint A/B account dies; at least one holder survives
- **Rule statement:** The account **continues with the surviving depositor(s)** — Joint A operated by the survivors jointly, Joint B by any survivor severally (GSPR 8(2): "…or the surviving depositors…"). **No deceased-claim settlement arises**; the balance is not payable to the deceased holder's heirs or to the nominee. The death is recorded against the account (death certificate produced; CBS/BO records noted — R60(14) analogue for BO journals), and a **sole survivor may convert the account to single** (CS-JNT-002). Legacy statement of the same principle: "On the death of one of the joint depositors, **the survivor shall be treated as the sole owner** of the account" (POSB Manual Vol I — MIS chapter and RD Rule 117(ii); pre-2018 anchor).
- **Official Source:** GSPR 8(2)–(3) (current); POSB Manual Vol I 117(ii)/MIS ch. (legacy corroboration)
- **Required Documents:** death certificate of the deceased holder; survivor's ID for record update · **Affidavit/Indemnity:** None · **Court Order:** None
- **Competent Authority / Limit:** no sanction required (not a claim) — post office records the death and continues/converts the account
- **Verification Status:** **VERIFIED**

### CS-JNT-005 — Death of ALL joint holders: nomination/heirs tracks open
- **Scenario:** Both (or all) holders are dead
- **Rule statement:** On the death of **all** depositors the eligible balance becomes payable (GSPR 15(1)): to the **registered nominee(s)** if the joint nomination is in force (nomination track — no limit, 1 working day, Topic 1/4 procedures); otherwise to the **legal heirs** under the no-nomination rules (Topic 2 — six-month gate, ₹5L discretionary ceiling, evidence routes). Which estate? — see CS-JNT-006.
- **Official Source:** GSPR 14(1), 15(1)–(6); R60(1)–(4)
- **Forms/Documents/Powers:** exactly per the applicable track (Form 11 etc.); **death certificates of every joint holder** are mandatory to establish that no holder survives
- **Verification Status:** **VERIFIED**

### CS-JNT-006 — Survivor dies before settlement/withdrawal: whose estate?
- **Scenario:** Holder-1 died; survivor became entitled; survivor then dies (scope item 9)
- **Rule statement:** By survivorship the surviving holder became **sole owner** (CS-JNT-004). On the survivor's death, therefore: (a) if the **joint nomination** is in force, the nominee(s) take — GSPR 14(1)'s condition ("death of all the depositors") is now satisfied; (b) if not, the balance belongs to the **estate of the last surviving holder** — his/her **legal heirs** claim under Topic 2; the **first-deceased holder's heirs have no claim**. Legacy statement: on death "of the survivor in a joint account, the legal heir/nominee **of the survivor**" may claim/continue (Vol I RD Rule 117(i)).
- **Official Source:** GSPR 8(2), 14(1), 15(1)/(6) (current construction); POSB Manual Vol I 117(i)–(ii) (legacy, explicit)
- **Required Documents:** death certificates of **all** holders (sequence of deaths determines the estate); then per track
- **Competent Authority / Limit / Court:** per applicable track (nomination = no limit; heirs = Topic 2 matrix; dispute = court succession certificate)
- **Verification Status:** **VERIFIED** (legacy explicit + current construction consistent; flagged **OQ-23** for an express current-text confirmation of the "survivor's estate" rule)

### CS-JNT-007 — Armed forces holder; account-office duties on notice of death
- **Rule statement:** GSPR 17 (CO/Committee-of-Adjustment requisition) binds the Accounts Office in respect of a deceased **depositor** of a joint account as it does for single accounts (rule text: "a depositor serving in the Army…dies" — not limited to single accounts); freeze/objection checks (R60(2)(viii)(d)) apply before any payment. GDS BPM notes the death against DLT/specimen-signature records and blocks transactions in the relevant account on receiving death information (R60(14)).
- **Official Source:** GSPR 17; R60(2)(viii), R60(14)
- **Verification Status:** **VERIFIED**

---

## C. Minors, guardians and joint accounts

### CS-JNT-008 — Minor cannot be a joint holder; no guardian-operated joint accounts
- **Scenario:** Scope items 13–14
- **Rule statement:** Joint accounts are opened by **adults** (POSA: "upto a maximum of three adults in joint names" — G.S.R. 489(E); MIS/other scheme provisions likewise adult-framed; legacy Vol I: "Joint accounts can be opened by two or three adults"). A **minor's account** is a **single account** opened by the minor (10+) or by the **guardian on the minor's behalf** (GSPR 4(1)–(2)); no official instrument permits a guardian-operated **joint** account or a minor as co-holder. Exception of a different kind: a **blind/visually-challenged or illiterate depositor may open a joint account with a literate depositor** (GSPR 5(5)) — both adults.
- **Death consequences:** a "minor joint holder" case therefore cannot arise under current law; legacy pre-2018 accounts, if any exist, are governed by the repealed 1981 rules for pre-commencement questions (GSPR 25).
- **Official Source:** GSPR 4(1)–(2), 5(5); G.S.R. 489(E); legacy Vol I Ch.1 (I)
- **Verification Status:** **VERIFIED**

---

## D. Forms, documents, declarations, powers (consolidated)

### CS-JNT-009 — Consolidated requirements by event
| Event | Forms | Documents | Affidavit/Disclaimer/Indemnity | Declarations | Authority/Limit | Court |
|---|---|---|---|---|---|---|
| One holder dies, other(s) survive | none (record update); conversion application if sole survivor opts | death certificate of deceased holder; survivor KYC | None | none official (office notes death; BO journal entry) | no sanction — not a claim | No |
| All holders die, nomination in force | Form 11 (in duplicate) | death certificates of **all** holders (+ any deceased nominee, original); passbook; nominees' ID (15(7)); 2 witnesses | None (Form 14 only for nominee-authorisation route) | acquittance; minor-share declarations (Topic 5) | **No limit — any SPM/PM; 1 working day** | No |
| All holders die, no nomination | Form 11 + Forms 13/14/15 (≤₹5L, after 6 months) or legal evidence | death certificates of all holders; passbook; heir ID; evidence documents | Form 13 + 14 + 15 (discretionary route) | reasons recorded in writing by sanctioning authority | Topic-2 matrix ₹50k/₹1L/₹5L; legal evidence no limit | >₹5L or dispute |
| Survivor died before settlement | as above, applied to the **survivor's** estate/nominee | death certificates establishing sequence | as per track | as per track | as per track | as per track |
- **Official Source:** GSPR 8/14/15; R60(1)–(4), (12)–(14); SB Orders 31/2020, 36/2020, 01/2023, Addendum 16.09.2020
- **Verification Status:** **VERIFIED**

---

## E. Scheme-wise differences

### CS-JNT-010 — MIS: joint ceiling and excess-on-death adjustment
- **Rule statement:** MIS deposit ceilings: **₹9 lakh single / ₹15 lakh joint** (G.S.R. 490(E) dt. 03.07.2023, official annexure to SB Order 16/2023); **in a joint account each holder has equal share for limit purposes** (MIS scheme rules — legacy Vol I text attributes investment differently for SCSS; for MIS the 2019 scheme provides equal share — gazette re-check under M-12). **On the death of a joint holder**, the account continues for the survivor as a **single** holding; deposits **exceeding the single-account ceiling** must be refunded, and interest on the excess is adjusted: MIS rate applies up to the date of death (+ applicable date arithmetic), **POSA (SB) rate** thereafter on the excess — Finacle procedure via **HINTTM/HCAACTD** with SBINT/MISGN codes (whole-closure, partial-excess-closure and post-maturity scenarios prescribed).
- **Official Source:** **SB Order 29/2021 dt. 13.10.2021 + Addendum dt. 28.10.2021** (official, archived); G.S.R. 490(E)
- **Applicable Scenario:** death of MIS joint holder · **Authority:** CBS post office (SOL/SBCO for post-maturity recovery); no claim sanction involved
- **Verification Status:** **VERIFIED** (Addendum in hand; main order 13.10.2021 still M-9)

### CS-JNT-011 — Scheme-by-scheme joint/survivorship map
| Scheme | Joint facility | Survivorship/death notes | Anchor & status |
|---|---|---|---|
| **SB (POSA)** | Joint A/B, **max 3 adults** (was 2) | survivor continues / converts to single; nominee on death of all | G.S.R. 489(E) ✅ |
| **RD** | Joint (adults) | survivor sole owner; continue-to-maturity / discontinue / immediate proportionate claim options for nominee/heir (legacy 117; current NS-RD 2019 + R60(10) row 2) | R60(10) ✅; NS-RD gazette re-check M-12 |
| **TD** | Joint (adults) | as RD (R60(10) row 3) | ✅ / M-12 |
| **MIS** | Joint, ₹15L ceiling | CS-JNT-010 excess adjustment | ✅ |
| **SCSS** | **Joint with spouse ONLY**; whole deposit attributed to first holder | on first holder's death, **spouse joint-holder continues** the account (survivorship); if spouse does not continue → close, SCSS interest to date of death, POSA thereafter; separate accounts of both spouses cannot be merged/continued on death | R60(10) row 5 ✅ (spouse-sole-nominee continuation); joint-spouse continuation + attribution from SCSS scheme rules — legacy Vol I explicit, 2019 gazette re-check M-12 (**OQ-8** consolidated here) |
| **PPF** | **No joint accounts** (individual only) | n/a — single-account rules | legacy Vol III/ scheme practice; PPF Scheme 2019 gazette re-check **OQ-20** |
| **NSC/KVP** | Joint A/B certificates (adults) | survivor(s) hold; on death of all → nominee/heirs; per-registration limits (R60(1) Note 1) | scheme 2019 gazettes re-check M-12 |
| **SSA** | **No joint** (girl-child single account, guardian-operated) | account-holder death → guardian/nominee rules (Topic 5/scheme) | scheme gazette re-check **OQ-20** |
- **Verification Status:** rows marked ✅ verified from archived instruments; unmarked scheme-gazette details **pending M-12** (no rule asserted beyond verified text).

---

## F. Superseded / conflicts / gaps

- **S-15 (new):** POSA joint accounts "two adults jointly" (POSA Scheme 2019 original) → "**upto a maximum of three adults in joint names**" by G.S.R. 489(E) dt. 03.07.2023 (SB Order 16/2023). Impact: three-adult joint POSA accounts.
- **S-16 (new):** GSPR 8(3) absolute conversion bar (2018) → proviso allowing **joint→single conversion for the sole surviving holder** by G.S.R. 488(E) dt. 03.07.2023. Impact: survivors no longer locked into joint-titled accounts.
- Legacy PORD/POTD/MIS/SCSS 1981–2004 rule texts (Vol I/Vol III compilations) — repealed/superseded (S-2 umbrella); retained as corroborative anchors.
- **C-11:** GSPR 3(1)(e) four-individual definition vs scheme caps (POSA 3; SCSS spouse-only) — scheme rules control (ACT s.3A); engine uses scheme caps.
- **OQ-22:** variation of a joint nomination by the surviving holder alone (default: convert to single, then re-nominate).
- **OQ-23:** express current-text confirmation that the balance vests in the **last surviving holder's estate** (legacy explicit; current by construction).
- **OQ-20:** PPF/SSA joint-prohibition current-gazette citation. **OQ-24:** MIS equal-share attribution in joint accounts (2019 gazette text) — needed to compute post-death excess precisely.
- Simultaneous death of joint holders (sequence unknown): no DoP instruction — excluded (same stance as commorientes, Topic 3).
