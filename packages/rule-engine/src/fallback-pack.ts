import type { RulePack } from "@claimsahayak/shared-types";
import { ALWAYS } from "@claimsahayak/shared-types";
import { ENGINE_VERSION } from "./version.js";

/**
 * The engine's own bundled fallback (Milestone 3 §2): a minimal,
 * schema-valid `RulePack` used only when the real pack a caller supplies
 * fails content-hash or engine-compatibility validation. It is
 * intentionally NOT the authored Milestone 2 pack — `packages/rule-engine`
 * cannot depend on `@claimsahayak/rule-pack` without creating a circular
 * package dependency (`rule-pack` already depends on `rule-engine` for
 * `ENGINE_VERSION`). Instead this is a tiny, self-contained pack whose
 * only job is to resolve to one safe, always-shown "something went wrong"
 * card through the exact same `evaluate()` used for every other pack, so
 * no special-casing is needed anywhere else in the engine.
 */
const FALLBACK_CARD_ID = "card_engine_fallback";

export const FALLBACK_RULE_PACK: RulePack = {
  meta: {
    version: "0.0.0-fallback",
    engineMin: ENGINE_VERSION.split(".").slice(0, 2).join("."),
    publishedAt: "1970-01-01T00:00:00.000Z",
    publishedBy: "engine",
    changelog: "Bundled fallback pack, used only when the real Rule Pack fails validation.",
    contentHash: "0".repeat(64),
  },
  constants: {
    AFFIDAVIT_LIMIT_INR: 0,
    NO_NOMINATION_WAIT_MONTHS: 0,
    FREEZE_YEARS: 0,
  },
  schemes: [],
  questions: [],
  routes: [
    {
      id: "FALLBACK_ROUTE",
      priority: 100,
      when: ALWAYS,
      kind: "card",
      target: FALLBACK_CARD_ID,
      handbookRef: "n/a — engine fallback",
    },
  ],
  outputs: [],
  overlays: [],
  documents: [],
  forms: [],
  cards: [
    {
      id: FALLBACK_CARD_ID,
      kind: "info",
      title: { en: "We're having trouble loading the checklist right now" },
      body: [
        {
          kind: "paragraph",
          text: {
            en: "Please try again in a few minutes. If this keeps happening, the Post Office branch can still help you directly with the death-claim paperwork.",
          },
        },
      ],
      nextPhysicalStep: {
        en: "Visit your nearest Post Office with the death certificate, the passbook or certificate, and your own ID — they can start the claim without this website.",
      },
    },
  ],
  templates: [],
  content: [],
  vocab: [],
};
