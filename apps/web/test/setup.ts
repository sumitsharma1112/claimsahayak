/**
 * Shared test environment setup for the web app suite.
 * jsdom lacks a handful of browser APIs the shell touches; the stubs below
 * make those calls inert and observable without changing component code.
 */

// matchMedia: consulted by future reduced-motion/media hooks; static in tests.
if (typeof window !== "undefined" && !("matchMedia" in window)) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

// scrollTo: invoked by focus management; jsdom does not implement layout.
if (typeof window !== "undefined") {
  window.scrollTo = () => undefined;
}
