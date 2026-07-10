import type { OutputRule } from "@claimsahayak/shared-types";
import {
  claimantId,
  deathCertificate,
  formEleven,
  passbookOrCertificate,
  witnesses,
} from "./common.js";

/**
 * ROUTE_B — legal evidence (Blueprint v2 §3.3): Succession Certificate,
 * Probate of Will, or Letter of Administration. No waiting period, no
 * amount limit. All named heirs sign Form 11.
 */
export const ROUTE_B_OUTPUTS: readonly OutputRule[] = [
  formEleven("ROUTE_B", 1),
  deathCertificate("ROUTE_B", 2),
  {
    id: "ROUTE_B_legal_evidence",
    routeId: "ROUTE_B",
    itemType: "document",
    refId: "doc_legal_evidence_copy",
    label: {
      en: "Succession Certificate, Probate of Will, or Letter of Administration",
    },
    attrs: {
      why: {
        en: "This is the court document that names every legal heir and their share — it replaces the need for a nomination.",
      },
      originalOrCopy: {
        en: "Bring the original to show; hand in an attested copy naming every heir and their share.",
      },
      selfAttest: { en: "Not needed — this is a court document." },
      verifiedBy: { en: "The Post Office, comparing it with the original" },
    },
    section: "documents",
    sortOrder: 3,
    handbookRef: "§3.1; §3.2",
  },
  passbookOrCertificate("ROUTE_B", 4),
  claimantId("ROUTE_B", 5),
  witnesses("ROUTE_B", 6),
  {
    id: "ROUTE_B_all_heirs_sign",
    routeId: "ROUTE_B",
    itemType: "instruction",
    label: {
      en: "If there is more than one legal heir, every heir's name and share (as shown in the court document) must be listed on Form 11, and every heir signs it.",
    },
    attrs: {
      why: { en: "The claim is settled according to the shares in the court document." },
      originalOrCopy: { en: "Not applicable." },
      selfAttest: { en: "Not applicable." },
      verifiedBy: { en: "The Post Office" },
    },
    section: "forms",
    sortOrder: 7,
    handbookRef: "§3.2",
  },
];
