"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { usePathname } from "next/navigation";

/**
 * Accessibility scaffold (M1):
 *  - focus management: on client-side navigation, focus moves to #main-content
 *    so keyboard and screen-reader users start at the new page's content;
 *  - route announcer: aria-live announcement of the new document title;
 *  - large-text toggle: persists on the device and flips the html attribute
 *    consumed by globals.css (spec: user large-text bumps base to 20px).
 * Reduced motion is handled purely in CSS (prefers-reduced-motion).
 */

const LARGE_TEXT_KEY = "claimsahayak.a11y.largeText";

interface AccessibilityContextValue {
  readonly largeText: boolean;
  readonly setLargeText: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within <AccessibilityProvider>");
  }
  return ctx;
}

export function AccessibilityProvider({
  children
}: {
  readonly children: ReactNode;
}) {
  const pathname = usePathname();
  const [largeText, setLargeTextState] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);

  // Restore the device-local large-text preference.
  useEffect(() => {
    try {
      setLargeTextState(window.localStorage.getItem(LARGE_TEXT_KEY) === "true");
    } catch {
      // Storage unavailable (private mode): keep the in-memory default.
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-large-text", String(largeText));
  }, [largeText]);

  const setLargeText = useCallback((value: boolean) => {
    setLargeTextState(value);
    try {
      window.localStorage.setItem(LARGE_TEXT_KEY, String(value));
    } catch {
      // Non-fatal: preference simply won't persist.
    }
  }, []);

  // Route-change focus management + announcement.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const main = document.getElementById("main-content");
    if (main) {
      main.focus({ preventScroll: false });
    }
    setAnnouncement(document.title);
  }, [pathname]);

  const value = useMemo(
    () => ({ largeText, setLargeText }),
    [largeText, setLargeText]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="cs-visually-hidden">
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
}
