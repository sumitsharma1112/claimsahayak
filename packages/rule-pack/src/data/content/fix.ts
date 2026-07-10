import type { ContentPage } from "@claimsahayak/shared-types";

const LAST_REVIEWED = "2026-07-09";

export const FIX_PAGES: readonly ContentPage[] = [
  {
    id: "fix_lost_passbook",
    tier: "fix",
    slug: "lost-passbook",
    title: { en: "The passbook or certificate is lost" },
    summary: {
      en: "You can still close the account, or continue an NSC/KVP certificate, without the original.",
    },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "A lost passbook or certificate does not stop a claim. What changes depends on whether the account is being closed or continued.",
        },
      },
      {
        kind: "heading",
        level: 2,
        text: { en: "If the account is being closed" },
      },
      {
        kind: "paragraph",
        text: {
          en: "Fill in the \"closure without passbook\" request (a printable template is provided in your checklist) and attach it to your claim papers.",
        },
      },
      {
        kind: "heading",
        level: 2,
        text: { en: "If an NSC or KVP certificate is being continued" },
      },
      {
        kind: "paragraph",
        text: {
          en: "A duplicate certificate needs to be issued first, for a small fee (₹10 plus GST per registration), along with an indemnity bond — the Post Office will confirm whether NC-54(a) (with a personal surety) or NC-54(b) (with a bank guarantee) fits your situation.",
        },
      },
    ],
    handbookRef: "§5.4-5; Annexure 9",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_reconciliation_depositor",
    tier: "fix",
    slug: "reconciliation-depositor",
    title: { en: "The depositor's name doesn't match" },
    summary: {
      en: "Apply for a reconciliation certificate before submitting the claim.",
    },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "If the account holder's name in the Post Office's records differs from the name on the death certificate — even by a small spelling difference — a reconciliation certificate is needed first.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "Fill in the reconciliation-certificate request (a printable template is provided)." },
          { en: "Submit it to the Division office or a Gazetted Postmaster, with copies of both documents showing the two versions of the name." },
          { en: "Once issued, attach the certificate to your claim papers." },
        ],
      },
    ],
    handbookRef: "§5.4-1; Annexure 7; FAQ 12",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_reconciliation_claimant",
    tier: "fix",
    slug: "reconciliation-claimant",
    title: { en: "Your own name doesn't match" },
    summary: {
      en: "Apply for a reconciliation certificate in your own name, or bring one from any Gazetted Officer.",
    },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "If your name as nominee or claimant in the Post Office's records differs from your ID (for example, your Aadhaar card), a reconciliation certificate confirms you are the same person.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "Fill in the reconciliation-certificate request (a printable template is provided)." },
          { en: "Submit it to the Division office or a Gazetted Postmaster — or bring a certificate in the prescribed format from any Gazetted Officer instead." },
        ],
      },
      {
        kind: "paragraph",
        text: {
          en: "Current practice asks for this certificate even for very minor spelling differences, so it's worth arranging in advance.",
        },
      },
    ],
    handbookRef: "§5.4-2; Annexure 7; FAQ 13, FAQ 14",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_form_13",
    tier: "fix",
    slug: "form-13",
    title: { en: "The Post Office asked for Form 13" },
    summary: { en: "A sworn affidavit, signed by every legal heir, used only in the no-nomination affidavit route." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Form 13 is a sworn statement that you and the other legal heirs are the only people entitled to the money. It's needed only when there's no nomination and no court document, with the balance within the affidavit limit.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "Every legal heir signs, including the person actually claiming the money." },
          { en: "It's executed on stamp paper (commonly ₹20 — confirm the exact value for your state), valid for one year." },
          { en: "It's sworn in front of a notary public or an oath commissioner." },
        ],
      },
    ],
    handbookRef: "§4.1; Annexure 3; Annexure 6",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_form_14",
    tier: "fix",
    slug: "form-14",
    title: { en: "The Post Office asked for Form 14" },
    summary: { en: "A letter of disclaimer, signed by every heir except the one actually claiming." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Form 14 lets other legal heirs (or other nominees) agree that the money should go to one particular person, rather than being split among everyone individually.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "Signed by every legal heir or nominee EXCEPT the person actually claiming." },
          { en: "Executed on stamp paper (commonly ₹20 — confirm the exact value for your state), valid for one year." },
          { en: "Sworn in front of a notary public or an oath commissioner." },
        ],
      },
    ],
    handbookRef: "§4.1; Annexure 4; Annexure 6",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_form_15",
    tier: "fix",
    slug: "form-15",
    title: { en: "The Post Office asked for Form 15" },
    summary: { en: "An indemnity bond, signed by the claimant and two sureties." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Form 15 protects the Post Office if it later turns out someone else also had a claim on the account. It's part of the sworn-statement (affidavit) route, alongside Forms 13 and 14.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "Signed by the claimant and two sureties, in front of two witnesses." },
          { en: "Executed on stamp paper (commonly ₹100 — confirm the exact value for your state), valid for one year." },
          { en: "Notarised by a notary public." },
        ],
      },
      {
        kind: "paragraph",
        text: {
          en: "Sureties can show their financial standing with a salary certificate (12 months), a recent income-tax return, an income certificate, or a solvency certificate from the local revenue office.",
        },
      },
    ],
    handbookRef: "§4.1; Annexure 5; Annexure 6; FAQ 40",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_lost_certificate",
    tier: "fix",
    slug: "lost-certificate",
    title: { en: "An NSC or KVP certificate is lost" },
    summary: { en: "A duplicate certificate can be issued, along with an indemnity bond." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "If the claimant is continuing an NSC or KVP certificate in their own name and the original has been lost, a duplicate is issued after the claim is approved.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "A fee of ₹10 plus GST applies per registration." },
          { en: "An indemnity bond is required: NC-54(a) with a personal surety, or NC-54(b) with a bank guarantee — the Post Office will confirm which one fits your situation, along with its exact execution requirements." },
        ],
      },
    ],
    handbookRef: "§5.4-5",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_witness",
    tier: "fix",
    slug: "witness",
    title: { en: "The Post Office raised a question about a witness" },
    summary: { en: "Witnesses do not need to visit the Post Office in person." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Any respectable person known to the Post Office, who is also personally acquainted with the claimant, can act as a witness on the claim form.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "The witness's own signed, self-attested photocopy of their ID and address proof is enough." },
          { en: "The witness's mobile number should be written on that photocopy." },
          { en: "The witness does not need to be physically present, at any stage, including when the claim is submitted." },
        ],
      },
    ],
    handbookRef: "§2.2; FAQ 10; Addendum to SB Order 31/2020 dated 16.09.2020",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_succession_certificate",
    tier: "fix",
    slug: "succession-certificate",
    title: { en: "The Post Office asked for a Succession Certificate" },
    summary: { en: "A court document naming the legal heirs — needed above the affidavit limit or when heirs can't all join together." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "A Succession Certificate is issued by a civil court under the Indian Succession Act, 1925. It names the legal heirs entitled to the deceased person's assets, including this account.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not legal advice: getting one usually means applying to the district court, typically with a lawyer's help.",
        },
      },
      {
        kind: "warningChip",
        text: {
          en: "A Legal Heirship Certificate from a Tahsildar or other revenue authority is NOT accepted in place of a Succession Certificate.",
        },
      },
    ],
    handbookRef: "§3.1; §3.2; FAQ 31",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_probate",
    tier: "fix",
    slug: "probate",
    title: { en: "The Post Office asked for a Probate of Will" },
    summary: { en: "A court's confirmation that a will is genuine and can be acted on." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "If the person who died left a will, a Probate is a court order confirming the will is valid and naming who is entitled to act on it. It serves the same purpose here as a Succession Certificate.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not legal advice: probate is granted by a civil court after reviewing the will.",
        },
      },
    ],
    handbookRef: "§3.1; §3.2",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_letter_of_administration",
    tier: "fix",
    slug: "letter-of-administration",
    title: { en: "The Post Office asked for a Letter of Administration" },
    summary: { en: "A court's appointment of someone to administer the estate when there's no will, or no executor named." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "A Letter of Administration is issued by a court when there is no will (or no executor able to act), appointing someone to manage and distribute the deceased person's assets. It serves the same purpose here as a Succession Certificate.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not legal advice: it is applied for at the civil court.",
        },
      },
    ],
    handbookRef: "§3.1; §3.2",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_death_certificate",
    tier: "fix",
    slug: "death-certificate",
    title: { en: "A question about the death certificate" },
    summary: { en: "A photocopy is usually enough, and several alternate certificates are accepted." },
    blocks: [
      {
        kind: "heading",
        level: 2,
        text: { en: "Can't leave the original?" },
      },
      {
        kind: "paragraph",
        text: {
          en: "That's fine. The Post Office can compare your original with a photocopy at the counter and hand the original straight back to you.",
        },
      },
      {
        kind: "heading",
        level: 2,
        text: { en: "Don't have one from a municipality, hospital, or police station?" },
      },
      {
        kind: "list",
        items: [
          { en: "A certificate from a Gazetted Officer, MP, MLA, or Panchayat/Village authority is accepted." },
          { en: "For balances up to ₹500, a certificate from the last employer or attending doctor is accepted." },
          { en: "A Parsee Panchayat certificate, or a church burial certificate, is accepted where applicable." },
        ],
      },
    ],
    handbookRef: "§7.2; FAQ 11",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_minor_certificate",
    tier: "fix",
    slug: "minor-certificate",
    title: { en: "The Post Office asked for a \"minor is alive\" certificate" },
    summary: { en: "A short certificate confirming a child nominee is alive and the money is needed for them." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "When the nominee is a child, the person collecting the money on the child's behalf — usually a parent or guardian — signs a short certificate confirming the child is alive and that the money is required for the child.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "This certificate is provided and signed at the Post Office itself; there's nothing to prepare in advance.",
        },
      },
    ],
    handbookRef: "§7.5",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_abroad_authentication",
    tier: "fix",
    slug: "abroad-authentication",
    title: { en: "Someone involved lives outside India" },
    summary: { en: "Documents signed abroad usually need consular or apostille authentication." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "If the claimant, a relative, or a document (death certificate, disclaimer, power of attorney) is from outside India, it usually needs authentication by the Indian Consular Office in that country.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "This step is skipped for countries with a reciprocal arrangement with India — including the United Kingdom, Ireland, most of the European Union, the USA, Australia, and several dozen others under the Hague Apostille Convention or the Notaries Act, 1952. Ask the Post Office to confirm whether the specific country qualifies.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "Payment to a claimant abroad is made only to a Power of Attorney holder present in India — there is no direct remittance abroad, and no NRE/NRO account credit.",
        },
      },
    ],
    handbookRef: "§7.10; FAQ 15",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_insurance_pmsby_pmjjby",
    tier: "fix",
    slug: "insurance-pmsby-pmjjby",
    title: { en: "Small yearly deductions were noticed in the passbook" },
    summary: { en: "This usually means separate insurance or pension claim papers are also needed." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "Small amounts deducted regularly (commonly around ₹20 or ₹436 each May) usually mean the account holder was enrolled in PMSBY or PMJJBY insurance cover, or in the Atal Pension Yojana (APY).",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "Separate claim papers for these are needed, but closing the savings account itself does not need to wait for them — both can move forward together.",
        },
      },
    ],
    handbookRef: "§7.1",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_missing_person",
    tier: "fix",
    slug: "missing-person",
    title: { en: "The person has been missing for more than 7 years" },
    summary: { en: "A court must first presume death before a claim can be settled." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "When someone has not been heard from for more than 7 years, the law allows a court to presume they have died, under Sections 107 and 108 of the Indian Evidence Act.",
        },
      },
      {
        kind: "list",
        items: [
          { en: "A police FIR must have been filed." },
          { en: "Either a police non-traceable report, or a court order presuming death, is needed." },
          { en: "A letter of indemnity from the claimant(s) is also required." },
        ],
      },
      {
        kind: "paragraph",
        text: {
          en: "This is general information, not legal advice — a lawyer can advise on raising the court presumption.",
        },
      },
    ],
    handbookRef: "§7.3",
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: "fix_other",
    tier: "fix",
    slug: "other",
    title: { en: "Something else the Post Office asked for" },
    summary: { en: "Not every situation fits a single guide — here's how to get the right help." },
    blocks: [
      {
        kind: "paragraph",
        text: {
          en: "If what the Post Office asked for isn't covered by the other guides here, two things can help: reading through how the overall claim process works, and knowing where to escalate if you feel something isn't moving as it should.",
        },
      },
      {
        kind: "paragraph",
        text: {
          en: "If your account has been flagged because it's more than 10 years past maturity, or a similar time-based freeze, know that your original claim steps still apply — the difference is that it will be processed at the Head Post Office rather than a smaller branch.",
        },
      },
    ],
    handbookRef: "§5.4-10; FAQ 18; FAQ 25; FAQ 30",
    lastReviewed: LAST_REVIEWED,
  },
];
