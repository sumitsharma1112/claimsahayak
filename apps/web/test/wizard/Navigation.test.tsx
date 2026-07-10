/**
 * Milestone 4.2 — wizard navigation and branching, driven end-to-end
 * against the real, authored RULE_PACK (never a synthetic fixture): every
 * "what's next" / "what's visible" / "what gets cleared" decision below
 * is read back from the frozen Rule Engine itself, not asserted from a
 * hand-picked assumption.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { resolveVisibleQuestions, type AnswerMap } from "@claimsahayak/rule-engine";
import { Wizard } from "@/components/wizard/Wizard";

afterEach(cleanup);

const sb = RULE_PACK.schemes.find((s) => s.id === "SB");
if (!sb) {
  throw new Error("Fixture assumption broken: SB scheme missing from RULE_PACK.");
}

function questionText(id: string): string {
  const q = RULE_PACK.questions.find((q) => q.id === id);
  if (!q) throw new Error(`Fixture assumption broken: question "${id}" missing.`);
  return q.text.en;
}

function optionLabel(questionId: string, optionId: string): string {
  const q = RULE_PACK.questions.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`Fixture assumption broken: "${questionId}.${optionId}" missing.`);
  return opt.label.en;
}

const validSb = sb;

/** Expected `Step X of Y` computed straight from the real engine, for a given flat answer set. */
function expectedTotal(flat: AnswerMap): number {
  return resolveVisibleQuestions(RULE_PACK, validSb, flat, undefined).length;
}

async function tickSchemeAndContinue(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

describe("Wizard navigation — forward, branch-aware, hidden-question skipping", () => {
  it("skips q3_holding/q4_death_month/q5_nomination entirely when the guardian branch fires", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);

    expect(screen.getByRole("heading", { name: questionText("q2_who_died") })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "guardian") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // The guardian branch makes q3_holding/q4_death_month/q5_nomination invisible
    // (verified directly against the engine, not assumed).
    const visible = resolveVisibleQuestions(
      RULE_PACK,
      sb,
      { "q1_schemes.SB": true, q2_who_died: "guardian" },
      undefined,
    ).map((q) => q.id);
    expect(visible).not.toContain("q3_holding");
    expect(visible).not.toContain("q4_death_month");
    expect(visible).not.toContain("q5_nomination");

    // The wizard must never render or land on any of those hidden questions —
    // it should jump straight to the next one that's still visible.
    expect(screen.queryByRole("heading", { name: questionText("q3_holding") })).toBeNull();
    expect(screen.queryByRole("heading", { name: questionText("q4_death_month") })).toBeNull();
    expect(screen.queryByRole("heading", { name: questionText("q5_nomination") })).toBeNull();
    expect(screen.getByRole("heading", { name: questionText("q9_payment") })).toBeTruthy();
  });

  it("advances through single/monthYear/multi question types in the pack's own authored order", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);

    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: questionText("q3_holding") })).toBeTruthy();

    await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: questionText("q4_death_month") })).toBeTruthy();

    await user.selectOptions(screen.getByLabelText("Month"), "3");
    await user.selectOptions(screen.getByLabelText("Year"), "2024");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: questionText("q5_nomination") })).toBeTruthy();

    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: questionText("q9_payment") })).toBeTruthy();

    await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: questionText("q10_docs_check") })).toBeTruthy();

    await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // No more visible-unanswered questions: the wizard shows its completion state, not a crash.
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
  });
});

describe("Wizard navigation — progress (Step X of Y, no hardcoded totals)", () => {
  it("computes Y from the actual visible branch and updates as answers are recorded", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);

    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe(String(expectedTotal({})));

    await tickSchemeAndContinue(user);
    expect(bar.getAttribute("aria-valuenow")).toBe("2");
    expect(bar.getAttribute("aria-valuemax")).toBe(String(expectedTotal({ "q1_schemes.SB": true })));

    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "guardian") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    // Guardian shrinks the visible branch (q3/q4/q5 drop out) — Y must shrink too, live.
    expect(bar.getAttribute("aria-valuemax")).toBe(
      String(expectedTotal({ "q1_schemes.SB": true, q2_who_died: "guardian" })),
    );
  });
});

describe("Wizard navigation — Previous restores the exact prior question and answer", () => {
  it("Back re-shows q2_who_died with the prior answer pre-selected, then q1_schemes with its tick intact", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: questionText("q3_holding") })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("heading", { name: questionText("q2_who_died") })).toBeTruthy();
    expect(
      screen.getByRole<HTMLInputElement>("radio", { name: optionLabel("q2_who_died", "adult") })
        .checked,
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("heading", { name: questionText("q1_schemes") })).toBeTruthy();
    expect(
      screen.getByRole<HTMLInputElement>("checkbox", { name: optionLabel("q1_schemes", "SB") })
        .checked,
    ).toBe(true);

    // Previous is disabled once there's nothing earlier to go back to.
    expect(screen.getByRole("button", { name: "Previous" })).toHaveProperty("disabled", true);
  });

  it("re-answering the same question after Back, unchanged, simply resumes forward from where it was", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("heading", { name: questionText("q2_who_died") })).toBeTruthy();
    // Re-confirm the SAME answer (no real change) and continue.
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("heading", { name: questionText("q3_holding") })).toBeTruthy();
  });
});

describe("Wizard navigation — answer invalidation cascade", () => {
  it("changing an earlier answer clears every dependent named in invalidates[], forcing them to be re-asked", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    // Now on q4_death_month, with q3_holding answered.

    // Debug panel confirms q3_holding is currently recorded.
    expect(screen.getByText(/"q3_holding"/)).toBeTruthy();

    // Go back to q2_who_died and switch to "guardian" — its invalidates[]
    // names q3_holding (among others) per the frozen rule-engine's own test
    // suite (packages/rule-engine/test/invalidation.test.ts).
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("heading", { name: questionText("q2_who_died") })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "guardian") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // q3_holding's stale answer must be gone — no stale answers survive an edit.
    expect(screen.queryByText(/"q3_holding"/)).toBeNull();
    // And since guardian hides it too, the wizard must not land back on it.
    expect(screen.queryByRole("heading", { name: questionText("q3_holding") })).toBeNull();
  });
});

describe("Wizard navigation — reroute banner", () => {
  it("announces via aria-live when editing an earlier answer changes the resolved route", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.selectOptions(screen.getByLabelText("Month"), "3");
    await user.selectOptions(screen.getByLabelText("Year"), "2024");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    // This account now resolves to T9 / ROUTE_A (verified by rule-engine's own
    // truth-table fixture fx01 for this exact answer combination) — no
    // reroute banner should be showing yet.
    expect(screen.queryByText(/guardian acts as the claimant/i)).toBeNull();

    // Go back to q2_who_died (2 Previous presses: q9_payment -> q5_nomination -> q2_who_died is 3 back;
    // walk back until the heading is q2_who_died, bounded).
    for (let i = 0; i < 6; i += 1) {
      if (screen.queryByRole("heading", { name: questionText("q2_who_died") })) {
        break;
      }
      await user.click(screen.getByRole("button", { name: "Previous" }));
    }
    expect(screen.getByRole("heading", { name: questionText("q2_who_died") })).toBeTruthy();

    // Switching to "child" fires the T5 reroute instead of T9 — the terminal
    // route changes, so the Rule-Pack-authored T5 banner must appear.
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "child") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const banner = screen.getByText(/guardian acts as the claimant/i);
    expect(banner.getAttribute("aria-live")).toBe("polite");
  });

  it("shows no reroute banner when the edited answer does not change the resolved route", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.click(screen.getByRole("button", { name: "Previous" }));
    // Re-answer q2_who_died with the SAME value ("adult") — no route change possible.
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.queryByText(/guardian acts as the claimant/i)).toBeNull();
  });
});
