import type { Metadata } from "next";
import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

export const metadata: Metadata = { title: "Offline" };

/** Navigation fallback precached by the service worker scaffold. */
export default function OfflinePage() {
  const t = getShellDictionary(DEFAULT_LOCALE);
  return (
    <article>
      <h1 className="mb-s3 mt-0 font-display text-h1 font-semibold">{t.offlineTitle}</h1>
      <p className="mt-0">{t.offlineBody}</p>
    </article>
  );
}
