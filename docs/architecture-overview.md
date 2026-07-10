# Architecture Overview (Milestone 1 state)

Authoritative design: **Version 3 Architecture Document** (frozen). This page
maps that document onto the repository.

## Three deployable units (V3 §1.1)

1. **Public website** — `apps/web`. Static-first Next.js; after Milestone 2
   it consumes one versioned, immutable Rule Pack JSON (CDN with bundled
   fallback). It has **no runtime dependency** on the backend.
2. **Content & event backend** — `apps/backend`. Milestone 1 ships a
   dependency-free HTTP scaffold (health endpoint, graceful shutdown). The
   content store, publish pipeline (M10) and anonymous event ingestion (M11)
   attach here.
3. **Admin Portal** — `apps/admin`. Separate origin, never linked from the
   public site. Milestone 1 ships the application scaffold only.

## The data/code split (V3 §2.2)

*If changing something would require citing an SB Order, it is data.*
`packages/shared-types` freezes the structures that data flows through:

- `RulePack` — questions, routes (T1–T21), outputs with the four mandatory
  attributes, overlays, cards (each with `nextPhysicalStep`), documents,
  forms, printable templates, portable-text content, vocabulary map, and
  named constants (e.g. `AFFIDAVIT_LIMIT_INR`).
- `Condition` — the restricted JSON-logic subset
  (`and / or / not / == / in / >= / var`), a closed union.
- `ChecklistDocument` — the single contract between the engine and every
  consumer (result page, PDF, future assistant/OCR). No timestamp field:
  identical inputs must yield byte-identical output (invariant I-1).
- `AnalyticsEvent` — anonymous by construction (invariant I-2): closed
  enums, categorical ids, derived booleans; no free text, no raw dates.
- `SessionState` — device-only wizard state, pinned to a rule-pack version,
  24-hour TTL.

## Design system

`packages/design-tokens` encodes Blueprint v2 §5 exactly: palette (paper /
ink / peacock / stamp and the four state pairs), Bricolage Grotesque +
Noto Sans (Devanagari-ready) typography, the 4 px spacing scale, radii,
elevation, the two real breakpoints, the 150 ms/400 ms motion budget, and
the 3 px peacock focus ring. A WCAG-AA contrast test runs over every
declared text/background pair. Consumption paths: typed tokens, the
Tailwind preset, or CSS variables injected once by `ThemeProvider` — never
literal values in app code.

## Offline architecture scaffold

`apps/web/public/sw.js` fixes the framework: versioned cache namespace,
activate-time cleanup, and a strategy registry evaluated by a final fetch
handler. The registry is **empty by data** at Milestone 1 (all requests pass
through); caching strategies are added as registry entries per V3 §5.3
without changing the handler.

## Security posture at M1

Strict security headers (CSP, HSTS, frame-deny, referrer policy) ship with
the shell; the admin origin is `noindex` and expected to sit behind edge
auth until Milestone 10 delivers application auth. No cookies, no trackers,
no PII surface exists.
