/**
 * Milestone 7 Part 8 — the Claim Package (auto-filled documents), driven
 * end-to-end against the real Wizard/RULE_PACK, covering the 8 named
 * scenarios: nomination exists, no nomination, multiple nominees, minor
 * nominee, joint account, legal heir, court order required, and different
 * sanctioning authorities. Each confirms: the "Generate complete Claim
 * Package" button appears only for a genuinely payable decision, entered
 * Claim Data values flow through to the auto-filled official forms and
 * office documents, the correct forms/authority/court-order/references
 * render, and no internal id (route/decision/refId) ever leaks into
 * visible text.
 */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RULE_PACK, OFFICIAL_FORM_LAYOUTS } from "@claimsahayak/rule-pack";
import { Wizard } from "@/components/wizard/Wizard";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function optionLabel(questionId: string, optionId: string): RegExp {
  const q = RULE_PACK.questions.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`Fixture assumption broken: "${questionId}.${optionId}" missing.`);
  return new RegExp(`^${opt.label.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}

function decisionForRoute(routeId: string) {
  const d = RULE_PACK.decisions?.find((d) => d.routeId === routeId);
  if (!d) throw new Error(`Fixture assumption broken: no DecisionRecord for "${routeId}".`);
  return d;
}

function monthYearMonthsAgo(monthsAgo: number): { month: string; year: string } {
  const now = new Date();
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() - monthsAgo;
  return { month: String((total % 12) + 1), year: String(Math.floor(total / 12)) };
}

type User = ReturnType<typeof userEvent.setup>;

async function continueBtn(user: User) {
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function tickSchemeAndContinue(user: User, schemeId = "SB") {
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", schemeId) }));
  await continueBtn(user);
}

async function answerCommonPathToNomination(user: User, deathMonthsAgo = 2) {
  await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
  await continueBtn(user);
  await user.click(screen.getByRole("radio", { name: "No" })); // q_armed_forces
  await continueBtn(user);
  await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
  await continueBtn(user);
  const death = monthYearMonthsAgo(deathMonthsAgo);
  await user.selectOptions(screen.getByLabelText("Month"), death.month);
  await user.selectOptions(screen.getByLabelText("Year"), death.year);
  await continueBtn(user);
}

async function finishPaymentAndDocs(user: User) {
  await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
  await continueBtn(user);
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
  await continueBtn(user);
}

async function generatePackageButton() {
  return screen.findByRole("button", { name: "Generate complete Claim Package" });
}

describe("Claim Package — nomination exists (ROUTE_A)", () => {
  it("offers the package, and entered claimant/depositor details auto-fill Form 11", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);

    expect(screen.getByRole("heading", { name: decisionForRoute("ROUTE_A").decision.en })).toBeTruthy();
    const generateBtn = await generatePackageButton();
    await user.click(generateBtn);

    await user.type(screen.getByLabelText("Claimant's name"), "Asha Devi");
    await user.type(screen.getByLabelText(/Depositor's name/), "Ram Prasad");

    expect(await screen.findByRole("heading", { name: "Complete Claim Package" })).toBeTruthy();
    // Auto-fills EVERY document that references claimant/depositor — Form 11
    // AND the always-available forwarding letter/approval note — so more
    // than one occurrence is the correct, intended outcome.
    expect(screen.getAllByText("Asha Devi").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ram Prasad").length).toBeGreaterThan(0);
    // Milestone 16 — Form 11 renders from its real, verbatim SB Order
    // 31/2020 body; its own printed heading is "FORM-11" (the same text
    // the actual gazetted form itself prints), distinct from
    // FormDefinition's "Form 11 — claim application" (still used by the
    // index/checklist, unaffected).
    expect(screen.getByRole("heading", { name: "FORM-11" })).toBeTruthy();
  });
});

describe("Claim Package — no nomination (ROUTE_C, affidavit route)", () => {
  it("selects and auto-fills the affidavit/disclaimer/indemnity-bond forms", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user, 12); // >6 months, so T17/ROUTE_C is reachable
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "no") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q6_legal_evidence", "no") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: "No" })); // q_dispute
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q7a_amount", "up_to_5_lakh") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q7b_heirs_together", "yes") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);

    expect(screen.getByRole("heading", { name: decisionForRoute("ROUTE_C").decision.en })).toBeTruthy();
    await user.click(await generatePackageButton());
    await user.click(screen.getByRole("button", { name: "Add Legal heir" }));
    await user.type(screen.getByLabelText(/Legal heir 1/), "Legal Heir One");
    // Milestone 16 — Form 14's body correctly reads the `disclaimant`
    // entity (a real correctness fix from M13, proven by this test having
    // to add one explicitly instead of relying on legalHeir.0.name
    // silently also filling Form 14, which was the M13 bug).
    await user.click(screen.getByRole("button", { name: "Add Disclaiming nominee / heir (signs Form 14)" }));
    await user.type(screen.getByLabelText(/Disclaiming nominee \/ heir \(signs Form 14\) 1/), "Disclaiming Heir One");

    expect(await screen.findByRole("heading", { name: "Form 13 — affidavit" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "FORM-14" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Form 15 — indemnity bond" })).toBeTruthy();
    expect(screen.getAllByText("Legal Heir One").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Disclaiming Heir One").length).toBeGreaterThan(0);
  });
});

describe("Claim Package — multiple nominees (T14, cannot come together)", () => {
  it("includes the absent-nominee disclaimer form", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_complication") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q5a_complication", "cannot_come_together") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);

    expect(screen.getByRole("heading", { name: decisionForRoute("ROUTE_A").decision.en })).toBeTruthy();
    await user.click(await generatePackageButton());

    expect(await screen.findByRole("heading", { name: "FORM-14" })).toBeTruthy();
  });
});

describe("Claim Package — minor nominee (T13)", () => {
  it("still resolves ROUTE_A's payable decision and offers the package", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_complication") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q5a_complication", "nominee_is_minor") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);

    expect(screen.getByRole("heading", { name: decisionForRoute("ROUTE_A").decision.en })).toBeTruthy();
    expect(await generatePackageButton()).toBeTruthy();
  });

  it("includes the Rule-Book-sourced minor-alive declaration in the Claim File (Milestone 10)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_complication") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q5a_complication", "nominee_is_minor") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());

    expect(
      await screen.findByRole("heading", { name: "Declaration — the minor is alive and the money is required for the minor" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "I declare that the above-named minor is alive on this day, and that the money now being withdrawn is required for the use and welfare of the minor.",
      ),
    ).toBeTruthy();
  });

  it("never includes the minor-alive declaration for a claim with no minor nominee", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(
      screen.queryByRole("heading", { name: "Declaration — the minor is alive and the money is required for the minor" }),
    ).toBeNull();
  });
});

describe("Claim Package — joint account (ROUTE_SURVIVOR, no claim needed)", () => {
  it("never offers the Claim Package for a not_applicable decision", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: "No" })); // q_armed_forces
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "two_names_survivor") }));
    await continueBtn(user);
    const death = monthYearMonthsAgo(2);
    await user.selectOptions(screen.getByLabelText("Month"), death.month);
    await user.selectOptions(screen.getByLabelText("Year"), death.year);
    await continueBtn(user);
    await finishPaymentAndDocs(user);

    expect(screen.getByText("No claim needed")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Generate complete Claim Package" })).toBeNull();
  });
});

describe("Claim Package — legal heir with court/revenue evidence, court order required (ROUTE_B)", () => {
  it("auto-fills correctly and shows the conditional court-order-required value with the authority ladder", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "no") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q6_legal_evidence", "yes") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: "No" })); // q_dispute
    await continueBtn(user);
    await finishPaymentAndDocs(user);

    const decB = decisionForRoute("ROUTE_B");
    expect(screen.getByRole("heading", { name: decB.decision.en })).toBeTruthy();
    // ROUTE_B's ladder has multiple authority rungs — "different sanctioning authorities".
    expect(decB.competentAuthority.length).toBeGreaterThan(1);
    expect(screen.getByText("Depends on the evidence provided")).toBeTruthy();

    await user.click(await generatePackageButton());
    expect(await screen.findByRole("heading", { name: "Complete Claim Package" })).toBeTruthy();
  });
});

describe("Claim Package — no internal identifiers leak into visible text", () => {
  it("never renders a raw routeId/DecisionRecord id/refId anywhere in the package view", async () => {
    const user = userEvent.setup();
    const { container } = render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(container.textContent).not.toMatch(/\bROUTE_[A-Z_]+\b/);
    expect(container.textContent).not.toMatch(/\bT\d{1,2}A?\b/);
    expect(container.textContent).not.toMatch(/\bDEC_[A-Z_]+\b/);
    expect(container.textContent).not.toMatch(/\bform_\w+\b/);
    expect(container.textContent).not.toMatch(/\bdoc_\w+\b/);
    expect(container.textContent).not.toMatch(/\btemplate_\w+\b/);
  });

  it("prompts for missing information non-blockingly and clears the prompt once a field is filled", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    // The Missing Document Report is now its own dedicated page (Milestone
    // 8); the same title also appears once in the Print Index, so match on
    // the section's own heading specifically, not just any matching text.
    const missing = screen.getByRole("heading", { name: "Missing Information Report" });
    expect(missing).toBeTruthy();
    const missingList = missing.closest("div");
    expect(missingList ? within(missingList).getAllByRole("listitem").length : 0).toBeGreaterThan(0);

    // The print button remains available even with information missing —
    // gaps can legitimately be completed by hand at the counter.
    expect(screen.getByRole("button", { name: "Print checklist (save as PDF)" })).toBeTruthy();
  });
});

describe("Claim File assembly — cover page, index, pagination (Milestone 8)", () => {
  it("renders a cover page and an index whose entries match the assembled document titles", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(screen.getByRole("heading", { name: "Deceased Claim — Claim File" })).toBeTruthy();
    const index = screen.getByRole("heading", { name: "Table of Contents" }).closest("div");
    expect(index).toBeTruthy();
    const indexItems = index ? within(index).getAllByRole("listitem") : [];
    expect(indexItems.length).toBeGreaterThan(0);
    // The decision summary and Form 11 are always in the assembled file for
    // a payable account — their titles must appear in the index too, each
    // grouped under its own named section (Milestone 14).
    expect(index ? within(index).getByText("Decision Summary") : null).toBeTruthy();
    expect(index ? within(index).getByText("Official India Post Forms") : null).toBeTruthy();
    expect(indexItems.some((li) => li.textContent?.includes("Decision Summary"))).toBe(true);
    expect(indexItems.some((li) => li.textContent?.includes("Form 11"))).toBe(true);
  });

  it("gives every document its own print page and puts the cover page first", async () => {
    const user = userEvent.setup();
    const { container } = render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    const pages = container.querySelectorAll(".cs-print-page");
    // Cover, table of contents, decision summary, rule references, Form 11,
    // 4 office documents, witness sheet, supporting-documents checklist,
    // missing-information report — at least 9 distinct pages for a
    // single-account ROUTE_A claim (Milestone 14 dropped the standalone
    // Competent Authority/Monetary Limit sheets — see the next test).
    expect(pages.length).toBeGreaterThanOrEqual(9);
    expect(pages[0]?.textContent).toContain("Deceased Claim — Claim File");
  });

  it("consolidates competent authority and monetary limit into the Decision Summary, keeping Rule References as its own sheet (Milestone 14: no duplicate data)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    // The standalone M8-era sheets are gone.
    expect(screen.queryByRole("heading", { name: "Competent Authority Sheet" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Monetary Limit Sheet" })).toBeNull();
    // Their data still appears exactly once, inline in the Decision Summary.
    expect(screen.getByText("Who approves this")).toBeTruthy();
    expect(screen.getByText(/Monetary limit/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Rule References" })).toBeTruthy();
    // The citation also appears in the reused ClaimDecisionSummary block —
    // a dedicated Rule References sheet restating it is the intended,
    // physical-file-consistent behavior, not an accidental duplicate.
    expect(
      screen.getAllByText(decisionForRoute("ROUTE_A").officialReferences[0]?.citation.en ?? "").length,
    ).toBeGreaterThan(0);
  });

  it("includes the new Office Note and Witness Sheet composed documents", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(screen.getByRole("heading", { name: "Internal office note — case noting" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Witness sheet" })).toBeTruthy();
  });

  it("collects details conditionally — plain nomination claim shows POSB payment but no bank/disclaimant/legal-heir/guardian/name-difference fields (Milestone 11)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user); // pays into own POSB, ticks "none of these"
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    // Always-relevant sections are present…
    expect(screen.getByLabelText("Office address")).toBeTruthy();
    expect(screen.getByLabelText("Prepared by — name of official")).toBeTruthy();
    expect(screen.getByLabelText("Date of death (as on the death certificate)")).toBeTruthy();
    expect(screen.getByLabelText("Mobile number")).toBeTruthy();
    expect(screen.getByLabelText(/Amount claimed/)).toBeTruthy();
    // …the chosen payment mode's field is asked…
    expect(screen.getByLabelText("Post Office savings account number (for payment)")).toBeTruthy();
    // …and everything this claim does NOT need is never asked.
    expect(screen.queryByLabelText("Bank name")).toBeNull();
    expect(screen.queryByLabelText("IFSC code")).toBeNull();
    expect(screen.queryByRole("button", { name: /Add Disclaiming/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add Legal heir" })).toBeNull();
    expect(screen.queryByLabelText(/Guardian's name/)).toBeNull();
    expect(screen.queryByLabelText(/name as on the death certificate \(the differing version\)/)).toBeNull();
    expect(screen.queryByLabelText(/name as per their ID/)).toBeNull();
  });

  it("asks for both name versions only when the matching name-difference flag was ticked (Milestone 11)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "name_mismatch_depositor") }));
    await continueBtn(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(screen.getByLabelText("Depositor's name as on the death certificate (the differing version)")).toBeTruthy();
    // The claimant-side variant was NOT flagged, so it is not asked.
    expect(screen.queryByLabelText("Claimant's name as per their ID (the differing version)")).toBeNull();
  });

  it("asks for disclaimants only when the claim actually selects the Form 14 disclaimer (Milestone 11)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_complication") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q5a_complication", "cannot_come_together") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(screen.getByRole("button", { name: /Add Disclaiming/ })).toBeTruthy();
  });

  it("asks for bank details only when payment is by bank transfer (Milestone 11)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    // Bank transfer is only available for RD/TD/MIS/NSC/KVP claims — use RD.
    await tickSchemeAndContinue(user, "RD");
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q8_maturity", "matured_within_10_years") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "bank_transfer") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
    await continueBtn(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(screen.getByLabelText("Bank name")).toBeTruthy();
    expect(screen.getByLabelText("IFSC code")).toBeTruthy();
    expect(screen.getByLabelText("Bank account number")).toBeTruthy();
    expect(screen.queryByLabelText("Post Office savings account number (for payment)")).toBeNull();
  });

  it("assembles the reconciliation-certificate request into the Claim File when the depositor name-difference flag is ticked (Milestone 12)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "name_mismatch_depositor") }));
    await continueBtn(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    // The Document Engine's registry includes the pack-authored request
    // template whenever the engine selected it — it renders as its own
    // page AND appears in the index (both derive from one definition).
    expect(screen.getByRole("heading", { name: "Apply for a reconciliation certificate — depositor's name" })).toBeTruthy();
    const index = screen.getByRole("heading", { name: "Table of Contents" }).closest("div");
    const indexItems = index ? within(index).getAllByRole("listitem") : [];
    expect(indexItems.some((li) => li.textContent?.includes("reconciliation certificate"))).toBe(true);
  });

  it("shows the entered claimant name on the cover page", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await user.type(screen.getByLabelText("Claimant's name"), "Cover Page Claimant");

    const cover = screen.getByRole("heading", { name: "Deceased Claim — Claim File" }).closest("div");
    // Milestone 14's cover page shows the name twice by design — once as
    // "Claimant", once inside "Nominee(s)" (the claimant IS a nominee) —
    // so this checks presence, not uniqueness.
    expect(cover ? within(cover).getAllByText("Cover Page Claimant").length : 0).toBeGreaterThan(0);
  });
});

describe("Production document quality (Milestone 15)", () => {
  it("formats the amount claimed as Indian currency and the death date as DD-MM-YYYY, wherever they're auto-filled", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());

    await user.type(screen.getByLabelText("Amount claimed (₹) — Savings Account"), "250000");
    const dateInput: HTMLInputElement = screen.getByLabelText("Date of death (as on the death certificate)");
    fireEvent.input(dateInput, { target: { value: "2025-03-14" } });
    fireEvent.change(dateInput, { target: { value: "2025-03-14" } });
    expect(dateInput.value).toBe("2025-03-14");

    expect(screen.getAllByText("₹2,50,000").length).toBeGreaterThan(0);
    expect((await screen.findAllByText("14-03-2025")).length).toBeGreaterThan(0);
    // The raw, un-reformatted values must never appear as auto-filled text.
    expect(screen.queryByText("250000")).toBeNull();
  });

  it("numbers every field on Tier B documents (forwarding letter) the same way Tier A forms are numbered", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());

    const forwardingLetter = screen.getByRole("heading", { name: /forwarding letter/i }).closest<HTMLElement>("div.cs-print-area");
    expect(forwardingLetter).toBeTruthy();
    expect(forwardingLetter ? within(forwardingLetter).getByText("Office-prepared document") : null).toBeTruthy();
    // Numbered rows exist (at least "1." through "3.").
    for (const n of ["1.", "2.", "3."]) {
      expect(forwardingLetter ? within(forwardingLetter).getByText(n) : null).toBeTruthy();
    }
  });

  it("shows the office-use footer only on the reconciliation-certificate request, not on the purely-internal forwarding letter", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "name_mismatch_depositor") }));
    await continueBtn(user);
    await user.click(await generatePackageButton());

    const reconciliation = screen
      .getByRole("heading", { name: "Apply for a reconciliation certificate — depositor's name" })
      .closest<HTMLElement>("div.cs-print-area");
    const forwardingLetter = screen.getByRole("heading", { name: /forwarding letter/i }).closest<HTMLElement>("div.cs-print-area");
    expect(reconciliation ? within(reconciliation).getByText("For office use only") : null).toBeTruthy();
    expect(forwardingLetter ? within(forwardingLetter).queryByText("For office use only") : "missing").toBeNull();
  });
});
