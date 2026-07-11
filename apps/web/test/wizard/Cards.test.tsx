/**
 * Milestone 4.3 — Wizard Cards, driven end-to-end against the real,
 * authored RULE_PACK: every card shown below is whatever the frozen
 * `resolveRoute` actually resolves to for that answer path, not a
 * hand-picked assumption.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { Wizard } from "@/components/wizard/Wizard";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

/**
 * An option's accessible name is its label PLUS its help text when present
 * (both live in the same <label>) — so this matches only the start of the
 * label, rather than requiring an exact (and label-vs-help-dependent) match.
 */
function optionLabel(questionId: string, optionId: string): RegExp {
  const q = RULE_PACK.questions.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`Fixture assumption broken: "${questionId}.${optionId}" missing.`);
  return new RegExp(`^${opt.label.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}

function card(id: string) {
  const c = RULE_PACK.cards.find((c) => c.id === id);
  if (!c) throw new Error(`Fixture assumption broken: card "${id}" missing.`);
  return c;
}

async function tickSchemeAndContinue(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

/**
 * q_armed_forces (D-14) sits right after q2_who_died on the adult branch;
 * q_dispute (D-11) sits right after q6_legal_evidence whenever there's no
 * nomination — both are ClaimSahayak Official Rule Book v1.0 additions
 * every adult/no-nomination path must now answer.
 */
async function answerBooleanNoAndContinue(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "No" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function reachQ6(user: ReturnType<typeof userEvent.setup>) {
  await tickSchemeAndContinue(user);
  await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await answerBooleanNoAndContinue(user); // q_armed_forces
  await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.selectOptions(screen.getByLabelText("Month"), "3");
  await user.selectOptions(screen.getByLabelText("Year"), "2024");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "no") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: optionLabel("q6_legal_evidence", "no") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await answerBooleanNoAndContinue(user); // q_dispute
}

describe("Wizard Cards — info", () => {
  it("shows the info card immediately for T1 (old/discontinued scheme), before any further question", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "OLD_UNSURE") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const c = card("card_info_end_old_scheme");
    expect(screen.getByRole("heading", { name: c.title.en })).toBeTruthy();
    expect(screen.getByText(c.nextPhysicalStep.en)).toBeTruthy();
    expect(screen.getByText("Information")).toBeTruthy();
  });
});

describe("Wizard Cards — pause, with printable letter", () => {
  it("shows the pause card for T15 (nomination unknown) with a Print Letter button and the template fields", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await answerBooleanNoAndContinue(user); // q_armed_forces
    await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.selectOptions(screen.getByLabelText("Month"), "3");
    await user.selectOptions(screen.getByLabelText("Year"), "2024");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "dont_know") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const c = card("card_pause_nomination");
    expect(screen.getByRole("heading", { name: c.title.en })).toBeTruthy();
    expect(screen.getByText("Pause")).toBeTruthy();

    // PrintableTemplate is next/dynamic-loaded (Milestone 4.3) — its chunk
    // resolves asynchronously, so this must wait rather than assert
    // synchronously (a pre-existing fragility this test's extra screen,
    // added by the ClaimSahayak Official Rule Book v1.0 integration, was
    // enough to expose under full-suite load).
    const printButton = await screen.findByRole("button", { name: "Print Letter" });
    expect(printButton).toBeTruthy();
    // The template's own fields render (from Rule Pack data, not hardcoded copy).
    expect(screen.getByText("Ask the Post Office about a registered nominee")).toBeTruthy();
    expect(screen.getByText("Name of Post Office")).toBeTruthy();

    const printSpy = vi.spyOn(window, "print").mockImplementation(() => undefined);
    printButton.click();
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});

describe("Wizard Cards — stop", () => {
  it("shows the stop card for T18 (court document needed, balance above the affidavit limit)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await reachQ6(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q7a_amount", "more_than_5_lakh") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const c = card("card_stop_succession_certificate");
    expect(screen.getByRole("heading", { name: c.title.en })).toBeTruthy();
    expect(screen.getByText("Stop")).toBeTruthy();
    // warningChip block from the card body renders too.
    expect(screen.getByRole("note")).toBeTruthy();
  });
});

describe("Wizard Cards — wait", () => {
  it("shows the wait card for T19 (within the affidavit limit, heirs together, wait window not yet met)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await reachQ6(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q7a_amount", "up_to_5_lakh") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q7b_heirs_together", "yes") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const c = card("card_wait_or_court");
    expect(screen.getByRole("heading", { name: c.title.en })).toBeTruthy();
    expect(screen.getByText("Wait")).toBeTruthy();
  });
});

describe("Wizard Cards — accessibility", () => {
  it("a11y: the info card has no axe violations and moves focus to its own heading", async () => {
    const user = userEvent.setup();
    // Mirrors the real app: RootLayout renders Wizard inside <main>, the
    // page's landmark region — rendering it bare here would make axe's
    // "region" rule flag a false positive that doesn't exist in production.
    render(
      <main>
        <Wizard rulePack={RULE_PACK} />
      </main>,
    );
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "OLD_UNSURE") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const c = card("card_info_end_old_scheme");
    const heading = screen.getByRole("heading", { name: c.title.en });
    expect(document.activeElement).toBe(heading);

    const results = await axe.run(document.body, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toHaveLength(0);
  });
});
