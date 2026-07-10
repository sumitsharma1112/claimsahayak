/**
 * Milestone 4.3 — offline support (no network dependency) and the
 * progressive-enhancement Read Aloud control.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Wizard } from "@/components/wizard/Wizard";
import { ReadAloudButton } from "@/components/wizard/ReadAloudButton";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

function optionLabel(questionId: string, optionId: string): string {
  const q = RULE_PACK.questions.find((q) => q.id === questionId);
  const opt = q?.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`Fixture assumption broken: "${questionId}.${optionId}" missing.`);
  return opt.label.en;
}

describe("Offline support", () => {
  it("shows the (existing, global) offline banner when the browser reports offline", () => {
    const onLineSpy = vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    render(<OfflineBanner />);
    expect(screen.getByRole("status").textContent).toMatch(/offline/i);
    onLineSpy.mockRestore();
  });

  it("keeps the wizard fully operable — answering and advancing — while offline, with zero network calls", async () => {
    const onLineSpy = vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    const fetchSpy = vi.spyOn(window, "fetch").mockImplementation(() => {
      throw new Error("No network access should be attempted by the wizard.");
    });

    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const q2 = RULE_PACK.questions.find((q) => q.id === "q2_who_died");
    if (!q2) throw new Error("Fixture assumption broken.");
    expect(screen.getByRole("heading", { name: q2.text.en })).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();

    onLineSpy.mockRestore();
    fetchSpy.mockRestore();
  });
});

describe("Read Aloud — progressive enhancement", () => {
  it("renders nothing when the browser has no speechSynthesis support", () => {
    const original = Object.getOwnPropertyDescriptor(window, "speechSynthesis");
    // Simulate an unsupported browser: the property doesn't exist at all.
    Reflect.deleteProperty(window, "speechSynthesis");

    const { container } = render(<ReadAloudButton text={{ en: "Hello" }} locale="en" />);
    expect(container.textContent).toBe("");

    if (original) {
      Object.defineProperty(window, "speechSynthesis", original);
    }
  });

  it("speaks the given text in the requested locale when speechSynthesis is available", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak, cancel },
    });
    // jsdom doesn't implement the Web Speech API at all; a minimal
    // constructor is enough to prove the wizard builds/speaks an utterance.
    const utteranceCtor = vi.fn(function (this: { text: string; lang: string }, text: string) {
      this.text = text;
      this.lang = "";
    });
    vi.stubGlobal("SpeechSynthesisUtterance", utteranceCtor);

    const user = userEvent.setup();
    render(<ReadAloudButton text={{ en: "Who has passed away?" }} locale="en" />);

    const button = await screen.findByRole("button", { name: "Read question aloud" });
    await user.click(button);

    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0]?.[0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe("Who has passed away?");
    expect(utterance.lang).toBe("en-IN");
  });
});
