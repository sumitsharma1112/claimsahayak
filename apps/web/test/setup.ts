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

// <dialog> showModal()/close(): jsdom parses the element but doesn't implement
// these methods at all (no native top-layer/backdrop support) — this stub
// gives the same observable `open` state and `close` event a real browser
// provides. Unconditional: this file only loads under vitest's jsdom
// environment, never in a real browser, so there's nothing real to clobber.
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};
