/**
 * Needs-Verification register (Blueprint v2 §10), plus one item discovered
 * during Milestone 2 data authoring (NV-14). Per the project's own working
 * method: when the handbook does not settle a rule, or a genuine ambiguity
 * surfaces while authoring, it becomes an NV entry with a conservative
 * interim behavior — never a guessed rule. Routes/outputs/forms cite these
 * via `nvRef`; the Admin Portal (Milestone 10) surfaces open items for
 * review and resolution.
 */
export interface NvEntry {
  readonly id: string;
  readonly openQuestion: string;
  readonly interimBehavior: string;
}

export const NV_REGISTER: readonly NvEntry[] = [
  {
    id: "NV-01",
    openQuestion:
      "Exact document set when the last/sole nominee dies AFTER the depositor (claim settles for the nominee's heirs, handbook §2.1) — the handbook names the principle, not the paperwork.",
    interimBehavior:
      "Show the principle, then the same document set as the no-nomination legal-evidence/affidavit routes for the NOMINEE's estate, with a note that the Post Office or Division will confirm the exact papers for this specific situation.",
  },
  {
    id: "NV-02",
    openQuestion:
      "Stamp-paper values: the handbook fixes ₹100 (Form 15) and ₹20 (Forms 13 and 14), but also says \"as per the Stamp Act of the State.\"",
    interimBehavior:
      "Print both the commonly-quoted value and a note to confirm the exact value for the claimant's state with the notary or oath commissioner at the time of execution.",
  },
  {
    id: "NV-03",
    openQuestion:
      "Whether a MINOR spelling difference in a name (missing initial, transliteration variant) still always needs a full Reconciliation Certificate — handbook FAQ 14 says the rules do not distinguish minor from major differences, but this may have been relaxed since 2023.",
    interimBehavior:
      "Keep the conservative guidance: apply for the Reconciliation Certificate regardless of how small the difference looks.",
  },
  {
    id: "NV-04",
    openQuestion:
      "Whether the nominee-first-else-guardian rule for a minor's Savings Account death applies identically to SB \"Basic\" and SB \"General\" sub-types (handbook §7.6 lists them in separate table rows).",
    interimBehavior:
      "Word the guidance generically for any Savings Account held by/for a minor: if a nominee is registered, the nominee claims; otherwise the guardian does. This matches both sub-type rows as written.",
  },
  {
    id: "NV-05",
    openQuestion:
      "Sukanya Samriddhi Account (SSA) precedence looks asymmetric: while the guardian is alive, the GUARDIAN is paid on the child's death \"in both nomination and no-nomination scenarios\" (§7.6-SSA), yet if BOTH the child and guardian have died, the NOMINEE claims when one is registered.",
    interimBehavior:
      "Implement exactly as written: guardian claims while the guardian is alive (regardless of nomination); nominee claims only in the both-deceased scenario when a nominee is registered. Flagged for departmental confirmation given how unusual the asymmetry is.",
  },
  {
    id: "NV-06",
    openQuestion:
      "PMSBY/PMJJBY premium figures (about ₹20 and ₹436 deducted each May) may have been revised since the handbook was written (20 April 2023).",
    interimBehavior:
      "Describe the figures as approximate (\"small yearly insurance deductions, about ₹20 and ₹436\") rather than as exact current premiums, and direct the claimant to confirm with the Post Office.",
  },
  {
    id: "NV-07",
    openQuestion:
      "Whether online claim submission has since been introduced (handbook FAQ 7 states it does not exist as of April 2023).",
    interimBehavior:
      "State that claims are submitted in person at the Post Office; this is re-verified at each quarterly rules review (Roadmap M10 review-due tracking).",
  },
  {
    id: "NV-08",
    openQuestion:
      "Official form download URLs on indiapost.gov.in are subject to link rot and periodic reorganization.",
    interimBehavior:
      "Link to the forms INDEX page rather than a deep PDF link, with an automated link-health check (Roadmap M10) flagging rot for content-team follow-up.",
  },
  {
    id: "NV-09",
    openQuestion:
      "Witness eligibility is worded two ways in the handbook: \"any person known to the Post Office\" (§2.2) versus \"personally acquainted with the claimant\" as well (FAQ 10).",
    interimBehavior:
      "Print the stricter, combined version: a witness should be known to the Post Office AND personally acquainted with the claimant.",
  },
  {
    id: "NV-10",
    openQuestion:
      "Whether Branch Post Offices can complete every step of a joint-account survivor withdrawal given their ₹50,000 transaction ceiling (context: FAQ 38).",
    interimBehavior:
      "Not surfaced to claimants (this is an internal routing question for Post Office staff, not something the claimant needs to act on); noted here for the content-review team only.",
  },
  {
    id: "NV-11",
    openQuestion:
      "Procedural detail for unfreezing an account beyond \"processed at the Head Post Office\" once it has been more than 10 years since maturity (Senior Citizen Welfare Fund transfer).",
    interimBehavior:
      "Guidance stops at directing the claimant to the Head Post Office; no further steps are invented.",
  },
  {
    id: "NV-12",
    openQuestion:
      "Whether the SSA premature-closure form (SB-7B) is something the claimant should obtain in advance, or is issued at the counter.",
    interimBehavior:
      "Describe it as \"available at the counter\" rather than something to print at home, pending confirmation.",
  },
  {
    id: "NV-13",
    openQuestion:
      "Nomination-details disclosure practice: the handbook says the Post Office \"normally will inform\" a claimant orally (FAQ 3); actual privacy practice may vary by office.",
    interimBehavior:
      "The printable nomination-details request letter includes the claimant's relationship to the depositor and notes the Post Office may ask for proof of that relationship.",
  },
  {
    id: "NV-14",
    openQuestion:
      "The handbook specifies a duplicate-passbook/certificate FEE (₹10 + GST per registration, §5.4-5) but does not detail the stamp-paper value or execution requirements for the NC-54(a)/(b) indemnity bonds themselves beyond \"procedure as laid down in the relevant rules.\"",
    interimBehavior:
      "Describe the NC-54(a)/(b) signatories and purpose as given, and defer the exact stamp-paper/execution specifics to the Post Office at the time of execution rather than inventing a value.",
  },
];

/**
 * ClaimSahayak Official Rule Book v1.0 integration (Topic 11 §6 mapping
 * table). These carry the Rule Book's OWN registered gaps and provisional
 * items — not new ambiguities discovered during this authoring pass. Two
 * Topic-11 entries are deliberately NOT duplicated here: "NV-RB-2"
 * (authority for heirs-of-nominee claims, OQ-11/D-06) is the same gap the
 * pack already tracks as NV-01, and "NV-RB-8" (stamp-paper denominations)
 * is the same gap already tracked as NV-02.
 */
export const RULEBOOK_NV_REGISTER: readonly NvEntry[] = [
  {
    id: "NV-RB-1",
    openQuestion:
      "No official India Post procedure exists for a co-nominee who is untraceable or unwilling to join a claim and has not signed a Form 14 disclaimer (Rule Book OQ-14, Decision Matrix row D-07X).",
    interimBehavior:
      "Tell the claimant there is no published procedure; the Post Office treats it as a doubtful/special case, makes enquiries, records what's known, and refers it to the Divisional Head or Directorate — never invent a resolution.",
  },
  {
    id: "NV-RB-3",
    openQuestion:
      "The Rule Book confirms a pledge is released by the pledgee, and a court/tax freeze must be lifted before settlement, but no official step-by-step release PROCEDURE is published (Rule Book OQ-28).",
    interimBehavior:
      "Show the pledge-release certificate as a document requirement, and state plainly that the exact release process depends on who imposed the freeze — direct the claimant to the Post Office and the freezing authority rather than inventing steps.",
  },
  {
    id: "NV-RB-4",
    openQuestion:
      "The Rule Book states a nominee who has attained majority is paid directly with their own KYC (CS-MIN-010), but does not give an express confirmation procedure for verifying that majority has in fact been attained (Rule Book OQ-17).",
    interimBehavior:
      "Ask for proof of date of birth alongside the usual identity proof, and let the Post Office confirm eligibility at the counter — do not invent a separate verification step.",
  },
  {
    id: "NV-RB-5",
    openQuestion:
      "NSC and KVP continuation is capped at up to 3 nominees/heirs jointly (Rule Book CS-SCH-007/008), but the current Rule Engine has no list-typed \"how many claimants are continuing together\" fact and no count() operator to enforce this cap — it can only be stated as information, not verified (Rule Book OQ-15 residue).",
    interimBehavior:
      "State the ≤3-claimant limit as information in the continuation checklist item; do not claim the wizard has checked or enforced it. Flagged as a required Rule Engine enhancement in the integration report.",
  },
  {
    id: "NV-RB-6",
    openQuestion:
      "Whether the ₹50 nomination-change fee has in fact been abolished (G.S.R. 214(E) / SB Order 05/2025) — the Rule Book could not obtain an official copy and marks this 🔶 PROVISIONAL/UNVERIFIED (CS-NOM-024).",
    interimBehavior:
      "Do not state the fee is abolished anywhere in the pack; if the existing ₹50 fee is ever mentioned, keep it as-is until an official copy is archived and the Rule Book upgrades this to VERIFIED.",
  },
  {
    id: "NV-RB-7",
    openQuestion:
      "Whether Internet-Banking nominee management (SB Order 04/2026) is live and what its exact workflow is — the Rule Book could not obtain an official copy and marks this 🔶 PROVISIONAL/UNVERIFIED (CS-NOM-025).",
    interimBehavior:
      "Do not add an internet-banking nomination path to the wizard until an official copy is archived and the Rule Book upgrades this to VERIFIED.",
  },
  {
    id: "NV-RB-9",
    openQuestion:
      "The Government Savings Promotion Act 1873 s.4A(4) says the no-nomination discretionary waiting period is THREE months, while GSPR 2018 Rule 15(6) and R60 say SIX months (Rule Book conflict C-1).",
    interimBehavior:
      "The Rule Engine's NO_NOMINATION_WAIT_MONTHS constant uses six months (the later, more specific instrument), matching the Rule Book's own resolution — flagged here for legal review, not silently picked without a record.",
  },
  {
    id: "NV-RB-10",
    openQuestion:
      "The Recurring Deposit Protected Savings Scheme's condition (vii) — \"no loan in the first 24 months\" — is stated in the Rule Book as printed in the gazette text, with confirmation of its exact current wording still pending (Rule Book OQ-25).",
    interimBehavior:
      "State the condition as printed; direct the claimant to the Post Office to confirm the current exact wording before relying on it.",
  },
];

export function getNvEntry(id: string): NvEntry | undefined {
  return [...NV_REGISTER, ...RULEBOOK_NV_REGISTER].find((entry) => entry.id === id);
}
