import type { LocaleCode, LocalizedText } from './locale.js';
import type {
  CardKind,
  CompetentAuthority,
  CourtOrderRequired,
  DecisionStatus,
  OfficialReference,
  OutputItemAttributes,
  OutputItemType,
} from './rule-pack.js';

/**
 * Checklist JSON — the single contract between the Decision Engine and every
 * consumer (result page, PDF renderer, future AI assistant / OCR prefill).
 * V3 §2.4 step 6. Deterministic (Roadmap M3): same pack + same answers =
 * byte-identical JSON — therefore no wall-clock field exists here; renderers
 * display the current date themselves.
 */

export interface ChecklistDocument {
  readonly rulePackVersion: string;
  readonly engineVersion: string;
  readonly locale: LocaleCode;
  readonly accounts: readonly AccountChecklist[];
  readonly cards: readonly ResolvedCard[];
  readonly verificationPanel: readonly LocalizedText[];
  readonly goodToKnow: readonly LocalizedText[];
  readonly disclaimers: readonly LocalizedText[];
  /** Only populated on the account-independent (no real scheme ticked) terminal-card path. */
  readonly decision?: ClaimDecision;
}

export interface AccountChecklist {
  readonly accountIndex: number;
  readonly schemeId: string;
  readonly schemeName: LocalizedText;
  readonly routeId: string;
  readonly routeName: LocalizedText;
  readonly timelineNote: LocalizedText;
  readonly sections: readonly ChecklistSection[];
  /** Overlay-driven extras, each deep-linking to a /fix guide. */
  readonly extras: readonly ExtraItem[];
  readonly paymentNote?: LocalizedText;
  /** The Rule Book decision resolved for this account's routeId, if the pack has one authored. */
  readonly decision?: ClaimDecision;
}

/**
 * The Complete Claim Decision (Milestone 5 Part 3) — the Rule Engine's
 * resolved, ready-to-render decision for one account/terminal. Assembled
 * by `resolveClaimDecision` (packages/rule-engine) purely from the
 * matching `DecisionRecord` in `RulePack.decisions`; the two derived
 * fields (`applicableRuleIds`, `monetaryLimitInr`) are structural
 * aggregation over pack data, not invented business logic.
 */
export interface ClaimDecision {
  readonly decisionRecordId: string;
  readonly decisionStatus: DecisionStatus;
  readonly decision: LocalizedText;
  readonly reason: LocalizedText;
  /** officialReferences[].csId ∪ rulebookRefs, deduped. */
  readonly applicableRuleIds: readonly string[];
  readonly competentAuthority: readonly CompetentAuthority[];
  /** Max of competentAuthority[].monetaryLimitInr, only if every rung declares one; undefined = no fixed limit stated. */
  readonly monetaryLimitInr?: number;
  readonly courtOrderRequired: CourtOrderRequired;
  readonly officialReferences: readonly OfficialReference[];
  readonly processingNotes?: LocalizedText;
  readonly nextActionForPostmaster: LocalizedText;
}

export interface ChecklistSection {
  readonly id: string;
  readonly title: LocalizedText;
  readonly items: readonly ChecklistItem[];
}

export interface ChecklistItem {
  readonly id: string;
  readonly itemType: OutputItemType;
  readonly label: LocalizedText;
  readonly attrs: OutputItemAttributes;
  readonly handbookRef: string;
  readonly nvRef?: string;
}

export interface ExtraItem {
  readonly id: string;
  readonly label: LocalizedText;
  readonly fixSlug: string;
}

export interface ResolvedCard {
  readonly id: string;
  readonly kind: CardKind;
  readonly title: LocalizedText;
  readonly nextPhysicalStep: LocalizedText;
  readonly templateId?: string;
}
