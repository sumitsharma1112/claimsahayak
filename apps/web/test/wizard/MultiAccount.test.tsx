/**
 * Milestone 6 Part 2 — multi-account wizard support, driven end-to-end
 * against the real RULE_PACK. Before M6 the Wizard hardcoded
 * `rulePack.schemes[0]` (SB): ticking any other scheme still evaluated
 * SB, scheme-gated questions (q8_maturity/q8_close_or_continue, gated on
 * `scheme.continuableByClaimant`) were unreachable dead code, and ticking
 * several schemes produced a single SB answer. These tests prove: (1) a
 * non-SB scheme ticked alone is genuinely evaluated (its scheme-gated
 * questions appear); (2) union visibility asks the superset of questions
 * for several ticked schemes; (3) the terminal renders one outcome per
 * ticked scheme via the engine's own `evaluateChecklist` document; and
 * (4) no internal route/decision identifier leaks into visible text.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { Wizard } from "@/components/wizard/Wizard";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

/** Same accessible-name convention as Cards.test.tsx. */
function optionLabel(questionId: string, optionId: string): RegExp {
  const q = RULE_PACK.questions.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`Fixture assumption broken: "${questionId}.${optionId}" missing.`);
  return new RegExp(`^${opt.label.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}

function questionText(id: string): string {
  const q = RULE_PACK.questions.find((q) => q.id === id);
  if (!q) throw new Error(`Fixture assumption broken: question "${id}" missing.`);
  return q.text.en;
}

function schemeName(id: string): string {
  const s = RULE_PACK.schemes.find((s) => s.id === id);
  if (!s) throw new Error(`Fixture assumption broken: scheme "${id}" missing.`);
  return s.displayName.en;
}

function decisionForRoute(routeId: string) {
  const d = RULE_PACK.decisions?.find((d) => d.routeId === routeId);
  if (!d) throw new Error(`Fixture assumption broken: no DecisionRecord for "${routeId}".`);
  return d;
}

function card(id: string) {
  const c = RULE_PACK.cards.find((c) => c.id === id);
  if (!c) throw new Error(`Fixture assumption broken: card "${id}" missing.`);
  return c;
}

/** Time-relative death month, same UTC convention as the engine's monthsBetween. */
function monthYearMonthsAgo(monthsAgo: number): { month: string; year: string } {
  const now = new Date();
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() - monthsAgo;
  return { month: String((total % 12) + 1), year: String(Math.floor(total / 12)) };
}

type User = ReturnType<typeof userEvent.setup>;

async function continueBtn(user: User) {
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function tickSchemesAndContinue(user: User, schemeIds: readonly string[]) {
  for (const id of schemeIds) {
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", id) }));
  }
  await continueBtn(user);
}

/** adult → armed forces No → one name → death 2 months ago. */
async function answerCommonPathToQ5(user: User) {
  await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
  await continueBtn(user);
  await user.click(screen.getByRole("radio", { name: "No" })); // q_armed_forces
  await continueBtn(user);
  await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
  await continueBtn(user);
  const death = monthYearMonthsAgo(2);
  await user.selectOptions(screen.getByLabelText("Month"), death.month);
  await user.selectOptions(screen.getByLabelText("Year"), death.year);
  await continueBtn(user);
}

describe("Multi-account — a non-SB scheme ticked alone is genuinely evaluated", () => {
  it("asks the continuable-scheme questions (q8) for an RD claim and reaches its decision", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemesAndContinue(user, ["RD"]);
    await answerCommonPathToQ5(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);

    // Previously dead code: q8_maturity is gated on scheme.continuableByClaimant,
    // which the old schemes[0] (SB) wizard could never satisfy.
    expect(screen.getByRole("heading", { name: questionText("q8_maturity") })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: optionLabel("q8_maturity", "not_yet_matured") }));
    await continueBtn(user);
    expect(screen.getByRole("heading", { name: questionText("q8_close_or_continue") })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: optionLabel("q8_close_or_continue", "close") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
    await continueBtn(user);

    // Single account still renders the M5 decision summary directly, now
    // for the scheme the user actually ticked.
    expect(screen.getByRole("heading", { name: decisionForRoute("ROUTE_A").decision.en })).toBeTruthy();
    expect(screen.getByText(schemeName("RD"))).toBeTruthy();
  });
});

describe("Multi-account — two schemes, one shared pass, one outcome each", () => {
  async function driveSbRdToResults(user: User) {
    await tickSchemesAndContinue(user, ["SB", "RD"]);
    await answerCommonPathToQ5(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    // Union visibility: q8_maturity is asked because RD needs it, even
    // though SB alone never would.
    expect(screen.getByRole("heading", { name: questionText("q8_maturity") })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: optionLabel("q8_maturity", "matured_within_10_years") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
    await continueBtn(user);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
    await continueBtn(user);
  }

  it("renders the results view with one decision per ticked scheme", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await driveSbRdToResults(user);

    expect(screen.getByRole("heading", { name: "Your claim outcomes" })).toBeTruthy();
    // Scheme names appear as the per-account section label AND inside each
    // decision summary's own Scheme field — at least once each is enough.
    expect(screen.getAllByText(schemeName("SB")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(schemeName("RD")).length).toBeGreaterThan(0);
    // Both accounts resolved a nomination-track decision — one summary each.
    const decisionHeadings = screen.getAllByRole("heading", {
      name: decisionForRoute("ROUTE_A").decision.en,
    });
    expect(decisionHeadings).toHaveLength(2);
  });

  it("never leaks internal route/decision identifiers into the results view", async () => {
    const user = userEvent.setup();
    const { container } = render(<Wizard rulePack={RULE_PACK} />);
    await driveSbRdToResults(user);

    expect(container.textContent).not.toMatch(/\bROUTE_[A-Z_]+\b/);
    expect(container.textContent).not.toMatch(/\bT\d{1,2}A?\b/);
    expect(container.textContent).not.toMatch(/\bDEC_[A-Z_]+\b/);
  });

  it("renders one card per account when the shared answers reach a card terminal", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemesAndContinue(user, ["SB", "MIS"]);
    await answerCommonPathToQ5(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "no") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q6_legal_evidence", "no") }));
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: "No" })); // q_dispute
    await continueBtn(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q7a_amount", "more_than_5_lakh") }));
    await continueBtn(user);

    // Both accounts short-circuit to the same stop card (routes never
    // condition on scheme capabilities today) — the results view shows it
    // once per account, under each scheme's own name.
    expect(screen.getByRole("heading", { name: "Your claim outcomes" })).toBeTruthy();
    expect(screen.getByText(schemeName("SB"))).toBeTruthy();
    expect(screen.getByText(schemeName("MIS"))).toBeTruthy();
    const stopHeadings = screen.getAllByRole("heading", {
      name: card("card_stop_succession_certificate").title.en,
    });
    expect(stopHeadings).toHaveLength(2);
  });
});
