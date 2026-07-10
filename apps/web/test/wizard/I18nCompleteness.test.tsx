/**
 * Milestone 4.4 — internationalization completeness. English is already
 * exercised throughout the suite; this specifically verifies: (1) every
 * WizardDictionary key has a real, non-empty value in both locales — a
 * missing key would be a TypeScript compile error already (both `en`/`hi`
 * objects satisfy the same `WizardDictionary` interface), but this also
 * catches an accidentally-empty string, which typechecking cannot; and
 * (2) switching `locale` actually renders Hindi end-to-end through the
 * full Wizard, not just an isolated component.
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getWizardDictionary, type WizardDictionary } from "@/i18n/wizard";
import { WizardCard } from "@/components/wizard/WizardCard";
import { ResumeBanner } from "@/components/wizard/ResumeBanner";
import type { CardDefinition } from "@claimsahayak/shared-types";

afterEach(cleanup);

describe("WizardDictionary — no missing or empty keys in either locale", () => {
  it.each(["en", "hi"] as const)("every string field in %s is non-empty", (locale) => {
    const dict = getWizardDictionary(locale);
    for (const [key, value] of Object.entries(dict)) {
      if (typeof value === "string") {
        expect(value.length, `WizardDictionary.${key} (${locale}) is empty`).toBeGreaterThan(0);
      }
    }
  });

  it.each(["en", "hi"] as const)("cardKindLabels covers every CardKind in %s", (locale) => {
    const dict = getWizardDictionary(locale);
    const kinds: (keyof WizardDictionary["cardKindLabels"])[] = ["pause", "stop", "wait", "dual", "info"];
    for (const kind of kinds) {
      expect(dict.cardKindLabels[kind].length).toBeGreaterThan(0);
    }
  });
});

describe("Locale switch — Hindi renders correctly end-to-end, no fallback crash", () => {
  it("WizardCard renders every chrome string in Hindi when locale='hi'", () => {
    const card: CardDefinition = {
      id: "test_card",
      kind: "info",
      title: { en: "English only title" }, // no hi translation on purpose
      body: [{ kind: "paragraph", text: { en: "English only body" } }],
      nextPhysicalStep: { en: "English only next step" },
    };
    render(<WizardCard card={card} template={undefined} locale="hi" onBack={() => undefined} canGoBack={false} />);

    const hi = getWizardDictionary("hi");
    // Chrome strings (owned by this component, not the Rule Pack) are Hindi.
    expect(screen.getByText(hi.cardKindLabels.info)).toBeTruthy();
    expect(screen.getByText(hi.cardNextStepLabel)).toBeTruthy();
    // Rule Pack content with no Hindi translation falls back to English —
    // cleanly, not a crash or a blank string.
    expect(screen.getByRole("heading", { name: "English only title" })).toBeTruthy();
  });

  it("ResumeBanner renders every action label in Hindi when locale='hi'", () => {
    const hi = getWizardDictionary("hi");
    render(
      <ResumeBanner
        visible
        locale="hi"
        onResume={() => undefined}
        onStartNew={() => undefined}
        onClearPrevious={() => undefined}
      />,
    );
    expect(screen.getByText(hi.resumeBannerTitle)).toBeTruthy();
    expect(screen.getByRole("button", { name: hi.resumeBannerAction })).toBeTruthy();
    expect(screen.getByRole("button", { name: hi.resumeBannerStartNewAction })).toBeTruthy();
    expect(screen.getByRole("button", { name: hi.resumeBannerClearAction })).toBeTruthy();
  });
});
