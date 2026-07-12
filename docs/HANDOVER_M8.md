# ClaimSahayak — Milestone 8 Handover

**Purpose of this document**: a brand-new Claude Code (or human) session should be able to read this file alone and continue development without re-deriving any architectural decision made in M1–M8. Where this document and the code disagree, **the code is the source of truth**.

---

## 1. Current Git branch / commit

`master`. Run `git log -1` for the exact SHA — expect a `feat(m8): ...` commit on top of M7's `b08054d`.

## 2. What this milestone is

The user issued a "Vision 2.0 — Complete Claim File Generator" request: a 24-item document list (cover page, index, decision summary, authority/limit/reference sheets, every official form, affidavits/bonds/declarations, witness sheets, office forwarding letter/note/sanction memo, missing document report, final checklist), assembled in real physical-filing order with each document starting on its own printed page. Per the user's explicit instruction, a full written analysis (comparing the vision against M1–M7, gaps, reusable components, effort, milestones, risks, strategy) was produced and approved **before any code was written** — see the conversation for the full analysis; this handover only records what was actually decided and built.

**M8 scope, as approved**: the presentation layer only — cover page, print index, per-document pagination, and promoting data that already existed (from M5's `ClaimDecision`, M7's `validateClaimPackage`) into dedicated pages. **Zero new legal content, zero new engine computation.** Two follow-on milestones were identified but explicitly deferred:
- **M9** (not started): author `OfficialFormLayout`s for the 6 remaining `FormDefinition`s.
- **M10** (not started, and gated): Guardian/Minor Nominee Declaration formal text — **blocked on a research pass** to confirm whether Rule-Book-sourced declaration wording actually exists; research found none in `knowledge-base/` today. Do not author declaration wording without that confirmation — see §5.

## 3. Two decisions made with the user before coding

1. **Guardian/Minor Nominee Declarations**: research (done before implementation) found **zero** Rule-Book-sourced format for either, anywhere in the repo or `knowledge-base/`. The user chose **"research first"** over "draft now as a generated application" — M10 must not author this wording until a dedicated research pass either finds a real source or confirms none exists (in which case these stay as today's `doc_guardianship_certificate`/`doc_minor_alive_certificate` — "bring this," not "sign this declaration").
2. **Mobile numbers / identity details (Aadhaar/PAN-type)**: the vision's list adds these to the Claim Data Model. The user chose to treat them exactly like every other field — session-memory only, same as M7 — no new privacy tier. **Note: neither field was actually added to `ClaimDataModel` in M8** (see §7) — this decision governs *if/when* they're added, not a claim that they exist yet.

## 4. What was found during analysis (saved a lot of scope)

- **"Annexure N" is never a standalone document** — every occurrence anywhere in the pack and `knowledge-base/forms/document-library.md` is a citation label attached to an existing form/letter (e.g. Form 13 → "Annexure 6"). The vision's "Every required Annexure" item is already satisfied by the forms/letters that cite them; no new "annexures" section was built.
- **Competent Authority / Monetary Limit / Rule References / Missing Document Report** needed **zero new data** — `ClaimDecision` (M5) and `validateClaimPackage` (M7) already carried everything; this milestone is pure re-presentation.
- **The hardest architectural principle in the vision — official forms preserve wording, non-official documents are clearly marked as generated — was already built in M7** (the Tier A/Tier B model). M8 didn't need to touch it.

## 5. What was actually built

- **`apps/web/src/app/globals.css`** — new `@media print { .cs-print-page { break-before: page; } .cs-print-page:first-child { break-before: auto; } }`, additive to the existing M4.3 visibility-based `.cs-print-area` mechanism (unchanged). Verified live: the compiled rule is present in the page's stylesheets and every top-level document in the assembled file carries the class.
- **`packages/rule-pack/src/data/office-documents.ts`** — two new composed (Tier B) templates, joining the two from M7:
  - `template_office_note` — general internal case-noting record, distinct from `template_approval_note` (the formal authority/amount record, i.e. the "sanction memo").
  - `template_witness_sheet` — a standalone witness page (previously witness names only ever appeared as two fields embedded in Form 11 itself). Only names auto-fill (`witness.0.name`/`witness.1.name` — the only witness fields `ClaimDataField` has); addresses and signatures stay hand-fill, since no `ClaimDataField` slot for witness address exists (not added in M8 — see §7).
  - Both automatically picked up by M7's `checkNoOrphanTemplates` allowlist (it's built from `OFFICE_DOCUMENT_TEMPLATES.map(t => t.id)`, no orphans.ts edit needed) and by `validate-pack`'s copy-lint ("approval," never "sanction," per `vocab.ts`, same as M7).
- **`apps/web/src/components/wizard/ClaimPackage.tsx`** — restructured from "one card per account" (M7) into a fully assembled, paginated Claim File:
  - **Cover page** (new `CoverPage`): claimant, depositor, scheme(s), office, a client-side-only "prepared on" date (display-only, never fed back into the engine or persisted).
  - **Print index** (new `FileIndex`): built from the *same* ordered entry list the body renders — not a second, hand-maintained list that could drift.
  - **Competent Authority Sheet / Monetary Limit Sheet / Rule References** (three new small components): each reads directly from the account's `ClaimDecision`, exactly the same object `ClaimDecisionSummary` (reused unmodified) already renders inline — the information is intentionally restated on its own page, matching how a physical claim file actually repeats key facts (account number, authority) across multiple documents by design, not an accidental duplicate.
  - **Missing Document Report**: `validateClaimPackage`'s output (M7), promoted from a small inline box into its own full page at the end of the file, covering every account together.
  - Every entry is wrapped in a `.cs-print-page` div; entries are built once per account via `buildAccountEntries` and reused for both the index and the body.
- **`apps/web/src/i18n/wizard.ts`** — 11 new chrome keys (en + hi), following the existing flat dictionary pattern.
- **`apps/web/test/wizard/ClaimPackage.test.tsx`** — 5 new tests: cover page + index content, page count/ordering (cover page first), the three new dedicated sheets, the two new composed documents, and live claim-data reflecting onto the cover page. All 8 M7 scenario tests continue to pass unmodified against the restructured component.

## 6. Verified

**307/307 tests** across all 9 packages (was 302 at end of M7: +5 new `ClaimPackage.test.tsx` cases). `pnpm -r --no-bail run typecheck`: clean except the one documented pre-existing `shared-types` failure. `pnpm --filter @claimsahayak/rule-pack run validate-pack`: PASS, 0 errors.

Live browser QA (Claude Browser pane, real `next dev` server): drove a ROUTE_A claim end-to-end to the Claim Package, entered claimant/depositor/office/account details, and confirmed via DOM inspection: **13 correctly-ordered `.cs-print-page` sections** — Cover → Index → Decision Summary → Competent Authority Sheet → Monetary Limit Sheet → Rule References → Form 11 → Forwarding Letter → Approval Note → Office Note → Witness Sheet → Office Checklist → Missing Document Report. Confirmed the compiled print-pagination CSS rule is actually present in the page's stylesheets (not just written in source and silently dropped by the build). Zero console errors.

## 7. Known gaps / deliberately not done in M8

1. **No `witness.N.address` / `witness.N.signature` in `ClaimDataField`** — the Witness Sheet's address/signature fields are hand-fill-only by construction (not a bug; extending `ClaimDataField` was out of this milestone's scope).
2. **Mobile numbers and identity details are NOT in `ClaimDataModel`** — the user's answer in §3 item 2 says *how* to handle them *if* added, not that they were added. A future session adding them should extend `ClaimDataModel`/`ClaimDataField`/`ClaimDetailsForm.tsx` following the exact pattern already used for every other field.
3. **Print index has no page numbers** — browsers don't expose page-position information to JavaScript before the print engine actually paginates, so the index lists document titles in order only, not "page 4." Stated here so it isn't mistaken for an oversight.
4. **Vision item ordering vs. what shipped**: the vision listed "Print Index" as item 23 (near the end); it was placed **right after the cover page** instead, since a table of contents at the back of a physical file isn't useful — a deliberate, documented reordering, not a numbering mistake.
5. **M9 (remaining 6 form layouts) and M10 (declaration research)** — not started, per the approved milestone split. Do not begin either without being asked, per the project's standing convention (every prior milestone transition in this project has followed the same rule).

## 8. Anything the next Claude session MUST know

1. **`FileIndex` and the document body render from one shared `bodyEntries` array** (`ClaimPackage.tsx`) — if a future change adds a new document type, add it to `buildAccountEntries` (or the top-level `bodyEntries` array for file-wide entries like the Missing Document Report), never render something in the body without also giving it an entry, or the index will silently omit it.
2. **The Competent Authority/Monetary Limit/Rule References sheets deliberately restate data `ClaimDecisionSummary` already shows.** Don't "deduplicate" this by removing the sheets or stripping the fields from `ClaimDecisionSummary` — a physical claim file is expected to repeat key facts across multiple documents (this is explicitly documented in §5, and both `ClaimPackage.test.tsx` and the M8 approval assume this).
3. **M10 is gated on research, not implementation readiness.** If a future session is asked to "just build the Guardian/Minor Declarations," point back to §3 item 1 — the blocking question (does a real format exist?) was never resolved, only deferred.
4. **`.cs-print-page` is purely a print-media construct** — it has zero effect on screen rendering (confirmed by the `@media print` wrapper); don't expect it to affect on-screen layout, and don't remove it thinking it's dead CSS.
