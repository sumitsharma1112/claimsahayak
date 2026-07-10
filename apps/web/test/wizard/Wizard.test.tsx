/**
 * End-to-end proof of the renderer architecture: Wizard renders the first
 * question straight from the real, authored Rule Pack (never a hardcoded
 * per-scheme component), and answering + continuing hands control back to
 * the Rule Engine to decide the next question — the UI never evaluates
 * scheme/route/threshold logic itself.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { ENGINE_VERSION } from "@claimsahayak/rule-engine";
import { Wizard } from "@/components/wizard/Wizard";

afterEach(cleanup);

const q1 = RULE_PACK.questions.find((q) => q.id === "q1_schemes");
const q2 = RULE_PACK.questions.find((q) => q.id === "q2_who_died");
if (!q1 || !q2) {
  throw new Error("Fixture assumption broken: q1_schemes/q2_who_died missing from RULE_PACK.");
}

describe("Wizard — foundation end-to-end", () => {
  it("renders the pack's first visible question with no answer recorded yet", () => {
    render(<Wizard rulePack={RULE_PACK} />);
    expect(screen.getByRole("heading", { name: q1.text.en })).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("1");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveProperty("disabled", true);
  });

  it("shows the development debug panel with pack/engine version and current question id", () => {
    render(<Wizard rulePack={RULE_PACK} />);
    expect(screen.getByText(RULE_PACK.meta.version)).toBeTruthy();
    expect(screen.getByText(ENGINE_VERSION)).toBeTruthy();
    expect(screen.getByText("q1_schemes")).toBeTruthy();
  });

  it("advances to the next Rule-Engine-visible question after answering and continuing", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);

    const sbOption = q1.options.find((o) => o.id === "SB");
    if (!sbOption) {
      throw new Error("Fixture assumption broken: q1_schemes has no SB option.");
    }
    await user.click(screen.getByRole("checkbox", { name: sbOption.label.en }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.queryByRole("heading", { name: q1.text.en })).toBeNull();
    expect(screen.getByRole("heading", { name: q2.text.en })).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("2");
  });

  it("never renders scheme, route, or threshold identifiers anywhere in the DOM", () => {
    const { container } = render(<Wizard rulePack={RULE_PACK} />);
    // The UI must render only Rule Pack question/option text — no route ids
    // like "T9" or "ROUTE_A", which would mean business logic leaked into
    // the component tree instead of staying inside the Rule Engine.
    expect(container.textContent).not.toMatch(/\bROUTE_[A-Z_]+\b/);
    expect(container.textContent).not.toMatch(/\bT\d{1,2}A?\b/);
  });
});
