import Link from "next/link";
import type { Metadata } from "next";
import { BRAND, ROUTES } from "@claimsahayak/shared-config";
import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

export const metadata: Metadata = {
  description: `Prepare complete Post Office savings death-claim papers before you visit. ${BRAND.independenceStrip.en}`
};

/**
 * Home (V2 §4.1 wireframe): headline, the three promises, primary Start CTA,
 * and the recovery-flow entry. Static shell only — the wizard arrives in M4,
 * the recovery module in M8.
 */
export default function HomePage() {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <article>
      <h1 className="mb-s3 mt-0 font-display text-h1 font-semibold">
        {t.homeHeadline}
      </h1>
      <p className="mt-0">{t.homeSub}</p>

      <ul className="m-0 flex list-none flex-wrap gap-s4 p-0 py-s3" aria-label="Our promises">
        <li className="font-semibold text-ok">✓ {t.promiseComplete}</li>
        <li className="font-semibold text-ok">✓ {t.promisePrivate}</li>
        <li className="font-semibold text-ok">✓ {t.promiseFree}</li>
      </ul>

      <div className="flex flex-col gap-s3 py-s3">
        <Link href={ROUTES.start} className="cs-btn-primary">
          ▶ {t.ctaStart}
        </Link>
        <Link href={ROUTES.fix} className="cs-btn-secondary">
          ↩ {t.ctaFix}
        </Link>
      </div>
    </article>
  );
}
