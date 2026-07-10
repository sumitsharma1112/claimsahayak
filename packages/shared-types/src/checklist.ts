import type { LocaleCode, LocalizedText } from './locale.js';
import type { CardKind, OutputItemAttributes, OutputItemType } from './rule-pack.js';

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
