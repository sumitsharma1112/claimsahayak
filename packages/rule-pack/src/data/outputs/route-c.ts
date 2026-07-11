import type { OutputRule } from "@claimsahayak/shared-types";
import {
  claimantId,
  deathCertificate,
  formEleven,
  passbookOrCertificate,
  witnesses,
} from "./common.js";

/**
 * ROUTE_C — affidavit route (Blueprint v2 §3.3; handbook §4.1, Annexure 6).
 * Used only when there is no nomination, no court document, the balance is
 * within the affidavit limit, at least the minimum wait has passed since
 * the death, and every legal heir is joining the claim.
 */
export const ROUTE_C_OUTPUTS: readonly OutputRule[] = [
  formEleven("ROUTE_C", 1),
  deathCertificate("ROUTE_C", 2),
  passbookOrCertificate("ROUTE_C", 3),
  claimantId("ROUTE_C", 4),
  witnesses("ROUTE_C", 5),
  {
    id: "ROUTE_C_form13_affidavit",
    routeId: "ROUTE_C",
    itemType: "form",
    refId: "form_13",
    label: { en: "Form 13 — affidavit" },
    attrs: {
      why: {
        en: "A sworn statement that you and the other legal heirs are the only people entitled to this money.",
      },
      originalOrCopy: {
        en: "One original, on stamp paper as shown in the forms guide, valid for one year.",
      },
      selfAttest: { en: "Every legal heir signs, including you." },
      verifiedBy: { en: "A notary public or an oath commissioner" },
    },
    section: "affidavits",
    sortOrder: 6,
    handbookRef: "§4.1; Annexure 3; Annexure 6",
  },
  {
    id: "ROUTE_C_form14_disclaimer",
    routeId: "ROUTE_C",
    itemType: "form",
    refId: "form_14",
    label: { en: "Form 14 — letter of disclaimer" },
    attrs: {
      why: {
        en: "Signed by every legal heir who agrees the money should go to you rather than be split among all heirs individually.",
      },
      originalOrCopy: {
        en: "One original, on stamp paper as shown in the forms guide, valid for one year.",
      },
      selfAttest: { en: "Every legal heir signs EXCEPT you (the claimant)." },
      verifiedBy: { en: "A notary public or an oath commissioner" },
    },
    section: "forms",
    sortOrder: 7,
    handbookRef: "§4.1; Annexure 4; Annexure 6",
  },
  {
    id: "ROUTE_C_form15_indemnity",
    routeId: "ROUTE_C",
    itemType: "form",
    refId: "form_15",
    label: { en: "Form 15 — indemnity bond" },
    attrs: {
      why: {
        en: "Protects the Post Office if it later turns out someone else also had a claim — this is why two sureties are needed.",
      },
      originalOrCopy: {
        en: "One original, on stamp paper as shown in the forms guide, valid for one year.",
      },
      selfAttest: { en: "You (the claimant) and two sureties sign, in front of two witnesses." },
      verifiedBy: { en: "A notary public" },
    },
    section: "indemnityBonds",
    sortOrder: 8,
    handbookRef: "§4.1; Annexure 5; Annexure 6",
  },
  {
    id: "ROUTE_C_surety_note",
    routeId: "ROUTE_C",
    itemType: "instruction",
    label: {
      en: "Sureties can show their standing with a salary certificate (12 months), a recent income-tax return, an income certificate, or a solvency certificate from the local revenue office.",
    },
    attrs: {
      why: { en: "The Post Office needs to be satisfied the sureties can honour the bond." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder: 9,
    handbookRef: "FAQ 40",
  },
  {
    id: "ROUTE_C_tahsildar_warning",
    routeId: "ROUTE_C",
    itemType: "warning",
    label: {
      en: "A Legal Heirship Certificate from a Tahsildar or other revenue authority is NOT accepted here — it is not the same as the court documents used in the legal-evidence route.",
    },
    attrs: {
      why: { en: "This is a common and costly mistake families make." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "documents",
    sortOrder: 10,
    handbookRef: "FAQ 31",
  },
];
