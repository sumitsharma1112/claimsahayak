# The Rule Pack (Milestone 2)

`packages/rule-pack` is the **only** place Post Office savings death-claim
business rules exist in this codebase (V3 invariant I-1). Nothing here is
UI, nothing here is the Decision Engine (that's Milestone 3) — this package
is data, its runtime schema, the pipeline that proves the data is sound,
and the fixtures/CLI that keep it that way.

## Layout

```
packages/rule-pack/src/
├── schema/       Hand-written runtime parsers mirroring every frozen
│                 shared-types contract (RulePack and all its parts).
│                 See "Why not Zod?" below.
├── data/         The authored pack itself:
│                 constants · schemes · vocab · documents · forms ·
│                 templates · questions · routes (T1-T20 + system
│                 buckets) · outputs/ (per route family) · overlays ·
│                 cards · content/ (fix · learn · faq · glossary) ·
│                 nv-register (Needs-Verification log) · index.ts
│                 (composes RULE_PACK)
├── validate/     The publish gate: reachability, orphan detection,
│                 no-dead-end wiring, locale parity, copy-lint,
│                 provenance, truth-table referential integrity,
│                 and the pipeline orchestrator.
├── fixtures/     25 truth-table scenarios spanning all 8 schemes,
│                 every T-rule, and every overlay.
└── cli/          validate-pack · build-pack · lint-pack
```

## Why not Zod?

The schema layer is hand-written TypeScript (`Result<T, E>`-returning
parsers), not a schema-validation library. Three reasons: the pack's shape
is closed and frozen (it mirrors `shared-types` exactly, not arbitrary
input), the input is always trusted authoring data rather than untrusted
user input, and — practically, in this offline sandbox — it avoids adding
an unverifiable new dependency. Every parser was verified the same way as
the rest of the workspace: `tsc --strict` against the real contracts, plus
a schema round-trip test (`JSON.parse(JSON.stringify(RULE_PACK))` through
`parseRulePack`).

## The routing model, briefly

`routes.ts` implements T1 through T20 plus **T18A** (a dead-end fix for this
pack's own "I'm not sure who counts as an heir" option — not a handbook
rule, just completeness). **T21 is not a route at all**: the handbook
describes it as an overlay, and unlike every other T-rule it layers on top
of whichever route already resolved rather than replacing it, so it's
implemented as an `OverlayRule` with a **system** flag id
(`system_frozen_10_years`) — the frozen contract's own doc-comment on
`OverlayRule.flagId` anticipates exactly this ("a Q10 flag id or system flag
id").

Multiple T-rules can resolve to the same downstream **route bucket** (T9,
T11, T13, and T14 all target `ROUTE_A`, adding their own extra items on top
via their own T-id). Four more buckets — `GLOBAL`, `CONTINUE_ADDON`,
`PAYMENT_BANK_TRANSFER`, `PAYMENT_OWN_POSB` — exist purely so `OutputRule`
has a valid target for output groups the engine (Milestone 3) appends based
on a direct answer (Q8/Q9) rather than the priority-ordered route pass.

## Needs-Verification register

Fourteen entries (`data/nv-register.ts`): the thirteen from Blueprint v2
§10, verbatim, plus **NV-14**, discovered while authoring the lost-passbook
overlay (the handbook gives a duplicate-certificate *fee* but not the
NC-54(a)/(b) indemnity's stamp-paper specifics). Routes/outputs/forms cite
these via `nvRef` rather than guessing.

## Milestone 2 scope boundary on content

`content/fix.ts` is complete — all 17 `/fix` guides (16 from the approved
IA plus `missing-person`, justified in `overlays.ts`), because these are
directly wired to overlay flags and exercised by validation. `content/learn.ts`
and `content/faq.ts` are real but intentionally partial: the Roadmap places
full `/learn` and FAQ authoring at Milestone 7 ("Dependencies: M2 content
structures"). What's here is exactly what this pack's own routes, cards,
and questions cross-reference, so nothing points at a page that doesn't
exist — not placeholders, just not yet the full ~38-item breadth.

## Running the pipeline

```bash
pnpm validate-pack   # schema → reachability → orphans → no-dead-end →
                      # locale-parity → copy-lint → provenance → truth-table
pnpm lint-pack        # fast subset: copy-lint, locale-parity, provenance
pnpm build-pack       # stamps the real SHA-256 contentHash, writes
                      # packages/rule-pack/dist/rule-pack.<version>.json
```

`validate-pack` is the same pipeline the Admin Portal (Milestone 10) will
reuse server-side before allowing a publish — a pack that fails here cannot
go live there either.
