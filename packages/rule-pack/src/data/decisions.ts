import type { CompetentAuthority, DecisionRecord } from "@claimsahayak/shared-types";

/**
 * ClaimSahayak Official Rule Book v1.0 integration — one DecisionRecord per
 * outcome BUCKET (the same id-space RouteRule.target/OutputRule.routeId
 * already uses), carrying the attributes objective 5 / Milestone 5 Part 3
 * requires that nothing else in the pack structures: a plain-language
 * Decision, the Reason for it, a payable/not-payable/not-applicable/
 * pending-information status, the Competent Authority (with limits/
 * timeline — the Decision Matrix §3 authority-resolution function),
 * whether a court order is required (the Decision Matrix's own "Court"
 * column), Official References, a postmaster-facing next processing
 * action, and (where genuinely sourced) internal processing notes.
 * Required documents/forms remain in outputs/*.ts — this file does not
 * duplicate them. "Applicable Rule IDs" and "Monetary Limit" are NOT
 * authored here — the Rule Engine derives them at resolution time from
 * `officialReferences`/`rulebookRefs` and `competentAuthority`.
 *
 * `processingNotes` is set uniformly from the Decision Matrix §4 timeline/
 * payment constants ("every claim: same-day acknowledgment; register
 * entry; monthly register review" — R60(12)-(13)), since that applies to
 * every claim record regardless of outcome, not a per-decision detail.
 */

const REGISTER_NOTE = {
  en: "Acknowledge the claim the same day it is received, and log it in the Register of Deceased Claim Cases for monthly review.",
};

const NOM_TRACK_AUTHORITY: readonly CompetentAuthority[] = [
  {
    authorityLabel: {
      en: "The Post Office staff at the branch where the account is held",
    },
    timelineWorkingDays: 1,
  },
];

/** Decision Matrix §3 "legal-evidence-track" ladder (D-08 / ROUTE_B). */
const LEGAL_EVIDENCE_AUTHORITY: readonly CompetentAuthority[] = [
  {
    authorityLabel: { en: "Front-line Post Office staff at a smaller branch" },
    monetaryLimitInr: 50000,
    timelineWorkingDays: 7,
    escalatesTo: { en: "Senior Post Office staff or the Divisional Head, for amounts above this limit" },
  },
  {
    authorityLabel: { en: "Senior Post Office staff at a mid-sized branch" },
    monetaryLimitInr: 100000,
    timelineWorkingDays: 7,
    escalatesTo: { en: "The Divisional Head, for amounts above this limit" },
  },
  {
    authorityLabel: { en: "Post Office staff at a Head Post Office or the GPO" },
    timelineWorkingDays: 7,
  },
  {
    authorityLabel: { en: "The Divisional Head" },
    timelineWorkingDays: 7,
  },
];

/** Decision Matrix §3 "no-evidence-track (≥6 months)" ladder (D-09 / ROUTE_C). */
const NO_EVIDENCE_DISCRETIONARY_AUTHORITY: readonly CompetentAuthority[] = [
  {
    authorityLabel: { en: "Front-line Post Office staff at a smaller branch" },
    monetaryLimitInr: 50000,
    timelineWorkingDays: 7,
    escalatesTo: { en: "The Divisional Office, for amounts above this limit" },
  },
  {
    authorityLabel: { en: "Senior Post Office staff at a mid-sized branch" },
    monetaryLimitInr: 100000,
    timelineWorkingDays: 7,
    escalatesTo: { en: "The Divisional Office, for amounts above this limit" },
  },
  {
    authorityLabel: { en: "A Gazetted officer" },
    monetaryLimitInr: 500000,
    timelineWorkingDays: 7,
    escalatesTo: {
      en: "Above ₹5,00,000, there is no discretionary approval at all — a court/revenue document becomes mandatory (see the more-than-₹5-lakh outcome)",
    },
  },
];

export const DECISIONS: readonly DecisionRecord[] = [
  {
    id: "DEC_card_info_end_old_scheme",
    routeId: "card_info_end_old_scheme",
    decision: {
      en: "This is not settled through this checklist — it is handled directly at the Head Post Office (HPO) or GPO.",
    },
    reason: {
      en: "Older or discontinued schemes (NSS-87, NSS-92, PPF (HUF), IVP, 6th/7th-issue NSC, and similar) are outside the routine branch-office claim process.",
    },
    decisionStatus: "pending_information",
    competentAuthority: [{ authorityLabel: { en: "Head Post Office (HPO) or GPO" } }],
    courtOrderRequired: "no",
    officialReferences: [{ csId: "CS-NOM-019", citation: { en: "R60(2) Note 2 / (3)(v)" } }],
    nextActionForPostmaster: {
      en: "Forward the claimant to the Head Post Office or GPO; no claim action is taken at this branch.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["M-I"],
  },
  {
    id: "DEC_card_guardian_change",
    routeId: "card_guardian_change",
    decision: { en: "No money is payable yet — a new guardian is registered on the child's still-open account." },
    reason: {
      en: "The child is alive; only the guardian has died or changed. The succeeding guardian follows the usual hierarchy (another parent, then a person entitled to act, then a court-appointed guardian).",
    },
    decisionStatus: "not_applicable",
    competentAuthority: NOM_TRACK_AUTHORITY,
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-MIN-009", citation: { en: "GSPR 2018, Rule 10(4)" } },
    ],
    nextActionForPostmaster: {
      en: "Register the new guardian using a fresh Account Opening Form and KYC; no claim form or approval is needed.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-13"],
  },
  {
    id: "DEC_ROUTE_SSA_MINOR",
    routeId: "ROUTE_SSA_MINOR",
    decision: {
      en: "The Sukanya Samriddhi Account is closed immediately and paid to the guardian — whether or not a nominee is registered.",
    },
    reason: {
      en: "SSA is a single exception to the usual nominee-first rule: on the girl child's death, the guardian is always the payee, and the scheme rate applies up to the date of death, Post Office savings rate afterwards.",
    },
    decisionStatus: "payable",
    competentAuthority: NOM_TRACK_AUTHORITY,
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-SCH-009", citation: { en: "SSA Scheme Rules 2019 (G.S.R. 914(E)), para 7(1)/(3)" } },
      { csId: "CS-NOM-010", citation: { en: "GSPR 2018, Rule 15" } },
    ],
    nextActionForPostmaster: {
      en: "Verify the guardian's ID and the child's death certificate, process the premature-closure application, and pay the guardian within 1 working day.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-13"],
  },
  {
    id: "DEC_ROUTE_PPF_MINOR",
    routeId: "ROUTE_PPF_MINOR",
    decision: { en: "The PPF account is closed and paid to the guardian at the PPF interest rate." },
    reason: {
      en: "A PPF account cannot be continued by a nominee or guardian after the account holder's death — closure is the only option.",
    },
    decisionStatus: "payable",
    competentAuthority: NOM_TRACK_AUTHORITY,
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-NOM-010", citation: { en: "GSPR 2018, Rule 15" } },
      { csId: "CS-MIN-012", citation: { en: "PPF Scheme Rules 2019 (G.S.R. 915(E))" } },
    ],
    nextActionForPostmaster: {
      en: "Verify the guardian's ID and the child's death certificate, close the account at the PPF rate, and pay the guardian within 1 working day.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-13"],
  },
  {
    id: "DEC_ROUTE_SURVIVOR",
    routeId: "ROUTE_SURVIVOR",
    decision: {
      en: "No claim is made. The surviving joint holder continues the account and may convert it to a single-name account.",
    },
    reason: {
      en: "One holder dying on a joint account is survivorship, not a death claim — the account simply continues in the survivor's name. (For a Savings Account, if the survivor already holds another single account, this one must instead be closed, since only one single POSA account per person is allowed.)",
    },
    decisionStatus: "not_applicable",
    competentAuthority: [{ authorityLabel: { en: "The post office where the account is held (records the death; no approval needed)" } }],
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-JNT-004", citation: { en: "GSPR 2018, Rule 8(2)-(3)" } },
      { csId: "CS-JNT-002", citation: { en: "GSPR 2018 (sole-survivor conversion, w.e.f. 06.07.2023)" } },
      { csId: "CS-SCH-001", citation: { en: "POSA Scheme Rules 2019 (G.S.R. 921(E)), para 3(2)" } },
    ],
    nextActionForPostmaster: {
      en: "Record the deceased holder's death on the account; no claim form or approval is needed. Offer the survivor the option to convert to a single-name account.",
    },
    rulebookRefs: ["D-01"],
  },
  {
    id: "DEC_ROUTE_A",
    routeId: "ROUTE_A",
    decision: { en: "The registered nominee(s) are paid, per their specified share (or equally, if no share was specified)." },
    reason: {
      en: "A nominee entitled under an in-force nomination is paid immediately, for any amount, without needing to prove they are a legal heir.",
    },
    decisionStatus: "payable",
    competentAuthority: NOM_TRACK_AUTHORITY,
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-NOM-019", citation: { en: "GSPR 2018, Rule 15(2)-(3)" } },
      { csId: "CS-NOM-020", citation: { en: "R60(2)" } },
      { csId: "CS-MNM-003", citation: { en: "GSPR 2018, Rule 15(3)-(4)" } },
      { csId: "CS-MNM-004", citation: { en: "R60(2)" } },
    ],
    nextActionForPostmaster: {
      en: "Verify the nomination, witness IDs, and death certificate; approve on the claim form itself and pay each nominee their share within 1 working day.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-02", "D-03", "D-04", "D-07"],
  },
  {
    id: "DEC_ROUTE_A_HEIRS_OF_NOMINEE",
    routeId: "ROUTE_A_HEIRS_OF_NOMINEE",
    decision: {
      en: "The claim settles for the legal heirs of the LAST deceased nominee — not the depositor's own heirs.",
    },
    reason: {
      en: "When the nominee outlived the depositor but has since also died, the entitlement passed to the nominee first, so it is the nominee's own estate that is now being claimed.",
    },
    decisionStatus: "payable",
    competentAuthority: [
      {
        authorityLabel: {
          en: "Depends on whether the nominee's heirs have court/revenue evidence of heirship — the evidence-track or no-evidence-track authority applies accordingly",
        },
      },
    ],
    courtOrderRequired: "conditional",
    officialReferences: [
      { csId: "CS-PRE-004", citation: { en: "R60(2)(iv)" } },
      { csId: "CS-PRE-005", citation: { en: "R60(2)(iv)" } },
    ],
    nextActionForPostmaster: {
      en: "Determine whether the nominee's heirs have court/revenue evidence of heirship, and route to the evidence-track or no-evidence-track authority accordingly (OQ-11 — the exact paperwork for this specific situation is not yet standardised).",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-06"],
  },
  {
    id: "DEC_card_pause_nomination",
    routeId: "card_pause_nomination",
    decision: { en: "No decision yet — find out from the Post Office whether a nominee is registered." },
    reason: { en: "Whether a nomination is in force decides which of the other tracks applies; any nearby Post Office can confirm this." },
    decisionStatus: "pending_information",
    competentAuthority: [{ authorityLabel: { en: "Any Post Office (nomination-status enquiry)" } }],
    courtOrderRequired: "no",
    officialReferences: [{ csId: "CS-NOM-018", citation: { en: "GSPR 2018, Rule 18(1)(i)" } }],
    nextActionForPostmaster: {
      en: "Confirm to the claimant, on enquiry, whether a nominee is registered for this account.",
    },
    rulebookRefs: ["D-02"],
  },
  {
    id: "DEC_card_referral_armed_forces",
    routeId: "card_referral_armed_forces",
    decision: {
      en: "The eligible amount is paid to the Commanding Officer or Committee of Adjustment on requisition — this overrides any nomination.",
    },
    reason: {
      en: "For serving Army, Air Force, or Navy personnel, the Accounts Office is bound by a CO/Committee requisition under the Army & Air Force (Disposal of Private Property) Act 1950 / Navy Act 1957.",
    },
    decisionStatus: "payable",
    competentAuthority: [{ authorityLabel: { en: "Accounts Office (bound by the CO/Committee requisition)" } }],
    courtOrderRequired: "no",
    officialReferences: [{ csId: "CS-NOM-017", citation: { en: "GSPR 2018, Rule 17" } }],
    nextActionForPostmaster: {
      en: "Pay the eligible amount to the Commanding Officer or Committee of Adjustment on receipt of their requisition; do not process this as a normal nominee/heir claim.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-14"],
  },
  {
    id: "DEC_card_referral_untraceable_nominee",
    routeId: "card_referral_untraceable_nominee",
    decision: { en: "No official procedure exists — the case is referred to the Divisional Head or Directorate as a doubtful/special case." },
    reason: {
      en: "The Rule Book has no published procedure for an untraceable or unwilling co-nominee who has not signed a Form 14 disclaimer.",
    },
    decisionStatus: "pending_information",
    competentAuthority: [{ authorityLabel: { en: "Divisional Head / Directorate (referral only)" } }],
    courtOrderRequired: "no",
    officialReferences: [{ csId: "CS-MNM-006", citation: { en: "R60(4)(C)-(D) principle" } }],
    nextActionForPostmaster: {
      en: "Record the case as doubtful/special and refer it to the Divisional Head or Directorate; no published procedure exists for this branch to resolve independently.",
    },
    rulebookRefs: ["D-07X"],
  },
  {
    id: "DEC_ROUTE_B",
    routeId: "ROUTE_B",
    decision: { en: "The claim is paid per the court/revenue document — for any amount, with no waiting period." },
    reason: {
      en: "A Probate, Letters of Administration, court Succession Certificate, or a Legal Heir Certificate from a Tahsildar (or higher revenue authority) settles the question of who the legal heirs are, so the claim can proceed immediately regardless of amount.",
    },
    decisionStatus: "payable",
    competentAuthority: LEGAL_EVIDENCE_AUTHORITY,
    courtOrderRequired: "conditional",
    officialReferences: [
      { csId: "CS-NON-002", citation: { en: "GSPR 2018, Rule 15(6)(i); R60(3)" } },
      { csId: "CS-NON-005", citation: { en: "GSPR 2018, Rule 15(6)(ii) (as amended 03.07.2023)" } },
    ],
    nextActionForPostmaster: {
      en: "Verify the Probate/Letters of Administration/Succession Certificate/Tahsildar Legal Heir Certificate, approve within your own limit or forward to the Divisional Head if beyond it, and pay within 7 working days.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-08"],
  },
  {
    id: "DEC_ROUTE_C",
    routeId: "ROUTE_C",
    decision: { en: "A discretionary settlement is made to the rightful claimant, based on sworn statements, with reasons recorded in writing." },
    reason: {
      en: "With no nomination and no court/revenue evidence, a claim up to ₹5,00,000 can still be settled — but only after 6 months have passed since the death, and only if every legal heir joins in or signs a disclaimer.",
    },
    decisionStatus: "payable",
    competentAuthority: NO_EVIDENCE_DISCRETIONARY_AUTHORITY,
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-NON-003", citation: { en: "GSPR 2018, Rule 15(6)(i); R60(4)(A)-(B)" } },
      { csId: "CS-NON-004", citation: { en: "Hindu Succession Act 1956 ss.8/15; Muslim personal law; Indian Succession Act 1925" } },
      { csId: "CS-NON-008", citation: { en: "Government Savings Promotion Act 1873, ss.4A/5/6/7" } },
    ],
    nextActionForPostmaster: {
      en: "Verify Forms 13/14/15 and heir ID, record the reasons for the discretionary settlement in writing, approve within your own limit or forward to the Divisional Office, and pay within 7 working days.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-09"],
  },
  {
    id: "DEC_card_stop_succession_certificate",
    routeId: "card_stop_succession_certificate",
    decision: { en: "A court or revenue document is needed before this claim can be settled." },
    reason: {
      en: "With no nomination, once the balance is above ₹5,00,000 or not every legal heir can join together, there is no discretionary power available — a Probate, Letters of Administration, court Succession Certificate, or Tahsildar Legal Heir Certificate becomes mandatory.",
    },
    decisionStatus: "not_payable",
    competentAuthority: [
      { authorityLabel: { en: "Any level of the Post Office can advise; the certificate itself is issued by a civil court or a revenue authority" } },
    ],
    courtOrderRequired: "conditional",
    officialReferences: [
      { csId: "CS-NON-005", citation: { en: "GSPR 2018, Rule 15(6)(ii)" } },
      { csId: "CS-NON-010", citation: { en: "Government Savings Promotion Act 1873, s.8" } },
    ],
    nextActionForPostmaster: {
      en: "Advise the claimant that a Probate, Letters of Administration, court Succession Certificate, or Tahsildar Legal Heir Certificate is required; issue a Post Office balance certificate for court fees on request.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-10"],
  },
  {
    id: "DEC_card_stop_dispute_succession_certificate",
    routeId: "card_stop_dispute_succession_certificate",
    decision: { en: "Only a court Succession Certificate is accepted — no other evidence suffices once a dispute is raised." },
    reason: {
      en: "Once any dispute about the claim is raised with the Post Office before payment, GSPR 2018 Rule 15(6)'s provisos require a court Succession Certificate specifically — a Probate, Letters of Administration, or Tahsildar Legal Heir Certificate, though normally acceptable, no longer suffice.",
    },
    decisionStatus: "not_payable",
    competentAuthority: [{ authorityLabel: { en: "Typically Divisional level, per the applicable powers" } }],
    courtOrderRequired: "yes",
    officialReferences: [
      { csId: "CS-NON-006", citation: { en: "GSPR 2018, Rule 15(6), provisos to (i) and (ii) (inserted 03.07.2023)" } },
    ],
    nextActionForPostmaster: {
      en: "Record the dispute, advise the claimant that only a court Succession Certificate will be accepted, and hold the claim until it is produced.",
    },
    processingNotes: REGISTER_NOTE,
    rulebookRefs: ["D-11"],
  },
  {
    id: "DEC_card_clarify_legal_heirs",
    routeId: "card_clarify_legal_heirs",
    decision: { en: "No decision yet — this explains, in general terms, who typically counts as a legal heir." },
    reason: { en: "Exactly who counts as a legal heir, and in what order, depends on the personal law that applies to the family." },
    decisionStatus: "pending_information",
    competentAuthority: [{ authorityLabel: { en: "Not applicable — general information only" } }],
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-NON-004", citation: { en: "Hindu Succession Act 1956 ss.8/15; Muslim personal law; Indian Succession Act 1925" } },
    ],
    nextActionForPostmaster: {
      en: "No processing action yet; wait for the claimant to confirm which heirs are joining the claim.",
    },
    rulebookRefs: ["D-09"],
  },
  {
    id: "DEC_card_wait_or_court",
    routeId: "card_wait_or_court",
    decision: { en: "Either wait until 6 months have passed since the death, or obtain a court document now to avoid the wait." },
    reason: {
      en: "The affidavit (sworn-statement) route is only available once 6 months have passed since the death; a court/revenue document has no such waiting period.",
    },
    decisionStatus: "pending_information",
    competentAuthority: [{ authorityLabel: { en: "The Post Office where the account is held" } }],
    courtOrderRequired: "no",
    officialReferences: [{ csId: "CS-NON-002", citation: { en: "R60(4)(A)" } }],
    nextActionForPostmaster: {
      en: "No processing action yet; the claimant is waiting out the 6-month period or arranging a court/revenue document.",
    },
    rulebookRefs: ["D-12"],
  },
  {
    id: "DEC_card_dual_preview",
    routeId: "card_dual_preview",
    decision: { en: "No decision yet — the balance in the passbook decides which of two routes applies." },
    reason: { en: "Up to ₹5,00,000, sworn statements are enough; above that, a court/revenue document is required." },
    decisionStatus: "pending_information",
    competentAuthority: [{ authorityLabel: { en: "Not applicable — check the passbook first" } }],
    courtOrderRequired: "no",
    officialReferences: [
      { csId: "CS-NON-003", citation: { en: "GSPR 2018, Rule 15(6)(i)" } },
      { csId: "CS-NON-005", citation: { en: "GSPR 2018, Rule 15(6)(ii)" } },
    ],
    nextActionForPostmaster: {
      en: "No processing action yet; the claimant is checking the passbook balance to determine which track applies.",
    },
    rulebookRefs: ["D-09", "D-10"],
  },
];
