import type { ContentPage } from "@claimsahayak/shared-types";

const LAST_REVIEWED = "2026-07-09";

/**
 * Milestone 2 scope note: the roadmap places FULL /learn authoring at
 * Milestone 7 ("Learn pages... Dependencies: M2 content structures"). What
 * belongs here now is the schema (content.schema.ts) and the handful of
 * pages that routes/cards/questions already cross-reference directly, so
 * nothing in this pack points at a page that doesn't exist yet.
 */
export const LEARN_PAGES: readonly ContentPage[] = [
  {
    id: "learn_process",
    tier: "learn",
    slug: "process",
    title: { en: "How a death claim works, in general" },
    summary: {
      en: "Every claim follows the same shape: find out about the nominee, gather papers, submit, then wait for approval.",
    },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Whatever the specific account or situation, a Post Office savings death claim moves through the same broad stages.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "Find out whether a nominee is registered for the account." },
          { en: "Gather the papers for your specific situation (this tool builds that list for you)." },
          { en: "Submit the papers at any nearby Post Office — you don't need the exact branch where the account was opened." },
          { en: "The Post Office verifies its own records (balance, nomination, any freeze) — you are never asked to prove these yourself." },
          { en: "Once papers are complete, approval usually takes 1 working day with a nominee, or up to 7 working days otherwise." },
        ],
      },
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not a substitute for asking Post Office staff about your specific account.",
        },
      },
    ],
    handbookRef: "§2.2; §5.2; §5.3; FAQ 17",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "learn_succession_certificate",
    tier: "learn",
    slug: "succession-certificate",
    title: { en: "What is a Succession Certificate, and when is it needed?" },
    summary: {
      en: "A court document naming the legal heirs — needed when there's no nomination, no will, and either the balance is large or the heirs can't agree.",
    },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "A Succession Certificate is issued by a civil court under the Indian Succession Act, 1925. It names the people legally entitled to a deceased person's movable assets — bank and Post Office balances among them — and their respective shares.",
        },
      },
      {
        kind: "heading",
        level: 2,
        text: { en: "When is it actually needed for a Post Office claim?" },
      },
      {
        kind: "list",
        items: [
          { en: "There is no nominee registered for the account (or the registered nominee's own claim has become complicated)." },
          { en: "The account balance is above the affidavit limit, OR not every legal heir is able to sign the claim together." },
        ],
      },
      {
        kind: "paragraph",
        text: {
          en: "Below the affidavit limit, with every heir able to join in, sworn statements (Forms 13, 14, and 15) can be used instead — no court step is needed.",
        },
      },
      {
        kind: "warningChip",
        text: {
          en: "A Legal Heirship Certificate from a Tahsildar or revenue authority is a different document and is NOT accepted as a substitute.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not legal advice. A Probate of Will (if there's a will) or a Letter of Administration (if there's no will and no executor) serve the same purpose here.",
        },
      },
    ],
    handbookRef: "§3.1; §3.2; FAQ 31",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "learn_legal_heirs",
    tier: "learn",
    slug: "legal-heirs",
    title: { en: "Who counts as a legal heir?" },
    summary: {
      en: "Usually the spouse, children, and mother of the person who died — but this depends on the personal law that applies.",
    },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not legal advice. When a person dies without a will, the law decides who inherits their assets — these people are called legal heirs.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "In most cases, the closest family — the spouse, children, and mother — are considered first. If none of them survive the person, more distant relatives may be considered instead (for example, grandchildren, father, or siblings, depending on the circumstances).",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "Exactly who counts, and in what proportion, depends on which personal law applies to the family (for example, Hindu Succession Act, Indian Succession Act, or a personal law based on religion). Where there's doubt or disagreement among family members, it's worth asking a lawyer, or applying for a Succession Certificate, which settles the question through the court.",
        },
      },
    ],
    handbookRef: "FAQ 41",
    lastReviewed: LAST_REVIEWED,
  },
];
