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
          en: "A Legal Heirship Certificate from a Tahsildar or other revenue authority is NOT accepted as a substitute — it will not be enough on its own.",
        },
      },
    ],
    nextPhysicalStep: {
      en: "Consult a lawyer or your local civil court about obtaining a Succession Certificate (or a Probate of Will / Letter of Administration, if there is a will). Once you have it, come back here and answer \"Yes\" to the court-document question.",
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
