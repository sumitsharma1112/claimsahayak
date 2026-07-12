# ClaimSahayak — Milestone 10 Handover

**Purpose of this document**: a brand-new Claude Code (or human) session should be able to read this file alone and continue development without re-deriving any architectural decision made in M1–M10. Where this document and the code disagree, **the code is the source of truth**.

---

## 1. Current Git branch / commit

`master`. Run `git log -1` for the exact SHA — expect a `feat(m10): ...` commit on top of M9's `9e78de6`.

## 2. What this milestone was, and the discipline it followed

M10 was scoped by the M8-approved plan as: **"Guardian/Minor Nominee Declaration formal text — gated on a research pass to confirm whether Rule-Book-sourced declaration language actually exists. Do not author wording without that confirmation."** The working assumption going in (from the Vision 2.0 analysis, before M8) was that no such format existed anywhere — that assumption came from a single grep-based check.

M10 opened with a **second, deeper research pass** — reading the actual locked, verified Rule Book topic files (`knowledge-base/official-rule-book/topic-05-minor-nominee.md`, its verification report, and `knowledge-base/forms/forms-catalog.md`) rather than re-grepping. **This changed the answer**: the original all-three-are-missing assumption was only 1/3 correct.

## 3. What the research found (the actual outcome, not the original assumption)

| Requested declaration | Finding | Source |
|---|---|---|
| **Minor "alive and required" declaration** | **A real format EXISTS.** R60(7)(c) requires "a certificate that the minor is alive and that the money is required on behalf of the minor"; cognate GSPR 12(2)/20(2) quote the actual wording pattern. Verification Status: **VERIFIED**, Confidence: **High**. | CS-MIN-007, `topic-05-minor-nominee.md` |
| **Guardian Declaration** | **Confirmed NOT to exist — with a reason.** A natural guardian (parent) needs no certificate at all; a non-natural guardian needs an external court order / court-issued guardianship certificate, which is not something ClaimSahayak could ever template (it's issued by a court, not filled by the claimant). | CS-MIN-006, same file |
| **Name/Identity Difference Declaration** | **Confirmed NOT to exist.** The actual process is applying *to the department* for a Reconciliation Certificate (issued by the Divisional Head/GPO/Gazetted HO) — not a claimant-authored declaration at all. | `forms-catalog.md` §D |

Only the first genuinely warranted new content. The other two are documented here as *confirmed absent, with a citable reason* — not silently skipped, and not left ambiguous for a future session to re-litigate.

## 4. What was built

- **`packages/rule-pack/src/data/declarations.ts`** (new file) — one `TemplateDefinition`, `template_minor_alive_declaration`. Deliberately kept in its own file, separate from `office-documents.ts`'s ClaimSahayak-composed administrivia (forwarding letter, approval note, office note, witness sheet) — this one carries a real official citation (`handbookRef: "R60(7)(c); GSPR 2018, Rule 12(2), Rule 20(2) (cognate declaration wording); CS-MIN-007"`), so it's structurally distinguished from content with no Rule Book anchor.
  - **Honesty note baked into the source**: R60(7)(c) itself is *paraphrased*, not quoted verbatim, in the knowledge-base — only the cognate GSPR 12(2)/20(2) provisions give actual quoted wording. The declaration text ("I declare that the above-named minor is alive on this day, and that the money now being withdrawn is required for the use and welfare of the minor.") is composed from that closest sourced wording, not presented as a verbatim government form the way Form 11/13/14/15 are.
  - The minor's own name field is **deliberately left `manual`** — `ClaimDataModel` has no field distinguishing "which of up to 4 nominees is the minor," so auto-filling `nominee.0.name` would risk silently naming the wrong person. Only office name, depositor name, account number, and the guardian/appointee's name (`guardian.name`) auto-fill.
- **A new selection mechanism, deliberately narrow in scope**: unlike the M7 office documents (unconditionally attached to every payable Claim File), this declaration is only relevant to minor-nominee claims. Rather than extend `resolveDocumentSelection`'s type-matching in `rule-engine` for one template, `ClaimPackage.tsx` gained a new helper `officeTemplateIdsForAccount(rulePack, account)` that conditionally includes the declaration by checking whether the account's own **already Rule-Engine-computed** document selection requires `doc_minor_alive_certificate` (T13's existing `OutputRule`, unchanged since M2/M5). No `rule-engine` code was touched — the condition reuses data the engine already gets right.
  - This same helper now also drives the "missing information" validation (`validateClaimPackage`), which previously called `validateClaimPackage` **once for all accounts** with **one shared** template list — that would have falsely flagged the declaration's fields as "missing" on every non-minor-nominee account too. Fixed by calling `validateClaimPackage` once **per account**, each with that account's own correct template list, and concatenating the results.
- **`packages/rule-pack/src/validate/orphans.ts`** — the `ALWAYS_AVAILABLE_TEMPLATE_IDS` allowlist (introduced in M7 for the office documents) now also covers `declarations.ts`'s template id, for the same reason: it's never referenced via `OutputRule.refId`/`CardDefinition.templateId`, so the orphan-template check needs to know it's reachable by design.
- **`packages/rule-pack/src/data/index.ts`** — `templates: [...TEMPLATES, ...OFFICE_DOCUMENT_TEMPLATES, ...DECLARATION_TEMPLATES]`.
- **4 new tests** in `ClaimPackage.test.tsx`: the declaration appears with correct auto-fill and correct citation text for the T13 (minor nominee) scenario; it does **not** appear for the plain nomination-alive (ROUTE_A, no minor) scenario — a real positive/negative pair, not just a happy-path check.

## 5. Verified

**314/314 tests** across all 9 packages (was 312 at end of M9: +2 net in `ClaimPackage.test.tsx`, all 112 prior web tests pass unmodified). Typecheck clean except the one documented pre-existing `shared-types` failure. `validate-pack` PASS (the new `handbookRef` string was checked against the citation-shape validator — `"R60(7)(c); GSPR 2018, Rule 12(2)..."` matches on both `R60` and `GSPR`, no error).

**Live browser QA**: drove a real minor-nominee (SB scheme, T13) claim end-to-end in the Claude Browser pane. Confirmed the declaration appears in the assembled Claim File (14 total `.cs-print-page` sections) with the entered depositor name ("Ram Prasad") and guardian name ("Priya Sharma") correctly auto-filled, the minor's own name correctly left blank (never entered — proving the deliberate manual-field design works, not just that it compiles), and the exact cited declaration text rendering. Re-ran the same flow for a plain nomination-alive claim and confirmed the declaration section is entirely absent. Zero console errors both times.

## 6. Anything the next Claude session MUST know

1. **The "no format exists" conclusion for Guardian and Name/Identity Difference declarations is now backed by a specific citation each (CS-MIN-006; `forms-catalog.md` §D), not an absence of evidence.** Don't re-open this question by re-grepping the same shallow search that produced the original (wrong-in-part) M8 assumption — read the actual topic files if genuinely revisiting it.
2. **`officeTemplateIdsForAccount` in `ClaimPackage.tsx` is now the one place that decides which composed/declaration templates apply to an account.** Any future conditionally-selected Tier-B document (composed or declaration) should extend this function's logic, not add a third parallel mechanism.
3. **`validateClaimPackage` must be called per-account when template applicability differs per account** — this was a real bug caught during implementation (not shipped), not a hypothetical. If a future session adds another per-account-conditional template, check that the missing-information validation call site still loops per account correctly rather than reverting to one shared list.
4. **This is the last item from the original Vision 2.0 request's document list that was still open.** M7 (auto-fill/document generation), M8 (Claim File assembly/pagination), M9 (all 10 official form layouts), and now M10 (the one genuinely sourceable declaration) together cover the full 24-item list from the original request — the remaining 2 items (Guardian Declaration, Name/Identity Difference Declaration) are closed as "confirmed not to exist, documented why," which is a valid closure per the vision's own stated fallback rule ("if no official prescribed format exists, clearly identify the document as an application/template... rather than presenting it as an official form" — here, there's no format to present at all, and that's now proven, not assumed).
