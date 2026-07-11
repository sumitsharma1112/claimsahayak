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
  /**
   * Decision-level records (ClaimSahayak Official Rule Book v1.0
   * integration): one per outcome bucket (joins on the same id-space as
   * OutputRule.routeId), carrying the four attributes not otherwise
   * structured anywhere else in the pack — decision summary, reason,
   * competent authority (with limits/timeline), and official references.
   * Optional so packs authored before this integration remain valid.
   */
  readonly decisions?: readonly DecisionRecord[];
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
  /** Version of the ClaimSahayak Official Rule Book this pack was authored from, e.g. "1.0". */
  readonly rulebookVersion?: string;
  /** As-on-date of law the referenced Rule Book was compiled against (ISO date). */
  readonly rulebookAsOnDate?: string;
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
  /** Official Rule Book CS-IDs (e.g. "CS-NOM-005") this question is derived from. */
  readonly sourceRefs?: readonly string[];
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
  /** Official Rule Book CS-IDs (e.g. "CS-NON-006") this route is derived from. */
  readonly sourceRefs?: readonly string[];
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
  /** Official Rule Book CS-IDs (e.g. "CS-NON-003") this output item is derived from. */
  readonly sourceRefs?: readonly string[];
}

export interface OverlayRule {
  /** Q10 flag id or system flag id. */
  readonly flagId: string;
  readonly items: readonly OutputRule[];
  /** Deep link into the /fix module. */
  readonly fixSlug: string;
  readonly handbookRef: string;
  /** Official Rule Book CS-IDs (e.g. "CS-NOM-022") this overlay is derived from. */
  readonly sourceRefs?: readonly string[];
}

export interface DocumentDefinition {
  readonly id: string;
  readonly name: LocalizedText;
  readonly detail: LocalizedText;
  readonly category: 'core' | 'identity' | 'legal' | 'witness' | 'exception';
  readonly originalRequired: boolean;
  readonly copiesRequired: number;
  /** Official Rule Book CS-IDs (e.g. "CS-NON-005") this document requirement is derived from. */
  readonly sourceRefs?: readonly string[];
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
  /** Official Rule Book CS-IDs (e.g. "CS-NOM-012") this form requirement is derived from. */
  readonly sourceRefs?: readonly string[];
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

/**
 * ClaimSahayak Official Rule Book v1.0 integration (Topic 11 mapping).
 * A single official citation, joining a Rule Book CS-ID to the human-
 * readable instrument text a claimant/officer would recognize.
 */
export interface OfficialReference {
  /** Rule Book CS-ID, e.g. "CS-NON-003". */
  readonly csId: string;
  /** e.g. "GSPR 2018, Rule 15(6)(i); SB Order 36/2020". */
  readonly citation: LocalizedText;
}

/** One rung of the Decision Matrix's authority-resolution function (§3). */
export interface CompetentAuthority {
  readonly authorityLabel: LocalizedText;
  /** Sanction limit in INR for this rung; undefined = no monetary limit. */
  readonly monetaryLimitInr?: number;
  readonly timelineWorkingDays?: number;
  /** Where a claim beyond this rung's limit escalates to. */
  readonly escalatesTo?: LocalizedText;
}

/**
 * Whether money is determined payable through this decision bucket.
 * `payable` — money moves to a determined party (nominee/heir/guardian, or
 * the CO/Committee of Adjustment for armed-forces cases). `not_payable` —
 * a real claim exists but is blocked pending court/revenue evidence or an
 * administrative referral. `not_applicable` — no claim decision is needed
 * at all (survivorship; a guardian-change with the minor still alive).
 * `pending_information` — the claimant must supply more information
 * before any of the above can be reached.
 */
export type DecisionStatus = 'payable' | 'not_payable' | 'not_applicable' | 'pending_information';

/**
 * Whether a court-issued order/certificate is required, sourced from the
 * Decision Matrix's own "Court" column per D-row. `conditional` covers
 * rows where a court document is one of several accepted evidence types
 * (e.g. Probate/LoA/Succession-Certificate/Tahsildar-LHC), not always
 * specifically a court order.
 */
export type CourtOrderRequired = 'yes' | 'no' | 'conditional';

/**
 * Decision-level record (Rule Book Decision Matrix D-row/M-row →
 * DecisionRecord). One per outcome BUCKET — the same id-space
 * OutputRule.routeId already uses — not per individual RouteRule, since
 * several RouteRules commonly share one outcome bucket (e.g. T9/T11/T13/T14
 * all resolve to ROUTE_A). Required documents/forms are already expressed
 * per-bucket via OutputRule[]; this record carries the attributes not
 * otherwise structured anywhere in the pack: decision summary, reason,
 * payable/not-payable status, competent authority (with limits/timeline),
 * whether a court order is required, official references, and the
 * postmaster-facing (not claimant-facing) next processing action.
 */
export interface DecisionRecord {
  readonly id: string;
  /** Joins OutputRule.routeId / RouteRule.target for this outcome bucket. */
  readonly routeId: string;
  readonly decision: LocalizedText;
  readonly reason: LocalizedText;
  readonly decisionStatus: DecisionStatus;
  readonly competentAuthority: readonly CompetentAuthority[];
  readonly courtOrderRequired: CourtOrderRequired;
  readonly officialReferences: readonly OfficialReference[];
  /** Officer-facing next processing step — distinct from CardDefinition.nextPhysicalStep (claimant-facing). */
  readonly nextActionForPostmaster: LocalizedText;
  /** Internal process reminders beyond the authority ladder (e.g. register-entry duties); only where genuinely sourced. */
  readonly processingNotes?: LocalizedText;
  /** Rule Book Decision Matrix row ids, e.g. ["D-09"] or ["D-02","D-03"]. */
  readonly rulebookRefs: readonly string[];
}
