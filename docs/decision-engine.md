# The Decision Engine (Milestone 3)

`packages/rule-engine` is the pack's ONLY evaluator: `checklist =
f(rulePack, answers)`, deterministic and side-effect free (V3 §2.4, §2.5).
It has no dependency on `@claimsahayak/rule-pack` (that would be circular
— `rule-pack` already depends on `rule-engine` for `ENGINE_VERSION`), so it
operates on any well-typed `RulePack` value handed to it.

## Layout

```
packages/rule-engine/src/
├── condition.ts        The restricted Condition evaluator (and/or/not/
│                        ==/in/>=/var) — see the note below on operator
│                        coverage.
├── derived.ts           Pure date-derived-value helpers (monthsSinceDeath,
│                        overSixMonths, overTenYears, freezeRequired).
│                        Never reads the wall clock itself.
├── variables.ts         Builds the flat Condition variable assignment
│                        (answers.*, account.*, scheme.*, derived.*,
│                        constants.*) for one account.
├── visibility.ts         Question visibility.
├── invalidation.ts       The answer-invalidation cascade.
├── routing.ts            Priority-ordered route resolution.
├── outputs.ts            Output-bucket collection (route/card/system).
├── overlay.ts            Q10 + system-flag overlay resolution.
├── sections.ts           Dedupe (by refId) → sort (by sortOrder) → group
│                        into declared-order sections → lift good-to-know/
│                        verification-panel to the document level.
├── account.ts            evaluateAccount(): one scheme's AccountChecklist.
├── checklist.ts          evaluateChecklist(): every account for a session.
├── validate-answers.ts   validateAnswers(): structural issues, never throws.
├── hash.ts / loader.ts / fallback-pack.ts
│                        Content-hash + engineMin validation, and the
│                        engine's own tiny bundled fallback pack.
└── index.ts              Public API surface.
```

## Two non-obvious rulings the truth-table fixtures forced

1. **A `"card"`-kind terminal produces no checklist of its own.** `T2`
   (`card_guardian_change`) has real authored outputs in the pack
   (`T2_GUARDIAN_CHANGE_OUTPUTS`), but `fx06`'s expected `outputBuckets` is
   `["GLOBAL"]` only. Every card-kind route is a dead end/pause — no real
   claim checklist exists yet — so the engine only ever adds the shared
   GLOBAL good-to-know block for a card, never any fired rule's own T-id
   extras. Only a `"route"`-kind terminal (an account that actually
   resolves to a payable checklist) pulls in the full fired-rule extra set.
2. **`T1` (the old/discontinued-scheme info-end card) also drops GLOBAL.**
   `fx21`'s expected `outputBuckets` is `[]` — not even the otherwise
   universal good-to-know block. This is the one exception among cards,
   because `T1` represents an account that isn't really in this system's
   scope at all.

## Operator coverage

Milestone 3's brief names `>`, `<`, `<=` alongside `and/or/not/==/in/>=`.
The frozen `Condition` union (`packages/shared-types/src/condition.ts`) is
closed to exactly the latter six, and no route or question in the
authored pack uses the other three (every numeric comparison is phrased
as `>=` against a named constant). Since "Do NOT modify Rule Pack schema"
applies to this milestone, `condition.ts` implements exactly the six
operators the schema can express.

## The content-hash placeholder

`RULE_PACK.meta.contentHash` is still the documented all-zeros placeholder
(the real digest is only stamped by `build-pack` at publish time). The
loader treats that specific value as "not yet stamped, trust the
structure" rather than a verification failure, so today's in-development
pack loads normally; a real, non-placeholder hash that doesn't match its
own body is still rejected and falls back.

## Running the tests

```bash
pnpm --filter @claimsahayak/rule-engine test
```

`test/truth-table.test.ts` runs all 25 Milestone 2 fixtures unmodified;
`test/routes-t5-t6.test.ts` adds the two routes (T5, T6) the fixture file
doesn't happen to exercise, so every T1–T21 route has direct coverage.
