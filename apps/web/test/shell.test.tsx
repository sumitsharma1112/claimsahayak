/**
 * Application-shell behavior tests: landmarks content, non-affiliation strip,
 * progress semantics, offline banner reaction, language-switch placeholder.
 */
import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProgressBar } from "@/components/ProgressBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { BRAND } from "@claimsahayak/shared-config";

afterEach(cleanup);

describe("Header", () => {
  it("renders the wordmark, primary nav, and the independence strip", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(screen.getByText(BRAND.independenceStrip.en)).toBeTruthy();
    expect(screen.getByRole("link", { name: BRAND.wordmark.en })).toBeTruthy();
  });
});

describe("Footer", () => {
  it("renders legal links and the not-legal-advice line", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Privacy" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Disclaimer" })).toBeTruthy();
    expect(
      screen.getByText(new RegExp("not legal advice", "i"))
    ).toBeTruthy();
  });
});

describe("ProgressBar", () => {
  it("exposes correct progressbar semantics and clamps values", () => {
    render(<ProgressBar current={3} total={7} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-valuemax")).toBe("7");
    expect(screen.getByText("Step 3 of 7")).toBeTruthy();

    cleanup();
    render(<ProgressBar current={99} total={7} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("7");
  });
});

describe("OfflineBanner", () => {
  it("appears when the browser reports offline and clears when back online", () => {
    const onLineSpy = vi.spyOn(window.navigator, "onLine", "get");
    onLineSpy.mockReturnValue(true);
    render(<OfflineBanner />);
    expect(screen.queryByRole("status")).toBeNull();

    act(() => {
      onLineSpy.mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status").textContent).toMatch(/offline/i);

    act(() => {
      onLineSpy.mockReturnValue(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.queryByRole("status")).toBeNull();
    onLineSpy.mockRestore();
  });
});

describe("LanguageSwitch placeholder", () => {
  it("marks Hindi as pending with aria-disabled and lang attribute", () => {
    render(<LanguageSwitch />);
    const hindi = screen.getByText("हिं");
    expect(hindi.getAttribute("aria-disabled")).toBe("true");
    expect(hindi.getAttribute("lang")).toBe("hi");
  });
});
