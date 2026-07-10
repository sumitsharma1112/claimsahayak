"use client";

import { useEffect, useState } from "react";
import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

/**
 * Offline banner (shell infrastructure, not business logic): appears when
 * the browser loses connectivity and reassures the user that the app keeps
 * working (V2 §4.9 states).
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const t = getShellDictionary(DEFAULT_LOCALE);

  useEffect(() => {
    setOffline(!window.navigator.onLine);
    const goOffline = () => {
      setOffline(true);
    };
    const goOnline = () => {
      setOffline(false);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) {
    return null;
  }
  return (
    <p
      role="status"
      className="m-0 border-b border-pause/30 bg-pause-bg px-s4 py-s2 text-center text-[16px] text-pause"
    >
      {t.offlineBanner}
    </p>
  );
}
