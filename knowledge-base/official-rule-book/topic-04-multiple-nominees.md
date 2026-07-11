# Topic 4 — Multiple Nominees (Official Rule Book)

**Status:** ✅ **LOCKED — ClaimSahayak Official Rule Book, Version 1.0, Topic 4 – Multiple Nominees** (approved 10.07.2026). Changes only via a new approved amendment entry; verification report retained at `verification-report/topic-04-multiple-nominees-verification.md`.
**Scope:** Every official rule applicable when a POSB/NSS account or certificate has **two, three or four nominees**: share structures, deaths among nominees (cross-referencing locked Topic 3), minor+major mixes, payment mechanics (joint vs separate), renunciation/disclaimer, documents, forms, powers, scheme-wise differences.

**Legend:** as in Topics 1–3. Nomination-track claims (this topic) carry **no monetary limit** and the **1-working-day** timeline.

---

## A. Creating a multi-nominee nomination

### CS-MNM-001 — Two to four nominees; percentage shares; per-nominee capacity
- **Official Source:** **GSPR 14(1)** (G.S.R. 1003(E), p.36); **ACT s.4(1)**; Form 1 ¶17 / Form 10 (nominee table rows 1–4)
- **Applicable Schemes:** All
- **Trigger:** Depositor(s) nominate at opening (Form 1) or later (Form 10)
- **Decision:** Up to **four individuals** may be nominated. For **each** nominee the depositor records: name & relationship, full address, **Aadhaar number**, DOB if minor, **percentage share of entitlement**, and **nature of entitlement — owner (absolute) or trustee** for the depositor's legal heirs. Capacity is set **per nominee** (the form's "Nature of entitlement Trustee or owner" is a per-row column) — a mix of owner- and trustee-nominees is therefore permissible on the face of the statutory form.
- **Equal vs unequal:** shares are whatever percentages the depositor specifies (unequal allowed); **if no shares are specified, the law imputes equal shares at payment** (GSPR 15(3)) — the depositor need not fill the column for an equal split.
- **Notes:** No official text requires shares to total 100% or prescribes rounding; validation left to the engine as a data-quality rule, flagged **OQ-13**.
- **Verification Status:** **VERIFIED**

### CS-MNM-002 — Appointee for each minor nominee; NRI co-nominees
- **Official Source:** **GSPR 14(2)** (appointee "in the event of the death of the depositor during the minority of the nominee"); Form 1 ¶17 / Form 10 appointment clause ("As the nominee(s) at Serial No.(s)… is/are minor(s), I appoint Shri/Smt/Kumari… to receive the sum due…"); **GSPR 14(9)** (NRI nominee, non-repatriation)
- **Decision:** Where **any** of the multiple nominees is a minor, the depositor appoints an individual (the form supports one appointee covering the named minor serial numbers) to receive that minor's payment. NRIs may be among the nominees; **their share is payable on non-repatriation basis** (other nominees unaffected).
- **Verification Status:** **VERIFIED**

---

## B. Payment on death of depositor — share mechanics

### CS-MNM-003 — Distribution among surviving nominees
- **Official Source:** **GSPR 15(3)–(4)**; **ACT s.4A(3)**; **R60(2)(iv)–(v)** (SB Order 31/2020)
- **Trigger:** Depositor (single) / all joint depositors die; ≥2 nominees named
- **Decision:**
  1. All named nominees surviving → each takes the **specified percentage**; if none specified, **equal shares**.
  2. Any nominee **predeceased** the depositor → that share is **redistributed among surviving nominees pro-rata** to their specified shares (equal if none specified). The predeceased nominee's heirs take **nothing** (locked Topic 3, CS-PRE-001/002).
  3. Nominee(s) die **after** the depositor but others survive at settlement → **survivors take** (ACT s.4A(3); C-10 resolution).
  4. **No nominee alive at settlement** → claim settled in favour of the **legal heirs of the last deceased nominee** (R60(2)(iv); locked Topic 3, CS-PRE-004).
- **Verification Status:** **VERIFIED**

### CS-MNM-004 — Joint claim and payment to all nominees; acquittance
- **Official Source:** **R60(2)(ii)** ("The nominee/nominees may make an application in prescribed Form (in duplicate)…"), **R60(2)(xi)** ("Where there is more than one surviving nominee, payment should be made to the **all** nominee(s) as per their share(s) specified, after taking acquittance on sanction."); SB Order 01/2023 ¶3(c) (account details + acquittance at submission)
- **Decision:** The default current procedure is a **single claim by the nominees together**, sanctioned once, with **payment to every surviving nominee per share** against their acquittance on the sanction. Each nominee's share is paid by **crossed cheque or credit to that nominee's POSB/bank account** (R60(10)(iii)).
- **Historic contrast (superseded):** legacy Vol I 87(2)(ii)/(v) allowed nominees to **claim jointly or separately**, with partial payment to willing nominees, detention of the passbook and **notice to the other nominees** — discontinued 28.08.2020 (register S-13).
- **Verification Status:** **VERIFIED**

### CS-MNM-005 — Renunciation / one nominee authorising another (disclaimer route)
- **Official Source:** **R60(2)(xi) Note** (SB Order 31/2020): "In case of exceptional circumstances where all the nominees are not in a position to submit claim or able to attend post office jointly, they may **authorize nominee(s) to claim/take payment** and the claimant nominee may submit **disclaimer from other nominees in Form 14 of GSPR-2018 along with their KYC documents**. In such case, payment can be made to the claimant nominee(s)."
- **Trigger:** A co-nominee cannot attend / does not wish to take payment himself
- **Decision:** Non-claiming nominee(s) execute **Form 14 (Letter of disclaimer)** — notarially attested, on non-judicial stamp paper per State Stamp Act — and supply **their KYC documents**; the claimant nominee(s) then receive payment (including the disclaiming nominees' shares).
- **Affidavit/Indemnity:** NOT required for this route (disclaimer + KYC only)
- **Notes:** This is the only official renunciation mechanism on the nomination track. It requires the co-nominee's **cooperation** (signed disclaimer + KYC).
- **Verification Status:** **VERIFIED**

### CS-MNM-006 — Co-nominee not traceable, unwilling to sign, or in conflict *(gap — no official rule)*
- **Search result:** No SB Order, GSPR provision or manual rule prescribes a procedure where a co-nominee is **untraceable or refuses to cooperate** (neither claiming nor disclaiming). The superseded partial-payment/notice mechanism (S-13) is no longer available; R60(2)(xi) requires payment to **all** nominees, and the disclaimer route needs the absentee's signature.
- **Engine guidance (derived, flagged):** treat as a **doubtful/contested-type case** — sanctioning authority makes inquiries and refers upward (R60(4)(D) applies in terms to no-evidence claims; the referral principle plus R60(4)(C) "cases presenting special features… referred to the Directorate" is the only official escape hatch). If a **dispute** is actually raised, the GSPR 15(6) dispute proviso (court succession certificate) governs the estate route — but that proviso is written for no-nomination claims, not intra-nominee deadlock.
- **Verification Status:** **UNVERIFIED as a rule** — logged as **OQ-14** (Directorate clarification needed). Not part of the Official Rule Book beyond the referral principle.

### CS-MNM-007 — Minor and major nominees together
- **Official Source:** **GSPR 15(5)**; **ACT s.4A(2)**; **R60(2)(vi)**; R60(6)(iii), R60(7)
- **Trigger:** At settlement, one or more of the surviving nominees is a minor
- **Decision:** The **major nominees** are paid their shares directly; the **minor nominee's share** is paid to the **person appointed** by the depositor (GSPR 14(2)), or if none, to the **guardian of the minor** (mother/father; else person entitled to care of the minor's property; court-appointed guardian — ACT s.3(h)). Natural guardians need **no guardianship certificate** (R60(6)(iii)); the recipient furnishes the "**minor is alive** and money required for the minor's use" certificate (R60(7)(c)); payment directly to the minor is **not a valid discharge** (R60(7) Note 2).
- **Documents (delta for the minor's share):** appointee/guardian ID + address proof; proof of guardianship only where the claimant is **not** a natural guardian.
- **Verification Status:** **VERIFIED**

---

## C. Documents, forms, powers (multi-nominee claims)

### CS-MNM-008 — Consolidated requirements
- **Official Source:** GSPR 15(2)/(7); R60(2)(ii)–(iii), (viii); Addendum 16.09.2020; SB Order 01/2023; Form 11
- **Requirements:**
  - **Form:** Form 11 / DoP operational claim form, **in duplicate**, signed by the claiming nominees (all, unless the Form-14 disclaimer route is used).
  - **Documents:** death certificate of depositor (original or compared photocopy); **original death proof of every deceased nominee**; passbook/certificates in original (lost passbook → R60(2)(xii)); **ID + address proof of every claiming nominee** (GSPR 15(7)); appointee/guardian papers for minor shares; **two witnesses** with self-attested ID/address proofs (physical presence not required).
  - **Affidavit (13)/Indemnity (15):** NOT required on the nomination track. **Disclaimer (14):** only for the CS-MNM-005 route.
  - **Financial authority:** any SPM/PM where the nomination is registered — **no limit** (R60(2) Note 1); GDS BPM accepts & forwards; discontinued schemes → HPO; **1 working day**; verification checklist R60(2)(viii) incl. freeze/pledge check; **no PRI/SDI verification**; sanction on the claim form (no memo).
  - **Payment:** crossed cheque or account credit **per nominee**; acquittance from each payee.
- **Verification Status:** **VERIFIED**

---

## D. Scheme-wise differences

### CS-MNM-009 — Scheme-wise notes for multiple nominees
- **Official Source:** R60(10)–(11) (SB Order 31/2020); R60(1) Note 1; SB Order 29/2021+Addendum
- **Decisions:**
  - **SCSS:** the spouse-continuation option exists **only where the spouse is the SOLE nominee** (R60(10) item 5(i) — verbatim "If Spouse is sole nominee…"). **Naming multiple nominees in SCSS therefore forecloses spouse continuation**; all nominees close and take payment (SCSS rate to date of death, POSA thereafter).
  - **RD/TD/NSC/KVP:** continuation/transfer-to-own-name is available to the claimant nominee(s) (R60(10)-(11); sanction-memo text). **No official text prescribes how a single account/certificate is continued by several nominees jointly with shares** — division/joint holding on continuation is unregulated; logged **OQ-15** (engine default: continuation only where a single nominee (or single claimant via disclaimer route) takes the whole holding; otherwise closure and share payout).
  - **Certificates (NSC/KVP):** the ₹5L discretionary limit and sanction thresholds apply **per registration number** (R60(1) Note 1) — relevant only if the case falls off the nomination track.
  - **MIS/SSA/PPF/SB:** closure per shares; interest per R60(10) table rows.
  - No scheme deviates from the 1–4 nominee framework of GSPR 14(1) (scheme gazette re-check consolidated under OQ-12).
- **Verification Status:** **VERIFIED** (with OQ-15 gap logged)

---

## E. Superseded (never delete)

- **S-13** (registered in Topic 3): joint-or-separate claims with partial payment/notice/passbook detention (Vol I 87(2)(ii)/(v)) → replaced by pay-all-per-shares + Form-14 disclaimer (R60(2)(xi)), w.e.f. 28.08.2020.
- Pre-2018 single-scheme nomination rules (POSC Rules 1960 etc.) → GSPR 2018 (S-2).
- Institutional nominees (legacy Vol I 22(1) Note) → individuals only, max 4 (C-7; S-3).

## F. Conflicts & gaps referenced

- **C-10** (Topic 3): post-depositor death of a co-nominee with survivors — survivors take; vesting only when none survive.
- **OQ-13:** no official rule that shares must total 100% / rounding treatment.
- **OQ-14:** untraceable/unwilling co-nominee — no official procedure post-2020 (CS-MNM-006).
- **OQ-15:** continuation of RD/TD/NSC/KVP by multiple nominees jointly — unregulated.
- **OQ-16:** whether separate Form-11 applications by different nominees remain permissible at all after R60(2)(xi) (legacy 87(2)(ii) allowed it; current text is silent on separate claims, prescribing payment to all after one sanction) — engine default: single consolidated claim.
