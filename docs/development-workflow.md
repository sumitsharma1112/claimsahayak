# Development Workflow

## The prime directive

The four specification documents are immutable. Implementation follows them
exactly; ambiguity is escalated (a "Needs Verification" entry), never
guessed. **Claim rules never enter TypeScript** — they are Rule Pack data
(Milestone 2 onward). If a change would need a handbook/SB-Order citation,
it belongs in data.

## Branch & review flow

1. One milestone (or one milestone sub-task) per branch.
2. Every PR must keep `pnpm lint`, `pnpm typecheck`, `pnpm test`,
   `pnpm build`, and `pnpm budgets` green — CI enforces all five plus
   Prettier formatting.
3. New user-facing strings go through the shell dictionary (M1) or the Rule
   Pack (M2+). Hard-coded strings in components fail review.
4. New colors/sizes/motion are forbidden outside `packages/design-tokens`.
5. Every terminal UI state must offer a next physical step (no-dead-end
   rule) — reviewers check this like they check types.

## Testing conventions

- Unit tests live in each package's `test/` directory (`vitest run`).
- Shell components carry axe checks (`apps/web/test/shell.a11y.test.tsx`);
  any new shell component gets an axe case in the same PR.
- Contract changes require updating
  `packages/shared-types/test/contracts.test.ts` — the compile-time
  guarantees are part of the spec, not decoration.

## Versioning discipline (V3 §2.6)

- `ENGINE_VERSION` lives only in `packages/rule-engine` and is stamped into
  every checklist and PDF from Milestone 3.
- Rule Packs use `YYYY.MM.patch`, are immutable once published, and roll
  back by repointing — never by rewriting.

## Milestone boundaries

Work only inside the current milestone's scope from the Execution Roadmap.
Scaffolding for future milestones is welcome only where the roadmap names it
(e.g. the strategy registry in `sw.js`); implementations are not.
