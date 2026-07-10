# Folder Structure

```
claimsahayak/
├── .github/workflows/ci.yml     # Lint · typecheck · test · build · a11y · budgets
├── apps/
│   ├── web/                     # Public website (Next.js App Router)
│   │   ├── public/              #   sw.js scaffold, manifest, robots.txt
│   │   ├── src/
│   │   │   ├── app/             #   Routes: / start learn fix claims privacy
│   │   │   │                    #   about disclaimer find-help offline + 404
│   │   │   ├── components/      #   Shell: Header, Footer, SkipLink, banners,
│   │   │   │                    #   ProgressBar, LanguageSwitch, SW register
│   │   │   ├── providers/       #   ThemeProvider, AccessibilityProvider
│   │   │   ├── i18n/            #   Shell dictionary (EN/HI) — shell strings only
│   │   │   └── lib/             #   env access (single process.env read point)
│   │   └── test/                #   Behavior + axe accessibility suites
│   ├── admin/                   # Admin Portal scaffold (M10)
│   └── backend/                 # Content & event backend scaffold (M10–11)
├── packages/
│   ├── shared-types/            # Frozen contracts (pack, checklist, events…)
│   ├── shared-config/           # Brand, locales, routes, version pattern
│   ├── shared-utils/            # invariant, Result, stableStringify, contrast…
│   ├── design-tokens/           # Tokens + Tailwind preset + CSS variables
│   ├── rule-pack/                # Rule Pack: schema, data, validation, CLI (M2)
│   └── rule-engine/             # Engine scaffold: version + public surface
├── docs/                        # This documentation set
├── scripts/check-budgets.mjs    # Performance budget gate
├── budgets.json                 # V3 §5.3 critical-path allocation
├── eslint.config.mjs            # Flat config incl. UI import restrictions
├── tsconfig.base.json           # Strict TypeScript baseline for everything
├── pnpm-workspace.yaml
└── vitest.workspace.ts
```

Placement rules: user-facing strings → shell dictionary or Rule Pack;
visual values → design-tokens; contracts → shared-types; anything citing the
handbook → Rule Pack data (from M2). If a file doesn't clearly belong to one
of those homes, raise it in review before creating it.
