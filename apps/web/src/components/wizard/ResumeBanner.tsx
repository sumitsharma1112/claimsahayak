import type { LocaleCode } from "@claimsahayak/shared-types";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Presentation only. Whether a resumable session exists is decided by the
 * caller (Wizard reads `wizardSession.ts`'s `loadSession()`) — this
 * component never touches storage itself, and never resumes automatically:
 * the user always makes one of three explicit choices (Milestone 4.3 §2).
 */
export function ResumeBanner({
  visible,
  locale,
  onResume,
  onStartNew,
  onClearPrevious,
}: {
  readonly visible: boolean;
  readonly locale: LocaleCode;
  readonly onResume: () => void;
  readonly onStartNew: () => void;
  readonly onClearPrevious: () => void;
}) {
  const t = getWizardDictionary(locale);
  if (!visible) {
    return null;
  }
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-s4 rounded-control border border-notice/30 bg-notice-bg p-s3"
    >
      <p className="m-0 font-semibold text-notice">{t.resumeBannerTitle}</p>
      <p className="mb-s2 mt-s1 text-ink-soft">{t.resumeBannerBody}</p>
      <div className="flex flex-wrap gap-s3">
        <button type="button" className="cs-btn-primary flex-1" onClick={onResume}>
          {t.resumeBannerAction}
        </button>
        <button type="button" className="cs-btn-secondary flex-1" onClick={onStartNew}>
          {t.resumeBannerStartNewAction}
        </button>
        <button type="button" className="cs-btn-secondary flex-1" onClick={onClearPrevious}>
          {t.resumeBannerClearAction}
        </button>
      </div>
    </div>
  );
}
