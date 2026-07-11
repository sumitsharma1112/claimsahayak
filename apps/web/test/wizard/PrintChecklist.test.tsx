/**
 * Milestone 6 Part 3 — print/PDF export of the finished checklist. The
 * terminal outcome (single-account decision or multi-account results) is
 * wrapped in the M4.3 `.cs-print-area` print pipeline and gains a
 * "Print checklist" button that hands off to the browser's own print
 * dialog (`window.print()` — where "Save as PDF" lives). The
 * document-level shared content (good-to-know / verification panel /
 * disclaimers) now renders on the single-account terminal too, so the
 * printout always covers the full `ChecklistDocument`.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { evaluateChecklist } from "@claimsahayak/rule-engine";
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

function monthYearMonthsAgo(monthsAgo: number): { month: string; year: string } {
  const now = new Date();
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() - monthsAgo;
  return { month: String((total % 12) + 1), year: String(Math.floor(total / 12)) };
}

type User = ReturnType<typeof userEvent.setup>;

async function continueBtn(user: User) {
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function driveNomineeAlivePath(user: User, schemeIds: readonly string[]) {
  for (const id of schemeIds) {
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", id) }));
  }
  await continueBtn(user);
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
  await user.click(screen.getByRole("radio", { name: optionLabel("q5_nomination", "yes_alive") }));
  await continueBtn(user);
  if (schemeIds.includes("RD")) {
    await user.click(screen.getByRole("radio", { name: optionLabel("q8_maturity", "matured_within_10_years") }));
    await continueBtn(user);
  }
  await user.click(screen.getByRole("radio", { name: optionLabel("q9_payment", "own_posb") }));
  await continueBtn(user);
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q10_docs_check", "none") }));
  await continueBtn(user);
}

describe("Print checklist (Milestone 6 Part 3)", () => {
  it("single-account terminal: full-document notes render, and the print button calls window.print", async () => {
    const user = userEvent.setup();
    const { container } = render(<Wizard rulePack={RULE_PACK} />);
    await driveNomineeAlivePath(user, ["SB"]);

    // The document-level disclaimer (previously never shown on the
    // single-account terminal) renders — sourced from the engine's own
    // document, not hardcoded expectations.
    const document_ = evaluateChecklist(RULE_PACK, { "q1_schemes.SB": true }).document;
    const disclaimer = document_.disclaimers[0]?.en;
    if (!disclaimer) throw new Error("Fixture assumption broken: no disclaimer in ChecklistDocument.");
    expect(screen.getByText(disclaimer)).toBeTruthy();

    // The outcome subtree is inside the M4.3 print pipeline's area.
    const printArea = container.querySelector(".cs-print-area");
    expect(printArea).toBeTruthy();
    expect(printArea?.textContent).toContain(disclaimer);

    const printSpy = vi.spyOn(window, "print").mockImplementation(() => undefined);
    await user.click(screen.getByRole("button", { name: "Print checklist (save as PDF)" }));
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it("multi-account terminal: the results view is printable the same way", async () => {
    const user = userEvent.setup();
    const { container } = render(<Wizard rulePack={RULE_PACK} />);
    await driveNomineeAlivePath(user, ["SB", "RD"]);

    expect(screen.getByRole("heading", { name: "Your claim outcomes" })).toBeTruthy();
    const printArea = container.querySelector(".cs-print-area");
    expect(printArea).toBeTruthy();
    expect(printArea?.textContent).toContain("Your claim outcomes");

    const printSpy = vi.spyOn(window, "print").mockImplementation(() => undefined);
    await user.click(screen.getByRole("button", { name: "Print checklist (save as PDF)" }));
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it("card terminals do not offer the checklist print button (a card is not a checklist)", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "OLD_UNSURE") }));
    await continueBtn(user);

    // T1 info card is showing; no checklist print offered.
    expect(screen.queryByRole("button", { name: "Print checklist (save as PDF)" })).toBeNull();
  });
});
