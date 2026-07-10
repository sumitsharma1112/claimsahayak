/**
 * Public route registry (V2 §2 Information Architecture).
 * Single source of truth for paths so navigation, sitemap generation (M9)
 * and tests never drift.
 */
export const ROUTES = {
  home: '/',
  start: '/start',
  checklist: '/start/checklist',
  fix: '/fix',
  learn: '/learn',
  claims: '/claims',
  findHelp: '/find-help',
  about: '/about',
  privacy: '/privacy',
  disclaimer: '/disclaimer',
  offline: '/offline',
} as const;

export type RouteKey = keyof typeof ROUTES;
