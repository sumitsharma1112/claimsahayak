import type { LocaleCode, LocalizedText } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";

/**
 * One selectable option. Presentation only: a native radio/checkbox input
 * wrapped in its own <label> gives correct accessible name, keyboard focus,
 * and toggling for free — no custom ARIA role is needed or added.
 */
export function OptionCard({
  inputKind,
  name,
  optionId,
  label,
  help,
  locale,
  checked,
  onChange,
}: {
  readonly inputKind: "radio" | "checkbox";
  readonly name: string;
  readonly optionId: string;
  readonly label: LocalizedText;
  readonly help?: LocalizedText | undefined;
  readonly locale: LocaleCode;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}) {
  const inputId = `${name}-${optionId}`;
  const helpId = help ? `${inputId}-help` : undefined;
  return (
    <label
      htmlFor={inputId}
      className="flex min-h-touch cursor-pointer items-start gap-s3 rounded-control border-card border-ink-soft/30 bg-paper p-s3 has-[:checked]:border-peacock has-[:checked]:bg-notice-bg"
    >
      <input
        id={inputId}
        type={inputKind}
        name={inputKind === "radio" ? name : inputId}
        checked={checked}
        aria-describedby={helpId}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
        className="mt-1 h-5 w-5 shrink-0 accent-peacock"
      />
      <span>
        <span className="text-ink">{pickText(label, locale)}</span>
        {help ? (
          <span id={helpId} className="block text-ink-soft">
            {pickText(help, locale)}
          </span>
        ) : null}
      </span>
    </label>
  );
}
