import type { OverlayRule } from "@claimsahayak/shared-types";

/**
 * Overlays map a Q10 tick-box (or a system-computed flag — see routes.ts's
 * note on T21) to extra checklist items and a /fix deep link. `flagId`
 * values here match the Q10 option ids in questions.ts one-for-one, except
 * `system_frozen_10_years`, which the engine (Milestone 3) sets from
 * derived values rather than a checkbox.
 *
 * One addition beyond the Blueprint v2 §2 IA list: `/fix/missing-person`.
 * The approved documents describe this scenario in real depth (handbook
 * §7.3; FAQ mentions) but the original 16-issue /fix list did not name it
 * explicitly — folding it into the generic "/fix/other" bucket would be a
 * worse experience for a scenario this well-specified, so it gets its own
 * guide, following the same reasoning already used for T18A.
 */
export const OVERLAYS: readonly OverlayRule[] = [
  {
    flagId: "passbook_lost",
    fixSlug: "lost-passbook",
    handbookRef: "§5.4-5; Annexure 9",
    items: [
      {
        id: "OVERLAY_passbook_lost_closure",
        routeId: "OVERLAY_passbook_lost",
        itemType: "instruction",
        refId: "template_no_passbook_request",
        label: {
          en: "If you are CLOSING the account: fill in the \"closure without passbook\" request (template provided) and attach it to your claim papers.",
        },
        attrs: {
          why: { en: "Lets the Post Office close the account without the original passbook." },
          originalOrCopy: { en: "Print, fill in, and sign the template." },
          selfAttest: { en: "Yes." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§5.4-5; Annexure 9",
      },
      {
        id: "OVERLAY_passbook_lost_continue_nc54a",
        routeId: "OVERLAY_passbook_lost",
        itemType: "form",
        refId: "form_nc54a",
        label: { en: "If you are CONTINUING an NSC or KVP certificate: indemnity bond NC-54(a) (with a personal surety), if this is the variant the Post Office asks for" },
        attrs: {
          why: { en: "A lost certificate must be replaced before it can be transferred to your name." },
          originalOrCopy: { en: "The Post Office will confirm the exact execution requirements when you reach this step." },
          selfAttest: { en: "Not applicable at this stage." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 2,
        handbookRef: "§5.4-5",
        nvRef: "NV-14",
      },
      {
        id: "OVERLAY_passbook_lost_continue_nc54b",
        routeId: "OVERLAY_passbook_lost",
        itemType: "form",
        refId: "form_nc54b",
        label: { en: "If you are CONTINUING an NSC or KVP certificate: indemnity bond NC-54(b) (with a bank guarantee), if this is the variant the Post Office asks for" },
        attrs: {
          why: { en: "An alternative to NC-54(a) when a bank guarantee is used instead of a personal surety." },
          originalOrCopy: { en: "The Post Office will confirm the exact execution requirements when you reach this step." },
          selfAttest: { en: "Not applicable at this stage." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 3,
        handbookRef: "§5.4-5",
        nvRef: "NV-14",
      },
      {
        id: "OVERLAY_passbook_lost_duplicate_fee_note",
        routeId: "OVERLAY_passbook_lost",
        itemType: "goodToKnow",
        label: {
          en: "A small fee (₹10 plus GST per registration) applies to issuing the duplicate certificate, in addition to whichever indemnity bond is needed.",
        },
        attrs: {
          why: { en: "So the fee doesn't come as a surprise." },
          originalOrCopy: { en: "Not applicable." },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "Not applicable." },
        },
        section: "documents",
        sortOrder: 4,
        handbookRef: "§5.4-5",
      },
    ],
  },
  {
    flagId: "name_mismatch_depositor",
    fixSlug: "reconciliation-depositor",
    handbookRef: "§5.4-1; Annexure 7; FAQ 12",
    items: [
      {
        id: "OVERLAY_name_mismatch_depositor_certificate",
        routeId: "OVERLAY_name_mismatch_depositor",
        itemType: "document",
        refId: "doc_reconciliation_certificate",
        label: { en: "Reconciliation certificate for the account holder's name" },
        attrs: {
          why: {
            en: "Confirms the person on the passbook and the person on the death certificate are the same, so the claim isn't held up.",
          },
          originalOrCopy: {
            en: "Apply in advance to the Division office or a Gazetted Postmaster (a printable request is provided), then attach the certificate you receive.",
          },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "The Division office or a Gazetted Postmaster" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§5.4-1; Annexure 7",
      },
      {
        id: "OVERLAY_name_mismatch_depositor_request_template",
        routeId: "OVERLAY_name_mismatch_depositor",
        itemType: "instruction",
        refId: "template_reconciliation_depositor",
        label: {
          en: "Use the printable reconciliation-certificate request (depositor's name) to apply.",
        },
        attrs: {
          why: { en: "Gives the Division office everything it needs in one submission." },
          originalOrCopy: { en: "Print, fill in, and sign it, with copies of both name versions attached." },
          selfAttest: { en: "Yes." },
          verifiedBy: { en: "The Division office or a Gazetted Postmaster" },
        },
        section: "documents",
        sortOrder: 2,
        handbookRef: "§5.4-1; Annexure 7",
      },
    ],
  },
  {
    flagId: "name_mismatch_own",
    fixSlug: "reconciliation-claimant",
    handbookRef: "§5.4-2; Annexure 7; FAQ 13, FAQ 14",
    items: [
      {
        id: "OVERLAY_name_mismatch_own_certificate",
        routeId: "OVERLAY_name_mismatch_own",
        itemType: "document",
        refId: "doc_reconciliation_certificate",
        label: { en: "Reconciliation certificate for your own name" },
        attrs: {
          why: {
            en: "Confirms you are the same person named as nominee or claimant, even with a small spelling difference.",
          },
          originalOrCopy: {
            en: "Apply in advance to the Division office, a Gazetted Postmaster, or any Gazetted Officer (a printable request is provided), then attach the certificate you receive.",
          },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "The Division office, a Gazetted Postmaster, or any Gazetted Officer" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§5.4-2; Annexure 7; FAQ 14",
        nvRef: "NV-03",
      },
      {
        id: "OVERLAY_name_mismatch_own_request_template",
        routeId: "OVERLAY_name_mismatch_own",
        itemType: "instruction",
        refId: "template_reconciliation_claimant",
        label: {
          en: "Use the printable reconciliation-certificate request (your own name) to apply.",
        },
        attrs: {
          why: { en: "Gives the Division office everything it needs in one submission." },
          originalOrCopy: { en: "Print, fill in, and sign it, with copies of both name versions attached." },
          selfAttest: { en: "Yes." },
          verifiedBy: { en: "The Division office, a Gazetted Postmaster, or any Gazetted Officer" },
        },
        section: "documents",
        sortOrder: 2,
        handbookRef: "§5.4-2; Annexure 7",
      },
    ],
  },
  {
    flagId: "cannot_leave_original_death_cert",
    fixSlug: "death-certificate",
    handbookRef: "§7.2",
    items: [
      {
        id: "OVERLAY_cannot_leave_original_note",
        routeId: "OVERLAY_cannot_leave_original",
        itemType: "instruction",
        label: {
          en: "This is fine — the Post Office can accept a photocopy, compare it with your original on the spot, and hand the original straight back to you.",
        },
        attrs: {
          why: { en: "Families are not required to permanently hand over the original death certificate." },
          originalOrCopy: { en: "Bring the original for a same-visit comparison; only the photocopy is kept." },
          selfAttest: { en: "Not needed." },
          verifiedBy: { en: "The Post Office, at the counter" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§7.2; FAQ 11",
      },
    ],
  },
  {
    flagId: "death_cert_not_standard",
    fixSlug: "death-certificate",
    handbookRef: "§7.2",
    items: [
      {
        id: "OVERLAY_death_cert_alternates",
        routeId: "OVERLAY_death_cert_alternates",
        itemType: "instruction",
        label: {
          en: "A death certificate from a municipality, hospital, or police station is preferred, but these are also accepted: a certificate from a Gazetted Officer, MP, MLA, or Panchayat/Village authority; for balances up to ₹500, a certificate from the last employer or attending doctor; or, where applicable, a Parsee Panchayat or church burial certificate.",
        },
        attrs: {
          why: { en: "Not every family can get a certificate from the usual sources." },
          originalOrCopy: { en: "Bring the original to show; hand in a photocopy." },
          selfAttest: { en: "Not needed." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§7.2",
      },
    ],
  },
  {
    flagId: "someone_abroad",
    fixSlug: "abroad-authentication",
    handbookRef: "§7.10",
    items: [
      {
        id: "OVERLAY_abroad_authentication",
        routeId: "OVERLAY_abroad",
        itemType: "document",
        refId: "doc_apostille_authentication",
        label: { en: "Consular or apostille authentication of documents signed abroad" },
        attrs: {
          why: {
            en: "Any claim paper, disclaimer, death certificate, or power of attorney signed outside India normally needs this — unless that country has a reciprocal arrangement with India (see the full country list in the guide).",
          },
          originalOrCopy: { en: "Bring the authenticated original; a compared photocopy is kept." },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "The Indian Consular Office in that country, or a Magistrate where none exists" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§7.10",
      },
      {
        id: "OVERLAY_abroad_poa_payment",
        routeId: "OVERLAY_abroad",
        itemType: "instruction",
        label: {
          en: "Payment to a claimant living abroad is made only to a Power of Attorney holder present in India — there is no direct transfer to a foreign country or a foreign (NRO/NRE) account.",
        },
        attrs: {
          why: { en: "This is how payment works for claimants residing outside India." },
          originalOrCopy: { en: "Not applicable." },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "Not applicable." },
        },
        section: "documents",
        sortOrder: 2,
        handbookRef: "§7.10; FAQ 15",
      },
    ],
  },
  {
    flagId: "missing_person",
    fixSlug: "missing-person",
    handbookRef: "§7.3",
    items: [
      {
        id: "OVERLAY_missing_person_fir",
        routeId: "OVERLAY_missing_person",
        itemType: "document",
        refId: "doc_fir_copy",
        label: { en: "Copy of the police FIR" },
        attrs: {
          why: { en: "Part of establishing that the person has genuinely been missing." },
          originalOrCopy: { en: "A copy is enough." },
          selfAttest: { en: "Not needed." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§7.3",
      },
      {
        id: "OVERLAY_missing_person_court_presumption",
        routeId: "OVERLAY_missing_person",
        itemType: "document",
        refId: "doc_nontraceable_or_presumption_certificate",
        label: { en: "Police non-traceable report, or a court order presuming death" },
        attrs: {
          why: {
            en: "A court must first raise a presumption of death under the Indian Evidence Act before a claim can be settled.",
          },
          originalOrCopy: { en: "Bring the original to show; hand in a photocopy." },
          selfAttest: { en: "Not needed." },
          verifiedBy: { en: "A competent court, then the Post Office" },
        },
        section: "documents",
        sortOrder: 2,
        handbookRef: "§7.3",
      },
      {
        id: "OVERLAY_missing_person_indemnity",
        routeId: "OVERLAY_missing_person",
        itemType: "document",
        refId: "doc_missing_person_indemnity",
        label: { en: "Letter of indemnity from the claimant(s)" },
        attrs: {
          why: { en: "A simpler indemnity than Form 15, specific to missing-person claims." },
          originalOrCopy: { en: "Original, signed by the claimant(s)." },
          selfAttest: { en: "Yes." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 3,
        handbookRef: "§7.3",
      },
      {
        id: "OVERLAY_missing_person_note",
        routeId: "OVERLAY_missing_person",
        itemType: "instruction",
        label: {
          en: "This route needs a court process (raising a presumption of death) before the Post Office can settle the claim — it is general information here, not legal advice.",
        },
        attrs: {
          why: { en: "So the family knows a court step is involved before visiting the Post Office." },
          originalOrCopy: { en: "Not applicable." },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "Not applicable." },
        },
        section: "documents",
        sortOrder: 4,
        handbookRef: "§7.3",
      },
    ],
  },
  {
    flagId: "insurance_deductions",
    fixSlug: "insurance-pmsby-pmjjby",
    handbookRef: "§7.1",
    items: [
      {
        id: "OVERLAY_insurance_claim_papers",
        routeId: "OVERLAY_insurance",
        itemType: "document",
        refId: "doc_pmsby_pmjjby_claim_papers",
        label: { en: "PMSBY / PMJJBY insurance claim papers" },
        attrs: {
          why: { en: "These small yearly deductions usually mean accident or life insurance cover is in force." },
          originalOrCopy: { en: "Available at the Post Office; fill in separately." },
          selfAttest: { en: "Yes, where the form asks for it." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§7.1",
        nvRef: "NV-06",
      },
      {
        id: "OVERLAY_apy_claim_papers",
        routeId: "OVERLAY_insurance",
        itemType: "document",
        refId: "doc_apy_claim_papers",
        label: { en: "Atal Pension Yojana (APY) claim papers" },
        attrs: {
          why: { en: "Needed only if the account holder was enrolled in the APY pension scheme." },
          originalOrCopy: { en: "Available at the Post Office; fill in separately." },
          selfAttest: { en: "Yes, where the form asks for it." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 2,
        handbookRef: "§7.1",
      },
      {
        id: "OVERLAY_insurance_no_wait_note",
        routeId: "OVERLAY_insurance",
        itemType: "goodToKnow",
        label: {
          en: "Closing the savings account does not need to wait for an insurance or pension claim to finish — both can move forward at the same time.",
        },
        attrs: {
          why: { en: "So one process doesn't unnecessarily delay the other." },
          originalOrCopy: { en: "Not applicable." },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "Not applicable." },
        },
        section: "documents",
        sortOrder: 3,
        handbookRef: "§7.1",
      },
    ],
  },
  {
    flagId: "system_frozen_10_years",
    fixSlug: "other",
    handbookRef: "§5.4-10; FAQ 18",
    items: [
      {
        id: "OVERLAY_system_frozen_note",
        routeId: "OVERLAY_system_frozen",
        itemType: "warning",
        label: {
          en: "Because of the time that has passed, this account has likely been frozen and moved toward the Senior Citizen Welfare Fund. The same claim steps still apply — the difference is that your claim will be processed at the Head Post Office rather than a smaller branch.",
        },
        attrs: {
          why: { en: "So there's no surprise about which office finally settles the claim." },
          originalOrCopy: { en: "Not applicable." },
          selfAttest: { en: "Not applicable." },
          verifiedBy: { en: "The Post Office" },
        },
        section: "documents",
        sortOrder: 1,
        handbookRef: "§5.4-10; FAQ 18",
        nvRef: "NV-11",
      },
    ],
  },
];
