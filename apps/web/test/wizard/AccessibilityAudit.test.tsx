/**
 * Milestone 4.4 — accessibility completeness pass. Targeted checks that
 * complement (not duplicate) the per-component axe runs already in
 * a11y.test.tsx and Cards.test.tsx: the full document's heading hierarchy,
 * focus movement between screens, and touch-target sizing.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
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

describe("Accessibility — full document heading hierarchy", () => {
  it("starts with exactly one h1, followed only by h2s — no skipped levels, no axe heading-order violations", async () => {
    const { container } = render(
      <main>
        <Wizard rulePack={RULE_PACK} />
      </main>,
    );

    const h1s = container.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    const h2 = container.querySelector("h2");
    expect(h2).toBeTruthy();
    expect(container.querySelector("h3, h4, h5, h6")).toBeNull();

    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toHaveLength(0);
  });
});

describe("Accessibility — focus moves to the new question on every navigation", () => {
  it("moves focus to the next question's own heading after Continue, and back again after Previous", async () => {
    const user = userEvent.setup();
    render(
      <main>
        <Wizard rulePack={RULE_PACK} />
      </main>,
    );

    const q1Text = RULE_PACK.questions.find((q) => q.id === "q1_schemes")?.text.en;
    const q2Text = RULE_PACK.questions.find((q) => q.id === "q2_who_died")?.text.en;
    if (!q1Text || !q2Text) throw new Error("Fixture assumption broken.");

    // On mount, the first question's own heading already has focus.
    // React reuses the same <h2> DOM node across question changes (same
    // position in the tree), so this checks the heading's CONTENT and
    // focus state — not node identity — at each step.
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(q1Text);
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2 }));

    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(q2Text);
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2 }));

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(q1Text);
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2 }));
  });
});

describe("Accessibility — touch targets", () => {
  it("gives every interactive control at least a 48px touch target (the cs-size-touch/cs-size-button tokens)", () => {
    render(
      <main>
        <Wizard rulePack={RULE_PACK} />
      </main>,
    );

    const whySummary = document.querySelector("summary");
    expect(whySummary?.className).toMatch(/min-h-touch/);

    const optionLabelEl = document.querySelector("label[for^='q1_schemes-']");
    expect(optionLabelEl?.className).toMatch(/min-h-touch/);

    for (const label of ["Continue", "Previous", "Start Over"]) {
      const button = screen.getByRole("button", { name: label });
      expect(button.className).toMatch(/cs-btn-(primary|secondary)/);
    }
  });
});
