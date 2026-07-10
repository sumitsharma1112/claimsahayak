import Link from "next/link";
import { BRAND, ROUTES } from "@claimsahayak/shared-config";
import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

/** Global footer with legal links and the rules-review line (V2 §7 nav map). */
export function Footer() {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <footer className="mt-s8 border-t border-ink-soft/20 bg-paper">
      <div className="mx-auto max-w-content px-s4 py-s5 desktop:max-w-4xl">
        <nav aria-label="Footer">
          <ul className="m-0 flex list-none flex-wrap gap-s4 p-0">
            <li>
              <Link href={ROUTES.about} className="text-peacock">
                {t.footerAbout}
              </Link>
            </li>
            <li>
              <Link href={ROUTES.privacy} className="text-peacock">
                {t.footerPrivacy}
              </Link>
            </li>
            <li>
              <Link href={ROUTES.disclaimer} className="text-peacock">
                {t.footerDisclaimer}
              </Link>
            </li>
            <li>
              <Link href={ROUTES.findHelp} className="text-peacock">
                {t.navFindHelp}
              </Link>
            </li>
          </ul>
        </nav>
        <p className="mb-0 mt-s4 text-[16px] text-ink-soft">
          {BRAND.independenceStrip.en} {BRAND.notLegalAdvice.en}
        </p>
        <p className="mb-0 mt-s2 text-[16px] text-ink-soft">
          {t.footerRulesReviewed}: —
        </p>
      </div>
    </footer>
  );
}
