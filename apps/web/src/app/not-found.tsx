import Link from "next/link";
import { ROUTES } from "@claimsahayak/shared-config";
import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

export default function NotFound() {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <article>
      <h1 className="mb-s3 mt-0 font-display text-h1 font-semibold">
        {t.notFoundTitle}
      </h1>
      <p className="mt-0">{t.notFoundBody}</p>
      <p>
        <Link href={ROUTES.home} className="cs-btn-primary max-w-content">
          {t.notFoundCta}
        </Link>
      </p>
    </article>
  );
}
