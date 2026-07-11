/**
 * Milestone 6 Part 1 — derived-date wiring, driven end-to-end against the
 * real RULE_PACK. Before M6 the Wizard passed `derived: undefined` into
 * every engine call, which made the 6-month no-nomination gate (T17 →
 * ROUTE_C, the discretionary affidavit route) unreachable in the live app:
 * every no-nomination/no-evidence claim landed on the WAIT card (T19)
 * regardless of how long ago the death was. These tests prove the gate is
 * now real, in both directions, including on the edit-a-past-answer path
 * and for the 10-year freeze overlay (`derived.freezeRequired`).
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

/**
 * Month/year exactly `monthsAgo` whole months before now, as the wizard's
 * <select> string values — time-relative so the tests never drift across
 * the 6-month/10-year gates as real time passes. UTC math mirrors the
 * engine's own `monthsBetween`.
 */
function monthYearMonthsAgo(monthsAgo: number): { month: string; year: string } {
  const now = new Date();
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() - monthsAgo;
  return { month: String((total % 12) + 1), year: String(Math.floor(total / 12)) };
}

type User = ReturnType<typeof userEvent.setup>;

async function continueBtn(user: User) {
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function answerBooleanNoAndContinue(user: User) {
  await user.click(screen.getByRole("radio", { name: "No" }));
  await continueBtn(user);
}

async function pickDeathMonth(user: User, monthsAgo: number) {
  const death = monthYearMonthsAgo(monthsAgo);
  await user.selectOptions(screen.getByLabelText("Month"), death.month);
  await user.selectOptions(screen.getByLabelText("Year"), death.year);
}

/** q1 (SB) → q2 adult → armed forces No → q3 one name → q4 (deathMonthsAgo). */
async function reachQ5(user: User, deathMonthsAgo: number) {
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
  await continueBtn(user);
  await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
  await continueBtn(user);
  await answerBooleanNoAndContinue(user); // q_armed_forces
  await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
  await continueBtn(user);
  await pickDeathMonth(user, deathMonthsAgo);
  await continueBtn(user);
}

/** After reachQ5: no nomination → no evidence → no dispute → ≤5L → heirs together. */
async function answerNoNominationAffidavitPath(user: User) {
  await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "no") }));
  await continueBtn(user);
  await user.click(screen.getByRole("radio", { name: optionLabel("q6_legal_evidence", "no") }));
  await continueBtn(user);
  await answerBooleanNoAndContinue(user); // q_dispute
  await user.click(screen.getByRole("radio", { name: optionLabel("q7a_amount", "up_to_5_lakh") }));
  await continueBtn(user);
  await user.click(screen.getByRole("radio", { name: optionLabel("q7b_heirs_together", "yes") }));
  await continueBtn(user);
}

async function answerPaymentAndDocs(user: User) {
  await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
  await continueBtn(user);
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
  await continueBtn(user);
}

describe("Derived dates — the 6-month no-nomination gate (T17 vs T19)", () => {
  it("reaches ROUTE_C's real decision when the death was over the wait window ago", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await reachQ5(user, 12);
    await answerNoNominationAffidavitPath(user);

    // Route-kind terminal: the WAIT card must NOT short-circuit; the flow
    // continues through payment/docs to the real decision.
    expect(screen.queryByRole("heading", { name: card("card_wait_or_court").title.en })).toBeNull();
    await answerPaymentAndDocs(user);

    const dec = decisionForRoute("ROUTE_C");
    expect(screen.getByRole("heading", { name: dec.decision.en })).toBeTruthy();
  });

  it("still shows the WAIT card when the death was inside the wait window", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await reachQ5(user, 2);
    await answerNoNominationAffidavitPath(user);

    expect(screen.getByRole("heading", { name: card("card_wait_or_court").title.en })).toBeTruthy();
  });

  it("re-resolves the route when the death month is edited after reaching the WAIT card", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await reachQ5(user, 2);
    await answerNoNominationAffidavitPath(user);
    expect(screen.getByRole("heading", { name: card("card_wait_or_court").title.en })).toBeTruthy();

    // Walk Back from the card to q4_death_month (visited: q1, q2,
    // q_armed_forces, q3, q4, q5, q6, q_dispute, q7a, q7b → 6 steps back).
    for (let i = 0; i < 6; i += 1) {
      await user.click(screen.getByRole("button", { name: "Previous" }));
    }
    expect(screen.getByLabelText("Month")).toBeTruthy();

    // A monthYear edit changes NO flat-map key — only `derived` — so this
    // is exactly the reroute the pre-M6 wizard could never see.
    await pickDeathMonth(user, 12);
    await continueBtn(user);

    // T19 no longer fires; the route-kind path resumes at the next
    // unanswered question instead of a card.
    expect(screen.queryByRole("heading", { name: card("card_wait_or_court").title.en })).toBeNull();
    await answerPaymentAndDocs(user);
    expect(screen.getByRole("heading", { name: decisionForRoute("ROUTE_C").decision.en })).toBeTruthy();
  });
});

describe("Derived dates — the 10-year freeze flag (derived.freezeRequired)", () => {
  it("adds the frozen-account warning to the checklist when the death was over ten years ago", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await reachQ5(user, 132); // 11 years
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await continueBtn(user);
    await answerPaymentAndDocs(user);

    // The nomination route's decision renders, with the system-frozen
    // overlay's warning item folded into its checklist sections.
    expect(screen.getByRole("heading", { name: decisionForRoute("ROUTE_A").decision.en })).toBeTruthy();
    expect(screen.getByText(/processed at the Head Post Office/)).toBeTruthy();
  });
});
