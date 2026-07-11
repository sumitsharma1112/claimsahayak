import type { TruthTableFixture } from "../validate/truth-table.js";

export const TRUTH_TABLE_FIXTURES: readonly TruthTableFixture[] = [
  {
    id: "fx01_sb_nomination_alive",
    description: "Savings Account, adult died, nominee alive and available — straight to Route A.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "PAYMENT_OWN_POSB"],
    },
  },
  {
    id: "fx02_sb_affidavit_route",
    description:
      "Savings Account, no nomination, within affidavit limit, 8 months since death, heirs together — Route C.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "yes",
      q9_payment: "own_posb",
    },
    derived: { monthsSinceDeath: 8, yearsSinceDeath: 0 },
    expected: {
      firedRouteIds: ["T17"],
      outputBuckets: ["ROUTE_C", "GLOBAL", "PAYMENT_OWN_POSB"],
    },
  },
  {
    id: "fx03_sb_legal_evidence_route",
    description: "Savings Account, no nomination, family already has a Succession Certificate — Route B.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "yes",
      q9_payment: "own_posb",
    },
    expected: {
      firedRouteIds: ["T16"],
      outputBuckets: ["ROUTE_B", "GLOBAL", "PAYMENT_OWN_POSB"],
    },
  },
  {
    id: "fx04_sb_stop_needs_court_document",
    description: "Savings Account, no nomination, balance above the affidavit limit — STOP card.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "more_than_5_lakh",
    },
    expected: {
      firedRouteIds: ["T18"],
      cardId: "card_stop_succession_certificate",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx05_sb_survivor",
    description: "Joint Savings Account, one holder dies, survivor continues or closes — ROUTE_SURVIVOR.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "two_names_survivor",
    },
    expected: {
      firedRouteIds: ["T7"],
      outputBuckets: ["ROUTE_SURVIVOR", "GLOBAL"],
    },
  },
  {
    id: "fx06_sb_guardian_change",
    description: "Guardian of a child's account dies (child alive) — guardian-change card, no money claim.",
    schemeId: "SB",
    answers: {
      q2_who_died: "guardian",
    },
    expected: {
      firedRouteIds: ["T2"],
      cardId: "card_guardian_change",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx07_ssa_minor_death",
    description: "Sukanya Samriddhi Account, the child dies — guardian claims via premature closure.",
    schemeId: "SSA",
    answers: {
      q2_who_died: "child",
    },
    expected: {
      firedRouteIds: ["T3"],
      outputBuckets: ["ROUTE_SSA_MINOR", "GLOBAL"],
    },
  },
  {
    id: "fx08_ppf_minor_death",
    description: "PPF account, the child dies — guardian claims, account closed.",
    schemeId: "PPF",
    answers: {
      q2_who_died: "child",
    },
    expected: {
      firedRouteIds: ["T4"],
      outputBuckets: ["ROUTE_PPF_MINOR", "GLOBAL"],
    },
  },
  {
    id: "fx09_rd_continue_account",
    description: "RD, adult died, nominee alive, claimant continues the account instead of closing it.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q8_maturity: "not_yet_matured",
      q8_close_or_continue: "continue",
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "CONTINUE_ADDON"],
    },
  },
  {
    id: "fx10_rd_nominee_predeceased_reroute",
    description: "RD, the sole nominee died before the account holder — reroutes as a no-nomination claim.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_complication",
      "q5a_complication.predeceased_no_others": true,
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "yes",
    },
    derived: { monthsSinceDeath: 7 },
    expected: {
      firedRouteIds: ["T10", "T17"],
      outputBuckets: ["T10", "ROUTE_C", "GLOBAL"],
    },
  },
  {
    id: "fx11_rd_one_of_several_nominees_died",
    description: "RD, one of several registered nominees has since died — still Route A, with an extra document.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_complication",
      "q5a_complication.one_of_several_died": true,
    },
    expected: {
      firedRouteIds: ["T11"],
      outputBuckets: ["ROUTE_A", "T11", "GLOBAL"],
    },
  },
  {
    id: "fx12_rd_nominee_is_minor",
    description: "RD, the registered nominee is a child — Route A, with a minor-alive certificate.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_complication",
      "q5a_complication.nominee_is_minor": true,
    },
    expected: {
      firedRouteIds: ["T13"],
      outputBuckets: ["ROUTE_A", "T13", "GLOBAL"],
    },
  },
  {
    id: "fx13_rd_nominees_cannot_come_together",
    description: "RD, several nominees but not all can attend — Route A, with a Form 14 disclaimer.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_complication",
      "q5a_complication.cannot_come_together": true,
    },
    expected: {
      firedRouteIds: ["T14"],
      outputBuckets: ["ROUTE_A", "T14", "GLOBAL"],
    },
  },
  {
    id: "fx14_rd_last_nominee_died_after",
    description: "RD, the last surviving nominee died AFTER the account holder — settles for the nominee's own heirs.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_complication",
      "q5a_complication.last_nominee_died_after": true,
    },
    expected: {
      firedRouteIds: ["T12"],
      outputBuckets: ["ROUTE_A_HEIRS_OF_NOMINEE", "GLOBAL"],
    },
  },
  {
    id: "fx15_nsc_dont_know_nomination",
    description: "NSC, claimant doesn't know if a nominee is registered — PAUSE card.",
    schemeId: "NSC",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "dont_know",
    },
    expected: {
      firedRouteIds: ["T15"],
      cardId: "card_pause_nomination",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx16_nsc_wait_or_court",
    description: "NSC, no nomination, within limit, heirs together, but only 3 months since death — WAIT-or-COURT.",
    schemeId: "NSC",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "yes",
    },
    derived: { monthsSinceDeath: 3 },
    expected: {
      firedRouteIds: ["T19"],
      cardId: "card_wait_or_court",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx17_nsc_dual_preview_amount_unknown",
    description: "NSC, no nomination, claimant isn't sure of the balance — DUAL-PREVIEW card.",
    schemeId: "NSC",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "not_sure",
    },
    expected: {
      firedRouteIds: ["T20"],
      cardId: "card_dual_preview",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx18_kvp_passbook_lost_bank_transfer",
    description: "KVP, nomination claim, passbook/certificate lost, paid by bank transfer.",
    schemeId: "KVP",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "bank_transfer",
      "q10_docs_check.passbook_lost": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "PAYMENT_BANK_TRANSFER", "OVERLAY_passbook_lost"],
      overlayFlags: ["passbook_lost"],
    },
  },
  {
    id: "fx19_td_both_holders_deceased",
    description: "TD, both joint holders have died — treated as a single-name account from Q5 onward.",
    schemeId: "TD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "two_names_both_deceased",
      q5_nomination: "yes_alive",
    },
    expected: {
      firedRouteIds: ["T8", "T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL"],
    },
  },
  {
    id: "fx20_mis_heirs_not_sure_who",
    description: "MIS, no nomination, within limit, but claimant isn't sure who counts as a legal heir.",
    schemeId: "MIS",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "not_sure_who",
    },
    expected: {
      firedRouteIds: ["T18A"],
      cardId: "card_clarify_legal_heirs",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx21_old_discontinued_scheme",
    description: "Claimant selects only an older/discontinued scheme — INFO-END card, handled at the Head Post Office.",
    schemeId: "SB",
    answers: {
      "q1_schemes.OLD_UNSURE": true,
    },
    expected: {
      firedRouteIds: ["T1"],
      cardId: "card_info_end_old_scheme",
      outputBuckets: [],
    },
  },
  {
    id: "fx22_missing_person_overlay",
    description: "SB, account holder missing for over 7 years — missing-person overlay adds FIR/court/indemnity items.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "yes",
      "q10_docs_check.missing_person": true,
    },
    derived: { monthsSinceDeath: 90 },
    expected: {
      firedRouteIds: ["T17"],
      outputBuckets: ["ROUTE_C", "GLOBAL", "OVERLAY_missing_person"],
      overlayFlags: ["missing_person"],
    },
  },
  {
    id: "fx23_abroad_overlay",
    description: "NSC, nomination claim, a nominee lives outside India — apostille/authentication overlay.",
    schemeId: "NSC",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      "q10_docs_check.someone_abroad": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_abroad"],
      overlayFlags: ["someone_abroad"],
    },
  },
  {
    id: "fx24_insurance_deductions_overlay",
    description: "SB, nomination claim, PMSBY/PMJJBY/APY deductions noticed — insurance/pension overlay.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      "q10_docs_check.insurance_deductions": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_insurance"],
      overlayFlags: ["insurance_deductions"],
    },
  },
  {
    id: "fx25_system_frozen_10_years",
    description: "RD, matured more than 10 years ago — system-frozen overlay, processed at the Head Post Office.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q8_maturity: "matured_over_10_years",
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_system_frozen"],
      overlayFlags: ["system_frozen_10_years"],
    },
  },
  {
    id: "fx26_sb_child_died_reroute",
    description:
      "Savings Account, the child (not a minor-scheme account) has died — reroutes to the nomination question as the guardian claimant.",
    schemeId: "SB",
    answers: {
      q2_who_died: "child",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    },
    expected: {
      firedRouteIds: ["T5", "T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "PAYMENT_OWN_POSB"],
    },
  },
  {
    id: "fx27_sb_both_died_reroute",
    description:
      "Savings Account, both the child and the guardian have died — reroutes to the nomination question for the legal heirs.",
    schemeId: "SB",
    answers: {
      q2_who_died: "both",
      q5_nomination: "no",
      q6_legal_evidence: "yes",
      q9_payment: "own_posb",
    },
    expected: {
      firedRouteIds: ["T6", "T16"],
      outputBuckets: ["ROUTE_B", "GLOBAL", "PAYMENT_OWN_POSB"],
    },
  },

  // -----------------------------------------------------------------------
  // ClaimSahayak Official Rule Book v1.0 integration — fixtures for the new
  // D-row/M-row routes, overlays, and the SCSS scheme addition (Topic 11 §8
  // acceptance criteria: armed-forces override, dispute-forces-succession-
  // certificate, untraceable co-nominee referral, the 6-month gate boundary,
  // SCSS, SCSS spouse continuation, RD-PSS, and each new M-row modifier at
  // least once).
  // -----------------------------------------------------------------------
  {
    id: "fx28_armed_forces_override",
    description:
      "Adult depositor serving in the armed forces dies with a CO/Committee requisition — overrides everything, even an in-force nomination.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q_armed_forces: true,
      q5_nomination: "yes_alive",
    },
    expected: {
      firedRouteIds: ["RB-D14"],
      cardId: "card_referral_armed_forces",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx29_dispute_forces_succession_certificate",
    description:
      "No nomination, no evidence, but a dispute has been raised before payment — only a court Succession Certificate is accepted, regardless of amount.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q_dispute: true,
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
    },
    expected: {
      firedRouteIds: ["RB-D11"],
      cardId: "card_stop_dispute_succession_certificate",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx30_untraceable_co_nominee_referral",
    description:
      "A co-nominee is untraceable/unwilling with no disclaimer — no official procedure exists; referred as a doubtful/special case.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_complication",
      "q5a_complication.co_nominee_untraceable": true,
    },
    expected: {
      firedRouteIds: ["RB-D07X"],
      cardId: "card_referral_untraceable_nominee",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx31_no_nomination_gate_under_6_months",
    description:
      "No nomination, no evidence, within the affidavit limit, heirs together, but only 5 months since death — WAIT card (6-month gate boundary, under side).",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "yes",
    },
    derived: { monthsSinceDeath: 5, yearsSinceDeath: 0 },
    expected: {
      firedRouteIds: ["T19"],
      cardId: "card_wait_or_court",
      outputBuckets: ["GLOBAL"],
    },
  },
  {
    id: "fx32_no_nomination_gate_at_6_months",
    description:
      "Same facts as fx31, but exactly 6 months since death — the discretionary affidavit route opens (6-month gate boundary, at side).",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "no",
      q7a_amount: "up_to_5_lakh",
      q7b_heirs_together: "yes",
      q9_payment: "own_posb",
    },
    derived: { monthsSinceDeath: 6, yearsSinceDeath: 0 },
    expected: {
      firedRouteIds: ["T17"],
      outputBuckets: ["ROUTE_C", "GLOBAL", "PAYMENT_OWN_POSB"],
    },
  },
  {
    id: "fx33_scss_nomination_alive",
    description: "Senior Citizen Savings Scheme (SCSS), adult died, nominee alive — Route A (proves the new scheme is wired end-to-end).",
    schemeId: "SCSS",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q9_payment: "own_posb",
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "PAYMENT_OWN_POSB"],
    },
  },
  {
    id: "fx34_scss_spouse_continuation",
    description: "SCSS, nominee alive, continuing — the surviving spouse ticks the SCSS spouse-continuation flag, adding SCSS Form-4 and the eligibility note.",
    schemeId: "SCSS",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      q8_close_or_continue: "continue",
      "q10_docs_check.scss_spouse_continuing": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "CONTINUE_ADDON", "OVERLAY_scss_spouse_continuing"],
      overlayFlags: ["scss_spouse_continuing"],
    },
  },
  {
    id: "fx35_rd_pss_candidate",
    description: "RD, nominee alive, the claimant ticks the Protected Savings Scheme flag — adds the PSS declaration, age proof, and 1-year deadline warning.",
    schemeId: "RD",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      "q10_docs_check.rd_pss_candidate": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_rd_pss_candidate"],
      overlayFlags: ["rd_pss_candidate"],
    },
  },
  {
    id: "fx36_pledge_or_freeze",
    description: "Nominee alive, but the account is pledged or frozen — adds the pledge-release certificate and the freeze-release note.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      "q10_docs_check.pledge_or_freeze": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_pledge_or_freeze"],
      overlayFlags: ["pledge_or_freeze"],
    },
  },
  {
    id: "fx37_minor_attained_majority",
    description: "Nominee alive, and the (former) minor nominee has since turned 18 — paid directly, own KYC.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      "q10_docs_check.minor_attained_majority": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_minor_attained_majority"],
      overlayFlags: ["minor_attained_majority"],
    },
  },
  {
    id: "fx38_guardian_died_after_depositor",
    description: "Nominee alive, and the guardian managing a minor's share has since died/changed — succeeding guardian acts.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      "q10_docs_check.guardian_died_after_depositor": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_guardian_died_after_depositor"],
      overlayFlags: ["guardian_died_after_depositor"],
    },
  },
  {
    id: "fx39_nri_nominee",
    description: "Nominee alive, and the nominee lives outside India — payment on a non-repatriation basis.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "yes_alive",
      "q10_docs_check.nri_nominee": true,
    },
    expected: {
      firedRouteIds: ["T9"],
      outputBuckets: ["ROUTE_A", "GLOBAL", "OVERLAY_nri_nominee"],
      overlayFlags: ["nri_nominee"],
    },
  },
  {
    id: "fx40_mis_excess_ceiling",
    description: "MIS joint account, survivor's balance may exceed the single-account ceiling — excess refunded, interest adjusted.",
    schemeId: "MIS",
    answers: {
      q2_who_died: "adult",
      q3_holding: "two_names_survivor",
      "q10_docs_check.mis_excess_ceiling": true,
    },
    expected: {
      firedRouteIds: ["T7"],
      outputBuckets: ["ROUTE_SURVIVOR", "GLOBAL", "OVERLAY_mis_excess_ceiling"],
      overlayFlags: ["mis_excess_ceiling"],
    },
  },
  {
    id: "fx41_unregistered_valid_nomination",
    description: "No nomination on record, but a filled-in, signed nomination form was found unregistered — posthumous registration guidance.",
    schemeId: "SB",
    answers: {
      q2_who_died: "adult",
      q3_holding: "one_name",
      q5_nomination: "no",
      q6_legal_evidence: "yes",
      "q10_docs_check.unregistered_valid_nomination": true,
    },
    expected: {
      firedRouteIds: ["T16"],
      outputBuckets: ["ROUTE_B", "GLOBAL", "OVERLAY_unregistered_valid_nomination"],
      overlayFlags: ["unregistered_valid_nomination"],
    },
  },
];
