import type { RouteRule } from "@claimsahayak/shared-types";

/**
 * Routing table (Blueprint v2 §3.2, T1–T21), evaluated priority-ordered,
 * once per account, by the Decision Engine (Milestone 3).
 *
 * A NOTE ON T21: the handbook describes it as an "overlay" in the original
 * design ("account is system-frozen; claim processed only at the Head Post
 * Office" — §5.4-10, FAQ 18), and unlike every other T-rule it is not
 * mutually exclusive with the main route resolution: a 10-years-frozen
 * account still follows the SAME nomination/legal-evidence/affidavit steps
 * — the only difference is which office processes it. Rather than force it
 * into the single-winner route-priority mechanism (which would wrongly
 * pre-empt the real route), T21 is implemented as an OverlayRule with a
 * SYSTEM flag id (`system_frozen_10_years`) in overlays.ts — the
 * OverlayRule.flagId field is explicitly documented in the frozen contract
 * as accepting "a Q10 flag id OR system flag id" for exactly this reason.
 * See overlays.ts for its implementation.
 *
 * ALSO ADDED: T18A. The approved Q7b design includes an "I'm not sure who
 * counts as a legal heir" option (a completeness addition of this pack's
 * own authoring, not a handbook ambiguity) that T16–T20 do not cover —
 * without a route for it, a claimant who picks it would hit a dead end.
 * T18A closes that gap with an explanatory card, then lets them re-answer.
 */
export const ROUTES: readonly RouteRule[] = [
  {
    id: "T1",
    priority: 100,
    when: { "==": [{ var: "answers.q1_schemes.OLD_UNSURE" }, true] },
    kind: "card",
    target: "card_info_end_old_scheme",
    handbookRef: "§5.4-9",
  },
  {
    id: "T2",
    priority: 95,
    when: { "==": [{ var: "answers.q2_who_died" }, "guardian"] },
    kind: "card",
    target: "card_guardian_change",
    handbookRef: "§7.6 (guardian-change rows); SB Order 35/2021 dated 05.11.2021",
    sourceRefs: ["CS-MIN-009"],
  },
  {
    id: "T3",
    priority: 90,
    when: {
      and: [
        { "==": [{ var: "answers.q2_who_died" }, "child"] },
        { "==": [{ var: "account.schemeId" }, "SSA"] },
      ],
    },
    kind: "route",
    target: "ROUTE_SSA_MINOR",
    handbookRef: "§7.6-SSA; G.S.R. 914(E)",
    sourceRefs: ["CS-SCH-009", "CS-NOM-010"],
  },
  {
    id: "T4",
    priority: 90,
    when: {
      and: [
        { "==": [{ var: "answers.q2_who_died" }, "child"] },
        { "==": [{ var: "account.schemeId" }, "PPF"] },
      ],
    },
    kind: "route",
    target: "ROUTE_PPF_MINOR",
    handbookRef: "§7.6-PPF; G.S.R. 915(E)",
    sourceRefs: ["CS-NOM-010", "CS-MIN-012"],
  },
  {
    id: "T5",
    priority: 85,
    when: { "==": [{ var: "answers.q2_who_died" }, "child"] },
    kind: "reroute",
    target: "q5_nomination",
    banner: {
      en: "Since the child has passed away, the guardian acts as the claimant from here.",
    },
    handbookRef: "§7.6 (SB Basic, RD, TD, MIS, NSC, KVP rows)",
    sourceRefs: ["CS-NOM-010"],
  },
  {
    id: "T6",
    priority: 85,
    when: { "==": [{ var: "answers.q2_who_died" }, "both"] },
    kind: "reroute",
    target: "q5_nomination",
    banner: {
      en: "Since both the child and the guardian have passed away, the legal heirs act as the claimant unless a nominee is registered.",
    },
    handbookRef: "§7.6 (\"Death of Both\" rows)",
    sourceRefs: ["CS-NOM-010"],
  },
  {
    id: "T7",
    priority: 80,
    when: { "==": [{ var: "answers.q3_holding" }, "two_names_survivor"] },
    kind: "route",
    target: "ROUTE_SURVIVOR",
    handbookRef: "§7.7 (table, joint-holder column); GSPR Rule 8(2)-(3)",
    sourceRefs: ["CS-JNT-004", "CS-JNT-002", "CS-SCH-001"],
  },
  {
    id: "T8",
    priority: 79,
    when: { "==": [{ var: "answers.q3_holding" }, "two_names_both_deceased"] },
    kind: "reroute",
    target: "q5_nomination",
    banner: {
      en: "Since both account holders have passed away, this is treated the same as a single-name account.",
    },
    handbookRef: "Blueprint v2 review finding R-01",
    sourceRefs: ["CS-JNT-005"],
  },
  {
    id: "T9",
    priority: 70,
    when: { "==": [{ var: "answers.q5_nomination" }, "yes_alive"] },
    kind: "route",
    target: "ROUTE_A",
    handbookRef: "§2.1; §2.2; GSPR 2018, Rule 15(2)-(3)",
    sourceRefs: ["CS-NOM-019", "CS-NOM-020", "CS-MNM-003", "CS-MNM-004"],
  },
  {
    id: "T10",
    priority: 69,
    when: { "==": [{ var: "answers.q5a_complication.predeceased_no_others" }, true] },
    kind: "reroute",
    target: "q6_legal_evidence",
    banner: {
      en: "Since the registered nominee died before the account holder and no other nominee is registered, this is treated as if there were no nomination.",
    },
    handbookRef: "§2.1; FAQ 22; Act 1873 s.4(2)",
    sourceRefs: ["CS-PRE-001"],
  },
  {
    id: "T11",
    priority: 68,
    when: { "==": [{ var: "answers.q5a_complication.one_of_several_died" }, true] },
    kind: "route",
    target: "ROUTE_A",
    handbookRef: "§2.1; GSPR 2018, Rule 15(3)-(4)",
    sourceRefs: ["CS-PRE-002"],
  },
  {
    id: "T12",
    priority: 67,
    when: { "==": [{ var: "answers.q5a_complication.last_nominee_died_after" }, true] },
    kind: "route",
    target: "ROUTE_A_HEIRS_OF_NOMINEE",
    nvRef: "NV-01",
    handbookRef: "§2.1",
    sourceRefs: ["CS-PRE-004", "CS-PRE-005"],
  },
  {
    id: "T13",
    priority: 66,
    when: { "==": [{ var: "answers.q5a_complication.nominee_is_minor" }, true] },
    kind: "route",
    target: "ROUTE_A",
    handbookRef: "§7.5; Act 1873 s.4A(2)",
    sourceRefs: ["CS-MIN-001", "CS-MIN-003", "CS-MNM-007"],
  },
  {
    id: "T14",
    priority: 65,
    when: { "==": [{ var: "answers.q5a_complication.cannot_come_together" }, true] },
    kind: "route",
    target: "ROUTE_A",
    handbookRef: "§2.1; FAQ 33; R60(2)(xi) Note",
    sourceRefs: ["CS-MNM-005"],
  },
  {
    id: "T15",
    priority: 60,
    when: { "==": [{ var: "answers.q5_nomination" }, "dont_know"] },
    kind: "card",
    target: "card_pause_nomination",
    handbookRef: "FAQ 1; FAQ 3",
  },
  {
    id: "RB-D14",
    priority: 110,
    when: {
      and: [
        { "==": [{ var: "answers.q2_who_died" }, "adult"] },
        { "==": [{ var: "answers.q_armed_forces" }, true] },
      ],
    },
    kind: "card",
    target: "card_referral_armed_forces",
    handbookRef: "GSPR Rule 17; Army & Air Force (Disposal of Private Property) Act 1950; Navy Act 1957",
    sourceRefs: ["CS-NOM-017"],
  },
  {
    // Priority 69.5: evaluated ABOVE every other q5a_complication flag
    // (T10=69..T14=65) since these tick-boxes are multi-select and can
    // co-occur — an untraceable/unwilling co-nominee with no disclaimer
    // has NO official procedure (CS-MNM-006/OQ-14) and must win over an
    // attempt to process the claim through the normal ROUTE_A path.
    id: "RB-D07X",
    priority: 69.5,
    when: { "==": [{ var: "answers.q5a_complication.co_nominee_untraceable" }, true] },
    kind: "card",
    target: "card_referral_untraceable_nominee",
    nvRef: "NV-RB-1",
    handbookRef: "R60(4)(C)-(D) principle (doubtful/special case referral)",
    sourceRefs: ["CS-MNM-006"],
  },
  {
    id: "RB-D11",
    priority: 51,
    when: {
      and: [
        { "==": [{ var: "answers.q5_nomination" }, "no"] },
        { "==": [{ var: "answers.q_dispute" }, true] },
      ],
    },
    kind: "card",
    target: "card_stop_dispute_succession_certificate",
    handbookRef: "GSPR 2018, Rule 15(6), provisos to (i) and (ii) (inserted 03.07.2023)",
    sourceRefs: ["CS-NON-006"],
  },
  {
    id: "T16",
    priority: 50,
    when: { "==": [{ var: "answers.q6_legal_evidence" }, "yes"] },
    kind: "route",
    target: "ROUTE_B",
    handbookRef: "§3.1; §3.2; GSPR 2018, Rule 15(6)(i); R60(3)",
    sourceRefs: ["CS-NON-002", "CS-NON-005"],
  },
  {
    id: "T17",
    priority: 45,
    when: {
      and: [
        { "==": [{ var: "answers.q6_legal_evidence" }, "no"] },
        { "==": [{ var: "answers.q7a_amount" }, "up_to_5_lakh"] },
        {
          ">=": [
            { var: "derived.monthsSinceDeath" },
            { var: "constants.NO_NOMINATION_WAIT_MONTHS" },
          ],
        },
        { "==": [{ var: "answers.q7b_heirs_together" }, "yes"] },
      ],
    },
    kind: "route",
    target: "ROUTE_C",
    handbookRef: "§3.1(c); §4.1; GSPR 2018, Rule 15(6)(i); SB Order 36/2020",
    sourceRefs: ["CS-NON-003", "CS-NON-004", "CS-NON-008"],
  },
  {
    id: "T18",
    priority: 44,
    when: {
      and: [
        { "==": [{ var: "answers.q6_legal_evidence" }, "no"] },
        {
          or: [
            { "==": [{ var: "answers.q7a_amount" }, "more_than_5_lakh"] },
            { "==": [{ var: "answers.q7b_heirs_together" }, "no"] },
          ],
        },
      ],
    },
    kind: "card",
    target: "card_stop_succession_certificate",
    handbookRef: "§3.1(c); §3.1(d); FAQ 31; GSPR 2018, Rule 15(6)(ii); Act 1873 s.8",
    sourceRefs: ["CS-NON-005", "CS-NON-010"],
  },
  {
    id: "T18A",
    priority: 43,
    when: { "==": [{ var: "answers.q7b_heirs_together" }, "not_sure_who"] },
    kind: "card",
    target: "card_clarify_legal_heirs",
    handbookRef: "FAQ 41",
  },
  {
    id: "T19",
    priority: 42,
    when: {
      and: [
        { "==": [{ var: "answers.q6_legal_evidence" }, "no"] },
        { "==": [{ var: "answers.q7a_amount" }, "up_to_5_lakh"] },
        { "==": [{ var: "answers.q7b_heirs_together" }, "yes"] },
        {
          not: {
            ">=": [
              { var: "derived.monthsSinceDeath" },
              { var: "constants.NO_NOMINATION_WAIT_MONTHS" },
            ],
          },
        },
      ],
    },
    kind: "card",
    target: "card_wait_or_court",
    handbookRef: "§3.1(b); FAQ 28; R60(4)(A)",
    sourceRefs: ["CS-NON-002"],
  },
  {
    id: "T20",
    priority: 41,
    when: {
      and: [
        { "==": [{ var: "answers.q6_legal_evidence" }, "no"] },
        { "==": [{ var: "answers.q7a_amount" }, "not_sure"] },
      ],
    },
    kind: "card",
    target: "card_dual_preview",
    handbookRef: "Blueprint v2 review finding R-15",
  },

  // ---------------------------------------------------------------------
  // SYSTEM BUCKETS — not part of the customer-facing T1–T20 decision tree.
  // These exist only so OutputRule.routeId has a valid, reachable target
  // for output groups that the engine (Milestone 3) appends based on a
  // direct answer rather than the priority-ordered route resolution pass:
  //   - GLOBAL: always-printed good-to-know + verification-panel items,
  //     applied to every account regardless of route (Blueprint v2 §3.3).
  //   - CONTINUE_ADDON: appended when q8_close_or_continue == "continue".
  //   - PAYMENT_BANK_TRANSFER / PAYMENT_OWN_POSB: appended per the q9
  //     answer (cheque needs no extra items, so has no bucket).
  // `when: ALWAYS` here is a schema-satisfying placeholder, not a real
  // per-account resolution condition — the engine never runs these through
  // the normal route-priority pass.
  // ---------------------------------------------------------------------
  {
    id: "SYS_GLOBAL",
    priority: 0,
    when: { and: [] },
    kind: "route",
    target: "GLOBAL",
    handbookRef: "Blueprint v2 §3.3 (always-printed block); §3.4 FR-19",
  },
  {
    id: "SYS_CONTINUE_ADDON",
    priority: 0,
    when: { and: [] },
    kind: "route",
    target: "CONTINUE_ADDON",
    handbookRef: "§5.4-4",
  },
  {
    id: "SYS_PAYMENT_BANK_TRANSFER",
    priority: 0,
    when: { and: [] },
    kind: "route",
    target: "PAYMENT_BANK_TRANSFER",
    handbookRef: "§6.1; §6.2; FAQ 39",
  },
  {
    id: "SYS_PAYMENT_OWN_POSB",
    priority: 0,
    when: { and: [] },
    kind: "route",
    target: "PAYMENT_OWN_POSB",
    handbookRef: "§6.1; §6.2",
  },
];
