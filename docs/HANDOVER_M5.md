# ClaimSahayak — Milestone 5 Handover

**Purpose of this document**: a brand-new Claude Code (or human) session should be able to read this file alone and continue development without re-deriving any architectural decision made in M1–M5. Where this document and the code disagree, **the code is the source of truth** — this file describes state as of the M5 commit named below; re-verify anything load-bearing with `git log`/`git blame` before acting on it.

---

## 1. Current Git branch

`master` — the only branch in this repository. There is no long-lived `develop`/feature-branch convention; work happens directly on `master` and is pushed after each milestone (or milestone sub-part) is verified.

## 2. Latest commit SHA / pending changes

- **Parent commit** (Part 1 of M5 — Rule Book → Rule Pack conversion): `e6d17d745175faf3b949de82387a89fd6b6ce737` — `feat(rulebook-v1.0): integrate ClaimSahayak Official Rule Book v1.0 into Rule Pack` — already pushed to `origin/master`.
- **This handover** is being written, committed, and pushed together with the remainder of M5 (Parts 2–6: Rule Engine decision assembly, Wizard UI wiring, consolidated validation report) in a single new commit titled `feat(m5): complete Rule Book integration and end-to-end claim workflow`. **Run `git log -1` for the exact SHA** — it cannot be predicted in advance (it's a hash of this file's own content, among others).
- Before that commit, the working tree had **22 pending files** (17 modified, 5 new) — see §9.

## 3. Repository structure

pnpm workspace monorepo, no Turborepo/Nx (root scripts just call `pnpm -r --parallel <script>`).

```
apps/
  web/          — public Next.js 15 (App Router) site; the Wizard lives here
  admin/        — Admin Portal scaffold (M10 territory, not started)
  backend/      — dependency-free HTTP scaffold (M10/M11 territory, not started)
packages/
  shared-types/ — frozen contracts: RulePack, ChecklistDocument, SessionState, etc.
  shared-config/— brand constants, locale registry, route registry, version-pattern regex
  shared-utils/ — invariant, Result<T,E>, stable-stringify, contrast, format (formatInr etc.), cn
  design-tokens/— Blueprint v2 §5 design system (colors, Tailwind preset)
  rule-pack/    — THE business-rule data: schema/validators/authored data/CLI tools/fixtures
  rule-engine/  — the pure Decision Engine: checklist = f(rulePack, answers)
knowledge-base/ — research-only: the ClaimSahayak Official Rule Book v1.0 (source documents,
                  NOT application code — never imported by app code, read only during authoring)
docs/           — this file, plus architecture-overview.md, decision-engine.md, rule-pack.md,
                  development-workflow.md, folder-structure.md, getting-started.md, m4-acceptance.md
scripts/        — check-budgets.mjs (perf budget gate)
```

## 4. Architecture overview

Strict layering, enforced by convention (not a lint rule, though a grep-audit exists — see §11):

```
knowledge-base/ (research)
      │  (human/agent authors from this, by hand, into...)
      ▼
packages/rule-pack/src/data/*.ts  (the ONLY place business rules live)
      │  parsed/validated by packages/rule-pack/src/schema+validate/*
      ▼
packages/rule-engine  (pure functions: RulePack + answers → ChecklistDocument/ClaimDecision)
      │  imported by...
      ▼
apps/web  (Wizard UI — renders whatever the engine returns; contains ZERO business logic)
```

Invariants that hold across the whole codebase (violating any of these is a regression, not a stylistic nit):
- **No business rule in code.** Every threshold, scheme name, citation, document requirement lives in `rule-pack/src/data/*.ts`, never hardcoded in `rule-engine` or `apps/web`.
- **Determinism.** `evaluateChecklist`/`evaluateAccount`/`resolveClaimDecision` are pure — same `RulePack` + same answers ⇒ byte-identical output. No wall-clock reads inside the engine; date-derived values are computed by the *caller* and passed in as `derived`.
- **No PII persisted.** Session storage (`localStorage`) holds only answers/selections, never names/account numbers.
- **Generic UI.** `QuestionRenderer`/`WizardCard`/`ClaimDecisionSummary` dispatch on *structural* type (`inputType`, `CardKind`, `DecisionStatus`), never on question id, scheme id, or route id. A grep-audit convention (not yet a CI gate) checks `apps/web/src/{components,lib,i18n}` never contains a literal scheme code (`"SB"`, `"RD"`, …), `ROUTE_[A-Z]`, `"T[0-9]+"`, or a `card_`/`doc_`/`form_`/`template_` id.

## 5. Milestones completed (M1–M5)

- **M1** — Monorepo scaffold, Next.js app, shared packages, testing infrastructure (Vitest everywhere).
- **M2** — Rule Pack schema (hand-written TS parsers, not Zod — see `docs/rule-pack.md` for why), validation pipeline, rule authoring (originally sourced from an informal internal "handbook", §-numbered — this is important context for M5, see §11), truth-table fixtures.
- **M3** — Decision Engine: condition evaluator, checklist evaluation, route routing, multi-account evaluation (`evaluateChecklist` loops every ticked scheme — though the Wizard UI still only *uses* one, see §13), overlay logic, `loadRulePack` (content-hash + engine-compat gate, unused by the app today), full validation.
- **M4** — Wizard UI: generic question renderer, navigation, branch routing/reroute, progress bar, Previous/Next, resume session (localStorage, 24h TTL), offline support (banner + zero fetch calls; service worker scaffold present but its `strategies` registry is empty), accessibility, pause/stop/wait/dual/info cards, keyboard nav, mobile responsive.
- **M5** (this handover) — two distinct parts, both complete:
  - **Part 1** (commit `e6d17d7`): converted the newly-released **ClaimSahayak Official Rule Book v1.0** (`knowledge-base/`) into Rule Pack data — this REPLACED the informal-handbook provenance with official India Post/GoI citations wherever the Rule Book confirms a rule, and added net-new scenarios (SCSS scheme, armed-forces override, dispute-forces-succession-certificate, untraceable co-nominee referral, and 8 more M-row modifiers). See §11 for the full mapping.
  - **Part 2** (this commit): the Rule Engine now *assembles* a structured `ClaimDecision` from the Rule Pack's `decisions[]` array, and the Wizard UI renders it (previously a "route"-kind terminal — the actual payable outcome — showed nothing but a hardcoded placeholder). See §6.

## 6. Exact M5 deliverables implemented

**Part 1 (Rule Book → Rule Pack conversion, commit `e6d17d7`):**
- SCSS added as a 9th in-scope scheme (was explicitly out-of-scope per SRS v1 §1.3 — widened on the user's explicit confirmation since the Rule Book has real SCSS content).
- `sourceRefs?: readonly string[]` (Rule Book CS-IDs) added to `RouteRule`/`OutputRule`/`OverlayRule`/`QuestionDefinition`/`FormDefinition`/`DocumentDefinition`.
- New routes: armed-forces override (D-14), dispute-forces-court-succession-certificate (D-11), untraceable/unwilling co-nominee referral (D-07X).
- New overlays (Q10-flag-driven): pledge/freeze (M-B), minor-attained-majority (M-E), guardian-died-after-depositor (M-F), NRI nominee (M-H), unregistered-but-valid nomination (M-G), MIS joint-ceiling excess (D-19), SCSS spouse-continuation (D-17 variant), RD Protected Savings Scheme (D-18).
- `packages/rule-pack/src/data/decisions.ts` (**new file**) — one `DecisionRecord` per outcome bucket (Decision/Reason/Competent-Authority/Official-References), the first structured answer to objective 5 ("every decision must include...").
- `packages/rule-pack/src/data/rulebook-cs-ids.ts` (**new file**) — canonical list of the 84 verified (non-provisional) CS-IDs; the coverage-percentage denominator.
- `packages/rule-pack/src/validate/rulebook-provenance.ts` (**new file**) — CS-ID resolution + decision↔route reachability checks, wired into `validate/pipeline.ts`.
- 14 new truth-table fixtures (fx28–fx41), all passing against the real engine.
- NV-RB register entries for the Rule Book's own registered gaps.

**Part 2 (Decision assembly + UI, this commit):**
- `DecisionRecord` gained 3 new **required** fields — `decisionStatus: 'payable'|'not_payable'|'not_applicable'|'pending_information'`, `courtOrderRequired: 'yes'|'no'|'conditional'`, `nextActionForPostmaster: LocalizedText` — plus one optional `processingNotes?: LocalizedText`. All 17 existing `DecisionRecord`s were back-filled.
- New shared-types export `ClaimDecision` (an *engine output* type, distinct from the *authored* `DecisionRecord`) — carries the resolved decision plus two **derived** fields computed at resolution time, never authored: `applicableRuleIds` (dedup union of `officialReferences[].csId` and `rulebookRefs`) and `monetaryLimitInr` (max of the competent-authority ladder, `undefined` if any rung is open-ended).
- `AccountChecklist.decision?` and `ChecklistDocument.decision?` (the latter only for the account-independent neutral-probe path).
- **New** `packages/rule-engine/src/decision.ts` — `resolveClaimDecision(rulePack, routeId)`, a pure, non-throwing lookup+derivation function, wired into `evaluateAccount` (before the `isOutOfScope` early return, so every terminal — card or route — gets a decision uniformly) and into `evaluateChecklist`'s neutral-scheme-probe branch.
- New `EngineIssueCode` value `"missing_decision"` — a non-fatal issue pushed if a live `routeId` has no matching `DecisionRecord` (authoring-drift insurance).
- Section taxonomy extended: `OutputRule.section` now also uses `"affidavits"`, `"indemnityBonds"`, `"declarations"` (previously only `"documents"`/`"forms"`/`"people"`) — `sections.ts`'s `SECTION_TITLES` map updated to title them. Existing items re-tagged: Form 13→affidavits, Form 15→indemnityBonds, the minor-alive certificate and RD-PSS declaration→declarations.
- **New** `apps/web/src/components/wizard/ClaimDecisionSummary.tsx` — the presentational component that finally renders a "route"-kind terminal's real decision (replacing the M4 "Foundation preview complete" placeholder). Visually mirrors `WizardCard.tsx`'s exact token/structure conventions (status→color map, `tabIndex={-1}` heading + focus-on-mount, visually-hidden `aria-live` announcement, the "next step" box pattern) — no new design language introduced.
- `Wizard.tsx` now calls `evaluateAccount` directly (single-account, matching the file's existing `scheme = rulePack.schemes[0]` scope — **not** `evaluateChecklist`, which would have silently expanded scope into the still-open multi-account gap) when the terminal is `"route"`-kind and no question remains.
- New i18n keys in `apps/web/src/i18n/wizard.ts` (`WizardDictionary` interface, both `en`/`hi`) — chrome labels only (`decisionStatusLabels`, `decisionCourtOrderRequiredValues`, section headings). The decision/reason/citation text itself is pack-authored `LocalizedText`, never a new dictionary entry.
- **New** `packages/rule-pack/src/cli/coverage-report.ts` — consolidated validation report covering all 6 categories the milestone asked for (Invalid Citations, Broken References [both directions — including a NEW inverse check that every reachable route/card has a matching decision], Missing Rules, Duplicate Rules, Unsupported Scenarios, Coverage %). Run via `pnpm --filter @claimsahayak/rule-pack run coverage-report`.
- 8 new engine tests (`rule-engine/test/decision.test.ts`) + 4 new UI tests (`apps/web/test/wizard/ClaimDecisionSummary.test.tsx`, including a regression guard that no raw internal `routeId`/`RouteRule.id`/`DecisionRecord.id` ever leaks into visible text).

## 7. Remaining technical debt

1. **Multi-account Wizard limitation** (pre-existing since M4, not touched by M5): `Wizard.tsx` hardcodes `scheme = rulePack.schemes[0]`. `evaluateChecklist` already supports every ticked `q1_schemes.<id>` scheme looping into `ChecklistDocument.accounts[]` — the UI simply never calls it. Fixing this is the natural M6 headline item (see §18).
2. **No derived-date computation in the Wizard** (newly discovered during M5 manual testing): every `buildVarAssignment`/`evaluateAccount` call in `Wizard.tsx` passes `derived: undefined`. This means `derived.monthsSinceDeath` is always absent, so the 6-month no-nomination gate (T17, `ROUTE_C`, the discretionary affidavit route) is **currently unreachable in the live app** — any no-nomination/no-evidence claim always lands on the WAIT card (T19), even if the death was 5 years ago. `computeDerivedValues`/`monthsBetween` already exist and are fully tested in `rule-engine`; the Wizard just never calls them from `q4_death_month`'s answer. This is a real, user-facing gap.
3. **Generic Form 11 instead of scheme-specific claim forms** for the 8 pre-existing schemes (SCSS got its own Form-3/4 in M5, but RD/TD/NSC/KVP/MIS/PPF/POSA still route through the shared `ROUTE_A`/`ROUTE_B`/`ROUTE_C` output sets, all citing Form 11). Rule Book Topic 8 §C notes certificates specifically may need scheme forms (DOC-C1–C11) instead.
4. **NSC/KVP ≤3-claimant continuation cap, RD-PSS eligibility, SCSS spouse-continuation eligibility** — all stated as *information* in the checklist (self-reported Q10 flags), never *enforced*, because the engine's `Condition` type has no list-typed facts or `count()`/`any()`/`none()` aggregate operator. This is the single root cause behind most of the "Unsupported Scenarios" list (see §8 and the `coverage-report` output).
5. **53.6% CS-ID coverage** (45/84) — the remaining 39 are mostly account-opening/nomination-making rules (out of scope for a *deceased-claim* wizard) or consolidated meta-rows whose substance is already distributed elsewhere. Full list: run `pnpm --filter @claimsahayak/rule-pack run coverage-report`.
6. **`pnpm lint` is broken on a clean, unmodified `master`** (207 pre-existing errors — confirmed via `git stash` before any M5 work began). Root cause not diagnosed (looks like an ESLint/typescript-eslint config drift, e.g. `vitest.config.ts` files not included in the parserOptions project, `toMatchTypeOf` deprecation, etc.). M5 changes add **zero new** lint errors but do not fix the pre-existing ones — out of scope for this milestone, worth a dedicated cleanup pass.
7. **One pre-existing, deliberately-untouched `tsc` failure** in `packages/shared-types/test/contracts.test.ts` (lines 79/86 — an `@ts-expect-error` that no longer matches the actual TS error it expects). Documented since M4 as "frozen package, not modified without a blocking reason." Still present, still not fixed.

## 8. Known limitations

Everything in §7 is a *limitation*, not a bug — each is either (a) genuinely unaddressed by the Rule Book itself (the Rule Book's own OQ-register — e.g. OQ-14 untraceable co-nominee, OQ-11 heirs-of-nominee authority, OQ-28 freeze-release procedure — has no official answer, so the pack routes to an honest referral card rather than inventing a procedure), or (b) a structural engine limitation (list-typed facts) that would require touching the frozen `rule-engine` package, which M5 was explicitly told not to do casually. **Do not silently "fix" any of these by inventing a business rule that isn't in the Rule Book** — that would violate the project's core charter ("never invent business rules," repeated in every milestone brief so far).

## 9. Files modified in M5

**Part 1** (commit `e6d17d7`, already pushed — 39 files): see that commit's message for the full breakdown (schema/validator plumbing, `packages/rule-pack/src/data/*`, 6 `apps/web/test/wizard/*.test.tsx` fixture updates, `packages/shared-types/src/{rule-pack,scheme}.ts`).

**Part 2** (this commit — 22 files, 17 modified + 5 new):
```
M  apps/web/src/components/wizard/Wizard.tsx
M  apps/web/src/i18n/wizard.ts
M  packages/rule-engine/src/account.ts
M  packages/rule-engine/src/checklist.ts
M  packages/rule-engine/src/errors.ts
M  packages/rule-engine/src/index.ts
M  packages/rule-engine/src/sections.ts
M  packages/rule-pack/package.json
M  packages/rule-pack/src/data/decisions.ts
M  packages/rule-pack/src/data/outputs/route-a.ts
M  packages/rule-pack/src/data/outputs/route-c.ts
M  packages/rule-pack/src/data/overlays.ts
M  packages/rule-pack/src/schema/decision.schema.ts
M  packages/rule-pack/src/validate/pipeline.ts
M  packages/rule-pack/src/validate/rulebook-provenance.ts
M  packages/shared-types/src/checklist.ts
M  packages/shared-types/src/rule-pack.ts
?? apps/web/src/components/wizard/ClaimDecisionSummary.tsx
?? apps/web/test/wizard/ClaimDecisionSummary.test.tsx
?? packages/rule-engine/src/decision.ts
?? packages/rule-engine/test/decision.test.ts
?? packages/rule-pack/src/cli/coverage-report.ts
?? docs/HANDOVER_M5.md   (this file)
```

## 10. Rule Engine architecture

`packages/rule-engine/src/` — pure functions only, `checklist = f(rulePack, answers)`, no wall-clock reads, no I/O except `loadRulePack` (async, content-hash-verified, unused by the app today). Public surface (`index.ts`):

- `evaluate` (`condition.ts`) — the restricted `Condition` evaluator: **closed** 6-operator union (`and`/`or`/`not`/`==`/`in`/`>=`/`var`). No list aggregation exists — this is the load-bearing fact behind §7 item 4.
- `computeDerivedValues`/`monthsBetween` (`derived.ts`) — pure date-math helpers the *caller* must invoke and pass in as `derived`; the engine never computes these itself (privacy: raw dates never even reach the engine, only derived booleans/counts).
- `buildVarAssignment` (`variables.ts`) — flattens `answers.*`/`account.*`/`scheme.*`/`derived.*`/`constants.*` into one flat `VarAssignment` for a single account/scheme.
- `resolveVisibleQuestions`/`isQuestionVisible` (`visibility.ts`).
- `applyAnswerChange` (`invalidation.ts`) — answer-invalidation cascade.
- `resolveRoute` (`routing.ts`) — priority-ordered walk of `rulePack.routes` (excludes `SYS_`-prefixed system buckets); `kind:"reroute"` records and continues, `kind:"route"`/`"card"` is terminal.
- `collectOutputBucketIds`/`collectOutputItems` (`outputs.ts`) — **hardcoded** to exactly 4 system buckets (`GLOBAL`, `CONTINUE_ADDON`, `PAYMENT_BANK_TRANSFER`, `PAYMENT_OWN_POSB`) plus whatever the terminal route/card fired — there is **no generic scheme-conditional output mechanism**; this is why M5's SCSS/RD-PSS/MIS-excess content had to be modeled as self-reported Q10 overlay flags rather than scheme-gated content.
- `resolveOverlays` (`overlay.ts`) — **hardcoded** to only scan `q10_docs_check.<optionId>` ticked flags plus one system flag (`system_frozen_10_years`, from `derived.freezeRequired` or a direct answer). Any *new* overlay-driven modifier MUST be added as a new `q10_docs_check` option — it cannot be a separate top-level question, because `resolveTickedFlags` (in `overlay.ts`) only ever looks at that one question id. **This is the single most important mechanical constraint for anyone adding new M-row-style modifiers in the future.**
- `buildSections` (`sections.ts`) — dedupe by `refId` → sort by `sortOrder` → group into sections (free-string `section` id, titled via `SECTION_TITLES`, now 6 known values: `documents`/`forms`/`people`/`affidavits`/`indemnityBonds`/`declarations`, anything else falls back to the raw id).
- **`resolveClaimDecision`** (`decision.ts`, **new in M5**) — `(rulePack, routeId) → {decision?: ClaimDecision, issue?: EngineIssue}`. Pure lookup + 2 derived-field computations, documented in §6.
- `evaluateAccount` (`account.ts`) — resolves ONE scheme's account: route → decision → output buckets → overlays → sections, all attached to one `AccountChecklist`. Two special cases: T1 ("older/discontinued scheme") drops even the GLOBAL bucket AND still gets a `decision` (uniform resolution, not skipped); other card-kind terminals get GLOBAL + decision but no route-specific extras.
- `evaluateChecklist` (`checklist.ts`) — the multi-account orchestrator, loops every ticked `q1_schemes.<id>` scheme via `evaluateAccount`. **The Wizard UI does not call this** (see §7 item 1) — it calls `evaluateAccount` directly for a single scheme.
- `validateAnswers` (`validate-answers.ts`), `loadRulePack`/`FALLBACK_RULE_PACK` (`loader.ts`/`fallback-pack.ts`), `engineIssue` (`errors.ts`, now 10 issue codes incl. `"missing_decision"`).

## 11. Rule Book integration architecture

The **source of truth** is `knowledge-base/official-rule-book/` (a git-committed but non-code research corpus — **never modify it**, per every milestone brief so far). Key files, in order of authority:

- `knowledge-base/official-rule-book/master-rule-matrix.md` — the 86-rule (84 verified + 2 provisional) catalogue, each with a `CS-XXX-000`-format ID. **The canonical CS-ID list lives in code** at `packages/rule-pack/src/data/rulebook-cs-ids.ts` (84 entries, transcribed from this matrix, excluding the 2 provisional `CS-NOM-024`/`025`).
- `knowledge-base/official-rule-book/decision-matrix.md` — the actual engine-facing table: D-01..D-19 (+D-07X) primary scenario rows and M-A..M-J modifier rows, each with Decision/Documents/Forms/Competent-Authority/Court-column/References — this is what `decisions.ts` and the new `DecisionRecord` fields were authored *from*, row by row.
- `knowledge-base/official-rule-book/rule-engine-mapping.md` (Topic 11) — a **pre-digested logical spec** written specifically to bridge Rule Book → Rule Pack authoring (facts/derived-values YAML, routes/overlays/outputs YAML). Treat this as a first-draft map, not gospel — it was written before the actual engine's mechanical constraints (§10) were re-verified against real code, and a few of its suggestions (e.g. modeling RD-PSS/MIS-excess as new top-level questions) turned out to be wrong once cross-checked against `overlay.ts`'s hardcoded `q10_docs_check`-only scanning — corrected during M5 authoring.
- `knowledge-base/forms/document-library.md` — the 39-record DOC-A..E library; the source for every `FormDefinition`/`DocumentDefinition` added in M5.

**Provenance mechanics in the pack**: every carrier type (`RouteRule`, `OutputRule`, `OverlayRule`, `QuestionDefinition`, `FormDefinition`, `DocumentDefinition`, and now `DecisionRecord.officialReferences`) has an **optional** `sourceRefs: readonly string[]` field holding CS-IDs. It's optional so pre-Rule-Book (informal-handbook-era) entries don't need to be touched to stay valid — but anything *newly authored or re-cited* against the Rule Book should populate it. `validate/rulebook-provenance.ts` checks: (a) every cited CS-ID is real and non-provisional (`checkRuleBookCsIdsResolve`), (b) every `DecisionRecord.routeId` resolves to a reachable route/card (`checkDecisionsReferenceReachableRoutes`), (c) — new in M5 — every reachable route/card HAS a matching `DecisionRecord` (`checkEveryReachableRouteHasDecision`, the inverse check), (d) — new in M5 — no duplicate decision ids/routeIds/citations (`checkNoDuplicateDecisions`). All 4 are wired into `validate/pipeline.ts` as real (error-severity) gates, plus reported in aggregate by the new `coverage-report.ts` CLI.

**If a future session needs to raise coverage past 53.6%**: pick an uncovered CS-ID from `coverage-report`'s "Missing Rules" list, find its record in `master-rule-matrix.md`, read the full text in the relevant `topic-0N-*.md` file, and either (a) add `sourceRefs` to an existing route/output/overlay if it's already implicitly covered, or (b) author new pack data following the same D-row/M-row disposition pattern used throughout M5 (see the "D-row / M-row disposition" table that was in the M5 Part-1 plan — reusable as a template).

## 12. Rule Pack format

`packages/rule-pack/src/data/index.ts` composes the single `RULE_PACK: RulePack` constant from per-concern files:
```
constants.ts        — named thresholds (AFFIDAVIT_LIMIT_INR, NO_NOMINATION_WAIT_MONTHS, FREEZE_YEARS, ...)
schemes.ts           — 9 SchemeDefinitions (capability flags: canBeJoint, canBeMinorAccount, continuableByClaimant, bankTransferEligible)
questions.ts         — QuestionDefinition[] (single/multi/boolean/monthYear inputType only — no new type without a UI change)
routes.ts            — RouteRule[], priority-ordered, T1-T20+T18A (handbook-era) + RB-D07X/RB-D11/RB-D14 (Rule-Book-era)
outputs/*.ts         — OutputRule[] per route-family (route-a/b/c, minors, survivor, continue-addon, payment, global, common)
overlays.ts          — OverlayRule[], keyed by a q10_docs_check option id (or the one system flag)
documents.ts/forms.ts— DocumentDefinition[]/FormDefinition[]
cards.ts             — CardDefinition[] (pause/stop/wait/dual/info terminal outcomes)
decisions.ts         — DecisionRecord[] (NEW in M5 Part 1, enriched in Part 2) — one per outcome bucket
templates.ts         — printable template field definitions (e.g. the nomination-enquiry letter)
content/*.ts         — /learn, /fix, /claims, /faq, /glossary pages
vocab.ts             — forbidden-jargon → plain-language map, enforced by copy-lint
nv-register.ts       — NvEntry[] (handbook-era NV-01..14 + Rule-Book-era NV-RB-1/3-10)
rulebook-cs-ids.ts   — the 84-CS-ID canonical list (NEW in M5 Part 1)
```
Validation pipeline (`validate/pipeline.ts`, run via `pnpm --filter @claimsahayak/rule-pack run validate-pack`): schema → reachability (var-refs, satisfiability, outputs-reference-routes, invalidates, overlay-flags) → orphans (refIds/documents/forms/templates/cards/fix-slugs) → no-dead-end (card-targets/reroute-targets) → locale-parity (warning-only) → copy-lint → provenance (handbookRef citation-shape) → rulebook-provenance (4 checks, §11) → truth-table referential integrity. `ok` reflects ERROR-severity only. CLI tools: `validate-pack`, `build-pack` (stamps real SHA-256 contentHash, emits `dist/rule-pack.<version>.json`, gitignored), `lint-pack` (fast content-only subset), **`coverage-report`** (NEW in M5 Part 2). Current pack version: `2026.07.2`, `rulebookVersion: "1.0"`.

## 13. Current Wizard flow

`apps/web/src/components/wizard/Wizard.tsx` is the sole state owner. Single-account only (`scheme = rulePack.schemes[0]`, §7 item 1). Flow, in order, for the SB happy path (varies by branch): `q1_schemes` → `q2_who_died` → **`q_armed_forces`** (new M5, boolean, gated on adult) → `q3_holding` → `q4_death_month` → `q5_nomination` (→ `q5a_complication` if "complication" chosen, now incl. **`co_nominee_untraceable`** new M5 option) → `q6_legal_evidence` (if no nomination) → **`q_dispute`** (new M5, boolean, gated on no-nomination) → `q7a_amount`/`q7b_heirs_together` (if no evidence) → `q9_payment` → `q10_docs_check` (now with 8 new M5 options: `pledge_or_freeze`, `minor_attained_majority`, `guardian_died_after_depositor`, `nri_nominee`, `mis_excess_ceiling`, `scss_spouse_continuing`, `rd_pss_candidate`, `unregistered_valid_nomination`) → **terminal**.

Terminal rendering (the three-way ternary in `Wizard.tsx`'s JSX, in priority order):
1. `terminalCard` set (route resolved to a `"card"`-kind rule) → `<WizardCard>` (unchanged since M4).
2. `currentQuestion` still pending → `<QuestionRenderer>` (unchanged since M4).
3. **NEW in M5**: neither of the above, `accountEvaluation.account.decision` present (route resolved to a `"route"`-kind rule, i.e. a real payable-or-not decision) → `<ClaimDecisionSummary>`.
4. Fallback (genuinely unresolved route, or a route with no matching `DecisionRecord` — should not happen given the `checkEveryReachableRouteHasDecision` validation gate, but kept as a defensive placeholder) → the old M4 "Foundation preview complete" text.

M4-era mechanics unchanged: session persistence (localStorage, 24h TTL, key `claimsahayak.session.v1`), offline banner + zero fetch calls, reroute banner on branch-changing edits, Previous/Start-Over, keyboard/a11y (focus-follows-content on every new question/card/decision).

**Known browser-automation quirk** (tooling, not app bug — see §17): coordinate-based click simulation was unreliable in the Claude Browser pane during M5 manual testing; direct DOM `.click()`/`.dispatchEvent()` via `javascript_tool` worked reliably and was used instead. If a future session hits the same issue, don't assume the app is broken — try DOM-level interaction first.

## 14. Outstanding TODOs

No literal `TODO`/`FIXME` comments exist in the source tree (confirmed clean in M5 Part 1 research; still true). "TODO" in this codebase means: read §7 (technical debt) and §18 (M6 scope) — those *are* the TODO list, deliberately kept out of code comments per this project's own convention (a TODO belongs in a memory/handover doc, not scattered in source, since scattered comments rot).

## 15. Assumptions made

1. **SCSS scope-widening was user-approved explicitly** (not a unilateral call) — see commit `e6d17d7`'s context; if a future session needs to justify why `SchemeId` has 9 members against the original SRS v1 §1.3 8-scheme scope, this is the paper trail.
2. **`evaluateAccount` (not `evaluateChecklist`) was deliberately chosen** for the M5 Wizard wiring, matching the file's existing single-scheme architecture rather than silently fixing the multi-account gap as a side effect. This was flagged explicitly in the M5 plan and is NOT an oversight — do not "fix" it without treating multi-account support as its own scoped milestone (§18).
3. **New M-row modifiers were placed as `q10_docs_check` options, not separate top-level questions** — this was a corrected assumption (the original Topic-11 mapping doc suggested top-level questions) after discovering `overlay.ts`'s hardcoded single-question scanning (§10). Any future modifier-style addition should follow the corrected pattern, not the Topic-11 doc's original suggestion.
4. **`decisionStatus`/`courtOrderRequired` values were derived by the author reading the Decision Matrix's own "Court" column and Decision text per row** — these are not mechanically derivable from other fields; if the Rule Book is ever amended, the corresponding `DecisionRecord` fields need manual re-authoring, not a script.
5. **`monetaryLimitInr`'s "undefined = no fixed limit" semantics**: for `DEC_ROUTE_A_HEIRS_OF_NOMINEE`, the single competent-authority rung is prose ("depends on evidence track"), not a real ladder — its derived "no fixed limit" is technically "not determinable from this record," not truly "unlimited." Flagged in code comments; a future session should not treat this record's `monetaryLimitInr: undefined` as equivalent to `ROUTE_A`'s genuinely-unlimited nomination-track authority.
6. **Processing notes were authored uniformly** (same register-entry reminder text) for every "real claim" decision bucket, sourced from Decision Matrix §4's general timeline/payment constants — not a per-row Rule Book detail. Buckets that aren't real claims (pending/not-applicable) deliberately omit `processingNotes` rather than force a value.

## 16. Test status

**267/267 passing** across all 9 packages as of the pending (about-to-be-committed) state:

| Package | Files | Tests |
|---|---|---|
| shared-types | 1 | 10 |
| shared-config | 1 | 3 |
| shared-utils | 3 | 15 |
| design-tokens | 1 | 12 |
| rule-engine | 13 | 108 (incl. 41 truth-table fixtures, 8 new `decision.test.ts`) |
| rule-pack | 5 | 28 |
| apps/backend | 2 | 5 |
| apps/admin | 1 | 1 |
| apps/web | 18 | 85 (incl. 4 new `ClaimDecisionSummary.test.tsx`) |

Whole-monorepo `pnpm typecheck`: clean except the one pre-existing `shared-types/test/contracts.test.ts` failure (§7 item 7). `pnpm --filter @claimsahayak/rule-pack run validate-pack` and `run build-pack`: both pass clean. `pnpm lint`: pre-existing broken (§7 item 6), unrelated to M5, zero new errors introduced.

## 17. Manual testing status

All 7 scenarios required by the M5 brief were driven live against a real `next dev` server (`localhost:3000/start`) in the Claude Browser pane, confirmed via `get_page_text`/screenshots, zero console errors:

1. Nomination exists → `ROUTE_A`, **Payable**.
2. No nomination, >₹5L → STOP card (court/revenue document required).
3. Multiple nominees (disclaimer) → `ROUTE_A` + Form 14 + absent-nominee ID.
4. Minor nominee → `ROUTE_A` + guardianship certificate + new **Declarations** section.
5. Nominee predeceased (last nominee died after depositor) → `ROUTE_A_HEIRS_OF_NOMINEE`, honest "depends on evidence" citation.
6. Joint account (survivor) → `ROUTE_SURVIVOR`, **"No claim needed"**, processing notes correctly omitted.
7. Different sanctioning authorities → `ROUTE_B`'s full 4-tier ladder (₹50k → ₹1L → HO/GPO → Divisional Head), contrasting with #1's single-tier and #6's "no approval needed."

As noted in §13, coordinate-based browser-tool clicks were unreliable this session; verification proceeded via direct DOM event dispatch on the same live app instance (a legitimate substitute — same React app, same Rule Engine, same dev server — not a mock). A future session doing manual browser QA should be aware of this and try DOM-level interaction (`javascript_tool` calling `.click()`/dispatching `change` events on real elements) if pointer-coordinate clicks seem to silently no-op.

## 18. Recommended Milestone 6 scope

In priority order (each is independently scoped, not required to ship together):

1. **Multi-account Wizard support** (§7 item 1) — wire `evaluateChecklist` into the Wizard (or a new post-single-account "next account" loop), rendering one `ClaimDecisionSummary`/checklist per ticked `q1_schemes.<id>` scheme. This is the most-requested-feeling gap and unblocks re-verifying `PathLength.test.ts`'s excluded continuable-scheme questions.
2. **Derived-date wiring in the Wizard** (§7 item 2) — call `computeDerivedValues`/`monthsBetween` from `q4_death_month`'s answer and pass real `derived` into `buildVarAssignment`/`evaluateAccount` calls. Small, contained, fixes a genuine live-app correctness gap (ROUTE_C currently unreachable).
3. **Result Page / PDF export** — the M4 "known limitation" that's now half-addressed (single-account decision renders inline) but still has no dedicated route/page or print/PDF output for the full `ChecklistDocument`.
4. **Scheme-specific claim forms** (§7 item 3) — replace generic Form 11 citations with DOC-C1–C11 per scheme, per Rule Book Topic 8 §C.
5. **`pnpm lint` cleanup** (§7 item 6) — not urgent (doesn't block anything) but accumulating; worth a dedicated pass before it grows further.
6. Continue raising CS-ID coverage past 53.6% opportunistically (§11 has the "how").

**Do not** attempt the list-typed-facts/`count()` engine enhancement (NSC/KVP cap, RD-PSS/SCSS eligibility enforcement) without a dedicated design pass — it's a real `Condition`-type schema change touching the frozen `rule-engine` package, non-trivial, and should be scoped as its own milestone with explicit user sign-off, not folded into something else.

## 19. Risks

- **`packages/rule-engine` and `apps/web`'s Wizard have both now been touched for the first time since M3/M4 "locked."** Both changes were additive (new function, new component, new branch in an existing ternary) and fully covered by new tests, but this sets a precedent — a future session should not assume these packages are still untouchable; they're now "M5-modified, re-verify before assuming frozen."
- **`resolveClaimDecision`'s `routeId` join is a string match with no compiler-enforced link** between `RouteRule.target`/card ids and `DecisionRecord.routeId` — a typo in either place is only caught by the `validate-pack` pipeline (specifically `checkEveryReachableRouteHasDecision`/`checkDecisionsReferenceReachableRoutes`), not by TypeScript. **Always run `validate-pack` after touching routes/cards/decisions.**
- **Coverage-report's "Missing Rules"/"Unsupported Scenarios" lists are hand-maintained data, not derived by static analysis** (the unsupported-scenarios list specifically — `coverage-report.ts`'s `UNSUPPORTED_SCENARIOS` constant). If a future session closes one of these gaps, **remember to remove it from that list**, or the report will lie.
- **The 3 Claude Browser pane sessions in this project's history have each had different pointer-coordinate reliability.** Don't assume click-based automation works without a quick sanity check (§13/§17) — budget for the DOM-dispatch fallback pattern if manual QA is needed again.
- **`knowledge-base/` is large (10,000+ lines, several binary PDFs)** and grows if the Rule Book is ever amended (the project's own "amendment protocol" — new instrument → new CS-record → S-register entry → pack delta, never delete). Don't `git rm` or reorganize it without checking `docs/rule-pack.md` and the Rule Book's own change-log section first.

## 20. Anything the next Claude session MUST know

1. **`packages/rule-engine/src/overlay.ts`'s `resolveTickedFlags` only scans `q10_docs_check.*` and one hardcoded system flag.** This is the #1 mechanical trap: any new "self-reported flag that adds checklist items" MUST be a `q10_docs_check` option, never a new top-level question, or it will silently never fire. (Contrast: a new *routing fork* — something that changes which decision bucket wins — CAN and should be a new top-level question, since `resolveRoute`/`buildVarAssignment` read every answer generically. The armed-forces and dispute questions in M5 are top-level precisely because they're routing forks, not checklist add-ons.)
2. **`apps/web/test/wizard/Wizard.test.tsx` has a standing regression guard** (`container.textContent` must never match `/\bROUTE_[A-Z_]+\b/` or `/\bT\d{1,2}A?\b/`) — any new UI component touching decision/route data must render `routeName`/`decision.decision` (human text) not `routeId`/`RouteRule.id` (internal identifiers). `ClaimDecisionSummary.test.tsx` extends this guard to also check `/\bDEC_[A-Z_]+\b/`.
3. **`pnpm lint` failing is expected and pre-existing** — do not spend time "fixing" it as a side effect of an unrelated change; it was broken before M5 and is out of scope unless a session is specifically tasked with it.
4. **Never edit `knowledge-base/`.** It's the frozen source of truth every Rule Pack citation traces back to. If the Rule Book itself needs amending, that's a separate research task with its own charter (see the project's memory file `rulebook-project-state.md` if running in an environment with persistent memory) — not something a Rule Pack authoring session does inline.
5. **The user's standing instruction pattern across M1–M5**: read/plan before large changes (this repo's owner explicitly asks for `EnterPlanMode`-style confirmation before big architectural work), never invent business rules, report gaps honestly rather than faking coverage, and **do not start the next milestone without being asked** — M5 ended with "Do not begin Milestone 6. Stop after the handover and commit," and that pattern has held for every milestone transition so far. Assume the same discipline applies to M6→M7 etc. unless told otherwise.
6. **Every `DecisionRecord` needs `competentAuthority.length > 0` and `officialReferences.length > 0`** — enforced by `parseDecisionRecord`'s schema validation (hard error, not a warning). If adding a new decision bucket, you cannot skip these even for a "gap/referral" case — use a prose `authorityLabel` like `ROUTE_A_HEIRS_OF_NOMINEE` did, and cite whatever CS-ID/OQ the gap traces back to.
