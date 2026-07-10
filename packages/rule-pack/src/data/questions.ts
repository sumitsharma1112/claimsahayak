import { ALWAYS, type QuestionDefinition } from "@claimsahayak/shared-types";
import { affidavitLimitPhraseEn } from "./format.js";

/**
 * VARIABLE-PATH CONVENTIONS used by every `visibleWhen`/route condition in
 * this pack (there is no runtime enforcement of this beyond the reachability
 * validator's var-existence check, so it is written down here once):
 *
 *  - `answers.<questionId>`            → the selected option id (single),
 *                                         or true/false (boolean).
 *  - `answers.<questionId>.<optionId>` → true/false, for MULTI questions —
 *                                         "was this option ticked".
 *  - `account.schemeId`                → the scheme id of the account the
 *                                         engine is currently resolving
 *                                         (Milestone 3 iterates one account
 *                                         at a time; the same question/route
 *                                         data is evaluated once per
 *                                         account, not duplicated per scheme).
 *  - `scheme.canBeJoint` / `scheme.canBeMinorAccount` /
 *    `scheme.continuableByClaimant` / `scheme.bankTransferEligible`
 *                                       → capability lookup for the CURRENT
 *                                         account's scheme (see schemes.ts).
 *  - `derived.monthsSinceDeath` / `derived.yearsSinceDeath`
 *                                       → computed from Q4's month/year;
 *                                         the raw month/year is NEVER itself
 *                                         a condition variable (privacy:
 *                                         V3 §4.1 — only derived booleans
 *                                         may ever leave the device, and
 *                                         this pack does not even let them
 *                                         leave the ENGINE as raw values).
 *  - `constants.<KEY>`                 → a named RulePackConstants value.
 *
 * A variable that was never answered (because its question was not shown,
 * or not yet reached) evaluates as absent; `==`/`in` against an absent
 * variable is false, and `>=` against an absent variable is false. This
 * lets a condition like "NOT (answers.q8_close_or_continue == 'continue')"
 * correctly default to true when Q8 was never shown at all.
 */

export const QUESTIONS: readonly QuestionDefinition[] = [
  {
    id: "q1_schemes",
    stepId: "S1",
    text: { en: "Which savings did the person have at the Post Office?" },
    whyStrip: {
      en: "So we can prepare one checklist for each account.",
    },
    inputType: "multi",
    options: [
      { id: "SB", label: { en: "Savings Account" } },
      { id: "RD", label: { en: "Recurring Deposit (RD)" } },
      { id: "TD", label: { en: "Time Deposit (TD)" } },
      { id: "MIS", label: { en: "Monthly Income Scheme (MIS)" } },
      { id: "PPF", label: { en: "Public Provident Fund (PPF)" } },
      { id: "SSA", label: { en: "Sukanya Samriddhi Account (SSA)" } },
      { id: "NSC", label: { en: "National Savings Certificate (NSC)" } },
      { id: "KVP", label: { en: "Kisan Vikas Patra (KVP)" } },
      {
        id: "OLD_UNSURE",
        label: { en: "An older or discontinued scheme, or I'm not sure" },
        help: {
          en: "For example NSS-87, NSS-92, PPF (HUF), IVP, or old-issue NSC. These are handled directly at the Head Post Office.",
        },
        exclusive: true,
      },
    ],
    visibleWhen: ALWAYS,
    invalidates: [
      "q1a_nsc_kvp_format",
      "q2_who_died",
      "q3_holding",
      "q4_death_month",
      "q5_nomination",
      "q5a_complication",
      "q6_legal_evidence",
      "q7a_amount",
      "q7b_heirs_together",
      "q8_maturity",
      "q8_close_or_continue",
      "q9_payment",
      "q10_docs_check",
    ],
    handbookRef: "§1.3 (scope); §5.4-9",
  },
  {
    id: "q1a_nsc_kvp_format",
    stepId: "S1",
    text: { en: "Are your NSC/KVP old paper certificates, or passbooks?" },
    whyStrip: {
      en: "Old certificates bought together in one registration count as a single claim; each passbook is its own separate claim.",
    },
    inputType: "single",
    options: [
      { id: "certificates", label: { en: "Old paper certificates" } },
      { id: "passbooks", label: { en: "Passbooks (issued after 2016)" } },
      { id: "both", label: { en: "Some of each" } },
      { id: "not_sure", label: { en: "I'm not sure" } },
    ],
    visibleWhen: {
      or: [
        { "==": [{ var: "answers.q1_schemes.NSC" }, true] },
        { "==": [{ var: "answers.q1_schemes.KVP" }, true] },
      ],
    },
    invalidates: [],
    handbookRef: "FAQ 35, FAQ 36",
  },
  {
    id: "q2_who_died",
    stepId: "S2",
    text: { en: "Who has passed away?" },
    whyStrip: {
      en: "Different rules apply for account holders, children's accounts, and guardians.",
    },
    inputType: "single",
    options: [
      { id: "adult", label: { en: "The account holder (an adult)" } },
      { id: "child", label: { en: "The child whose account it is" } },
      {
        id: "guardian",
        label: { en: "The guardian who managed a child's account" },
      },
      { id: "both", label: { en: "Both the child and the guardian" } },
    ],
    visibleWhen: {
      not: { "==": [{ var: "answers.q1_schemes.OLD_UNSURE" }, true] },
    },
    invalidates: [
      "q3_holding",
      "q4_death_month",
      "q5_nomination",
      "q5a_complication",
      "q6_legal_evidence",
      "q7a_amount",
      "q7b_heirs_together",
      "q8_maturity",
      "q8_close_or_continue",
      "q9_payment",
      "q10_docs_check",
    ],
    handbookRef: "§7.6; §7.6-SSA",
  },
  {
    id: "q3_holding",
    stepId: "S3",
    text: { en: "Was the account in one name, or two names together?" },
    whyStrip: {
      en: "A joint account has a simpler path for the surviving holder.",
    },
    inputType: "single",
    options: [
      { id: "one_name", label: { en: "One name" } },
      {
        id: "two_names_survivor",
        label: { en: "Two names — I am the surviving holder" },
      },
      {
        id: "two_names_both_deceased",
        label: { en: "Two names — both holders have passed away" },
      },
      { id: "not_sure", label: { en: "I'm not sure" } },
    ],
    visibleWhen: {
      and: [
        { "==": [{ var: "answers.q2_who_died" }, "adult"] },
        { "==": [{ var: "scheme.canBeJoint" }, true] },
      ],
    },
    invalidates: [
      "q5_nomination",
      "q5a_complication",
      "q6_legal_evidence",
      "q7a_amount",
      "q7b_heirs_together",
      "q8_maturity",
      "q8_close_or_continue",
      "q9_payment",
      "q10_docs_check",
    ],
    handbookRef: "§7.7 (table); FAQ 20",
  },
  {
    id: "q4_death_month",
    stepId: "S4",
    text: { en: "In which month and year did the death occur?" },
    whyStrip: {
      en: "Some claims can only start 6 months after the death — we'll check this for you, so you don't have to do the maths.",
    },
    inputType: "monthYear",
    options: [],
    visibleWhen: {
      in: [{ var: "answers.q2_who_died" }, ["adult", "child", "both"]],
    },
    invalidates: [],
    handbookRef: "§3.1(a); FAQ 28",
  },
  {
    id: "q5_nomination",
    stepId: "S5",
    text: { en: "Was a nominee registered at the Post Office for this account?" },
    whyStrip: {
      en: "If yes, the claim is usually completed within one working day.",
    },
    inputType: "single",
    options: [
      {
        id: "yes_alive",
        label: { en: "Yes — the nominee is alive and can claim" },
      },
      {
        id: "yes_complication",
        label: { en: "Yes, but there's a complication" },
        help: {
          en: "For example, the nominee has since died, or there is more than one nominee.",
        },
      },
      { id: "no", label: { en: "No nominee was registered" } },
      {
        id: "dont_know",
        label: { en: "I don't know" },
        help: {
          en: "We'll show you exactly how to find out at the Post Office.",
        },
      },
    ],
    visibleWhen: {
      and: [
        { not: { "==": [{ var: "answers.q3_holding" }, "two_names_survivor"] } },
        { not: { "==": [{ var: "answers.q2_who_died" }, "guardian"] } },
        {
          not: {
            and: [
              { "==": [{ var: "answers.q2_who_died" }, "child"] },
              { in: [{ var: "account.schemeId" }, ["SSA", "PPF"]] },
            ],
          },
        },
      ],
    },
    invalidates: [
      "q5a_complication",
      "q6_legal_evidence",
      "q7a_amount",
      "q7b_heirs_together",
      "q8_maturity",
      "q8_close_or_continue",
      "q9_payment",
      "q10_docs_check",
    ],
    handbookRef: "§2.1; §2.2; FAQ 1, FAQ 3",
  },
  {
    id: "q5a_complication",
    stepId: "S5",
    text: { en: "What's the complication? Tick anything that applies." },
    whyStrip: { en: "Each situation has a clear next step." },
    inputType: "multi",
    options: [
      {
        id: "predeceased_no_others",
        label: {
          en: "The nominee died BEFORE the account holder, and there is no other nominee",
        },
      },
      {
        id: "one_of_several_died",
        label: { en: "One of several nominees has since died" },
      },
      {
        id: "last_nominee_died_after",
        label: {
          en: "The last (or only) nominee died AFTER the account holder",
        },
      },
      {
        id: "nominee_is_minor",
        label: { en: "A nominee is a child (under 18)" },
      },
      {
        id: "cannot_come_together",
        label: { en: "Not all the nominees are able to come together" },
      },
    ],
    visibleWhen: { "==": [{ var: "answers.q5_nomination" }, "yes_complication"] },
    invalidates: [],
    handbookRef: "§2.1; FAQ 22, FAQ 33",
  },
  {
    id: "q6_legal_evidence",
    stepId: "S6",
    text: {
      en: "Does the family have a court document — a Succession Certificate, Probate of Will, or Letter of Administration?",
    },
    whyStrip: {
      en: "With one of these, the claim has no waiting period and no amount limit.",
    },
    inputType: "single",
    options: [
      { id: "yes", label: { en: "Yes" } },
      {
        id: "no",
        label: { en: "No" },
        help: {
          en: "These are court documents naming the legal heirs. If the family does not have one yet, the next questions will show whether one is actually needed.",
        },
      },
    ],
    visibleWhen: { "==": [{ var: "answers.q5_nomination" }, "no"] },
    invalidates: [
      "q7a_amount",
      "q7b_heirs_together",
      "q8_maturity",
      "q8_close_or_continue",
      "q9_payment",
      "q10_docs_check",
    ],
    handbookRef: "§3.1; §3.2",
  },
  {
    id: "q7a_amount",
    stepId: "S7",
    text: { en: "Roughly how much is in this account? (See the last line of the passbook.)" },
    whyStrip: {
      en: `Up to ${affidavitLimitPhraseEn}, families can claim with sworn statements instead of a court document.`,
    },
    inputType: "single",
    options: [
      { id: "up_to_5_lakh", label: { en: `Up to ${affidavitLimitPhraseEn}` } },
      { id: "more_than_5_lakh", label: { en: `More than ${affidavitLimitPhraseEn}` } },
      { id: "not_sure", label: { en: "I'm not sure" } },
    ],
    visibleWhen: { "==": [{ var: "answers.q6_legal_evidence" }, "no"] },
    invalidates: [],
    handbookRef: "§3.1(c); §4.1",
  },
  {
    id: "q7b_heirs_together",
    stepId: "S7",
    text: {
      en: "Can all the legal heirs join in — sign the papers together, or give written consent?",
    },
    whyStrip: {
      en: "This route needs every heir's signature, or a signed no-objection from anyone who is not claiming.",
    },
    inputType: "single",
    options: [
      { id: "yes", label: { en: "Yes" } },
      { id: "no", label: { en: "No, or there is disagreement" } },
      {
        id: "not_sure_who",
        label: { en: "I'm not sure who counts as a legal heir" },
        help: {
          en: "Usually the spouse, children, and mother of the person who died, in that order. We can explain this in more detail.",
        },
      },
    ],
    visibleWhen: { "==": [{ var: "answers.q6_legal_evidence" }, "no"] },
    invalidates: [],
    handbookRef: "§4.1; FAQ 41",
  },
  {
    id: "q8_maturity",
    stepId: "S8",
    text: { en: "Where does this account or certificate stand today?" },
    whyStrip: {
      en: "This decides whether the account can be transferred into the claimant's name instead of being closed.",
    },
    inputType: "single",
    options: [
      { id: "not_yet_matured", label: { en: "It has not yet reached its maturity date" } },
      {
        id: "matured_within_10_years",
        label: { en: "It matured, less than 10 years ago" },
      },
      {
        id: "matured_over_10_years",
        label: { en: "It matured more than 10 years ago" },
      },
      { id: "not_sure", label: { en: "I'm not sure" } },
    ],
    visibleWhen: {
      and: [
        { "==": [{ var: "scheme.continuableByClaimant" }, true] },
        { "==": [{ var: "answers.q2_who_died" }, "adult"] },
        { not: { "==": [{ var: "answers.q3_holding" }, "two_names_survivor"] } },
      ],
    },
    invalidates: ["q8_close_or_continue"],
    handbookRef: "§7.7 (RD/TD/NSC/KVP rows); §5.4-10",
  },
  {
    id: "q8_close_or_continue",
    stepId: "S8",
    text: {
      en: "Do you want to close this account, or continue it in your name until maturity?",
    },
    whyStrip: {
      en: "Recurring Deposit, Time Deposit, NSC, and KVP can be transferred to the claimant instead of closed.",
    },
    inputType: "single",
    options: [
      { id: "close", label: { en: "Close the account and receive the money now" } },
      {
        id: "continue",
        label: { en: "Continue the account in my name until maturity" },
      },
    ],
    visibleWhen: { "==": [{ var: "answers.q8_maturity" }, "not_yet_matured"] },
    invalidates: ["q9_payment", "q10_docs_check"],
    handbookRef: "§5.4-4; FAQ 20",
  },
  {
    id: "q9_payment",
    stepId: "S9",
    text: { en: "How would you like to receive the money?" },
    whyStrip: {
      en: "Choosing now means you sign once and don't need to visit again to collect it.",
    },
    inputType: "single",
    options: [
      {
        id: "own_posb",
        label: { en: "Into my own Post Office savings account (fastest)" },
      },
      {
        id: "bank_transfer",
        label: { en: "Into my bank account" },
        help: {
          en: "Available only for RD, TD, MIS, NSC and KVP claims — not Savings Account, SSA, or PPF.",
        },
      },
      { id: "cheque", label: { en: "By cheque" } },
    ],
    visibleWhen: {
      not: { "==": [{ var: "answers.q8_close_or_continue" }, "continue"] },
    },
    invalidates: [],
    handbookRef: "§6.1; §6.2; FAQ 39",
  },
  {
    id: "q10_docs_check",
    stepId: "S10",
    text: { en: "Quick documents check — tick anything that applies." },
    whyStrip: {
      en: "These change what you need to bring, so we ask now, before your checklist.",
    },
    inputType: "multi",
    options: [
      {
        id: "passbook_lost",
        label: { en: "The passbook or certificate is lost" },
      },
      {
        id: "name_mismatch_depositor",
        label: {
          en: "The name on the passbook differs from the name on the death certificate",
        },
      },
      {
        id: "name_mismatch_own",
        label: {
          en: "Your own name differs between Post Office records and your ID",
        },
      },
      {
        id: "cannot_leave_original_death_cert",
        label: { en: "I can't leave the original death certificate" },
      },
      {
        id: "death_cert_not_standard",
        label: {
          en: "The death certificate is not from a municipality, hospital, or police station",
        },
      },
      {
        id: "someone_abroad",
        label: { en: "Someone involved lives outside India" },
      },
      {
        id: "missing_person",
        label: {
          en: "The person has been missing (not heard of) for more than 7 years",
        },
      },
      {
        id: "insurance_deductions",
        label: {
          en: "Small amounts (about ₹20, ₹436, or a monthly pension contribution) were deducted regularly",
        },
        help: { en: "This usually means PMSBY, PMJJBY insurance cover, or an Atal Pension Yojana (APY) enrolment." },
      },
      {
        id: "none",
        label: { en: "None of these" },
        exclusive: true,
      },
    ],
    visibleWhen: ALWAYS,
    invalidates: [],
    handbookRef: "§5.4-1; §5.4-2; §7.2; §7.3; §7.10; §7.1",
  },
];
