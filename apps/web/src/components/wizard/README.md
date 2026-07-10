# Wizard module (Milestone 4)

Renders one Rule Pack question, card, or dialog at a time. Every decision
about *what* to show — which question is current, which are visible, what
gets invalidated, whether the route changed, whether a terminal Card fired —
comes from the frozen Rule Engine (`@claimsahayak/rule-engine`). This module
only sequences those calls, holds the resulting UI state, and renders it.

```
Rule Pack + answers
        │
        ▼
  Rule Engine (resolveVisibleQuestions / validateAnswers /
               applyAnswerChange / resolveRoute)
        │
        ▼
      Wizard.tsx  ──  owns state: answers, draft, visited, editIndex,
        │              rerouteBanner, pendingSession, startOverOpen
        ▼
  QuestionRenderer   or   WizardCard   or   foundation-complete
   (one question)         (terminal outcome)
```

## Files

| File | Responsibility |
|---|---|
| `Wizard.tsx` | Owns all state; sequences Rule Engine calls; decides question vs. card vs. done. |
| `QuestionRenderer.tsx` | The one generic renderer for every question, regardless of scheme/route/content. |
| `QuestionCard.tsx` | Question heading; moves focus to itself on question change. |
| `WhyPanel.tsx` | Expandable `whyStrip` disclosure (`<details>`). |
| `OptionList.tsx` / `OptionCard.tsx` | Answer controls, dispatched only on structural `inputType` (single/multi/boolean/monthYear) — never on question id. |
| `ContinueButton.tsx` / `PreviousButton.tsx` | Navigation controls, shared by both question and card screens. |
| `ReadAloudButton.tsx` | Progressive-enhancement Web Speech API control; renders nothing if unsupported. |
| `RerouteBanner.tsx` | `aria-live` announcement when editing an earlier answer changes the resolved route. |
| `ResumeBanner.tsx` | Presentation only for the Resume/Start New/Clear Previous prompt — `Wizard.tsx` decides *whether* to show it. |
| `WizardCard.tsx` | Renders a terminal `CardDefinition` (pause/stop/wait/dual/info); moves focus to its own heading. |
| `PortableText.tsx` | Generic renderer for all 6 `PortableTextBlock` kinds — used by card bodies. |
| `PrintableTemplate.tsx` | Print-only view of a `TemplateDefinition` + a `window.print()` button; lazy-loaded (`next/dynamic`) since only pause cards with a `templateId` need it. |
| `ConfirmDialog.tsx` | Generic accessible confirm/cancel `<dialog>`, used by "Start Over". |
| `DebugPanel.tsx` | Development-only inspector; renders nothing when `NODE_ENV === "production"`. |

## Lib helpers (`apps/web/src/lib/`)

- `wizardAnswers.ts` — translates the wizard's rich per-question `AnswersState`
  into the Rule Engine's flat `AnswerMap` wire format.
- `wizardCurrentQuestion.ts` — the first visible-but-unanswered question, via
  the frozen `validateAnswers`/`resolveVisibleQuestions` exports.
- `wizardReroute.ts` — detects whether editing a past answer changed the
  resolved route, for the reroute banner.
- `wizardSession.ts` — localStorage read/write/expire around the frozen
  `SessionState` contract (24 h TTL).
- `locale.ts` — `pickText()`, the one place `LocalizedText` gets resolved to
  a plain string, with an English fallback.

## Known, documented limitations

- **Single-account only.** The wizard always evaluates against
  `rulePack.schemes[0]` (SB). Multi-account looping — one pass per scheme
  ticked in `q1_schemes` — is out of scope for Milestone 4; see
  `docs/m4-acceptance.md`.
- **No Result Page / Checklist / PDF.** A terminal `"route"` outcome (as
  opposed to a `"card"` outcome) currently ends in a generic "foundation
  complete" placeholder — building the real Result/Checklist/PDF experience
  is later-milestone scope.
