import type { LocaleCode, LocalizedText } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";

/**
 * Announces that editing an earlier answer changed this account's route
 * (Milestone 4.2 §5). Presentation only: the banner text is always a Rule
 * Pack `RouteRule.banner` value passed in by the caller — never authored
 * here. `aria-live="polite"` (plus `role="status"`, which implies the
 * same) so screen readers announce the change without stealing focus.
 */
export function RerouteBanner({
  banner,
  locale,
}: {
  readonly banner: LocalizedText | undefined;
  readonly locale: LocaleCode;
}) {
  if (!banner) {
    return null;
  }
  return (
    <p
      role="status"
      aria-live="polite"
      className="m-0 rounded-control border border-notice/30 bg-notice-bg px-s3 py-s2 text-notice"
    >
      {pickText(banner, locale)}
    </p>
  );
}
