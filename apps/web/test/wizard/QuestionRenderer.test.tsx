/**
 * Generic-renderer proof: QuestionRenderer must render correctly from
 * arbitrary Rule-Pack-shaped data alone — including hypothetical questions
 * that do not exist in the authored pack — never from a hardcoded
 * per-scheme component.
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnswerValue } from "@claimsahayak/shared-types";
import { QuestionRenderer } from "@/components/wizard/QuestionRenderer";

afterEach(cleanup);

describe("QuestionRenderer — arbitrary single-select question", () => {
  it("renders question text, why text, and every option from data alone", () => {
    render(
      <QuestionRenderer
        questionId="zz_hypothetical_single"
        text={{ en: "A totally made-up single-select question" }}
        whyText={{ en: "Because this test invented it." }}
        options={[
          { id: "alpha", label: { en: "Alpha" } },
          { id: "beta", label: { en: "Beta" }, help: { en: "Beta help text" } },
        ]}
        type="single"
        visible
        locale="en"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByRole("heading", { name: "A totally made-up single-select question" })).toBeTruthy();
    expect(screen.getByRole("radiogroup")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /Beta/ })).toBeTruthy();
    expect(screen.getByText("Beta help text")).toBeTruthy();
  });

  it("renders nothing when not visible", () => {
    const { container } = render(
      <QuestionRenderer
        questionId="zz_hidden"
        text={{ en: "Hidden" }}
        whyText={{ en: "Hidden why" }}
        options={[]}
        type="single"
        visible={false}
        locale="en"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(container.textContent).toBe("");
  });

  it("disables Continue until an answer is recorded", async () => {
    const user = userEvent.setup();
    let answer: AnswerValue | undefined;
    const onAnswer = vi.fn((next: AnswerValue) => {
      answer = next;
    });
    const { rerender } = render(
      <QuestionRenderer
        questionId="zz_gate"
        text={{ en: "Gate question" }}
        whyText={{ en: "why" }}
        options={[{ id: "a", label: { en: "A" } }]}
        type="single"
        visible
        locale="en"
        answer={answer}
        onAnswer={onAnswer}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Continue" })).toHaveProperty("disabled", true);

    await user.click(screen.getByRole("radio", { name: "A" }));
    expect(onAnswer).toHaveBeenCalledWith({ kind: "single", optionId: "a" });

    rerender(
      <QuestionRenderer
        questionId="zz_gate"
        text={{ en: "Gate question" }}
        whyText={{ en: "why" }}
        options={[{ id: "a", label: { en: "A" } }]}
        type="single"
        visible
        locale="en"
        answer={answer}
        onAnswer={onAnswer}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Continue" })).toHaveProperty("disabled", false);
  });
});

describe("QuestionRenderer — arbitrary multi-select question with an exclusive option", () => {
  it("clears other ticks when an exclusive option is chosen", async () => {
    const user = userEvent.setup();
    let answer: AnswerValue = { kind: "multi", optionIds: ["x"] };
    const onAnswer = vi.fn((next: AnswerValue) => {
      answer = next;
    });
    const options = [
      { id: "x", label: { en: "X" } },
      { id: "y", label: { en: "Y" } },
      { id: "none", label: { en: "None of these" }, exclusive: true },
    ];
    render(
      <QuestionRenderer
        questionId="zz_multi"
        text={{ en: "Pick any" }}
        whyText={{ en: "why" }}
        options={options}
        type="multi"
        visible
        locale="en"
        answer={answer}
        onAnswer={onAnswer}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "None of these" }));
    expect(onAnswer).toHaveBeenCalledWith({ kind: "multi", optionIds: ["none"] });
  });
});

describe("QuestionRenderer — hypothetical boolean question", () => {
  it("renders a generic Yes/No control with no Rule-Pack-authored options", () => {
    render(
      <QuestionRenderer
        questionId="zz_bool"
        text={{ en: "Is this a boolean question?" }}
        whyText={{ en: "why" }}
        options={[]}
        type="boolean"
        visible
        locale="en"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByRole("radio", { name: "Yes" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "No" })).toBeTruthy();
  });
});

describe("QuestionRenderer — hypothetical monthYear question", () => {
  it("renders month and year selects and gates Continue until both are picked", async () => {
    const user = userEvent.setup();
    let answer: AnswerValue | undefined;
    const onAnswer = vi.fn((next: AnswerValue) => {
      answer = next;
    });
    const { rerender } = render(
      <QuestionRenderer
        questionId="zz_when"
        text={{ en: "When did it happen?" }}
        whyText={{ en: "why" }}
        options={[]}
        type="monthYear"
        visible
        locale="en"
        answer={answer}
        onAnswer={onAnswer}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Continue" })).toHaveProperty("disabled", true);
    await user.selectOptions(screen.getByLabelText("Month"), "3");
    expect(onAnswer).toHaveBeenCalled();
    answer = { kind: "monthYear", month: 3, year: 2024 };
    rerender(
      <QuestionRenderer
        questionId="zz_when"
        text={{ en: "When did it happen?" }}
        whyText={{ en: "why" }}
        options={[]}
        type="monthYear"
        visible
        locale="en"
        answer={answer}
        onAnswer={onAnswer}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Continue" })).toHaveProperty("disabled", false);
  });
});

describe("QuestionRenderer — localization", () => {
  it("switches every visible string when the locale prop changes, with no hardcoded English leaking through", () => {
    const { rerender } = render(
      <QuestionRenderer
        questionId="zz_locale"
        text={{ en: "English text", hi: "हिन्दी पाठ" }}
        whyText={{ en: "English why", hi: "हिन्दी क्यों" }}
        options={[{ id: "a", label: { en: "English option", hi: "हिन्दी विकल्प" } }]}
        type="single"
        visible
        locale="en"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByText("English text")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "English option" })).toBeTruthy();
    expect(screen.getByText("Continue")).toBeTruthy();

    rerender(
      <QuestionRenderer
        questionId="zz_locale"
        text={{ en: "English text", hi: "हिन्दी पाठ" }}
        whyText={{ en: "English why", hi: "हिन्दी क्यों" }}
        options={[{ id: "a", label: { en: "English option", hi: "हिन्दी विकल्प" } }]}
        type="single"
        visible
        locale="hi"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByText("हिन्दी पाठ")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "हिन्दी विकल्प" })).toBeTruthy();
    expect(screen.getByText("जारी रखें")).toBeTruthy();
  });

  it("falls back to English when a locale is missing a translation", () => {
    render(
      <QuestionRenderer
        questionId="zz_fallback"
        text={{ en: "Only English exists" }}
        whyText={{ en: "why" }}
        options={[]}
        type="boolean"
        visible
        locale="hi"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    expect(screen.getByText("Only English exists")).toBeTruthy();
  });
});

describe("QuestionRenderer — keyboard navigation", () => {
  it("is reachable by Tab and toggled by Space, with no mouse involved", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(
      <QuestionRenderer
        questionId="zz_kbd"
        text={{ en: "Keyboard question" }}
        whyText={{ en: "why" }}
        options={[
          { id: "a", label: { en: "A" } },
          { id: "b", label: { en: "B" } },
        ]}
        type="single"
        visible
        locale="en"
        answer={undefined}
        onAnswer={onAnswer}
        onContinue={() => undefined}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    const optionA = screen.getByRole("radio", { name: "A" });

    // Tab forward (bounded) until the "A" option is reachable by keyboard alone
    // (real per-browser radiogroup tab-stop skipping isn't modeled by
    // jsdom/user-event, so this only asserts reachability, not an exact count).
    for (let i = 0; i < 5 && document.activeElement !== optionA; i += 1) {
      await user.tab();
    }
    expect(document.activeElement).toBe(optionA);

    await user.keyboard(" ");
    expect(onAnswer).toHaveBeenCalledWith({ kind: "single", optionId: "a" });
  });

  it("activates Continue with the Enter key once it is focused and enabled", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(
      <QuestionRenderer
        questionId="zz_kbd_continue"
        text={{ en: "Keyboard question" }}
        whyText={{ en: "why" }}
        options={[{ id: "a", label: { en: "A" } }]}
        type="single"
        visible
        locale="en"
        answer={{ kind: "single", optionId: "a" }}
        onAnswer={() => undefined}
        onContinue={onContinue}
        onBack={() => undefined}
        canGoBack={false}
      />,
    );
    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toHaveProperty("disabled", false);

    continueButton.focus();
    expect(document.activeElement).toBe(continueButton);
    await user.keyboard("{Enter}");
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
