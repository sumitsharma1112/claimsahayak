/**
 * Fixes a real reported bug: inside the assembled Complete Claim File,
 * every document sits under one shared `.cs-print-area` (Wizard.tsx), so
 * a per-document "Print" button that just called `window.print()` always
 * printed the WHOLE file, not the one document the Postmaster clicked —
 * there was no way to hand a claimant just the reconciliation-certificate
 * request, or print one replacement page, without printing everything.
 *
 * Finds the button's own enclosing `.cs-print-page` (the per-document
 * page wrapper `ClaimPackage.tsx` already gives every document) and marks
 * it as the sole page to print via a body-level class — every other
 * `.cs-print-page` is force-hidden for that one print job only (see the
 * `cs-print-isolate` rule in globals.css). Cleans up on the browser's own
 * `afterprint` event (fires whether the user printed or cancelled), with
 * a generous fallback timeout as a safety net in case that event is ever
 * missed, so screen rendering is never left in a stuck state.
 *
 * Outside the Claim Package (e.g. a lone pre-decision pause-card letter,
 * WizardCard.tsx), there is no sibling `.cs-print-page` to hide from —
 * this degrades to a plain `window.print()`, unchanged from before.
 */
export function printSingleDocument(trigger: HTMLElement | null): void {
  const page = trigger?.closest<HTMLElement>(".cs-print-page");
  if (!page) {
    window.print();
    return;
  }
  page.classList.add("cs-print-isolate-target");
  document.body.classList.add("cs-print-isolate");

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    page.classList.remove("cs-print-isolate-target");
    document.body.classList.remove("cs-print-isolate");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  // Safety net only — afterprint fires reliably in every supported
  // browser, but a generous fallback avoids a permanently stuck isolate
  // state if it's ever missed (e.g. an unusual print-to-PDF flow).
  setTimeout(cleanup, 60_000);

  window.print();
}
