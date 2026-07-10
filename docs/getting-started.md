# Getting Started

## Prerequisites

- Node.js ≥ 20 (LTS)
- pnpm ≥ 9 (`corepack enable` provides it)

## Install & run

```bash
pnpm install
cp .env.example .env        # optional at M1; defaults work for local dev

pnpm dev:web       # public site      → http://localhost:3000
pnpm dev:admin     # admin scaffold   → http://localhost:3100
pnpm dev:backend   # backend scaffold → http://localhost:8080/health
```

The first successful `pnpm install` creates `pnpm-lock.yaml`; commit it —
CI installs with `--frozen-lockfile`.

## Verify your environment

```bash
pnpm lint            # ESLint (strict type-checked config)
pnpm typecheck       # tsc across every package and app
pnpm test            # Vitest across the workspace (incl. axe a11y suite)
pnpm build           # production builds
pnpm budgets         # performance-budget manifest gate
```

All six commands must pass before any commit (see development-workflow.md).

## Service worker note

`public/sw.js` registers in production builds only, so local development
never fights a stale worker. To exercise it locally:
`pnpm --filter @claimsahayak/web build && pnpm --filter @claimsahayak/web start`.
