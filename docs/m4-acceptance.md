# Milestone 4 — Wizard Acceptance Checklist

Maps every acceptance criterion from the M4.1–M4.4 roadmap prompts to what
implements it, what tests prove it, and what was manually verified in a real
browser. All file paths are relative to the repo root; all tests live under
`apps/web/test/wizard/` unless noted.

Legend: ✅ implemented & verified · ⚠️ implemented with a documented limitation.

---

## M4.1 — Wizard Foundation & Generic Question Renderer

| Criterion | Status | File(s) | Test(s) | Manual verification |
|---|---|---|---|---|
| Wizard shell hierarchy (Wizard → ProgressBar → QuestionRenderer → QuestionCard/WhyPanel/OptionList/ContinueButton; ResumeBanner) | ✅ | `Wizard.tsx`, `QuestionRenderer.tsx` | `Wizard.test.tsx` | `/start` walked in browser, M4.1 session |
| OfflineBanner / Footer present | ✅ | inherited from `apps/web/src/app/layout.tsx` (M1, global) — not duplicated inside the Wizard subtree | `test/shell.test.tsx` (M1) | — |
| ONE generic `QuestionRenderer` — no per-scheme components | ✅ | `QuestionRenderer.tsx` | `QuestionRenderer.test.tsx` (arbitrary/hypothetical questions incl. types never in the real pack) | code audit: zero `SB`/`RD`/scheme-named components exist |
| QuestionCard: presentation only | ✅ | `QuestionCard.tsx` | `QuestionRenderer.test.tsx` | — |
| OptionCard: presentation, accessible, keyboard-friendly | ✅ | `OptionCard.tsx`, `OptionList.tsx` | `QuestionRenderer.test.tsx` (keyboard nav suite) | Tab/Space verified in browser |
| WhyPanel: expandable, localized | ✅ | `WhyPanel.tsx` (native `<details>`) | `QuestionRenderer.test.tsx` | expand/collapse verified in browser |
| ProgressBar: "Step X of Y", no hardcoded numbers | ✅ | `ProgressBar.tsx` (M1, reused unmodified) + `Wizard.tsx` supplies `current`/`total` | `Navigation.test.tsx` progress suite | — |
| ResumeBanner: presentation only in M4.1 (logic landed in M4.3) | ✅ | `ResumeBanner.tsx` | `ResumeBanner.test.tsx` | — |
| Styling: existing design tokens only | ✅ | all wizard components use `@claimsahayak/design-tokens` Tailwind preset classes only | design-tokens contrast test (frozen) covers every color pair used | — |
| Accessibility: WCAG AA baseline | ✅ | see M4.4 accessibility section below for the completeness pass | `a11y.test.tsx`, `AccessibilityAudit.test.tsx` | — |
| Responsive: desktop/tablet/mobile, no duplicate layouts | ✅ | Tailwind `desktop:` variant only; one markup tree | `responsive.test.tsx` (proves identical DOM at mobile/desktop) | see M4.4 responsive section |
| Localization: existing system, no hardcoded strings except loading placeholders | ✅ | `i18n/wizard.ts`, `lib/locale.ts` | `QuestionRenderer.test.tsx` locale suite, `I18nCompleteness.test.tsx` | — |
| State limited to answers/currentQuestion/locale/session | ✅ | `Wizard.tsx` — `answers`, `draft`, derived `currentQuestion`, `locale`, `pendingSession`; `visited`/`editIndex` are structural navigation bookkeeping, not business state | — | — |
| No business logic in React | ✅ | see M4.4 code-audit section | — | — |
| Debug panel dev-only | ✅ | `DebugPanel.tsx` (`process.env.NODE_ENV === "production"` check) | `DebugPanel.test.tsx` | confirmed absent in a real `next build && next start` |
| Tests: rendering/localization/a11y/responsive/keyboard/debug-panel/arbitrary-questions | ✅ | — | `QuestionRenderer.test.tsx`, `a11y.test.tsx`, `responsive.test.tsx`, `DebugPanel.test.tsx` | — |

## M4.2 — Navigation & Branching

| Criterion | Status | File(s) | Test(s) | Manual verification |
|---|---|---|---|---|
| Next / Previous navigation | ✅ | `Wizard.tsx` (`handleContinue`/`handleBack`), `ContinueButton.tsx`, `PreviousButton.tsx` | `Navigation.test.tsx` | browser walk-through, M4.2 session |
| Branch-aware navigation; skip hidden questions; never visit invisible questions | ✅ | `lib/wizardCurrentQuestion.ts` (`getCurrentQuestion`, built on the frozen `resolveVisibleQuestions`/`validateAnswers`) | `Navigation.test.tsx` (guardian branch skips q3/q4/q5) | — |
| Back restores the exact previous visible question + its answer | ✅ | `visited`/`editIndex` state in `Wizard.tsx` | `Navigation.test.tsx` | — |
| Visibility entirely from Rule Engine; hidden questions never render/validate/count | ✅ | same as above — no question-id conditionals anywhere in `apps/web/src` | code audit (grep, see below) | — |
| Progress: "Step X of Y", branch-aware total, no hardcoded totals | ✅ | `Wizard.tsx` (`total = visibleQuestions.length`, recomputed every render) | `Navigation.test.tsx` progress suite, `PathLength.test.ts` | — |
| Progress never visibly decreases mid-branch | ⚠️ | true for every path actually reachable in the authored pack (verified) — see the path-length note below for the one theoretical scenario this can't fully guarantee | `PathLength.test.ts` | — |
| Answer invalidation cascade | ✅ | `Wizard.tsx` calling the frozen `applyAnswerChange` | `Navigation.test.tsx` invalidation suite, `CombinedStateIntegration.test.tsx` | — |
| Reroute banner, `aria-live` | ✅ | `RerouteBanner.tsx`, `lib/wizardReroute.ts` (`detectRerouteBanner`, built on frozen `resolveRoute`) | `Navigation.test.tsx` reroute suite | — |
| Keyboard: Tab/Shift+Tab/Space/Enter/Arrows | ✅ | native `<input>`/`<button>` throughout — arrow-key radio-group navigation is native browser behavior, not custom JS | `QuestionRenderer.test.tsx` keyboard suite | Tab/Space/Enter verified in browser; arrow-key nav is native to `<input type=radio>` groups (not reimplemented) |
| Tests: navigation/back/branch/progress/reroute/invalidation/hidden-skip/determinism | ✅ | — | `Navigation.test.tsx` (8 tests), `lib.test.ts` (determinism) | — |

## M4.3 — Session Persistence, Cards, Offline

| Criterion | Status | File(s) | Test(s) | Manual verification |
|---|---|---|---|---|
| Local session persistence: answers, step, timestamp; 24 h expiry | ✅ | `lib/wizardSession.ts`, using the frozen `SessionState`/`SESSION_STORAGE_KEY`/`SESSION_TTL_MS` contract | `Session.test.tsx` (persistence + expiry) | reload-in-browser verified, M4.3 session |
| "Visible route" as stored data | ⚠️ (by design) | deliberately **not** stored — recomputed from persisted answers via the frozen `resolveRoute` at resume time, so it can never drift from what the engine would actually decide. See `wizardSession.ts`'s header comment. | — | — |
| Resume experience: Resume / Start New / Clear Previous; no auto-resume | ✅ | `ResumeBanner.tsx`, `Wizard.tsx` (`handleResume`/`handleStartNew`/`handleClearPrevious`) | `Session.test.tsx` resume suite | reload → banner → each of the 3 actions verified in browser |
| Clear session: Start Over + confirmation + delete + restart | ✅ | `ConfirmDialog.tsx` (native `<dialog>`), `Wizard.tsx` (`handleStartOverConfirm`) | `Session.test.tsx` Start Over suite | confirmed in browser incl. at 375px |
| Wizard Cards: pause/stop/wait/info(+dual), from Rule Pack, no hardcoded copy | ✅ | `WizardCard.tsx`, `PortableText.tsx` | `Cards.test.tsx` (info/pause/stop/wait against real T1/T15/T18/T19) | all 4 kinds walked in browser |
| Pause card: printable letter + Print Letter button | ✅ | `PrintableTemplate.tsx` (`window.print()`; a print-only CSS rule in `globals.css`, since no print pipeline existed before M4.3) | `Cards.test.tsx` (asserts `window.print` is called) | print button clicked in browser, template fields confirmed data-driven |
| Offline support: detect status, banner, continues working, no network dependency | ✅ | reused the existing (M1) `OfflineBanner.tsx` — global, not duplicated; Wizard makes zero `fetch` calls | `OfflineAndReadAloud.test.tsx` (asserts `fetch` never called while `navigator.onLine === false`), `CombinedStateIntegration.test.tsx` (full flow offline) | — |
| Cards accessible: aria-live, focus mgmt, keyboard, screen-reader friendly | ✅ | `WizardCard.tsx` (focus moves to its own heading on a new card; quiet `aria-live` announcement) | `Cards.test.tsx` a11y suite, `AccessibilityAudit.test.tsx` | — |
| Read Aloud: progressive enhancement, graceful fallback | ✅ | `ReadAloudButton.tsx` (feature-detects `window.speechSynthesis`; renders nothing if absent) | `OfflineAndReadAloud.test.tsx` | button presence verified in browser |
| Language: Hindi renders if present, no hardcoding | ✅ | `i18n/wizard.ts`, `lib/locale.ts` | `I18nCompleteness.test.tsx` | Hindi verified in browser (M4.1/M4.3 sessions) |
| Tests: persistence/expiry/resume/clear/cards/offline/read-aloud/keyboard | ✅ | — | `Session.test.tsx`, `Cards.test.tsx`, `OfflineAndReadAloud.test.tsx` | — |

## M4.4 — Finalization

| Criterion | Status | File(s) | Test(s) | Manual verification |
|---|---|---|---|---|
| Full wizard review: one generic renderer, no duplication, no hardcoded business logic | ✅ | code audit: `grep -rniE '"(SB|RD|TD|MIS|PPF|SSA|NSC|KVP)"\|ROUTE_[A-Z]\|"T[0-9]+"\|lakh\|card_\|template_\|doc_\|form_'` across `apps/web/src/{components,lib,i18n}` — zero matches | — | — |
| Longest path ≤ 10 screens | ✅ | computed against the real pack: **9 screens** (SB scheme, the only one the current single-account Wizard evaluates) | `PathLength.test.ts` | — |
| Normal path ≤ 7 screens | ✅ | computed: **exactly 7** (adult, one name, nominee alive, own POSB, no doc flags) | `PathLength.test.ts` | — |
| Path-length scope note | ⚠️ | Multi-account looping (evaluating a scheme other than `schemes[0]`) is not implemented — this is the same, already-documented M4.1 limitation. Schemes with `continuableByClaimant: true` (RD/TD/NSC/KVP) have extra questions (`q1a_nsc_kvp_format`, `q8_maturity`, `q8_close_or_continue`) that are dead code under the *current* single-scheme Wizard and were **not** included in the path-length computation, since they're unreachable today. Re-verify path length once multi-account support lands. | — | — |
| Progress never decreases; branch-aware totals only | ✅ | `Wizard.tsx` (`total`/`current` recomputed from `resolveVisibleQuestions` every render — never a stored/hardcoded number) | `Navigation.test.tsx`, `PathLength.test.ts` | — |
| Responsive: 375/768/1024/1280, no overflow, no horizontal scroll | ✅ | Tailwind `desktop:` breakpoint (1024px); content capped at `max-w-content`/`max-w-4xl` (rendering at 1008px at desktop widths — the pack's own `18px` root font-size, not 16px, so `56rem` ≠ the textbook 896px; confirmed by design, not a bug) | `responsive.test.tsx` | measured `scrollWidth === clientWidth` (no overflow) at all 4 widths in a real browser; question, pause card, and Start Over dialog all screenshotted at 375px |
| Accessibility completeness: keyboard-only, focus visible, tab order, screen-reader labels, aria-live, reduced motion, semantic headings, contrast, touch targets | ✅ | see below | `AccessibilityAudit.test.tsx`, `a11y.test.tsx`, `Cards.test.tsx` | — |
| — keyboard-only / focus visible | ✅ | native `<input>`/`<button>`/`<dialog>`, global `:focus-visible` ring (`globals.css`, M1) | `QuestionRenderer.test.tsx` | — |
| — logical tab order | ✅ | no `tabIndex` values except `-1` on programmatically-focused headings (never in the tab sequence) | `AccessibilityAudit.test.tsx` | — |
| — screen-reader labels / aria-live | ✅ | `aria-labelledby` throughout; `RerouteBanner`/`ResumeBanner`/`WizardCard` all use `role="status"`/`aria-live="polite"` | `Navigation.test.tsx`, `AccessibilityAudit.test.tsx` | — |
| — reduced motion | ✅ | global `@media (prefers-reduced-motion: reduce)` rule, `globals.css` (M1, unmodified) | — | — |
| — semantic headings (no skipped levels) | ✅ **fixed this milestone** | added a visually-hidden page-level `<h1>` in `Wizard.tsx` (previously the document went straight to `<h2>`); `QuestionCard`/`WizardCard` headings are `<h2>` | `AccessibilityAudit.test.tsx` (exactly one h1, zero h3+, zero axe heading-order violations) | — |
| — contrast | ✅ | every `WizardCard` kind style (`pause`/`stop`/`wait`/`info`) reuses color pairs already in the frozen design-tokens `contrastPairs` list | design-tokens contrast test (frozen) | — |
| — touch targets (≥ 48px) | ✅ **fixed this milestone** | `WhyPanel`'s `<summary>` had no minimum height; added `min-h-touch`. Buttons (`cs-btn-primary`/`cs-btn-secondary`) and option labels already met this. | `AccessibilityAudit.test.tsx` | — |
| — focus moves to the new question/card on every navigation | ✅ **added this milestone** | `QuestionCard.tsx` now mirrors `WizardCard.tsx`'s existing focus-management pattern (moves focus to its own heading when the question changes) | `AccessibilityAudit.test.tsx` | verified Tab/Continue/Previous in browser |
| Wizard state: resume + clear + restart + branch change + invalidation + reroute + offline, all together | ✅ | — | `CombinedStateIntegration.test.tsx` (single session: reaches a card, reloads, resumes, changes an earlier answer to a different branch — invalidation + route change — then Starts Over, entirely offline) | — |
| Branch change reachable from a Card, not just a question | ✅ **fixed this milestone** | `WizardCard.tsx` had no Previous button — added one, wired to the same `handleBack` | `CombinedStateIntegration.test.tsx` | — |
| Performance: remove unnecessary renders, memoize, lazy-load non-critical components | ✅ | `Wizard.tsx` already memoizes every expensive Rule-Engine-backed computation (`questionsById`, `flatAnswers`, `visibleQuestions`, `frontierQuestion`, `routeResolution`, `terminalCard`, `terminalTemplate`) — carried over from M4.2/M4.3, re-verified here. `PrintableTemplate` is now `next/dynamic`-loaded from `WizardCard.tsx` (only needed for pause cards with a `templateId`) | full test suite re-run clean after the change | confirmed `PrintableTemplate` lands in its own build chunk (`.next/static/chunks/380.*.js`, separate from `/start`'s main chunk) |
| Performance note: `OptionCard`/`React.memo` | ⚠️ (considered, not applied) | Reviewed wrapping `OptionCard` in `React.memo`; declined — `OptionList` currently creates a fresh `onChange` closure per option per render, so memoizing `OptionCard` alone wouldn't skip re-renders without also restructuring the callback wiring. Given option lists are small (2–9 items) and cheap to render, the added complexity isn't justified by a measurable benefit at this scale. | — | — |
| Code audit: no scheme names / thresholds / routing logic / document logic in React | ✅ | see the M4.1 row above — same grep, re-run this milestone, zero matches | — | — |
| i18n: English correct, Hindi works on switch, no missing keys, no fallback crashes | ✅ | `WizardDictionary` interface (TypeScript enforces `en`/`hi` key parity at compile time) | `I18nCompleteness.test.tsx` (every key non-empty in both locales; `WizardCard`/`ResumeBanner` render correctly in Hindi; a Rule-Pack string with no Hindi translation falls back to English without crashing) | Hindi verified in browser across M4.1/M4.3 sessions |
| Developer experience: comments/docs/organization, no behavior change | ✅ | added `apps/web/src/components/wizard/README.md` (module architecture, file responsibilities, known limitations); reviewed existing docblocks (already thorough from M4.1–M4.3) | full test suite re-run clean (behavior unchanged) | — |
| Acceptance verification: this document | ✅ | `docs/m4-acceptance.md` (this file) | — | — |

---

## Known limitations (carried forward, not fixed in M4)

1. **Single-account only.** The Wizard always evaluates against
   `rulePack.schemes[0]` (SB). A user can tick multiple schemes in
   `q1_schemes`, but only one evaluation pass ever runs. Multi-account
   looping is out of scope for Milestone 4 (first documented in M4.1).
2. **No Result Page / Checklist Generator / PDF.** A `"route"`-kind terminal
   outcome (as opposed to a `"card"`-kind one) currently ends in a generic
   "foundation complete" placeholder message, not a real checklist. Explicitly
   out of scope for every M4 sub-milestone.
3. **`packages/shared-types`'s own `contracts.test.ts` typecheck failure** —
   pre-existing, unrelated to the Wizard, first reported in the M4.1 session;
   still untouched (frozen package, not modified without a blocking reason
   tied to this work).

## Confirmation

- `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` all pass — see
  the M4.4 session's quality-gate run for full output.
- Milestones 1–4.3 remain unmodified except the specific, listed integration
  fixes above (all additive: a new `<h1>`, a `min-h-touch` class, a
  `PreviousButton` in `WizardCard`, a `next/dynamic` wrapper).
