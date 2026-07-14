/**
 * Decision Engine package — Milestone 3.
 *
 * The evaluator `checklist = f(rulePack, answers)` (V3 §2.4) lives here:
 * a deterministic, side-effect-free evaluation of one Rule Pack against
 * one answer set, producing the single `ChecklistDocument` contract every
 * consumer (result page, PDF renderer, future assistant/OCR) reads from.
 *
 * Public surface (Milestone 3 §14):
 *  - `evaluate`            — the restricted Condition evaluator itself
 *                             (and/or/not/==/in/>=/var), exposed for
 *                             tooling (e.g. the Admin Portal simulator)
 *                             and tests.
 *  - `evaluateAccount`     — resolves ONE scheme's account (route,
 *                             checklist sections, overlays) against a
 *                             complete answer set.
 *  - `evaluateChecklist`   — orchestrates every account a session's Q1
 *                             answer implies into one `ChecklistDocument`.
 *  - `validateAnswers`     — structural validation of an answer set
 *                             against the pack's own questions/options;
 *                             never throws, always returns issues.
 *  - `loadRulePack`        — content-hash + engine-compatibility gate,
 *                             falling back to the bundled pack on failure.
 *  - `applyAnswerChange`   — the invalidation cascade for one changed
 *                             answer (Milestone 3 §6).
 *  - `resolveVisibleQuestions` / `isQuestionVisible` — question visibility
 *                             (Milestone 3 §5), for a wizard UI.
 *  - `computeDerivedValues`/`monthsBetween` — pure date-derived-value
 *                             helpers a caller uses to build the
 *                             `derived` input (the engine itself never
 *                             reads the wall clock).
 */
export { ENGINE_VERSION, satisfiesEngineMin } from "./version.js";

export { evaluate, collectVarRefs, type VarAssignment } from "./condition.js";

export {
  computeDerivedValues,
  monthsBetween,
  type DerivedValues,
  type MonthYear,
} from "./derived.js";

export {
  buildVarAssignment,
  getAnswer,
  isOptionTicked,
  type AnswerMap,
} from "./variables.js";

export { isQuestionVisible, resolveVisibleQuestions } from "./visibility.js";

export { applyAnswerChange, type InvalidationResult } from "./invalidation.js";

export { resolveRoute, type RouteResolution } from "./routing.js";

export { collectOutputBucketIds, collectOutputItems } from "./outputs.js";

export { resolveOverlays, type OverlayExtra, type OverlayResolution } from "./overlay.js";

export { buildSections, type BuiltSections } from "./sections.js";

export { resolveClaimDecision } from "./decision.js";

export { evaluateAccount, type AccountEvaluation } from "./account.js";

export { evaluateChecklist, type ChecklistEvaluation } from "./checklist.js";

// Milestone 7 — document generation, auto-fill, claim-package validation.
export { resolveDocumentSelection, type DocumentSelectionEntry } from "./documents.js";
export {
  resolveClaimDataValue,
  resolveAccountNumber,
  resolveAccountValue,
  resolveFieldValue,
} from "./autofill.js";
export { validateClaimPackage, type ClaimValidationIssue } from "./claim-validation.js";

// Milestone 12 — the Document Engine: registry-driven Claim Package definition.
export {
  buildClaimPackageDefinition,
  type AccountPackageDefinition,
  type AutoFillCapability,
  type ClaimPackageDefinition,
  type DocumentRegistryEntry,
  type DocumentRequirement,
  type DocumentSource,
  type DocumentTrigger,
  type PackageDocument,
  type PackageDocumentAutoFill,
  type PackageSheetKind,
} from "./document-engine.js";

export { validateAnswers } from "./validate-answers.js";

export { computeContentHash, isPlaceholderHash } from "./hash.js";

export { loadRulePack, type LoadedRulePack } from "./loader.js";

export { FALLBACK_RULE_PACK } from "./fallback-pack.js";

export { engineIssue, type EngineIssue, type EngineIssueCode } from "./errors.js";

export type {
  RulePack,
  RulePackMeta,
  RulePackConstants,
  QuestionDefinition,
  RouteRule,
  OutputRule,
  OverlayRule,
  CardDefinition,
  ChecklistDocument,
  AccountChecklist,
  ChecklistSection,
  ChecklistItem,
  ExtraItem,
  ResolvedCard,
  SessionState,
  AnswerValue,
  SchemeDefinition,
  Condition,
  ClaimDecision,
  DecisionRecord,
  DecisionStatus,
  CourtOrderRequired,
  CompetentAuthority,
  OfficialReference,
  ClaimDataModel,
  ClaimDataField,
  Party,
  FormDefinition,
  DocumentDefinition,
  TemplateDefinition,
  TemplateField,
  OfficialFormLayout,
  OfficialFormField,
} from "@claimsahayak/shared-types";
