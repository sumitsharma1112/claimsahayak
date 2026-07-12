# ClaimSahayak — Milestone 9 Handover

**Purpose of this document**: a brand-new Claude Code (or human) session should be able to read this file alone and continue development without re-deriving any architectural decision made in M1–M9. Where this document and the code disagree, **the code is the source of truth**.

---

## 1. Current Git branch / commit

`master`. Run `git log -1` for the exact SHA — expect a `feat(m9): ...` commit on top of M8's `c7838d4`.

## 2. What this milestone is

Per the M8 handover's own §2/§7, M9 was scoped as "Form Coverage Expansion: author the remaining 6 `OfficialFormLayout`s" — the six `FormDefinition`s that had structural pack data (`forms.ts`) but no Tier A fixed field layout: `form_10_nomination`, `form_aof_kyc`, `form_sb7b`, `form_scss_form4`, `form_nc54a`, `form_nc54b`. All six now have layouts, joining `form_11`/`form_13`/`form_14`/`form_15` from M7 — `OFFICIAL_FORM_LAYOUTS` now covers all 10 forms the pack defines.

## 3. Correction to the M7 record

M7's `official-forms.ts` comment (and the M7/M8 handovers) claimed the 6 remaining forms were "not currently reachable from any live route" — **this was wrong**, verified by grep before any M9 code was written. All 6 are genuinely reachable:

| Form | Reached via |
|---|---|
| `form_10_nomination` | `outputs/continue-addon.ts` — `CONTINUE_ADDON` (any continuable scheme, `q8_close_or_continue == "continue"`) |
| `form_aof_kyc` | `outputs/continue-addon.ts` (`CONTINUE_ADDON`) and `outputs/minors.ts` (`ROUTE_SSA_MINOR`) |
| `form_sb7b` | `outputs/minors.ts` — `ROUTE_SSA_MINOR` (SSA, `q2_who_died == "child"`) |
| `form_scss_form4` | `overlays.ts` — `scss_spouse_continuing` flag (any SCSS claim with that Q10 option ticked) |
| `form_nc54a` / `form_nc54b` | `overlays.ts` — `passbook_lost` flag (any claim with that Q10 option ticked) |

They just weren't exercised by M7's 8 test scenarios, which were chosen to cover the vision's *named* scenarios (nomination/no-nomination/multiple-nominees/etc.), not the *continuation*/*overlay* paths. This is now corrected in `official-forms.ts`'s own header comment and proven by 5 new reachability tests (§5) — not just asserted.

## 4. Confidence levels are not uniform across the 10 layouts

`form_11`/`form_13`/`form_14`/`form_15` (M7) and `form_10_nomination`/`form_aof_kyc`/`form_sb7b`/`form_scss_form4` (M9) are all reasonable structural approximations sourced from the `FormDefinition`'s own authored `purpose`/`signatories` text (itself Rule-Book-researched during M2/M5) — the same confidence level as M7's four.

**`form_nc54a`/`form_nc54b` are explicitly lower-confidence**, flagged in `official-forms.ts`'s header comment and per-record: the pack's *own* pre-existing overlay copy for these two already says *"the Post Office will confirm the exact execution requirements when you reach this step"* — i.e. even the original M2 authors treated these as under-specified. Their layouts are a defensible structural guess (claimant/depositor/certificate identity + surety/bank-guarantee details), not a claim of verified fidelity. A future session with the actual NC-54(a)/(b) specimen should re-verify before raising confidence on these two specifically.

## 5. A genuine correctness decision worth knowing about: `form_10_nomination`

Form 10 in the `CONTINUE_ADDON` context is a *new* nomination — the claimant (now the continuing account holder) naming someone else as *their own* nominee going forward. This is a **different person** from anything already in the Claim Data Model (`nominees[]` holds the *deceased's* nominees). The layout deliberately does **not** reuse `nominee.0.name`/etc. for this form's nominee field — doing so would have silently auto-filled the deceased's old nominee's name into a brand-new nomination naming someone potentially entirely different, which is a real correctness bug, not just an inconvenience. That field stays `manual` by design; there's no `ClaimDataField` for "who the claimant is newly nominating" and one should not be added without designing for it properly (it's a different kind of fact than everything else in the model, which is entirely about the *existing* claim, not a *future* account's nomination).

## 6. What was built

- **`packages/rule-pack/src/data/official-forms.ts`** — 6 new `OfficialFormLayout` entries appended to the existing array (10 total now). Header comment rewritten (§3, §4).
- **`packages/rule-engine/test/official-forms-reachability.test.ts`** (new, 5 tests) — proves, via `evaluateAccount` + `resolveDocumentSelection` against the real `RULE_PACK`, that each of the 6 new forms is actually selected by its real route/overlay AND has a matching `OFFICIAL_FORM_LAYOUTS` entry — exactly the condition `ClaimPackage.tsx`'s `AutoFilledDocuments` checks before rendering. This is a direct proof the Claim File will surface these forms, not just that the data exists in isolation.
- No changes to `apps/web`, `shared-types`, or any other engine module — `resolveDocumentSelection`/`OfficialFormView`/`ClaimPackage.tsx` from M7/M8 already handle any form with a matching layout generically; adding layout data was sufficient.

## 7. Verified

**312/312 tests** across all 9 packages (was 307 at end of M8: +5 new `official-forms-reachability.test.ts` cases). Typecheck clean except the one documented pre-existing `shared-types` failure. `validate-pack` PASS (the `OfficialFormLayout` array isn't part of the schema-validated `RulePack`, per M7's design — see `official-forms.ts`'s own comment — so this run had nothing new to check there; TypeScript itself is the safety net for `claimDataField` validity).

**Live browser QA**: drove a real RD ("continue the account") claim end-to-end in the Claude Browser pane. Confirmed both `form_aof_kyc` ("Account Opening Form and KYC documents") and `form_10_nomination` ("Form 10 — nomination form") appear correctly in the assembled Claim File (15 total `.cs-print-page` sections, cover page first), with the entered office name and claimant name correctly auto-filled on both, the account number correctly left blank (never entered in this pass), and Form 10's "new nominee" field correctly staying manual per §5. Zero console errors.

## 8. Remaining scope (carried forward)

- **M10** (Guardian/Minor Nominee Declaration formal text) — still gated on a research pass per the M8-approved plan; no Rule-Book-sourced format was found in `knowledge-base/` as of M8, and M9 did not re-investigate this (different concern — M9 was about official *forms*, not composed *declarations*).
- **`form_scss_form4`/`form_sb7b`/`form_nc54a`/`form_nc54b` confidence levels** (§4) — worth raising if real specimen material becomes available.
- Every other item in `docs/HANDOVER_M8.md` §7 (witness address/signature auto-fill, mobile/identity-detail fields, print index page numbers) is unchanged by M9.
- The **scheme-specific claim forms gap** (RD/TD/NSC/KVP/MIS/PPF/POSA all route through generic Form 11 for the primary claim itself, per `document-library.md`'s DOC-C4–C11 rows listing scheme-specific claim/repayment forms) is a **different, larger, separately-flagged gap** (M5/M6 handover technical debt, "generic Form 11 instead of scheme-specific claim forms") — M9 did not touch this; do not conflate the two. M9 closed the 6-form Tier-A layout gap that already existed in the pack's own `forms.ts`, not this one.

## 9. Anything the next Claude session MUST know

1. **The M7/M8 "not reachable" claim about these 6 forms was wrong — always verify reachability by grep/route-walk before asserting it in a handover, not by assumption.** This correction is now the record of truth; don't revert to the old claim.
2. **`form_nc54a`/`form_nc54b` are explicitly lower-confidence** (§4) — don't silently promote them to the same certainty as the others without new source material.
3. **Never wire `nominee.N.name`/`legalHeir.N.name` into a form field that represents a genuinely different person than "the deceased's nominee/legal heir"** (§5) — check what the field actually means in context before reaching for an existing `ClaimDataField`, even if the label looks similar.
4. **The mechanism (resolveDocumentSelection/OfficialFormView/ClaimPackage.tsx) needed zero code changes for M9** — adding a new official form to auto-fill coverage is, going forward, purely a data-authoring task (`official-forms.ts`), not an engineering task, as long as the form is already in `forms.ts` and referenced by a real `OutputRule`/overlay. This is the intended, load-bearing generality of the M7 architecture — a future session adding an 11th form should not need to touch any `.tsx` file.
