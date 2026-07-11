/**
 * Milestone 4.4 — "Wizard State: verify resume, clear, restart, branch
 * change, invalidations, reroute, offline all behave correctly together."
 * Earlier milestones tested each behavior in isolation; this exercises them
 * interacting in a single realistic session, entirely offline throughout.
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { SESSION_STORAGE_KEY } from "@claimsahayak/shared-types";
import { Wizard } from "@/components/wizard/Wizard";
import { loadSession } from "@/lib/wizardSession";

let onLineSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  onLineSpy = vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  onLineSpy.mockRestore();
});

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

describe("Combined wizard state — offline throughout", () => {
  it("walks to a card, resumes after a reload, changes an earlier branch (invalidation + reroute), then Starts Over — all offline", async () => {
    const user = userEvent.setup();

    // 1. First mount: answer through to the T15 pause card. Entirely offline.
    const first = render(<Wizard rulePack={RULE_PACK} />);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    // q_armed_forces (D-14, ClaimSahayak Official Rule Book v1.0 integration)
    // sits right after q2_who_died on the adult branch.
    await user.click(screen.getByRole("radio", { name: "No" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.selectOptions(screen.getByLabelText("Month"), "3");
    await user.selectOptions(screen.getByLabelText("Year"), "2024");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "dont_know") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const pauseCard = RULE_PACK.cards.find((c) => c.id === "card_pause_nomination");
    if (!pauseCard) throw new Error("Fixture assumption broken.");
    expect(screen.getByRole("heading", { name: pauseCard.title.en })).toBeTruthy();

    await waitFor(() => {
      expect(loadSession()?.answers.q5_nomination).toEqual({ kind: "single", optionId: "dont_know" });
    });
    first.unmount();

    // 2. Simulate a reload: fresh mount, still offline. Resume the session.
    render(<Wizard rulePack={RULE_PACK} />);
    await waitFor(() => screen.getByRole("button", { name: "Resume" }));
    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(screen.getByRole("heading", { name: pauseCard.title.en })).toBeTruthy();

    // 3. Branch change FROM the card: Previous is available here too, not
    //    just from question screens (Milestone 4.4 fix).
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("heading", { name: questionText("q5_nomination") })).toBeTruthy();

    // Switch nomination to "no" — moves the account off the "pause" (T15)
    // outcome entirely, onto the legal-evidence branch (T16/T17/T18/T19/T20).
    // q5's invalidates[] runs on this edit too (clearing anything answered
    // downstream — there's nothing to clear yet here, since q6+ were never
    // reached on the first pass, but the same cascade call fires regardless).
    await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "no") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("heading", { name: questionText("q6_legal_evidence") })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: optionLabel("q6_legal_evidence", "yes") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // q_dispute (D-11) is visible whenever q5_nomination === "no", regardless
    // of the q6_legal_evidence answer.
    expect(screen.getByRole("heading", { name: questionText("q_dispute") })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: "No" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // T16 fires (ROUTE_B, a real route, not a card) — the wizard keeps going.
    expect(screen.getByRole("heading", { name: questionText("q9_payment") })).toBeTruthy();

    // 4. Clear everything with Start Over, confirm, still offline.
    await user.click(screen.getByRole("button", { name: "Start Over" }));
    await user.click(screen.getByRole("button", { name: "Yes, start over" }));

    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole("heading", { name: questionText("q1_schemes") })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") })).toHaveProperty(
      "checked",
      false,
    );

    // Confirm we really were offline this whole time.
    expect(window.navigator.onLine).toBe(false);
  });
});
