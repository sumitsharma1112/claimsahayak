/**
 * Milestone 4.3 — local session persistence, expiry, resume, and Start Over,
 * driven end-to-end against the real RULE_PACK.
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { SESSION_STORAGE_KEY } from "@claimsahayak/shared-types";
import { Wizard } from "@/components/wizard/Wizard";
import { loadSession } from "@/lib/wizardSession";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

/** Matches only the start of the label — an option's accessible name is its label plus any help text. */
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

async function tickSchemeAndContinue(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

function storedSession(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    schemaVersion: 1,
    rulePackVersion: RULE_PACK.meta.version,
    locale: "en",
    startedAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
    answers: {
      q1_schemes: { kind: "multi", optionIds: ["SB"] },
      q2_who_died: { kind: "single", optionId: "adult" },
    },
    currentStepId: "S3",
    ...overrides,
  };
}

describe("Session persistence", () => {
  it("saves the answer set to localStorage after continuing (not before)", async () => {
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);

    await waitFor(() => {
      const stored = loadSession();
      expect(stored?.answers.q1_schemes).toEqual({ kind: "multi", optionIds: ["SB"] });
    });
  });
});

describe("Session resume flow", () => {
  it("offers to resume a valid stored session, and does not auto-resume", async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession()));
    render(<Wizard rulePack={RULE_PACK} />);

    await waitFor(() => {
      expect(screen.getByText("Resume previous claim?")).toBeTruthy();
    });
    // No auto-resume: the wizard still shows q1_schemes (the fresh start), untouched.
    expect(screen.getByRole("heading", { name: questionText("q1_schemes") })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") })).toHaveProperty(
      "checked",
      false,
    );
  });

  it("Resume restores the saved answers and jumps straight to the next unanswered question", async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession()));
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);

    await waitFor(() => screen.getByRole("button", { name: "Resume" }));
    await user.click(screen.getByRole("button", { name: "Resume" }));

    expect(screen.queryByText("Resume previous claim?")).toBeNull();
    expect(screen.getByRole("heading", { name: questionText("q3_holding") })).toBeTruthy();
  });

  it("Start New dismisses the prompt without touching storage", async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession()));
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);

    await waitFor(() => screen.getByRole("button", { name: "Start New" }));
    await user.click(screen.getByRole("button", { name: "Start New" }));

    expect(screen.queryByText("Resume previous claim?")).toBeNull();
    expect(screen.getByRole("heading", { name: questionText("q1_schemes") })).toBeTruthy();
    // Old data is left alone — a refresh would offer to resume it again.
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).not.toBeNull();
  });

  it("Clear Previous dismisses the prompt and deletes the stored session", async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession()));
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);

    await waitFor(() => screen.getByRole("button", { name: "Clear Previous" }));
    await user.click(screen.getByRole("button", { name: "Clear Previous" }));

    expect(screen.queryByText("Resume previous claim?")).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});

describe("Session expiry", () => {
  it("does not offer to resume a session older than 24 hours", async () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(storedSession({ updatedAtIso: twentyFiveHoursAgo })),
    );
    render(<Wizard rulePack={RULE_PACK} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: questionText("q1_schemes") })).toBeTruthy();
    });
    expect(screen.queryByText("Resume previous claim?")).toBeNull();
  });

  it("still offers to resume a session updated 23 hours ago", async () => {
    const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(storedSession({ updatedAtIso: twentyThreeHoursAgo })),
    );
    render(<Wizard rulePack={RULE_PACK} />);

    await waitFor(() => {
      expect(screen.getByText("Resume previous claim?")).toBeTruthy();
    });
  });
});

describe("Start Over", () => {
  it("requires confirmation, then deletes local data and restarts the wizard", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);
    await user.click(screen.getByRole("radio", { name: optionLabel("q2_who_died", "adult") }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: questionText("q3_holding") })).toBeTruthy();

    await waitFor(() => {
      expect(loadSession()?.answers.q2_who_died).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: "Start Over" }));
    // Confirmation required — nothing is deleted yet.
    expect(loadSession()?.answers.q2_who_died).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Start over?" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Yes, start over" }));

    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole("heading", { name: questionText("q1_schemes") })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: optionLabel("q1_schemes", "SB") })).toHaveProperty(
      "checked",
      false,
    );
  });

  it("Cancel leaves everything untouched", async () => {
    const user = userEvent.setup();
    render(<Wizard rulePack={RULE_PACK} />);
    await tickSchemeAndContinue(user);

    await user.click(screen.getByRole("button", { name: "Start Over" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("heading", { name: questionText("q2_who_died") })).toBeTruthy();
  });
});
