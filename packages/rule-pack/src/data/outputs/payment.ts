import type { OutputRule } from "@claimsahayak/shared-types";

/**
 * Appended by the engine according to the q9_payment answer. Cheque has no
 * extra items (handbook §6.1-2) so there is no PAYMENT_CHEQUE bucket.
 */
export const PAYMENT_BANK_TRANSFER_OUTPUTS: readonly OutputRule[] = [
  {
    id: "PAYMENT_BANK_TRANSFER_passbook_page",
    routeId: "PAYMENT_BANK_TRANSFER",
    itemType: "document",
    refId: "doc_bank_passbook_first_page",
    label: { en: "First page of your bank passbook, or a bank statement" },
    attrs: {
      why: { en: "Confirms your bank account and IFSC code for the transfer." },
      originalOrCopy: { en: "A clear copy is enough." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 1,
    handbookRef: "§6.1; §6.2",
  },
  {
    id: "PAYMENT_BANK_TRANSFER_availability_note",
    routeId: "PAYMENT_BANK_TRANSFER",
    itemType: "goodToKnow",
    label: {
      en: "Direct bank transfer is available only for Recurring Deposit, Time Deposit, Monthly Income Scheme, NSC, and KVP claims — not for Savings Account, Sukanya Samriddhi, or PPF. It takes about a day longer than crediting your own Post Office account.",
    },
    attrs: {
      why: { en: "So there are no surprises about which accounts this option covers." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "documents",
    sortOrder: 2,
    handbookRef: "FAQ 39",
  },
];

export const PAYMENT_OWN_POSB_OUTPUTS: readonly OutputRule[] = [
  {
    id: "PAYMENT_OWN_POSB_passbook_copy",
    routeId: "PAYMENT_OWN_POSB",
    itemType: "document",
    refId: "doc_own_posb_passbook_copy",
    label: { en: "Copy of your own Post Office savings passbook (or just the account number)" },
    attrs: {
      why: { en: "Tells the Post Office where to credit the money." },
      originalOrCopy: { en: "A copy is enough, or simply write the account number on Form 11." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 1,
    handbookRef: "§6.1; §6.2",
  },
  {
    id: "PAYMENT_OWN_POSB_no_revisit_note",
    routeId: "PAYMENT_OWN_POSB",
    itemType: "goodToKnow",
    label: {
      en: "This is the fastest option: no delay from cheque printing or clearing, and you sign the receipt at the time you submit your claim, so you won't need to visit again just to collect the money.",
    },
    attrs: {
      why: { en: "This explains why this is the recommended default." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "documents",
    sortOrder: 2,
    handbookRef: "§6.2",
  },
];
