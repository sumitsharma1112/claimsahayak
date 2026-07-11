# ClaimSahayak — Milestone 7 Handover

**Purpose of this document**: a brand-new Claude Code (or human) session should be able to read this file alone and continue development without re-deriving any architectural decision made in M1–M7. Where this document and the code disagree, **the code is the source of truth** — this file describes state as of the M7 commit named below; re-verify anything load-bearing with `git log`/`git blame` before acting on it.

---

## 1. Current Git branch

`master` — the only branch in this repository.

## 2. Latest commit SHA / numbering note

Run `git log -1` for the exact SHA. **Important**: `master` already contains three commits titled `feat(m6.N): ...` (derived-date wiring, multi-account support, print/PDF export) from an earlier session in the same conversation this milestone was requested in. When this milestone's request arrived (again labeled "Milestone 6" by the user, describing an unrelated document-generation scope), the numbering collision was flagged and the user agreed to label this work **Milestone 7** instead — commits use `feat(m7): ...`. If a future session sees a request calling itself "Milestone 6" again, check `git log` first; the number in a prompt is not authoritative, the repository's own history is.

## 3. Objective actually delivered

The user's brief (10 parts: Claim Data Model, auto document selection, auto-fill, document library, Claim Package, print system, validation, testing across 8 scenarios, code quality, completion report) is implemented as an **additive layer on top of the existing M4–M6 Wizard**, not a rewrite. The pre-existing terminal (`ClaimDecisionSummary`/`ChecklistResults` + `PrintChecklistButton`) is completely unchanged in its default rendering — every M4–M6 test (99 of them) passes unmodified. The new Claim Package is opt-in via a "Generate complete Claim Package" button that appears only once a real, payable decision has been reached.

## 4. The one blocking decision, resolved before any code was written

The brief requires collecting and auto-filling names, account numbers, addresses, and witness/guardian/nominee/legal-heir details — the first time in this app's history that any free-text PII would be captured. This directly touches a stated, repeated architectural invariant: `docs/architecture-overview.md` (M1) said *"No cookies, no trackers, no PII surface exists"*, and `docs/HANDOVER_M5.md` repeated it as a hard invariant (*"No PII persisted... never names/account numbers"*).

This was surfaced to the user explicitly before coding began. **Resolution (user-approved)**: the Claim Data Model exists **only in React state, for the current browser tab**. It is never passed to `saveSession`/`localStorage` (the existing 24h-resume mechanism still persists only the pre-existing enum/boolean/monthYear answers, byte-identical to before M7), never transmitted (zero fetch calls, unchanged), and is discarded the instant the tab closes or "Start Over" is used. `docs/architecture-overview.md` has been updated to state this precisely rather than leave the now-inaccurate absolute claim in place.

**If a future session is asked to make the Claim Data Model persist across sessions** (e.g. "let a Postmaster resume a half-filled claim tomorrow"), that is a real, user-facing policy change from what M7 shipped — it should be raised explicitly, not done silently, for the same reason the original decision was raised explicitly.

## 5. Document-fidelity model (user-specified design principle, load-bearing)

Two tiers, both reading from the same Claim Data Model, only one of them structurally free:

- **Tier A — official India Post forms** (Form 11/13/14/15 today): a `OfficialFormLayout` (new type, `packages/shared-types/src/claim-data.ts`) is authored **once per form**, transcribing the real form's field order/labels. ClaimSahayak fills the VALUES into that fixed layout; the layout itself is never regenerated, reordered, or reworded at runtime. Rendered by `apps/web/src/components/wizard/OfficialFormView.tsx`.
- **Tier B — composed documents** (customer applications, the new forwarding letter / approval note, checklists): ClaimSahayak has latitude to assemble these, using the pre-existing `TemplateDefinition`/`TemplateField` model (`packages/rule-pack/src/data/templates.ts`), now extended with an optional `claimDataField` per field. Rendered by the same `PrintableTemplate.tsx` component every M4.3 pause-card letter already used — extended, not duplicated.

**Honesty note on "prescribed structure and wording"**: Tier A's layouts approximate the real gazetted forms at a level useful for auto-fill (field order, labels), authored by the same reasoning process used throughout this pack (not transcribed from a scanned official PDF, since none exists in this repo). `packages/rule-pack/src/data/official-forms.ts`'s own doc comment says so explicitly and points a future session at `knowledge-base/forms/document-library.md` for re-verification before this is treated as certified. Output is print-CSS HTML via the browser's own print dialog ("Save as PDF") — not a pixel-perfect overlay of a scanned form image.

## 6. Claim Data Model shape

`packages/shared-types/src/claim-data.ts`:

```ts
interface Party { name: string; address?: string; relationship?: string }
interface ClaimDataModel {
  claimant: Party;
  depositor: Party;                              // the deceased account holder
  guardian?: Party;
  nominees: readonly Party[];                     // bounded, max 4 (MAX_NOMINEES)
  legalHeirs: readonly Party[];                    // bounded, max 4 (MAX_LEGAL_HEIRS)
  witnesses: readonly Party[];                     // bounded, max 2 (MAX_WITNESSES)
  accountNumbers: Readonly<Record<number, string>>; // keyed by AccountChecklist.accountIndex
  officeName: string;
}
```

`ClaimDataField` is a **closed string-literal union** (`"claimant.name" | "depositor.name" | "nominee.0.name" | ... | "account.number"`), not a free dotted-path string — `resolveClaimDataValue` (`packages/rule-engine/src/autofill.ts`) is a plain exhaustive `switch`, so an invalid field reference is a TypeScript compile error, never a silent runtime no-op. `account.number` is resolved separately (`resolveAccountNumber`) since it needs the caller's `accountIndex`, which the closed-union switch alone can't carry.

**Deliberately excluded from the model**: competent authority, monetary limit, applicable rule ids, citations, decision text, timeline — all of that already lives on `ClaimDecision`/`AccountChecklist` (computed by the frozen Rule Engine) and is read directly from there by every document renderer. Duplicating it into the Claim Data Model would have violated the brief's own Part 9 ("use Rule Engine + Claim Data Model only, never duplicate Rule Engine logic").

**Deliberately never auto-filled**: the "date and place"/signature blank lines every template has had since M4.3 stay hand-fill — the actual submission date is only known when the claimant physically visits the counter, so pre-filling it would be a fabrication, not an auto-fill.

**Bounded, not unbounded, party lists**: a scoping choice for type-safety (a closed `ClaimDataField` union can't index an unbounded array). Reported honestly, not silently — a household with 5 legal heirs currently has no 5th slot; the UI's "Add" button simply stops offering once the cap is reached.

## 7. Document selection — mostly already existed

The research phase (before any code was written) confirmed **document selection was already fully dynamic**: `collectOutputBucketIds`/`collectOutputItems` (`rule-engine/src/outputs.ts`) + `buildSections` (`sections.ts`) already compute exactly which forms/documents/people/affidavits/indemnityBonds/declarations a resolved route+overlays need, purely from authored `OutputRule` data — nothing hardcoded, unchanged since M3. The only real gap: `ChecklistItem` dropped `OutputRule.refId`, so there was no path from "item shown to the user" back to the `FormDefinition`/`DocumentDefinition` record a document renderer needs (signatories, stamp paper, copies, official source URL).

**Fixed additively**: `ChecklistItem` gained an optional `refId?: string` (`packages/shared-types/src/checklist.ts`), `sections.ts`'s `toChecklistItem` now carries it through (one line), and **new** `packages/rule-engine/src/documents.ts` — `resolveDocumentSelection(rulePack, account)` — is a **thin join** over an already-resolved `AccountChecklist.sections`, resolving each item's `refId` against `rulePack.forms`/`rulePack.documents`. It re-implements nothing: no routing, no output-bucket logic, no section-grouping. `refId` is an internal id (e.g. `"form_11"`) and is never rendered as visible text — the standing no-internal-id regression guard (`Wizard.test.tsx`, extended in `ClaimPackage.test.tsx`) checks this explicitly, including a new `form_\w+`/`doc_\w+`/`template_\w+` pattern.

## 8. New Rule Engine surface (`packages/rule-engine/src/`)

- **`documents.ts`** — `resolveDocumentSelection(rulePack, account): DocumentSelectionEntry[]` (§7 above).
- **`autofill.ts`** — `resolveClaimDataValue(model, field)` / `resolveAccountNumber(model, accountIndex)` (§6 above).
- **`claim-validation.ts`** — `validateClaimPackage(rulePack, accounts, claimData, officialFormLayouts, officeDocumentTemplates): ClaimValidationIssue[]`. Checks every mandatory (non-`manual`) `claimDataField` slot on a *selected* official form or office document has a resolved value. Deliberately non-fatal (a `message`-only issue, no severity gate) — a claim package with gaps can still legitimately be printed, since a real Postmaster may complete the rest by hand at the counter. This is a **different concern** from `@claimsahayak/rule-pack`'s `validate/*` pipeline (which checks the *authored pack* is internally consistent, not a *live claim*'s generated documents) — `rule-engine` does not import from `rule-pack` (would invert the package layering), so this follows the same `{path/field, message, severity}`-flavored shape as `rule-pack`'s validators by convention, not by shared code.
- All three exported from `index.ts`, alongside the newly-public shared-types (`ClaimDataModel`, `ClaimDataField`, `Party`, `FormDefinition`, `DocumentDefinition`, `TemplateDefinition`, `TemplateField`, `OfficialFormLayout`, `OfficialFormField`).
- `rule-engine` was already "M5/M6-modified, not frozen" per the M5 handover's own risk note — this is now its third milestone of additive changes. Still true: **always run the full test suite after touching it.**

## 9. New Rule Pack data (`packages/rule-pack/src/data/`)

- **`official-forms.ts`** (new) — `OFFICIAL_FORM_LAYOUTS: readonly OfficialFormLayout[]`, one entry each for `form_11`/`form_13`/`form_14`/`form_15` (the four forms actually reachable in the current pack's routes, confirmed via `route-a.ts`/`route-c.ts`). **Not** part of the schema-validated `RulePack` interface — it's a standalone export (`packages/rule-pack/src/index.ts` re-exports it directly), deliberately *not* wired into `parseRulePack`/`validate-pack`'s JSON-schema pipeline, since `RULE_PACK` is consumed as a direct TypeScript import by the live app (not JSON-parsed) — see `docs/rule-pack.md`/`data/index.ts` if that assumption ever changes. Six more `FormDefinition`s (SCSS Form-4, NC-54(a)/(b), SB-7B, AOF/KYC, Form 10) have **no layout authored yet** — an honest gap, same convention as the 53.6% CS-ID coverage number; not currently reachable from any live route, so this doesn't block auto-fill for any real claim today.
- **`office-documents.ts`** (new) — `OFFICE_DOCUMENT_TEMPLATES`: two composed `TemplateDefinition`s — `template_forwarding_letter` and `template_approval_note` — spliced into the pack's real `templates` array (`data/index.ts`: `templates: [...TEMPLATES, ...OFFICE_DOCUMENT_TEMPLATES]`), so they get the exact same schema/print pipeline every claimant letter already uses. Copy-lint required "sanction" → "approval" (the pack's own forbidden-jargon map, `vocab.ts`) — already applied; if authoring a new office document, check `vocab.ts` before using "sanction" anywhere.
- **`validate/orphans.ts`** — `checkNoOrphanTemplates` gained one small allowlist: the two office-document template ids are treated as reachable-by-design (they're always available in the Claim Package for any payable decision, never gated behind a specific `CardDefinition.templateId` or `OutputRule.refId` the way a claimant pause-card letter is), rather than fabricating a fake reference just to satisfy the orphan check.
- `packages/rule-pack/src/data/questions.ts` was **not** touched — the original plan sketch proposed new `inputType: 'text'` questions flowing through the Q1–Q10 wizard pipeline; this was revised during implementation (§11 below) in favor of a dedicated data-entry screen, so no new `QuestionDefinition`s or `AnswerValue` kinds were needed at all.

## 10. `validate-pack` / copy-lint gotchas hit during authoring

Two real errors were caught by the existing pipeline while authoring `office-documents.ts` — both fixed, but worth knowing if authoring more office documents:
1. **copy-lint**: "sanction" is forbidden vocabulary (`vocab.ts` maps it to "approval"). Templates were renamed `template_sanction_note` → `template_approval_note` and all body text updated.
2. **provenance**: `handbookRef` must match `/§|FAQ|Annexure|SB Order|Blueprint|NV-|R-\d|GSPR|.../` — a plain `"Milestone 7 (...)"` string fails. Used `"Blueprint v2 §3.4 (printable templates); Milestone 7 (...)"`, the same pattern `card_dual_preview` (T20) already uses for UI-authored content with no Rule Book row.

## 11. Where the plan changed during implementation (and why)

The approved plan sketched a broader surface than what actually shipped; every deviation was toward **less** new surface area, not more, for lower risk:

1. **No new `AnswerValue` kind, no new `QuestionDefinition`s.** The plan considered adding `AnswerValue.kind: 'text'` flowing through the existing `OptionList`/`QuestionRenderer` single-question-per-screen pipeline. Revised: the Claim Data Model lives in its **own** React state (`Wizard.tsx`'s `claimData`), populated by a dedicated multi-field screen (`ClaimDetailsForm.tsx`) that never touches `AnswersState`/`SessionState`/the Q1–Q10 routing pipeline at all. This is simpler, avoids touching the core answer-model exhaustiveness switches several existing tests rely on, and makes "never persisted to localStorage" true *by construction* (there's no code path for it to reach `saveSession` — it's a different state variable entirely) rather than by a filter that could be forgotten later.
2. **No new `ChecklistItem`-derived "office checklist" template.** Rather than authoring a third composed document duplicating the same requirement data `ClaimDecisionSummary` already renders, the office checklist (Part 5 item 10) is a compact `<table>` (`ClaimPackage.tsx`'s `OfficeChecklistTable`) built directly from the same `account.sections` data — a second **rendering**, not a second **selection**, of the one true requirement list.
3. **"Auto-filled applications" (Part 5 item 6) has nothing to show today.** The existing claimant-facing letter templates (`template_nomination_request` etc.) are all pause-card artifacts (`CardDefinition.templateId`), relevant only *before* a decision is reached — the Claim Package only exists *after* one. The auto-fill mechanism (`PrintableTemplate`'s new optional `claimData`/`accountIndex` props) works correctly the moment such a template is ever wired to a decision-bearing route; none currently are. Not silently dropped — stated here and in the completion report.
4. **The Claim Package is opt-in, not the new default terminal.** The plan's architecture list implied replacing the terminal ternary's decision/results branches; implementation instead **added** a new branch gated on a `showClaimPackage` toggle, leaving the M5/M6 default rendering byte-identical. This was the single highest-value risk reduction: all 99 pre-existing tests pass completely unmodified, and a user who never clicks "Generate complete Claim Package" sees exactly the M6 experience.
5. **`packageAccounts` filters on `decisionStatus === "payable"`, not "has a decision".** `resolveClaimDecision` attaches a decision to *every* terminal uniformly (M5's own design), including stop/wait/pause cards and the `not_applicable` "no claim needed" survivor case. Auto-filling a full document package only makes sense once there's a real amount to pay — this was caught during test-writing (the "joint account" scenario test), not anticipated in the plan.

## 12. Files changed

```
M  apps/web/src/app/start/page.tsx
M  apps/web/src/components/wizard/PrintableTemplate.tsx
M  apps/web/src/components/wizard/Wizard.tsx
M  apps/web/src/i18n/wizard.ts
M  docs/architecture-overview.md
M  packages/rule-engine/src/index.ts
M  packages/rule-engine/src/sections.ts
M  packages/rule-pack/src/data/index.ts
M  packages/rule-pack/src/index.ts
M  packages/rule-pack/src/validate/orphans.ts
M  packages/shared-types/src/checklist.ts
M  packages/shared-types/src/index.ts
M  packages/shared-types/src/rule-pack.ts
?? apps/web/src/components/wizard/ClaimDetailsForm.tsx
?? apps/web/src/components/wizard/ClaimPackage.tsx
?? apps/web/src/components/wizard/OfficialFormView.tsx
?? apps/web/src/lib/wizardClaimData.ts
?? apps/web/test/wizard/ClaimPackage.test.tsx
?? packages/rule-engine/src/autofill.ts
?? packages/rule-engine/src/claim-validation.ts
?? packages/rule-engine/src/documents.ts
?? packages/rule-engine/test/autofill.test.ts
?? packages/rule-engine/test/claim-validation.test.ts
?? packages/rule-engine/test/documents.test.ts
?? packages/rule-pack/src/data/office-documents.ts
?? packages/rule-pack/src/data/official-forms.ts
?? packages/shared-types/src/claim-data.ts
?? docs/HANDOVER_M7.md
```

## 13. Documents / forms supported (completion report §3–6)

**Auto-filled official forms (Tier A)**: Form 11 (claim application), Form 13 (affidavit), Form 14 (letter of disclaimer), Form 15 (indemnity bond). **Not yet authored** (reachable-form gap, §9): SCSS Form-4, NC-54(a), NC-54(b), SB-7B, Form 10, AOF/KYC — none are on a currently-reachable route, so this doesn't block any real claim today; the next session raising this should follow §9's "how" note.

**Auto-filled composed documents (Tier B)**: the office forwarding letter and internal approval note (new, always available for any payable decision), plus every M4.3 claimant pause-card letter (nomination-request, both reconciliation-certificate letters, no-passbook request) — auto-fill-**capable** now via the extended `PrintableTemplate`, though none currently has a `claimDataField` populated on its fields (they're pre-decision, so no Claim Data Model exists yet when they render — see §11 item 3).

**Auto-fill coverage**: every `ClaimDataField` slot resolves correctly (`autofill.test.ts`, `claim-validation.test.ts` — 10 unit tests). Live-verified in the browser: office name, depositor name, account number, and claimant name all correctly auto-filled into Form 11 and the forwarding letter simultaneously from one data-entry pass; the missing-information prompt correctly listed only the genuinely-unfilled fields (relationship, address, both witnesses) and cleared as each was filled.

**Unsupported documents**: no PDF-file generation (browser print → "Save as PDF" only, per the document-fidelity note in §5); no per-account nominee/legal-heir lists (claim-level only, §6); no persistence of entered details across a session reload (§4, deliberate).

## 14. Manual testing status

All 8 named scenarios (nomination exists, no nomination, multiple nominees, minor nominee, joint account, legal heir, court order required, different sanctioning authorities) are covered by `apps/web/test/wizard/ClaimPackage.test.tsx`, driven end-to-end through the real `Wizard`/`RULE_PACK`, confirming correct form/document selection, correct auto-fill, correct authority/court-order/reference rendering, and the no-internal-id guard. One scenario (nomination exists, ROUTE_A) was additionally verified live in the Claude Browser pane against a real `next dev` server: reached the decision, opened the Claim Package, entered claimant/depositor/office/account details, confirmed the values appeared correctly in both Form 11 and the forwarding letter, confirmed the missing-information list and its live-clearing behavior, and confirmed the print area/button wiring. A genuine UX bug was found and fixed during this pass — see §15.

## 15. Bug found and fixed during manual QA

The per-account "account number" input's visible `<label>` was just the scheme's display name (e.g. "Savings Account") with no indication it was for the account number — a real user would not have known what to type there. Fixed in `ClaimDetailsForm.tsx` to read `"Account / certificate number — Savings Account"`. This was only caught by driving the real rendered DOM in a browser, not by any automated test (the test suite queries by the (correct) intent, not by what a first-time user would visually see) — a reminder that automated coverage and manual QA catch different classes of bug.

## 16. Test status

**302/302 passing** across all 9 packages (was 281 at the end of M6):

| Package | Tests | Delta from M6 |
|---|---|---|
| shared-types | 10 | — |
| shared-config | 3 | — |
| shared-utils | 15 | — |
| design-tokens | 12 | — |
| rule-engine | 121 | +13 (documents/autofill/claim-validation) |
| rule-pack | 28 | — |
| apps/backend | 5 | — |
| apps/admin | 1 | — |
| apps/web | 107 | +8 (ClaimPackage.test.tsx) |

`pnpm -r --no-bail run typecheck`: clean except the one pre-existing, deliberately-untouched `shared-types/test/contracts.test.ts` failure (documented since M4, still not this milestone's concern). `pnpm --filter @claimsahayak/rule-pack run validate-pack`: PASS, 0 errors, 1 warning (locale coverage — unchanged, hi translations remain a separate future pass).

## 17. Remaining technical debt (carried over + new)

Everything in `docs/HANDOVER_M5.md` §7 not touched by M6/M7 still applies (generic Form 11 for the 8 non-SCSS schemes, NSC/KVP list-typed-facts engine gap, 53.6% CS-ID coverage, `pnpm lint` pre-existing breakage, the one frozen `shared-types` tsc failure). New from M7:

1. **Six `FormDefinition`s have no `OfficialFormLayout`** (§9, §13) — not currently reachable from any route, so not urgent, but the next session raising CS-ID coverage or adding scheme-specific forms (M6 handover's own §18 item 4) should author layouts for whatever it makes newly reachable.
2. **No auto-fill-populated claimant application letters** (§11 item 3, §13) — the mechanism exists; no current template is wired to fire post-decision.
3. **Party lists are claim-level, not per-account** (§6) — a claim with genuinely different nominees per scheme in a multi-account session will have its Claim Data Model's `nominees`/`legalHeirs` shared across all accounts. Flagged as a scoping choice, not a bug, but a future session extending multi-account document generation should revisit this.
4. **Bounded party arrays (max 4/4/2)** — a household with more nominees/heirs/witnesses than the cap has no additional slots. Raising the cap is a type-level change (`ClaimDataField`'s literal union) plus a `ClaimDataModel` field-shape change; not a quick fix.

## 18. Suggested Milestone 8 scope

In priority order, independently scoped:

1. **Author `OfficialFormLayout`s for the remaining 6 `FormDefinition`s**, paired with whatever work makes them reachable (scheme-specific forms, per M6 handover §18 item 4) — the two naturally belong together.
2. **Wire at least one claimant-facing application template to auto-fill post-decision** (§11 item 3) — closes the one genuinely empty section in the Claim Package today.
3. **Multi-account document generation with per-account nominee/legal-heir lists** (§17 item 3) — a real design question (does the UI ask "which nominees apply to which account?"), scope it before implementing.
4. **`pnpm lint` cleanup** (carried over from M5/M6, still not urgent, still accumulating).
5. Continue raising CS-ID coverage opportunistically (per M5 handover §11's "how").

**Do not** silently persist the Claim Data Model to `localStorage` without raising it explicitly first (§4) — that reverses a deliberate, user-approved privacy decision, not a bug to "fix."

## 19. Anything the next Claude session MUST know

1. **The M6/M7 numbering collision is real and permanent in `git log`** — three `feat(m6.N)` commits exist for a different scope than what a later "Milestone 6" prompt in the same conversation described. Always check `git log` before trusting a prompt's own milestone number.
2. **The Claim Data Model is intentionally NOT part of `SessionState`/`AnswerValue`.** Don't "fix" this by merging them — it's the mechanism that keeps PII out of `localStorage` by construction (§4, §11 item 1).
3. **`resolveClaimDataValue`'s closed-union switch has no `default` case** — TypeScript's own exhaustiveness check is the safety net if `ClaimDataField` ever grows a new member; keep it that way rather than adding a catch-all.
4. **`OFFICIAL_FORM_LAYOUTS` is deliberately outside the schema-validated `RulePack` shape** (§9) — if a future session wires dynamic pack loading (`loadRulePack`) to also fetch official-form layouts, that's new plumbing to design, not an oversight to patch.
5. **The Claim Package button only appears for `decisionStatus === "payable"`** (§11 item 5) — this is correct behavior, not a filter to loosen; a stop/wait/dispute/survivor outcome has nothing to auto-fill.
6. **Every M4–M6 test passes completely unmodified** — if a future change to `ClaimDecisionSummary`/`ChecklistResults`/`Wizard.tsx`'s default branches breaks any of them, that's a real regression in the pre-M7 product, not collateral damage to wave away.
