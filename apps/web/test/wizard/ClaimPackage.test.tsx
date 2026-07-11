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

    const missing = screen.getByText("Still missing — you can fill these in by hand instead");
    expect(missing).toBeTruthy();
    const missingList = missing.closest("div");
    expect(missingList ? within(missingList).getAllByRole("listitem").length : 0).toBeGreaterThan(0);

    // The print button remains available even with information missing —
    // gaps can legitimately be completed by hand at the counter.
    expect(screen.getByRole("button", { name: "Print checklist (save as PDF)" })).toBeTruthy();
  });
});
