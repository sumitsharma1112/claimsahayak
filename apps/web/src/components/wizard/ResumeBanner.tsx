import type { LocaleCode } from "@claimsahayak/shared-types";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Presentation only. Whether a resumable session exists is a persistence
 * concern for a later milestone — this component just renders the banner
 * when told to; it never reads storage or decides anything itself.
 */
export function ResumeBanner({
  visible,
  locale,
  onResume,
}: {
  readonly visible: boolean;
  readonly locale: LocaleCode;
  readonly onResume: () => void;
}) {
  const t = getWizardDictionary(locale);
  if (!visible) {
    return null;
  }
  return (
    <div role="status" className="mb-s4 rounded-control border border-notice/30 bg-notice-bg p-s3">
      <p className="m-0 font-semibold text-notice">{t.resumeBannerTitle}</p>
      <p className="mb-s2 mt-s1 text-ink-soft">{t.resumeBannerBody}</p>
      <button type="button" className="cs-btn-secondary" onClick={onResume}>
        {t.resumeBannerAction}
      </button>
    </div>
  );
}
