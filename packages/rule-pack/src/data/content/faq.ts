import type { ContentPage } from "@claimsahayak/shared-types";

const LAST_REVIEWED = "2026-07-09";

/**
 * Milestone 2 scope note: same as learn.ts — the roadmap places the FULL
 * FAQ page (all ~38 items) at Milestone 7. This is a real, complete subset
 * (not placeholders) covering the questions this pack's own routes, cards,
 * and overlays already reference, so every cross-reference resolves.
 */
export const FAQ_PAGES: readonly ContentPage[] = [
  {
    id: "faq_nominee_unknown",
    tier: "faq",
    slug: "dont-know-if-theres-a-nominee",
    title: { en: "I don't know if a nominee is registered. What do I do?" },
    summary: { en: "Ask at any nearby Post Office — you don't need to travel to the exact branch." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Visit any nearby Post Office with the death certificate and your own ID, and ask whether a nominee is registered for the account. Mention your relationship to the person who died.",
        },
      },
    ],
    handbookRef: "FAQ 1",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_will_post_office_tell_me",
    tier: "faq",
    slug: "will-post-office-tell-me-nominee-details",
    title: { en: "Will the Post Office tell me who the nominee is?" },
    summary: { en: "Normally yes, on request, in person." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Normally, yes — the Post Office will let you know whether a nominee is registered and who it is, when you ask in person. It may ask for proof of your relationship to the account holder.",
        },
      },
    ],
    handbookRef: "FAQ 3",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_any_post_office",
    tier: "faq",
    slug: "can-i-use-any-post-office",
    title: { en: "Can I submit my claim at any Post Office?" },
    summary: { en: "Yes — it will be forwarded the same day to the account's own Post Office." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Yes. You can hand in your claim papers at any nearby Post Office, and it will forward them the same day, by insured post, to the Post Office where the account actually stands.",
        },
      },
    ],
    handbookRef: "FAQ 5; FAQ 27",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_witness_who",
    tier: "faq",
    slug: "who-can-be-a-witness",
    title: { en: "Who can be a witness on the claim form?" },
    summary: { en: "Someone known to the Post Office who also personally knows you." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "A witness should be a respectable person known to the Post Office, who is also personally acquainted with you (the claimant). They don't need to be present in person — a signed, self-attested photocopy of their ID with their mobile number is enough.",
        },
      },
    ],
    handbookRef: "FAQ 10",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_original_death_certificate",
    tier: "faq",
    slug: "do-i-lose-the-original-death-certificate",
    title: { en: "Do I have to permanently hand over the original death certificate?" },
    summary: { en: "No — it's compared at the counter and handed straight back." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "No. Bring the original along with a photocopy; the Post Office compares them at the counter, keeps the photocopy, and returns the original to you immediately.",
        },
      },
    ],
    handbookRef: "FAQ 11",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_name_mismatch_depositor",
    tier: "faq",
    slug: "depositor-name-doesnt-match",
    title: { en: "What if the depositor's name doesn't exactly match the death certificate?" },
    summary: { en: "A reconciliation certificate resolves this." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Apply for a reconciliation certificate from the Division office or a Gazetted Postmaster before submitting the claim — see the guide on reconciliation certificates for the exact steps.",
        },
      },
    ],
    handbookRef: "FAQ 12",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_name_mismatch_own",
    tier: "faq",
    slug: "my-own-name-doesnt-match",
    title: { en: "What if my own name doesn't exactly match my ID?" },
    summary: { en: "The same reconciliation-certificate process applies, even for small differences." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "The same reconciliation-certificate process applies — current practice asks for it even when the difference looks minor (a missing initial, for example), so it's worth arranging in advance.",
        },
      },
    ],
    handbookRef: "FAQ 13; FAQ 14",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_claimant_abroad",
    tier: "faq",
    slug: "claimant-lives-abroad",
    title: { en: "The claimant lives outside India. What changes?" },
    summary: { en: "Documents usually need consular or apostille authentication; payment goes through a Power of Attorney holder in India." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Documents signed abroad usually need authentication by the Indian Consular Office in that country, unless it has a reciprocal arrangement with India. Payment is made only to a Power of Attorney holder present in India — there is no direct transfer abroad.",
        },
      },
    ],
    handbookRef: "FAQ 15",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_how_long",
    tier: "faq",
    slug: "how-long-does-it-take",
    title: { en: "How long does the claim take, once papers are complete?" },
    summary: { en: "Usually 1 working day with a nominee, up to 7 working days otherwise." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Usually 1 working day when a nominee is registered, and up to 7 working days otherwise, once your papers are complete and submitted.",
        },
      },
    ],
    handbookRef: "FAQ 17; SB Order 01/2023 dated 09.01.2023",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_deadline",
    tier: "faq",
    slug: "is-there-a-deadline-to-claim",
    title: { en: "Is there a deadline to submit a claim?" },
    summary: { en: "No fixed cutoff, but it's best to settle within 10 years." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "There is no fixed cutoff. However, it's advised to get the claim settled within 10 years of the death — after that, the account gets frozen and can only be processed at the linked Head Post Office.",
        },
      },
    ],
    handbookRef: "FAQ 18",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_receipt",
    tier: "faq",
    slug: "should-i-get-a-receipt",
    title: { en: "Should I get a receipt when I submit my papers?" },
    summary: { en: "Yes — always ask for one." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Yes, always ask for a receipt slip when you submit your claim papers. It's your proof of when you submitted, which is useful if there's ever a delay.",
        },
      },
    ],
    handbookRef: "FAQ 19",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_joint_account",
    tier: "faq",
    slug: "what-happens-with-a-joint-account",
    title: { en: "What happens with a joint account when one holder dies?" },
    summary: { en: "The surviving holder continues or closes it — no Form 11 needed." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "The surviving holder can continue the account as a single account, or close it, with a simple application — this is a lighter process than a full claim, and does not use Form 11.",
        },
      },
    ],
    handbookRef: "FAQ 20",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_nominee_predeceased",
    tier: "faq",
    slug: "nominee-died-before-account-holder",
    title: { en: "The registered nominee died before the account holder. What now?" },
    summary: { en: "If there's no other nominee, the claim is treated as if there were no nomination." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "If there is no other nominee registered, the claim proceeds as a no-nomination claim, through the legal-evidence or affidavit route depending on the circumstances. The nominee's own death certificate is also needed.",
        },
      },
    ],
    handbookRef: "FAQ 22",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_sms",
    tier: "faq",
    slug: "will-i-get-an-sms",
    title: { en: "Will I get an SMS when the claim is approved?" },
    summary: { en: "Only if you hold your own Post Office savings account with a mobile number registered." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "You will only receive an SMS if you hold your own Post Office savings account with a mobile number registered on it. Otherwise, check back at the Post Office directly.",
        },
      },
    ],
    handbookRef: "FAQ 24",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_separate_applications",
    tier: "faq",
    slug: "separate-application-per-account",
    title: { en: "Do I need a separate application for each account?" },
    summary: { en: "Yes — even if several accounts belong to the same person." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Yes, a separate claim application and document set is needed for each account or certificate registration, even if several are held by the same person and submitted together.",
        },
      },
    ],
    handbookRef: "FAQ 26; FAQ 35",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_six_month_wait",
    tier: "faq",
    slug: "why-wait-six-months",
    title: { en: "Why is there a 6-month wait for some claims?" },
    summary: { en: "It only applies to the no-nomination, no-court-document (affidavit) route." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "The 6-month wait applies only when there's no nomination and no court document, and the family wants to use sworn statements instead. A court document (Succession Certificate, Probate, or Letter of Administration) has no such wait.",
        },
      },
    ],
    handbookRef: "FAQ 28",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_power_of_attorney",
    tier: "faq",
    slug: "can-someone-else-submit-for-me",
    title: { en: "Can someone else submit the claim for me?" },
    summary: { en: "Yes, if they hold your Power of Attorney." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Yes — if you genuinely cannot be present, someone holding your Power of Attorney can submit and sign on your behalf.",
        },
      },
    ],
    handbookRef: "FAQ 29",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_tahsildar_certificate",
    tier: "faq",
    slug: "is-a-tahsildar-certificate-accepted",
    title: { en: "Is a Legal Heirship Certificate from a Tahsildar accepted?" },
    summary: { en: "No — it is not the same as a Succession Certificate, Probate, or Letter of Administration." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "No. A Legal Heirship Certificate from a Tahsildar or other revenue authority is not accepted as a substitute for a Succession Certificate, Probate of Will, or Letter of Administration. This is one of the most common and costly mistakes families make.",
        },
      },
    ],
    handbookRef: "FAQ 31",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_multiple_nominees_cannot_attend",
    tier: "faq",
    slug: "not-all-nominees-can-attend",
    title: { en: "Not every nominee can come to the Post Office together. What now?" },
    summary: { en: "The attending nominee(s) can collect the full amount with a signed disclaimer from the others." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "The nominee(s) who can attend may collect the full amount, provided the absent nominee(s) sign a Form 14 disclaimer (on stamp paper, notarised) along with a copy of their ID.",
        },
      },
    ],
    handbookRef: "FAQ 33",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "faq_bank_transfer_eligibility",
    tier: "faq",
    slug: "which-accounts-allow-bank-transfer",
    title: { en: "Which accounts allow direct bank transfer for the claim amount?" },
    summary: { en: "RD, TD, MIS, NSC, and KVP — not Savings Account, SSA, or PPF." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Direct bank transfer is available for Recurring Deposit, Time Deposit, Monthly Income Scheme, NSC, and KVP claims. It is not available for Savings Account, Sukanya Samriddhi Account, or PPF claims — for these, choose your own Post Office account or a cheque instead.",
        },
      },
    ],
    handbookRef: "FAQ 39",
    lastReviewed: LAST_REVIEWED,
  },
];
