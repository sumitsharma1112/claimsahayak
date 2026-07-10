import type { OutputRule } from "@claimsahayak/shared-types";

/**
 * Every route in the ROUTE_A / ROUTE_B / ROUTE_C family shares this same
 * core document set (Blueprint v2 §3.3 "ROUTE A — Nomination", carried into
 * B and C with additions). Rather than retype the same why/original-or-copy/
 * self-attest/verified-by text three times, each function below defines the
 * content ONCE and is called once per route with that route's own unique
 * output id (`${routeId}_...`) and sort position — satisfying "no
 * duplicated data" while still producing a distinct, valid OutputRule per
 * route (ids must be globally unique across the whole pack).
 */

export function formEleven(routeId: string, sortOrder: number): OutputRule {
  return {
    id: `${routeId}_form11`,
    routeId,
    itemType: "form",
    refId: "form_11",
    label: { en: "Form 11 — claim application" },
    attrs: {
      why: { en: "This is the claim itself — every route needs it." },
      originalOrCopy: { en: "Fill in 2 copies; sign both." },
      selfAttest: { en: "Not applicable — you sign this form directly." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder,
    handbookRef: "§2.2; Annexure 2",
  };
}

export function deathCertificate(routeId: string, sortOrder: number): OutputRule {
  return {
    id: `${routeId}_death_certificate`,
    routeId,
    itemType: "document",
    refId: "doc_death_certificate",
    label: { en: "Death certificate of the account holder" },
    attrs: {
      why: { en: "Proves the death to the Post Office." },
      originalOrCopy: {
        en: "Bring the original to show; hand in one photocopy.",
      },
      selfAttest: { en: "Not needed — the counter compares it with the original." },
      verifiedBy: { en: "The Post Office, at the counter" },
    },
    section: "documents",
    sortOrder,
    handbookRef: "§2.2; §7.2",
  };
}

export function passbookOrCertificate(routeId: string, sortOrder: number): OutputRule {
  return {
    id: `${routeId}_passbook`,
    routeId,
    itemType: "document",
    refId: "doc_passbook_or_certificate",
    label: { en: "Passbook or certificate for this account" },
    attrs: {
      why: { en: "Confirms which account this claim is for." },
      originalOrCopy: { en: "Original only." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder,
    handbookRef: "§2.2",
  };
}

export function claimantId(routeId: string, sortOrder: number): OutputRule {
  return {
    id: `${routeId}_claimant_id`,
    routeId,
    itemType: "document",
    refId: "doc_claimant_id",
    label: { en: "Your ID and address proof" },
    attrs: {
      why: { en: "Confirms who you are." },
      originalOrCopy: {
        en: "Bring the original (Aadhaar preferred) to show; hand in a self-attested photocopy.",
      },
      selfAttest: { en: "Yes — sign across the photocopy." },
      verifiedBy: { en: "The Post Office staff, who attest it against the original" },
    },
    section: "documents",
    sortOrder,
    handbookRef: "§2.2",
  };
}

export function witnesses(routeId: string, sortOrder: number): OutputRule {
  return {
    id: `${routeId}_witnesses`,
    routeId,
    itemType: "people",
    refId: "doc_witness_id",
    label: { en: "Two witnesses sign Form 11" },
    attrs: {
      why: {
        en: "Confirms your identity to the Post Office. Any person known to the Post Office, who also personally knows you, can be a witness.",
      },
      originalOrCopy: {
        en: "Each witness gives a self-attested photocopy of their own ID and address proof, with their mobile number written on it.",
      },
      selfAttest: { en: "Yes — each witness signs their own photocopy." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "people",
    sortOrder,
    handbookRef: "§2.2; FAQ 10, FAQ 23",
  };
}
