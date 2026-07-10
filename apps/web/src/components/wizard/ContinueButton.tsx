import type { LocaleCode } from "@claimsahayak/shared-types";
import { getWizardDictionary } from "@/i18n/wizard";

/** Presentation only: the existing `.cs-btn-primary` shell button style. */
export function ContinueButton({
  locale,
  disabled,
  onClick,
}: {
  readonly locale: LocaleCode;
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  const t = getWizardDictionary(locale);
  return (
    <button
      type="button"
      className="cs-btn-primary mt-s4 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      {t.continueLabel}
    </button>
  );
}
