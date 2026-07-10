import type { ContentPage } from "@claimsahayak/shared-types";

const LAST_REVIEWED = "2026-07-09";

function glossaryEntry(
  id: string,
  slug: string,
  term: string,
  definitionEn: string,
  handbookRef?: string,
): ContentPage {
  return {
    id,
    tier: "glossary",
    slug,
    title: { en: term },
    summary: { en: definitionEn },
    blocks: [{ kind: "paragraph", text: { en: definitionEn } }],
    ...(handbookRef !== undefined ? { handbookRef } : {}),
    lastReviewed: LAST_REVIEWED,
  };
}

export const GLOSSARY_PAGES: readonly ContentPage[] = [
  glossaryEntry(
    "glossary_nominee",
    "nominee",
    "Nominee",
    "A person registered by the account holder to receive the money after their death. A nominee is only a receiver, not necessarily the legal owner — unless there's no other claimant, the money may still need to be shared with legal heirs in some situations.",
    "§2.1",
  ),
  glossaryEntry(
    "glossary_legal_heir",
    "legal-heir",
    "Legal heir",
    "A person entitled by law to inherit a deceased person's assets when there's no nomination or will — usually the spouse, children, and mother, though this depends on the personal law that applies to the family.",
    "FAQ 41",
  ),
  glossaryEntry(
    "glossary_succession_certificate",
    "succession-certificate",
    "Succession Certificate",
    "A court document, issued under the Indian Succession Act, 1925, naming the legal heirs of a person who died without a will and their respective shares.",
    "§3.1",
  ),
  glossaryEntry(
    "glossary_probate",
    "probate",
    "Probate",
    "A court order confirming that a deceased person's will is genuine and can be acted on.",
    "§3.1",
  ),
  glossaryEntry(
    "glossary_letter_of_administration",
    "letter-of-administration",
    "Letter of Administration",
    "A court order appointing someone to manage and distribute a deceased person's assets, used when there's no will (or no executor able to act).",
    "§3.1",
  ),
  glossaryEntry(
    "glossary_indemnity_bond",
    "indemnity-bond",
    "Indemnity bond",
    "A signed promise (Form 15 in this process) to compensate the Post Office if it later turns out someone else also had a valid claim on the account.",
    "§4.1",
  ),
  glossaryEntry(
    "glossary_disclaimer",
    "disclaimer",
    "Disclaimer (Form 14)",
    "A signed statement by a legal heir or nominee giving up their own individual share so the full amount can be paid to one particular claimant.",
    "§2.1; §4.1",
  ),
  glossaryEntry(
    "glossary_affidavit",
    "affidavit",
    "Affidavit (Form 13)",
    "A sworn written statement, signed in front of a notary or oath commissioner, used as proof of who the legal heirs are when there's no nomination or court document and the balance is within the affidavit limit.",
    "§4.1",
  ),
  glossaryEntry(
    "glossary_surety",
    "surety",
    "Surety",
    "A person who guarantees, alongside the claimant, that an indemnity bond will be honoured — the Post Office checks the surety's own financial standing before accepting them.",
    "FAQ 40",
  ),
  glossaryEntry(
    "glossary_reconciliation_certificate",
    "reconciliation-certificate",
    "Reconciliation certificate",
    "A certificate, obtained in advance from the Division office or a Gazetted officer, confirming that two slightly different versions of a name refer to the same person.",
    "§5.4-1; §5.4-2",
  ),
];
