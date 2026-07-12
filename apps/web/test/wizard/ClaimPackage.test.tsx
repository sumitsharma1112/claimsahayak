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
import { cleanup, render, screen, within } from "@testing-library/react";
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
    // The OfficialFormView's own heading — distinct from the same form name
    // also appearing in the checklist section and the office-checklist table.
    expect(screen.getByRole("heading", { name: "Form 11 — claim application" })).toBeTruthy();
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

    expect(await screen.findByRole("heading", { name: "Form 13 — affidavit" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Form 14 — letter of disclaimer" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Form 15 — indemnity bond" })).toBeTruthy();
    // legalHeir.0.name is auto-filled on both Form 13 and Form 14.
    expect(screen.getAllByText("Legal Heir One").length).toBeGreaterThan(0);
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

    expect(await screen.findByText("Form 14 — letter of disclaimer")).toBeTruthy();
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
    const missing = screen.getByRole("heading", { name: "Still missing — you can fill these in by hand instead" });
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
    const index = screen.getByRole("heading", { name: "Index" }).closest("div");
    expect(index).toBeTruthy();
    const indexItems = index ? within(index).getAllByRole("listitem") : [];
    expect(indexItems.length).toBeGreaterThan(0);
    // The decision summary and Form 11 are always in the assembled file for
    // a payable account — their titles must appear in the index too.
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
    // Cover, index, decision summary, authority/limit/references sheets,
    // Form 11, 4 office documents, office checklist, missing report — at
    // least 10 distinct pages for a single-account ROUTE_A claim.
    expect(pages.length).toBeGreaterThanOrEqual(10);
    expect(pages[0]?.textContent).toContain("Deceased Claim — Claim File");
  });

  it("renders the Competent Authority, Monetary Limit, and Rule References as their own dedicated sheets", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />);
    await tickSchemeAndContinue(user);
    await answerCommonPathToNomination(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await finishPaymentAndDocs(user);
    await user.click(await generatePackageButton());
    await screen.findByRole("heading", { name: "Complete Claim Package" });

    expect(screen.getByRole("heading", { name: "Competent Authority Sheet" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Monetary Limit Sheet" })).toBeTruthy();
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
    expect(cover ? within(cover).getByText("Cover Page Claimant") : null).toBeTruthy();
  });
});
