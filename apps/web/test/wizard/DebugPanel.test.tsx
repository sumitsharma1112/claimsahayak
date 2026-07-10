/**
 * The debug panel must show engine/pack introspection in development and
 * disappear completely in a production build.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DebugPanel } from "@/components/wizard/DebugPanel";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

const baseProps = {
  rulePackVersion: "2026.01.1",
  engineVersion: "0.1.0",
  currentQuestionId: "q1_schemes",
  locale: "en" as const,
  answers: {},
  visibleQuestionIds: ["q1_schemes", "q2_who_died"],
};

describe("DebugPanel", () => {
  it("shows Rule Pack version, Engine version, current question, locale, and visible questions in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    render(<DebugPanel {...baseProps} />);
    expect(screen.getByText("2026.01.1")).toBeTruthy();
    expect(screen.getByText("0.1.0")).toBeTruthy();
    expect(screen.getByText("q1_schemes")).toBeTruthy();
    expect(screen.getByText("en")).toBeTruthy();
    expect(screen.getByText("q1_schemes, q2_who_died")).toBeTruthy();
  });

  it("renders nothing at all in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const { container } = render(<DebugPanel {...baseProps} />);
    expect(container.textContent).toBe("");
  });
});
