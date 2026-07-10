import Link from "next/link";
import { ROUTES } from "@claimsahayak/shared-config";
import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

/**
 * Shared placeholder body for routes whose implementation is scheduled in a
 * later milestone (Master Prompt 1 §7: pages exist, business logic does not).
 */
export function MilestonePlaceholder({
  title,
  milestone
}: {
  readonly title: string;
  readonly milestone: string;
}) {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <article>
      <h1 className="mb-s3 mt-0 font-display text-h1 font-semibold">{title}</h1>
      <p className="mb-s2 mt-0 font-semibold text-ink-soft">
        {t.placeholderTitlePrefix}: {milestone}
      </p>
      <p className="mt-0">{t.placeholderBody}</p>
      <p>
        <Link href={ROUTES.home} className="text-peacock">
          ← {getShellDictionary(DEFAULT_LOCALE).notFoundCta}
        </Link>
      </p>
    </article>
  );
}
