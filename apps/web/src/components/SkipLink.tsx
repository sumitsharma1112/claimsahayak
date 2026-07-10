import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

export function SkipLink() {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <a href="#main-content" className="cs-skip-link">
      {t.skipToContent}
    </a>
  );
}
