import type { Condition } from "./condition.js";
import type { LocaleCode, LocalizedText, PortableTextBlock } from "./locale.js";
import type { SchemeDefinition } from "./scheme.js";

export type { SchemeDefinition } from "./scheme.js";

/**
 * Rule Pack contract (V3 §2.3). The pack is the ONLY location for business
 * rules; the interfaces below are structure, not rules. Authored in M2,
 * published/versioned via the Admin Portal in M10.
 */

export interface RulePack {
  readonly meta: RulePackMeta;
  readonly constants: RulePackConstants;
  readonly schemes: readonly SchemeDefinition[];
  readonly questions: readonly QuestionDefinition[];
  readonly routes: readonly RouteRule[];
  readonly outputs: readonly OutputRule[];
  readonly overlays: readonly OverlayRule[];
  readonly documents: readonly DocumentDefinition[];
  readonly forms: readonly FormDefinition[];
  readonly cards: readonly CardDefinition[];
  readonly templates: readonly TemplateDefinition[];
  readonly content: readonly ContentPage[];
  readonly vocab: readonly VocabEntry[];
}

export interface RulePackMeta {
  /** Format: YYYY.MM.patch (see RULE_PACK_VERSION_PATTERN). Immutable once published. */
  readonly version: string;
  /** Minimum engine version able to evaluate this pack. */
  readonly engineMin: string;
  readonly publishedAt: string;
  /** Publisher role identifier — never a personal identity in the public artifact. */
  readonly publishedBy: string;
  readonly changelog: string;
  /** SHA-256 of the canonical (stable-stringified) pack body, verified before use. */
  readonly contentHash: string;
}

/**
 * Named constants (V3 §2.2): every threshold a future SB Order could change.
 * Values are authored in M2 — none are defined in code.
 */
export interface RulePackConstants {
  readonly AFFIDAVIT_LIMIT_INR: number;
  readonly NO_NOMINATION_WAIT_MONTHS: number;
  readonly FREEZE_YEARS: number;
  /** Open extension point for future SB-Order-driven constants. */
  readonly [key: string]: number;
}

export type QuestionInputType = 'single' | 'multi' | 'boolean' | 'monthYear';

export interface QuestionDefinition {
  readonly id: string;
  readonly stepId: string;
  readonly text: LocalizedText;
  readonly whyStrip: LocalizedText;
  readonly inputType: QuestionInputType;
  readonly options: readonly QuestionOption[];
  readonly visibleWhen: Condition;
  /** Answer ids removed when this answer changes (V2 amber-banner behavior, data-declared). */
  readonly invalidates: readonly string[];
  readonly handbookRef: string;
}

export interface QuestionOption {
  readonly id: string;
  readonly label: LocalizedText;
  readonly help?: LocalizedText;
  /** Mutually-exclusive option within a multi (e.g. "none of these"). */
  readonly exclusive?: boolean;
}

export type RouteKind = 'route' | 'card' | 'reroute';

export interface RouteRule {
  /** T1..T21 identifiers from Blueprint v2 §3.2, plus future additions. */
  readonly id: string;
  readonly priority: number;
  readonly when: Condition;
  readonly kind: RouteKind;
  /** Route id, card id, or reroute target depending on kind. */
  readonly target: string;
  readonly banner?: LocalizedText;
  readonly handbookRef: string;
  readonly nvRef?: string;
}

export type OutputItemType =
  | 'form'
  | 'document'
  | 'people'
  | 'instruction'
  | 'warning'
  | 'goodToKnow';

/** The four mandatory attributes on every checklist item (V2 FR-5a). */
export interface OutputItemAttributes {
  readonly why: LocalizedText;
  readonly originalOrCopy: LocalizedText;
  readonly selfAttest: LocalizedText;
  readonly verifiedBy: LocalizedText;
}

export interface OutputRule {
  readonly id: string;
  readonly routeId: string;
  readonly itemType: OutputItemType;
  /** Reference into documents[] or forms[] where applicable. */
  readonly refId?: string;
  readonly label: LocalizedText;
  readonly attrs: OutputItemAttributes;
  readonly section: string;
  readonly sortOrder: number;
  readonly handbookRef: string;
  readonly nvRef?: string;
}

export interface OverlayRule {
  /** Q10 flag id or system flag id. */
  readonly flagId: string;
  readonly items: readonly OutputRule[];
  /** Deep link into the /fix module. */
  readonly fixSlug: string;
  readonly handbookRef: string;
}

export interface DocumentDefinition {
  readonly id: string;
  readonly name: LocalizedText;
  readonly detail: LocalizedText;
  readonly category: 'core' | 'identity' | 'legal' | 'witness' | 'exception';
  readonly originalRequired: boolean;
  readonly copiesRequired: number;
}

export interface StampPaperSpec {
  readonly required: boolean;
  readonly commonValueInr: number;
  readonly validityMonths: number;
  /** NV-02: state Stamp Acts govern; note rendered with the value. */
  readonly stateVariationNote: LocalizedText;
}

export interface FormDefinition {
  readonly id: string;
  readonly name: LocalizedText;
  readonly purpose: LocalizedText;
  readonly stampPaper?: StampPaperSpec;
  readonly signatories: LocalizedText;
  readonly executedBefore: LocalizedText;
  readonly copies: number;
  readonly officialSourceUrl?: string;
}

export type CardKind = 'pause' | 'stop' | 'wait' | 'dual' | 'info';

export interface CardDefinition {
  readonly id: string;
  readonly kind: CardKind;
  readonly title: LocalizedText;
  readonly body: readonly PortableTextBlock[];
  /** No-dead-end invariant: every terminal card MUST declare this. */
  readonly nextPhysicalStep: LocalizedText;
  readonly templateId?: string;
}

export interface TemplateDefinition {
  readonly id: string;
  readonly title: LocalizedText;
  /** Structured fields, rendered to print — never free HTML. */
  readonly fields: readonly TemplateField[];
  readonly handbookRef: string;
}

export interface TemplateField {
  readonly id: string;
  readonly label: LocalizedText;
  readonly kind: 'staticText' | 'blankLine' | 'checkboxRow';
  readonly text?: LocalizedText;
}

export interface ContentPage {
  readonly id: string;
  readonly tier: 'learn' | 'fix' | 'claims' | 'faq' | 'glossary';
  readonly slug: string;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly blocks: readonly PortableTextBlock[];
  readonly handbookRef?: string;
  readonly lastReviewed: string;
}

export interface VocabEntry {
  readonly forbidden: string;
  readonly preferred: LocalizedText;
}
