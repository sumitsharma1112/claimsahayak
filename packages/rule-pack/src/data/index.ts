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
  version: "2026.07.1",
  engineMin: engineMinFromVersion(ENGINE_VERSION),
  publishedAt: "2026-07-09T00:00:00.000Z",
  publishedBy: "publisher",
  changelog:
    "Milestone 2: full Rule Pack authored — 8 schemes, 14 questions, T1-T20 routes (T21 implemented as a system overlay), outputs for every route family, 9 overlays, 19 documents, 9 forms, 4 templates, 7 cards, and fix/learn/faq/glossary content.",
  contentHash: "0".repeat(64),
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
};
