/**
 * a11y: automated axe checks on the wizard foundation components, mirroring
 * test/shell.a11y.test.tsx's pattern (kept local rather than importing from
 * that Milestone 1 file, so this Milestone 4.1 addition never has to touch
 * it).
 */
import { cleanup, render } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { QuestionRenderer } from "@/components/wizard/QuestionRenderer";
import { ResumeBanner } from "@/components/wizard/ResumeBanner";
import { DebugPanel } from "@/components/wizard/DebugPanel";

afterEach(cleanup);

async function expectNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  const summary = results.violations
    .map((v) => `${v.id}: ${v.help} (${String(v.nodes.length)} nodes)`)
    .join("\n");
  expect(results.violations, summary).toHaveLength(0);
}

describe("a11y — wizard foundation", () => {
  it("a11y: QuestionRenderer (single-select) has no axe violations", async () => {
    const { container } = render(
      <QuestionRenderer
        questionId="q_a11y_single"
        text={{ en: "An accessible single-select question" }}
        whyText={{ en: "Why we ask this." }}
        options={[
          { id: "a", label: { en: "Option A" } },
          { id: "b", label: { en: "Option B" }, help: { en: "Extra detail on B" } },
        ]}
        type="single"
        visible
        locale="en"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
      />,
    );
    await expectNoViolations(container);
  });

  it("a11y: QuestionRenderer (multi-select) has no axe violations", async () => {
    const { container } = render(
      <QuestionRenderer
        questionId="q_a11y_multi"
        text={{ en: "An accessible multi-select question" }}
        whyText={{ en: "Why we ask this." }}
        options={[
          { id: "a", label: { en: "Option A" } },
          { id: "none", label: { en: "None of these" }, exclusive: true },
        ]}
        type="multi"
        visible
        locale="en"
        answer={{ kind: "multi", optionIds: [] }}
        onAnswer={() => undefined}
        onContinue={() => undefined}
      />,
    );
    await expectNoViolations(container);
  });

  it("a11y: QuestionRenderer (monthYear) has no axe violations", async () => {
    const { container } = render(
      <QuestionRenderer
        questionId="q_a11y_monthyear"
        text={{ en: "When did it happen?" }}
        whyText={{ en: "Why we ask this." }}
        options={[]}
        type="monthYear"
        visible
        locale="en"
        answer={undefined}
        onAnswer={() => undefined}
        onContinue={() => undefined}
      />,
    );
    await expectNoViolations(container);
  });

  it("a11y: ResumeBanner has no axe violations", async () => {
    const { container } = render(
      <ResumeBanner visible locale="en" onResume={() => undefined} />,
    );
    await expectNoViolations(container);
  });

  it("a11y: DebugPanel has no axe violations", async () => {
    const { container } = render(
      <DebugPanel
        rulePackVersion="2026.01.1"
        engineVersion="0.1.0"
        currentQuestionId="q1_schemes"
        locale="en"
        answers={{}}
        visibleQuestionIds={["q1_schemes"]}
      />,
    );
    await expectNoViolations(container);
  });
});
