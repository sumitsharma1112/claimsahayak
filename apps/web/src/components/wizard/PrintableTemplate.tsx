import type { LocaleCode, TemplateDefinition } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Renders one Rule Pack `TemplateDefinition` as a printable letter, and a
 * "Print Letter" button that hands off to the browser's own print dialog
 * (`window.print()`) — this is deliberately NOT a PDF generator (that's a
 * separate, later milestone; `templates.ts` itself says so: "The PDF/print
 * renderer is Milestone 6 scope. This file only says WHAT the letter
 * contains"). Every field renders purely from its own `kind`
 * (staticText/blankLine/checkboxRow) — never from the template's id.
 */
export function PrintableTemplate({
  template,
  locale,
}: {
  readonly template: TemplateDefinition;
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);
  return (
    <div>
      <button
        type="button"
        className="cs-btn-secondary"
        onClick={() => {
          window.print();
        }}
      >
        {t.printLetterLabel}
      </button>
      <div className="cs-print-area mt-s3 flex flex-col gap-s3 rounded-control border border-ink-soft/20 bg-paper p-s4">
        <h3 className="m-0 font-display font-semibold text-ink">{pickText(template.title, locale)}</h3>
        {template.fields.map((field) => (
          <div key={field.id}>
            <p className="m-0 font-semibold text-ink-soft">{pickText(field.label, locale)}</p>
            {field.kind === "blankLine" ? (
              <p className="m-0 mt-s2 border-b border-ink-soft/40 pb-s4">&nbsp;</p>
            ) : (
              <p className="m-0 mt-s1 text-ink">
                {field.kind === "checkboxRow" ? "☐ " : ""}
                {field.text ? pickText(field.text, locale) : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
