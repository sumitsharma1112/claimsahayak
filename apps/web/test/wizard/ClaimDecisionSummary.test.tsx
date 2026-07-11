/**
 * Milestone 5 Part 6 — the "route"-kind terminal (a real, payable-or-not
 * decision), previously untested: this drives a full answer path to
 * ROUTE_A and confirms the Complete Claim Decision renders — decision,
 * reason, competent authority, monetary limit, court-order-required,
 * official references, next action for the Post Office, and the
 * dynamically-generated processing checklist — with no raw internal
 * route/scheme identifier ever leaking into visible text.
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

function optionLabel(questionId: string, optionId: string): RegExp {
  const q = RULE_PACK.questions.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`Fixture assumption broken: "${questionId}.${optionId}" missing.`);
  return new RegExp(`^${opt.label.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}

async function driveToRouteA(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: "No" })); // q_armed_forces
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: optionLabel("q3_holding", "one_name") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.selectOptions(screen.getByLabelText("Month"), "3");
  await user.selectOptions(screen.getByLabelText("Year"), "2024");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

describe("Wizard — Complete Claim Decision (route-kind terminal)", () => {
  it("renders the resolved decision, reason, and 'Payable' status for a nomination-alive claim", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await driveToRouteA(user);

    expect(screen.getByText("Payable")).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "The registered nominee(s) are paid, per their specified share (or equally, if no share was specified).",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(/A nominee entitled under an in-force nomination is paid immediately/),
    ).toBeTruthy();
  });

  it("renders the processing checklist, competent authority, monetary limit, court-order-required, and official references", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await driveToRouteA(user);

    expect(screen.getByText("Who approves this")).toBeTruthy();
    expect(screen.getByText(/Monetary limit/)).toBeTruthy();
    expect(screen.getByText("No fixed limit")).toBeTruthy();
    expect(screen.getByText(/Court order required/)).toBeTruthy();
    expect(screen.getByText("Official references")).toBeTruthy();
    expect(screen.getByText("Next action for the Post Office")).toBeTruthy();
    expect(screen.getByText("What you'll need")).toBeTruthy();
    expect(screen.getByText("GSPR 2018, Rule 15(2)-(3)")).toBeTruthy();
  });

  it("never renders a raw internal routeId/RouteRule id anywhere in the decision view", async () => {
    const user = userEvent.setup();
    const { container } = render(<Wizard rulePack={RULE_PACK} />);
    await driveToRouteA(user);

    expect(container.textContent).not.toMatch(/\bROUTE_[A-Z_]+\b/);
    expect(container.textContent).not.toMatch(/\bT\d{1,2}A?\b/);
    expect(container.textContent).not.toMatch(/\bDEC_[A-Z_]+\b/);
  });

  it("Previous from the decision view returns to the last answered question", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await driveToRouteA(user);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    const q10 = RULE_PACK.questions.find((q) => q.id === "q10_docs_check");
    if (!q10) throw new Error("Fixture assumption broken: q10_docs_check missing.");
    expect(screen.getByRole("heading", { name: q10.text.en })).toBeTruthy();
  });
});
