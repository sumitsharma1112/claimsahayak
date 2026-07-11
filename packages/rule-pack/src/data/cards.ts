import type { CardDefinition } from "@claimsahayak/shared-types";
import { affidavitLimitPhraseEn, noNominationWaitPhraseEn } from "./format.js";

export const CARDS: readonly CardDefinition[] = [
  {
    id: "card_info_end_old_scheme",
    kind: "info",
    title: { en: "This is handled at the Head Post Office" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "Older or discontinued schemes — such as NSS-87, NSS-92, PPF (HUF), IVP, or 6th/7th-issue NSC — are settled directly at the Head Post Office or GPO, not through this checklist.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "The passbook or certificate for the account" },
          { en: "The death certificate of the account holder" },
          { en: "Your own ID" },
        ],
      },
    ],
    nextPhysicalStep: {
      en: "Visit your linked Head Post Office with the passbook or certificate, the death certificate, and your ID.",
    },
  },
  {
    id: "card_guardian_change",
    kind: "info",
    title: { en: "This is a change of guardian, not a money claim" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "The child is still alive, so there is no money to claim yet. What's needed here is to register the new guardian on the child's account.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "A change of guardian is only allowed on the death of the existing guardian, or by a court's order. If a parent is still alive, that parent is the new guardian; otherwise, a court must appoint one.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "Bring the previous guardian's death certificate and a fresh account-opening form with KYC documents to the Post Office. If no parent is available, bring the court order appointing the new guardian instead.",
    },
  },
  {
    id: "card_pause_nomination",
    kind: "pause",
    title: { en: "First, find out about the nominee" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "Any nearby Post Office can tell you whether a nominee is registered for this account — you don't need to go to the exact branch where the account was opened.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "The death certificate" },
          { en: "Your own ID" },
          { en: "The printed request letter below (optional, but helpful)" },
        ],
      },
      {
        kind: "summaryBox",
        text: {
          en: "Ask: \"Is a nominee registered for this account?\" Mention your relationship to the person who died.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "Ask at any nearby Post Office, or hand in the printed request letter. Your answers here are saved on this device, so you can come back and continue once you know.",
    },
    templateId: "template_nomination_request",
  },
  {
    id: "card_stop_succession_certificate",
    kind: "stop",
    title: { en: "A court document is needed here" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "Because there's no nomination, and either the balance is above the affidavit limit or not every legal heir can join the claim together, a court document is needed — a Succession Certificate, Probate of Will, or Letter of Administration.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "These are general terms, not legal advice: a Succession Certificate is issued by a civil court and lists who is entitled to the deceased person's assets. Getting one usually involves a lawyer and a court application.",
        },
      },
      {
        kind: "warningChip",
        text: {
          en: "A Legal Heirship Certificate from a Tahsildar or other revenue authority IS accepted for claims above the affidavit limit, alongside a Succession Certificate, Probate, or Letter of Administration — but once a dispute has been raised, only a court Succession Certificate is accepted.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "If you need to apply for one of these court documents, the Post Office can give you, on request, a balance certificate for this account so its value doesn't have to be included when working out the court fee.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "Consult a lawyer or your local civil court about obtaining a Succession Certificate, a Legal Heir Certificate from the Tahsildar, or a Probate of Will / Letter of Administration if there is a will. Once you have it, come back here and answer \"Yes\" to the court-document question.",
    },
  },
  {
    id: "card_referral_armed_forces",
    kind: "info",
    title: { en: "This is handled through the Armed Forces requisition process" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "When a serving member of the Army, Air Force, or Navy dies (or deserts) and their Commanding Officer or Committee of Adjustment raises a requisition, the Post Office is required to pay the eligible amount to that Committee — this overrides any nomination and is not settled through the usual claim process described here.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "The family's point of contact for this is the Commanding Officer or Committee of Adjustment, who deals directly with the Post Office's Accounts Office.",
    },
  },
  {
    id: "card_referral_untraceable_nominee",
    kind: "stop",
    title: { en: "There's no official procedure for this yet" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "When a co-nominee cannot be found, or is unwilling to join the claim, and has not signed a Form 14 disclaimer, there is currently no published official procedure covering this situation.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "The usual approach is for the Post Office to treat it as a doubtful or special case: they make enquiries, record what's known, and refer it to the Divisional Head or the Directorate for a decision.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "Take your claim to the Post Office and explain the situation — ask them to record it and refer it to the Divisional Head, since there is no standard published procedure for this specific case.",
    },
  },
  {
    id: "card_stop_dispute_succession_certificate",
    kind: "stop",
    title: { en: "A dispute means only a court Succession Certificate will do" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "Because a dispute about this claim has been raised with the Post Office before payment, the claim can only be paid on a Succession Certificate granted by a court under the Indian Succession Act, 1925.",
        },
      },
      {
        kind: "warningChip",
        text: {
          en: "A Probate of Will, Letter of Administration, or a Legal Heir Certificate from a Tahsildar — which would normally be enough — do NOT suffice once a dispute has been raised.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "Consult a lawyer or your local civil court about obtaining a Succession Certificate. Once you have it, come back here and continue the claim.",
    },
  },
  {
    id: "card_clarify_legal_heirs",
    kind: "info",
    title: { en: "Who counts as a legal heir?" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not legal advice. When someone dies without a will, the closest family members — usually the spouse, children, and mother — are considered first. If none of them are alive, the next closest relatives (such as grandchildren, father, siblings) may be considered.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "Exactly who counts, and in what order, depends on the personal law that applies to the family. If there's any doubt or disagreement, it's worth asking a lawyer before the claim is submitted.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "Once you have a clearer picture of who the legal heirs are, go back and answer whether they can all join the claim together.",
    },
  },
  {
    id: "card_wait_or_court",
    kind: "wait",
    title: { en: "You can wait, or get a court document now" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: `Without a nomination or a court document, a claim based on sworn statements can only be made once ${noNominationWaitPhraseEn} have passed since the death. It hasn't been that long yet.`,
        },
      },
      {
        kind: "list",
        items: [
          { en: "Wait until the 6-month mark has passed, then use the sworn-statement (affidavit) route." },
          { en: "Or, if the family needs the money sooner, get a Succession Certificate (or similar court document) now, which has no waiting period." },
        ],
      },
    ],
    nextPhysicalStep: {
      en: "Choose to wait, or start the court-document process now. Either way, you can return to this checklist once you're ready.",
    },
  },
  {
    id: "card_dual_preview",
    kind: "dual",
    title: { en: "Check the passbook, then choose" },
    body: [
      {
        kind: "paragraph",
        text: {
          en: `The next steps depend on the balance: up to ${affidavitLimitPhraseEn}, sworn statements are enough; above that, a court document is needed.`,
        },
      },
      {
        kind: "table",
        rows: [
          [{ en: "If the balance is up to the limit" }, { en: "Sworn-statement (affidavit) route — Forms 13, 14, 15" }],
          [{ en: "If the balance is above the limit" }, { en: "A court document is needed (Succession Certificate, Probate, or Letter of Administration)" }],
        ],
      },
    ],
    nextPhysicalStep: {
      en: "Look at the last balance entry in the passbook, then come back and tell us whether it's above or below the limit.",
    },
  },
];
