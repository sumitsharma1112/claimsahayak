/**
 * "Do not duplicate layouts" (Milestone 4.1 spec): the renderer must emit
 * the exact same markup regardless of viewport — responsiveness comes
 * entirely from the existing `desktop:` Tailwind breakpoint (see
 * design-tokens' tailwind-preset.ts), never from a JS layout branch. This
 * test proves there is no such branch: the same roles/content render
 * whether the viewport looks like a phone or a desktop.
 *
 * (Real visual responsive QA — that the CSS breakpoint actually reflows
 * correctly — needs a real browser; see the manual testing checklist.)
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QuestionRenderer } from "@/components/wizard/QuestionRenderer";

afterEach(cleanup);

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
}

describe("QuestionRenderer — responsive rendering", () => {
  it("renders identical structure at mobile and desktop viewport widths", () => {
    const props = {
      questionId: "zz_responsive",
      text: { en: "Responsive question" },
      whyText: { en: "why" },
      options: [
        { id: "a", label: { en: "A" } },
        { id: "b", label: { en: "B" } },
      ],
      type: "single" as const,
      visible: true,
      locale: "en" as const,
      answer: undefined,
      onAnswer: () => undefined,
      onContinue: () => undefined,
      onBack: () => undefined,
      canGoBack: false,
    };

    setViewport(375); // mobile
    const mobile = render(<QuestionRenderer {...props} />);
    const mobileMarkup = mobile.container.innerHTML;
    expect(screen.getByRole("heading", { name: "Responsive question" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    mobile.unmount();

    setViewport(1280); // desktop
    const desktop = render(<QuestionRenderer {...props} />);
    const desktopMarkup = desktop.container.innerHTML;
    expect(screen.getByRole("heading", { name: "Responsive question" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);

    expect(desktopMarkup).toBe(mobileMarkup);
  });
});
