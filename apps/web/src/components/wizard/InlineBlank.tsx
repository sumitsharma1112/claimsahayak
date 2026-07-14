/**
 * Milestone 16 — one inline blank within a flowing paragraph (shared by
 * `OfficialFormView` for Tier A forms and `PrintableTemplate`'s
 * `richParagraph` fields for Tier B documents whose real wording is a
 * paragraph with embedded blanks, e.g. the reconciliation certificate):
 * the resolved (and formatted) value when known, visually distinct
 * (solid) from a genuinely empty blank — an underline run, matching how
 * the real, printed form shows unfilled space, not a placeholder phrase
 * mid-sentence.
 */
export function InlineBlank({ value, blankLabel }: { readonly value: string | undefined; readonly blankLabel: string }) {
  if (value) {
    return <span className="font-semibold text-ink">{` ${value} `}</span>;
  }
  return (
    <span className="inline-block min-w-[6em] border-b border-ink-soft/60 align-baseline" title={blankLabel}>
      {" "}
    </span>
  );
}
