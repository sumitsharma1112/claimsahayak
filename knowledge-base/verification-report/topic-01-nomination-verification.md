# Verification Report — Topic 1: Nomination

**Date:** 10.07.2026 · **Researcher:** ClaimSahayak Lead Research & Knowledge Engineer
**Verdict:** Topic recommended **COMPLETE for v1.0** subject to 6 pending documents (none block the core nomination rules).

## 1. Official documents located (official copies in `sources/`)

| Document | Authority | How obtained |
|---|---|---|
| Government Savings Promotion Act, 1873 (consolidated, incl. Finance Act 2018 amendments) | Statute | India Code official PDF (indiacode.nic.in) |
| GSPR 2018 — G.S.R. 1003(E) dt. 05.10.2018 (full gazette incl. Forms 1–15, Schedules) | Statutory rules | National Savings Institute (nsiindia.gov.in) gazette PDF |
| SB Order 31/2020 dt. 28.08.2020 (+ full revised Rule 60/87 text, claim form, Forms 13–15, sanction memo) | DoP F.S. Division | Signed-copy scan (mirror; India Post original URL dead — see caveat in `sb-orders/sb-order-index.md`) |
| Addendum to SB Order 31/2020 dt. 16.09.2020 (witnesses + ID list + claim form) | DoP | utilities.cept.gov.in (official DoP utility) id=4779 |
| SB Order 36/2020 dt. 06.11.2020 (revised sanction limits) | DoP | utilities.cept.gov.in id=4935 |
| SB Order 01/2023 dt. 09.01.2023 (quick settlement) | DoP | utilities.cept.gov.in id=7440 / indiapost.gov.in |
| SB Order 16/2023 dt. 18.07.2023 + G.S.R. 488(E)/489(E)/490(E) gazettes (En+Hi) | DoP + MoF | utilities.cept.gov.in id=8894 |
| SB Order 29/2021 Addendum dt. 28.10.2021 (Finacle interest adjustment on death) | DoP | utilities.cept.gov.in id=6033 |
| POSB Manual Vol I (legacy edition; Rules 22 & 87) | DoP manual | India Code official regulation upload |

## 2. Official documents still missing (see `missing-documents/`)

SB Order 08/2023 (+G.S.R. 238(E)); SB Order 05/2025 (+G.S.R. 214(E)); SB Order 04/2026 (Internet-Banking nomination); POSB (CBS) Manual corrected up to 31.12.2021 (+SB Order 03/2022); SB Orders 25/2010, 12/2011, 14/2012 (cited historical); SB Order 29/2021 main order; officially-hosted copy of SB Order 31/2020; current Form-11 PDF from indiapost.gov.in (link found, retrieval failed).

## 3. Verified rules extracted

**25 rule records** in `official-rule-book/topic-01-nomination.md`: CS-NOM-001…023 VERIFIED; CS-NOM-024/025 PROVISIONAL-UNVERIFIED (excluded from Official Rule Book). Verbatim statutory texts preserved in `gspr/gspr-2018-nomination-provisions.md`; procedural digest in `cbs-manual/rule-60-deceased-claim-settlement.md`.

## 4. Superseded rules

12 supersession events recorded in `superseded-orders/superseded-orders-register.md` (S-1…S-12), including both generations of GSPR 15(6), three generations of sanction-limit tables, legacy SB-3/SB-55 forms and the 1981/1960/1968 rule repeals.

## 5. Conflicting instructions (conflicts register)

| # | Conflict | Analysis / proposed resolution |
|---|---|---|
| C-1 | **Act s.4A(4): 3 months** vs **GSPR 15(6) & Rule 60(4): 6 months** before discretionary no-evidence settlement | Rules made under Act s.15 prescribe the operative procedure; DoP field rule is 6 months. Rule Engine should use **6 months**; flag statutory discrepancy for legal review (DEA is final interpreter, GSPR Rule 27) |
| C-2 | **SB Order 36/2020 Note 2:** >₹5L payable only on "Succession Certificate" vs **GSPR 15(6)(ii) as amended 03.07.2023:** probate/LoA/succession certificate **or Tahsildar+ legal heir certificate** | Later, higher-ranking instrument (gazette) prevails → accept all four evidences above ₹5L; note that DoP has not re-issued the field table since 488(E) |
| C-3 | **Form 11 footnotes & R60(4)** don't yet reflect the 2023 addition of "identity proof of legal heir" and legal-heir-certificate route | Gazette prevails; forms lag — record as amendment gap |
| C-4 | **GSPR 14(8):** literate depositor needs **no witness** to nominate vs **Form 1 ¶17 / Form 10** carry two witness blocks | Witness blocks operative for illiterate depositors (thumb impression); for literate depositors blocks are non-mandatory. Engine: require witnesses only when thumb impression used |
| C-5 | **Timelines:** R60(13) "all claims within 7 working days" vs 36/2020 & 01/2023 "1 working day where nomination exists" | Later orders control: **1 day nomination / 7 days others** |
| C-6 | **GSPR 19(2)** permits cash payment below IT limit vs **R60(10)(iii)**: deceased-claim payment **invariably by crossed cheque or credit to account** | Departmental restriction is stricter and specific to deceased claims → no cash |
| C-7 | Legacy Manual Vol I Rule 22 permits **institutional nominees** vs Act s.4(1)/GSPR 14(1) "individuals" | Superseded; individuals only (max 4) |

## 6. Open research questions

1. Did G.S.R. 238(E) (31.03.2023) touch Rule 14/15 or only KYC rules? (Official copy needed.)
2. Exact text/date of SB Order 04/2026 (Internet-Banking nomination) — blog-shown date inconsistent.
3. Does the CBS Manual (corrected 31.12.2021) integrate 31/2020+36/2020 verbatim or with further edits (e.g., Rule 60 numbering, Rule 37(3) cross-ref)?
4. Is there any post-2020 order on **nomination registration fee in Finacle (CNOM/CMRC menus)** or acknowledgment of nomination registration to depositor?
5. Whether "first nomination free" (only *change/cancellation* was fee-bearing) is stated anywhere post-2018 explicitly (Schedule II implies it).
6. SCSS-specific nomination variations (spouse-continuation) to be re-verified against SCSS Scheme 2019 gazette in the scheme-wise topic.

## 7. Confidence assessment

| Layer | Confidence | Basis |
|---|---|---|
| Act 1873 (ss. 3–8, 10, 12) | **High** | Official consolidated India Code text |
| GSPR 2018 Rules 14/15 + Forms + 2023 amendment | **High** | Two official gazette PDFs (NSI + SB Order 16/2023 annexure) cross-checked |
| Rule 60/87 procedure | **High** | Full text from signed SB Order 31/2020; corroborated by officially-hosted Addendum, 36/2020, 01/2023 |
| Financial powers matrix | **Medium-High** | 36/2020 official but scanned table partially garbled; cross-checked against 31/2020 text; final confirmation in Topic 6 |
| Fee abolition (2025), Internet-Banking nomination (2026) | **Low (UNVERIFIED)** | Reference sources only — excluded from Official Rule Book |

## 8. Recommendation

**Topic 1 is complete** for Rule Book v1.0. The verified rule set covers: mandatory nomination, 1–4 nominees, shares, owner/trustee capacity, minor-nominee appointee, variation/cancellation, cancellation events, witnesses, NRI nominees, payment procedure to nominees, precedence vs court claimants, posthumous registration of unregistered nominations, armed-forces exception, and all supersession history. Pending documents affect only (a) the fee element and (b) an online-channel convenience feature — neither changes claim-settlement logic.

**STOP — awaiting approval to proceed to Topic 2 (Multiple Nominees).**
