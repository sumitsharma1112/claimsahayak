import type { RulePack, RulePackMeta } from "@claimsahayak/shared-types";
import { ENGINE_VERSION } from "@claimsahayak/rule-engine";
import { CONSTANTS } from "./constants.js";
import { SCHEMES } from "./schemes.js";
import { QUESTIONS } from "./questions.js";
import { ROUTES } from "./routes.js";
import { OUTPUTS } from "./outputs/index.js";
import { OVERLAYS } from "./overlays.js";
import { DOCUMENTS } from "./documents.js";
import { FORMS } from "./forms.js";
import { CARDS } from "./cards.js";
import { TEMPLATES } from "./templates.js";
import { CONTENT } from "./content/index.js";
import { VOCAB } from "./vocab.js";
import { DECISIONS } from "./decisions.js";

/**
 * `engineMin` is derived from the engine package's own version (never
 * hand-typed as a second copy of the number) — a pack declares the minimum
 * engine capability it needs, sourced from the single place that version
 * is defined (packages/rule-engine).
 */
function engineMinFromVersion(version: string): string {
  const [major, minor] = version.split(".");
  return `${major ?? "0"}.${minor ?? "0"}`;
}

/**
 * contentHash is a PLACEHOLDER here (64 zeros — schema-valid, but not a
 * real digest). Packs are immutable once published (V3 §2.6); the real
 * SHA-256 over this pack's content is computed and stamped in by the
 * `build-pack` CLI at the moment a publishable artifact is produced, not
 * baked into the source data. Node's crypto module is deliberately kept
 * out of this file so the data/schema layer stays runtime-agnostic (it may
 * be reused by the Admin Portal simulator in the browser, Milestone 10).
 */
const META: RulePackMeta = {
  version: "2026.07.2",
  engineMin: engineMinFromVersion(ENGINE_VERSION),
  publishedAt: "2026-07-11T00:00:00.000Z",
  publishedBy: "publisher",
  changelog:
    "ClaimSahayak Official Rule Book v1.0 integration: added SCSS (9th scheme); re-cited existing T1-T20 routes/overlays with official CS-ID sourceRefs where the Rule Book confirms them; added routes/overlays/questions for armed-forces override (D-14), dispute-forces-succession-certificate (D-11), untraceable/unwilling co-nominee referral (D-07X), pledge/freeze (M-B), minor-attained-majority (M-E), guardian-succession (M-F), NRI nominee (M-H), unregistered-but-valid nomination (M-G), MIS joint-ceiling excess (D-19), SCSS spouse continuation (D-17), and RD Protected Savings Scheme (D-18); added decisions.ts (DecisionRecord: Decision/Reason/Competent Authority/Official References per outcome bucket); added NV-RB register entries for Rule Book gaps/provisional items. See knowledge-base/official-rule-book/RULE-BOOK-v1.0.md for the source. Known gap: NSC/KVP's ≤3-claimant continuation cap and per-nominee list evaluation generally are not enforceable by the current engine (no list-typed facts/count() operator) — stated as information only, not gated logic.",
  contentHash: "0".repeat(64),
  rulebookVersion: "1.0",
  rulebookAsOnDate: "2026-07-10",
};

export const RULE_PACK: RulePack = {
  meta: META,
  constants: CONSTANTS,
  schemes: SCHEMES,
  questions: QUESTIONS,
  routes: ROUTES,
  outputs: OUTPUTS,
  overlays: OVERLAYS,
  documents: DOCUMENTS,
  forms: FORMS,
  cards: CARDS,
  templates: TEMPLATES,
  content: CONTENT,
  vocab: VOCAB,
  decisions: DECISIONS,
};
