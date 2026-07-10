import Link from "next/link";
import { BRAND, ROUTES } from "@claimsahayak/shared-config";
import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";
import { LanguageSwitch } from "./LanguageSwitch";

/**
 * Global header: wordmark, primary navigation, language switch, and the
 * non-affiliation micro-strip (brand guardrail #1 — every page).
 */
export function Header() {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <header className="border-b border-ink-soft/20 bg-paper">
      <div className="mx-auto flex max-w-content items-center justify-between gap-s4 px-s4 py-s3 desktop:max-w-4xl">
        <Link
          href={ROUTES.home}
          className="font-display text-question font-semibold text-peacock no-underline"
        >
          {BRAND.wordmark.en}
        </Link>
        <LanguageSwitch />
      </div>
      <nav aria-label="Primary" className="mx-auto max-w-content px-s4 pb-s3 desktop:max-w-4xl">
        <ul className="m-0 flex list-none flex-wrap gap-s4 p-0 text-ink">
          <li>
            <Link href={ROUTES.learn} className="text-peacock underline-offset-4">
              {t.navLearn}
            </Link>
          </li>
          <li>
            <Link href={ROUTES.fix} className="text-peacock underline-offset-4">
              {t.navFix}
            </Link>
          </li>
          <li>
            <Link href={ROUTES.claims} className="text-peacock underline-offset-4">
              {t.navClaims}
            </Link>
          </li>
          <li>
            <Link href={ROUTES.findHelp} className="text-peacock underline-offset-4">
              {t.navFindHelp}
            </Link>
          </li>
        </ul>
      </nav>
      <p className="m-0 bg-notice-bg px-s4 py-s2 text-center text-[16px] text-notice">
        {BRAND.independenceStrip.en}
      </p>
    </header>
  );
}
