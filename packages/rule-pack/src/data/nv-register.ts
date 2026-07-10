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

export function getNvEntry(id: string): NvEntry | undefined {
  return NV_REGISTER.find((entry) => entry.id === id);
}
