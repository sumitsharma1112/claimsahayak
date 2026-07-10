"use client";

import { useEffect } from "react";

/**
 * Registers the offline scaffold service worker (public/sw.js).
 * Registration is production-only so local development never fights a
 * stale worker. Failure is non-fatal: the site is fully usable without it.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    if (!("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline enhancement unavailable; the application continues normally.
    });
  }, []);
  return null;
}
