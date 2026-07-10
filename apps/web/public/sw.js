/**
 * ClaimSahayak service worker — Milestone 1 scaffold.
 *
 * Architecture (V3 §5.3): stale-while-revalidate for static assets, pinned
 * rule pack per session, offline fallback page. Milestone 1 ships the
 * FRAMEWORK ONLY: lifecycle handling, versioned cache namespace, and a
 * strategy registry that is intentionally EMPTY BY DATA. Caching strategies
 * are added as registry entries in later milestones — the fetch handler
 * below is final and does not change.
 */
const SW_VERSION = 'm1-scaffold-1';
const CACHE_NAMESPACE = `claimsahayak-${SW_VERSION}`;

/**
 * Strategy registry: ordered [matcher, handler] pairs. Empty at Milestone 1,
 * so every request passes through to the network unchanged.
 * @type {Array<{ matches: (request: Request) => boolean, handle: (event: FetchEvent) => Promise<Response> }>}
 */
const strategies = [];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('claimsahayak-') && name !== CACHE_NAMESPACE)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const strategy = strategies.find((s) => s.matches(event.request));
  if (strategy) {
    event.respondWith(strategy.handle(event));
  }
  // No matching strategy: fall through to the network (browser default).
});
