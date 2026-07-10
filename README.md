# ClaimSahayak

**Independent guide for preparing Post Office savings death-claim applications.**
Not an official India Post website. Free, private, and not legal advice.

This repository implements the four-document frozen specification (SRS v1,
Blueprint v2, Architecture v3, Execution Roadmap). **Milestone 1 — Project
Foundation** is complete: monorepo, contracts, design tokens, application
shell, service-worker scaffold, CI, and documentation. No business logic
exists anywhere in this codebase yet — claim rules arrive only as Rule Pack
data in Milestone 2 (architectural invariant I-1/I-2 of V3).

## What lives where

| Path | Purpose |
|---|---|
| `apps/web` | Public website (Next.js App Router). Static-first, offline-capable, mobile-first. |
| `apps/admin` | Admin Portal scaffold (separate origin; implemented in Milestone 10). |
| `apps/backend` | Content & event backend scaffold (dependency-free health server until M10–11). |
| `packages/shared-types` | Frozen TypeScript contracts: Rule Pack, Checklist JSON, analytics events, session state, restricted condition subset. |
| `packages/design-tokens` | The Blueprint v2 §5 design system as typed tokens + Tailwind preset + CSS variables. |
| `packages/rule-pack` | The complete, versioned Rule Pack (Milestone 2): schema, authored data (schemes/questions/routes/outputs/overlays/documents/forms/cards/templates/content/vocab), validation pipeline, truth-table fixtures, and CLI. |
| `packages/rule-engine` | Decision Engine package — scaffold only (public surface + version). Evaluator lands in Milestone 3. |
| `packages/shared-utils` | Generic utilities (invariant, Result, stable stringify, WCAG contrast math, Indian number formatting). |
| `packages/shared-config` | Brand constants & guardrails, locale registry, route registry, rule-pack version pattern. |
| `docs/` | Architecture overview, getting started, workflow, folder structure. |
| `scripts/check-budgets.mjs` | Performance-budget gate (V3 §5.3 allocation). |

## Quick start

```bash
corepack enable            # provides pnpm 9
pnpm install
pnpm dev:web               # public site on http://localhost:3000
pnpm test                  # all workspace tests
pnpm lint && pnpm typecheck

# Rule Pack (Milestone 2)
pnpm validate-pack         # full publish gate: schema, reachability, orphans,
                           #   no-dead-end, locale-parity, copy-lint,
                           #   provenance, truth-table referential integrity
pnpm lint-pack             # fast subset for content editing: copy-lint,
                           #   locale-parity, provenance
pnpm build-pack            # computes the real contentHash and emits
                           #   packages/rule-pack/dist/rule-pack.<version>.json
```

See `docs/getting-started.md` for the full guide and `docs/development-workflow.md`
for the rules every change must follow.

## Non-negotiable invariants (enforced, not aspirational)

1. **No business rules in code.** Claim rules exist only inside Rule Packs.
   ESLint restrictions + (from M4) a grep-audit keep UI components rule-free.
2. **No personal information.** The analytics contract has no free-text
   fields; the death month/year type can never leave the device (see
   `packages/shared-types/test/contracts.test.ts`).
3. **Determinism.** `ChecklistDocument` carries `rulePackVersion` +
   `engineVersion` and no wall-clock field.
4. **Brand guardrails.** The independence strip renders on every page and is
   test-enforced (`packages/shared-config/test/brand.test.ts`).
5. **Accessibility floor.** WCAG-AA contrast is a build-time test on the
   token palette; axe runs on every shell component in CI.
