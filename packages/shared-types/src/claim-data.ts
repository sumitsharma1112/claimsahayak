import type { LocalizedText } from './locale.js';

/**
 * Milestone 7 — the Claim Data Model. A claimant/postmaster enters a
 * person's identifying details ONCE; every generated document reads from
 * this model instead of asking again (V7 §1, "no duplicate data entry").
 *
 * Deliberately excludes anything the Rule Engine already computes —
 * competent authority, monetary limits, applicable rule ids, citations,
 * decision text, timelines. Those live on `ClaimDecision`/`AccountChecklist`
 * and are read from there wherever a document needs them; duplicating them
 * here would violate "use Rule Engine + Claim Data Model only, never
 * duplicate Rule Engine logic" (V7 §9).
 *
 * PRIVACY: this type never appears in `SessionState`/`AnswerValue`. The
 * Wizard holds one `ClaimDataModel` in React state for the current tab
 * only — never `localStorage`, never transmitted — the same zero-
 * persistence posture the app has had since M1, extended to this new
 * field shape. Closing the tab clears it.
 *
 * Bounded, not unbounded arrays (nominees/legalHeirs/witnesses each have a
 * small fixed cap) — keeps the model and `ClaimDataField` below fully
 * closed/type-checkable, matching this codebase's existing preference for
 * closed unions over free-form strings (e.g. `Condition`'s 6-operator
 * union, `QuestionInputType`).
 */
export interface Party {
  readonly name: string;
  readonly address?: string;
  readonly relationship?: string;
}

export const MAX_NOMINEES = 4;
export const MAX_LEGAL_HEIRS = 4;
export const MAX_WITNESSES = 2;

export interface ClaimDataModel {
  readonly claimant: Party;
  /** The deceased account holder. */
  readonly depositor: Party;
  /** Only meaningful on a minor/guardian branch. */
  readonly guardian?: Party;
  readonly nominees: readonly Party[];
  readonly legalHeirs: readonly Party[];
  readonly witnesses: readonly Party[];
  /** Account/certificate number, keyed by `AccountChecklist.accountIndex`. */
  readonly accountNumbers: Readonly<Record<number, string>>;
  readonly officeName: string;
}

export const EMPTY_CLAIM_DATA: ClaimDataModel = {
  claimant: { name: '' },
  depositor: { name: '' },
  nominees: [],
  legalHeirs: [],
  witnesses: [],
  accountNumbers: {},
  officeName: '',
};

/**
 * The closed set of fillable slots a document template may reference. A
 * plain switch (`resolveClaimDataValue` in rule-engine) resolves these —
 * never a dynamic/`eval`'d dotted-path string — so an invalid field is a
 * compile error, not a runtime typo.
 */
export type ClaimDataField =
  | 'claimant.name'
  | 'claimant.address'
  | 'claimant.relationship'
  | 'depositor.name'
  | 'guardian.name'
  | 'nominee.0.name'
  | 'nominee.1.name'
  | 'nominee.2.name'
  | 'nominee.3.name'
  | 'legalHeir.0.name'
  | 'legalHeir.1.name'
  | 'legalHeir.2.name'
  | 'legalHeir.3.name'
  | 'witness.0.name'
  | 'witness.1.name'
  | 'account.number'
  | 'office.name';

/**
 * Tier A of the document-fidelity model (V7 design principle): an official
 * India Post form (Form 11/13/14/15, etc.) has government-prescribed
 * structure and wording. `OfficialFormLayout` transcribes that structure
 * ONCE, field-for-field, from the real form — ClaimSahayak fills VALUES
 * into it and never regenerates, reorders, or rewords the form itself.
 * Contrast with `TemplateField` (rule-pack.ts), which is for documents
 * ClaimSahayak has latitude to compose (Tier B).
 */
export interface OfficialFormField {
  readonly id: string;
  readonly label: LocalizedText;
  /** Present when this field is auto-fillable from the Claim Data Model. */
  readonly claimDataField?: ClaimDataField;
  /** True when the field can only be completed by hand at the counter (e.g. today's date, a signature). */
  readonly manual?: true;
}

export interface OfficialFormLayout {
  /** Joins `FormDefinition.id` (rule-pack forms.ts) — the source of truth for name/purpose/signatories/etc. */
  readonly formId: string;
  readonly fields: readonly OfficialFormField[];
}
