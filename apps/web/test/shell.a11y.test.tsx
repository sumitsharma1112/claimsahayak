/**
 * a11y: automated axe checks on shell components (CI accessibility job).
 * The color-contrast rule is disabled in jsdom (no layout engine); contrast
 * is guaranteed separately by the design-token contrast test suite.
 */
import { cleanup, render } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProgressBar } from "@/components/ProgressBar";
import { SkipLink } from "@/components/SkipLink";

afterEach(cleanup);

async function expectNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } }
  });
  const summary = results.violations
    .map((v) => `${v.id}: ${v.help} (${String(v.nodes.length)} nodes)`)
    .join("\n");
  expect(results.violations, summary).toHaveLength(0);
}

describe("a11y — application shell", () => {
  it("a11y: Header has no axe violations", async () => {
    const { container } = render(
      <>
        <SkipLink />
        <Header />
      </>
    );
    await expectNoViolations(container);
  });

  it("a11y: Footer has no axe violations", async () => {
    const { container } = render(<Footer />);
    await expectNoViolations(container);
  });

  it("a11y: ProgressBar has no axe violations", async () => {
    const { container } = render(<ProgressBar current={2} total={7} />);
    await expectNoViolations(container);
  });
});
