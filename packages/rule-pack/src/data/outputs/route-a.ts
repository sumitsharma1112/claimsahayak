import type { OutputRule } from "@claimsahayak/shared-types";
import {
  claimantId,
  deathCertificate,
  formEleven,
  passbookOrCertificate,
  witnesses,
} from "./common.js";

/**
 * ROUTE_A — nomination (Blueprint v2 §3.3). Sanction target: 1 working day
 * once papers are complete (SB Order 01/2023 dated 09.01.2023).
 */
export const ROUTE_A_OUTPUTS: readonly OutputRule[] = [
  formEleven("ROUTE_A", 1),
  deathCertificate("ROUTE_A", 2),
  passbookOrCertificate("ROUTE_A", 3),
  claimantId("ROUTE_A", 4),
  witnesses("ROUTE_A", 5),
];

/**
 * T11 — one of several registered nominees has since died. Adds the
 * deceased nominee's own death certificate; shares are redistributed among
 * the surviving nominees in proportion (the Post Office computes this).
 */
export const T11_EXTRA_OUTPUTS: readonly OutputRule[] = [
  {
    id: "T11_nominee_death_certificate",
    routeId: "T11",
    itemType: "document",
    refId: "doc_nominee_death_certificate",
    label: { en: "Death certificate of the nominee who has since died" },
    attrs: {
      why: {
        en: "Confirms that nominee's share should be redistributed among the surviving nominees.",
      },
      originalOrCopy: { en: "Bring the original to show; hand in one photocopy." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 6,
    handbookRef: "§2.1",
  },
];

/** T13 — the nominee is a child (under 18). */
export const T13_EXTRA_OUTPUTS: readonly OutputRule[] = [
  {
    id: "T13_minor_alive_certificate",
    routeId: "T13",
    itemType: "document",
    refId: "doc_minor_alive_certificate",
    label: { en: "\"The minor is alive\" certificate" },
    attrs: {
      why: {
        en: "The person collecting the money on the child's behalf must confirm the child is alive and the money is needed for them.",
      },
      originalOrCopy: { en: "You sign this at the Post Office." },
      selfAttest: { en: "Yes." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 6,
    handbookRef: "§7.5",
  },
  {
    id: "T13_guardianship_certificate",
    routeId: "T13",
    itemType: "document",
    refId: "doc_guardianship_certificate",
    label: { en: "Guardianship certificate or court guardianship order (if you are not a natural guardian)" },
    attrs: {
      why: {
        en: "A parent needs no certificate; anyone else collecting the minor's share (a court-appointed guardian, for instance) must prove their guardianship.",
      },
      originalOrCopy: { en: "Bring the original to show; hand in a photocopy." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 7,
    handbookRef: "R60(4)(A) Note 2(iii); R60(6)(iii); Act 1873 s.3(h)(iii)",
    sourceRefs: ["CS-MIN-006"],
  },
];

/**
 * T14 — not every nominee can attend together. The attending nominee(s)
 * carry a Form 14 disclaimer plus ID copies from the absent nominees.
 */
export const T14_EXTRA_OUTPUTS: readonly OutputRule[] = [
  {
    id: "T14_form14_disclaimer",
    routeId: "T14",
    itemType: "form",
    refId: "form_14",
    label: { en: "Form 14 — letter of disclaimer from the absent nominee(s)" },
    attrs: {
      why: {
        en: "Lets the attending nominee(s) collect the full amount on behalf of everyone.",
      },
      originalOrCopy: {
        en: "One original per absent nominee, on stamp paper as shown in the forms guide.",
      },
      selfAttest: { en: "Each absent nominee signs their own copy." },
      verifiedBy: { en: "A notary public or an oath commissioner" },
    },
    section: "forms",
    sortOrder: 6,
    handbookRef: "§2.1; FAQ 33",
  },
  {
    id: "T14_absent_nominee_ids",
    routeId: "T14",
    itemType: "document",
    refId: "doc_absent_nominee_id",
    label: { en: "ID copies of the absent nominee(s)" },
    attrs: {
      why: { en: "Confirms the identity of everyone named on the disclaimer." },
      originalOrCopy: { en: "Self-attested photocopies from each absent nominee." },
      selfAttest: { en: "Yes." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 7,
    handbookRef: "§2.1; FAQ 33",
  },
];

/**
 * T10 — the registered nominee died BEFORE the account holder and there is
 * no other nominee. The flow reroutes to the no-nomination questions
 * (Q6 onward), but the fact that a nominee once existed still means the
 * Post Office needs that nominee's own death certificate alongside
 * whichever of ROUTE_B/ROUTE_C eventually applies.
 */
export const T10_EXTRA_OUTPUTS: readonly OutputRule[] = [
  {
    id: "T10_nominee_death_certificate",
    routeId: "T10",
    itemType: "document",
    refId: "doc_nominee_death_certificate",
    label: { en: "Death certificate of the nominee who died first" },
    attrs: {
      why: {
        en: "Shows the Post Office why this is being claimed as if there were no nomination.",
      },
      originalOrCopy: { en: "Bring the original to show; hand in one photocopy." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 1,
    handbookRef: "§2.1; FAQ 22",
  },
];

/**
 * T12 (NV-01) — the last or only nominee died AFTER the account holder.
 * The handbook states the PRINCIPLE (the claim now settles in favour of
 * that nominee's own legal heirs, not the depositor's) without detailing
 * the exact paperwork, so this pack shows the principle plus the same
 * document family used for a no-nomination legal-heir claim, and is
 * explicit that the Post Office/Division will confirm specifics.
 */
export const ROUTE_A_HEIRS_OF_NOMINEE_OUTPUTS: readonly OutputRule[] = [
  {
    id: "ROUTE_A_HEIRS_OF_NOMINEE_principle",
    routeId: "ROUTE_A_HEIRS_OF_NOMINEE",
    itemType: "instruction",
    label: {
      en: "This claim is settled in favour of the deceased nominee's own legal heirs — not the original account holder's legal heirs.",
    },
    attrs: {
      why: { en: "This is how the handbook defines this specific situation." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "Not applicable." },
    },
    section: "documents",
    sortOrder: 1,
    handbookRef: "§2.1",
    nvRef: "NV-01",
  },
  formEleven("ROUTE_A_HEIRS_OF_NOMINEE", 2),
  deathCertificate("ROUTE_A_HEIRS_OF_NOMINEE", 3),
  {
    id: "ROUTE_A_HEIRS_OF_NOMINEE_nominee_death_certificate",
    routeId: "ROUTE_A_HEIRS_OF_NOMINEE",
    itemType: "document",
    refId: "doc_nominee_death_certificate",
    label: { en: "Death certificate of the nominee" },
    attrs: {
      why: { en: "Shows when the nominee died, relative to the account holder." },
      originalOrCopy: { en: "Bring the original to show; hand in one photocopy." },
      selfAttest: { en: "Not needed." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "documents",
    sortOrder: 4,
    handbookRef: "§2.1",
  },
  passbookOrCertificate("ROUTE_A_HEIRS_OF_NOMINEE", 5),
  claimantId("ROUTE_A_HEIRS_OF_NOMINEE", 6),
  witnesses("ROUTE_A_HEIRS_OF_NOMINEE", 7),
  {
    id: "ROUTE_A_HEIRS_OF_NOMINEE_confirm_with_division",
    routeId: "ROUTE_A_HEIRS_OF_NOMINEE",
    itemType: "instruction",
    label: {
      en: "Ask the Post Office to confirm the exact papers needed for the nominee's own legal heirs — this can vary and may need the Division office's guidance.",
    },
    attrs: {
      why: { en: "The handbook does not spell out every document for this specific situation." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office / Division office" },
    },
    section: "documents",
    sortOrder: 8,
    handbookRef: "§2.1",
    nvRef: "NV-01",
  },
];
