import type { LocalizedText } from './locale.js';

/**
 * Milestone 7 — the Claim Data Model; Milestone 11 — the Universal Claim
 * Data Model. A claimant/postmaster enters a fact ONCE; every generated
 * document reads from this model instead of asking again (V7 §1, "no
 * duplicate data entry"). M11 grows the model to hold every field required
 * by the four supported valid-nomination scenarios (single nominee,
 * depositor name difference, claimant name difference, multiple nominees)
 * per the approved Universal Claim Data Dictionary.
 *
 * Deliberately excludes anything the Rule Engine already computes —
 * competent authority, monetary limits, applicable rule ids, citations,
 * decision text, timelines, scheme names. Those live on
 * `ClaimDecision`/`AccountChecklist` and are read from there wherever a
 * document needs them; duplicating them here would violate "use Rule
 * Engine + Claim Data Model only, never duplicate Rule Engine logic"
 * (V7 §9). Also deliberately excludes future acts — signatures, dates of
 * execution/submission, the approving officer's entries — which must stay
 * hand-fill (never invent data that doesn't exist yet).
 *
 * PRIVACY: this type never appears in `SessionState`/`AnswerValue`. The
 * Wizard holds one `ClaimDataModel` in React state for the current tab
 * only — never `localStorage`, never transmitted — the same zero-
 * persistence posture the app has had since M1, extended to this new
 * field shape. Closing the tab clears it.
 *
 * Bounded, not unbounded arrays (each party list has a small fixed cap) —
 * keeps the model and `ClaimDataField` below fully closed/type-checkable,
 * matching this codebase's existing preference for closed unions over
 * free-form strings (e.g. `Condition`'s 6-operator union,
 * `QuestionInputType`).
 *
 * M1–M10 compatibility: every pre-M11 model member and every pre-M11
 * `ClaimDataField` string literal is preserved unchanged — M11 is purely
 * additive, so no authored `OfficialFormLayout`/`TemplateDefinition`
 * mapping and no pre-M11 test needs to change.
 */
export interface Party {
  readonly name: string;
  readonly address?: string;
  readonly relationship?: string;
  /** M11 — contact and identity-verification details, applicable to any party. */
  readonly mobile?: string;
  readonly idDocumentType?: string;
  readonly idDocumentNumber?: string;
  /** M11 — this party's share of the claim, where the nomination splits it (kept as entered, e.g. "50%"). */
  readonly sharePercent?: string;
}

export const MAX_NOMINEES = 4;
export const MAX_LEGAL_HEIRS = 4;
export const MAX_WITNESSES = 2;
/** M11 — additional attending claimants beyond the lead claimant (joint multiple-nominee claims). */
export const MAX_CO_CLAIMANTS = 3;
/** M11 — parties relinquishing their share via Form 14 (absent nominees today; legal heirs when ROUTE_C comes in scope). */
export const MAX_DISCLAIMANTS = 3;

/**
 * M11 — the office's own identity beyond its name (`ClaimDataModel.officeName`,
 * kept where it has been since M7 for compatibility; the `office.name` field
 * string still resolves from it).
 */
export interface OfficeDetails {
  readonly address: string;
  readonly pin: string;
  /** Office/facility code (e.g. the CBS SOL id). */
  readonly code: string;
  readonly phone: string;
  /** The Head Post Office this office forwards claim papers to. */
  readonly headOfficeName: string;
}

/** M11 — the official preparing the file ("prepared by" on office documents; the signature itself stays manual). */
export interface PreparerDetails {
  readonly name: string;
  readonly designation: string;
}

/**
 * M11 — details read off the death certificate the claimant presents.
 * Note: the Wizard's Q4 month/year answer (routing/date-derivation) is a
 * different, deliberately coarser fact — this full date is document-tier
 * data only and never feeds the Rule Engine.
 */
export interface DeathCertificateDetails {
  readonly dateOfDeath: string;
  readonly placeOfDeath: string;
  readonly certificateNumber: string;
  readonly issuedBy: string;
}

/**
 * M11 — the second name version each reconciliation-certificate request
 * needs. Only meaningful when the matching Q10 flag was ticked; the
 * canonical names stay on `depositor`/`claimant` (as per Post Office
 * records) — these are the variants, so no name is stored twice.
 */
export interface NameDifferenceDetails {
  readonly depositorNameOnDeathCertificate: string;
  readonly claimantNameAsPerId: string;
}

/** M11 — where the money goes, per the Q9 payment-mode answer. Only the fields matching the chosen mode are collected. */
export interface PaymentDetails {
  readonly bankName: string;
  readonly bankBranch: string;
  readonly bankAccountNumber: string;
  readonly bankIfsc: string;
  readonly posbAccountNumber: string;
}

/**
 * M11 — per-account facts beyond the account number
 * (`ClaimDataModel.accountNumbers`, kept where it has been since M7 for
 * compatibility). `amountClaimed` is what the claimant claims — the exact
 * balance is verified by the Post Office from its own records (see the
 * GLOBAL verification panel) and is deliberately NOT a field here.
 */
export interface AccountExtraDetails {
  readonly amountClaimed: string;
  /** From the Post Office's own nomination register. */
  readonly nominationRegistrationNumber: string;
  readonly nominationDate: string;
}

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
  /** M11 — attending claimants 2..4 on a joint multiple-nominee claim (the lead claimant stays `claimant`). */
  readonly coClaimants: readonly Party[];
  /** M11 — parties signing a Form 14 disclaimer in the lead claimant's favour. */
  readonly disclaimants: readonly Party[];
  readonly officeDetails: OfficeDetails;
  readonly preparer: PreparerDetails;
  readonly deathCertificate: DeathCertificateDetails;
  readonly nameDifference: NameDifferenceDetails;
  readonly payment: PaymentDetails;
  /** M11 — keyed by `AccountChecklist.accountIndex`, like `accountNumbers`. */
  readonly accountDetails: Readonly<Record<number, AccountExtraDetails>>;
}

export const EMPTY_CLAIM_DATA: ClaimDataModel = {
  claimant: { name: '' },
  depositor: { name: '' },
  nominees: [],
  legalHeirs: [],
  witnesses: [],
  accountNumbers: {},
  officeName: '',
  coClaimants: [],
  disclaimants: [],
  officeDetails: { address: '', pin: '', code: '', phone: '', headOfficeName: '' },
  preparer: { name: '', designation: '' },
  deathCertificate: { dateOfDeath: '', placeOfDeath: '', certificateNumber: '', issuedBy: '' },
  nameDifference: { depositorNameOnDeathCertificate: '', claimantNameAsPerId: '' },
  payment: { bankName: '', bankBranch: '', bankAccountNumber: '', bankIfsc: '', posbAccountNumber: '' },
  accountDetails: {},
};

/**
 * The closed set of fillable slots a document template may reference,
 * composed (M11) from small per-entity template-literal unions instead of
 * one flat list — same guarantees as before (closed, compile-checked, an
 * invalid field is a compile error, never a runtime typo), but scalable.
 * Every pre-M11 literal ("claimant.name", "witness.0.name", "office.name",
 * "account.number", ...) is still a member, so no authored mapping changes.
 */
type PartyKey =
  | 'name'
  | 'address'
  | 'relationship'
  | 'mobile'
  | 'idDocumentType'
  | 'idDocumentNumber'
  | 'sharePercent';
type WitnessIndex = 0 | 1;
type TriIndex = 0 | 1 | 2;
type QuadIndex = 0 | 1 | 2 | 3;

export type ClaimDataField =
  | `claimant.${PartyKey}`
  | `coClaimant.${TriIndex}.${PartyKey}`
  | `depositor.${'name' | 'address'}`
  | `guardian.${'name' | 'address' | 'relationship'}`
  | `nominee.${QuadIndex}.name`
  | `legalHeir.${QuadIndex}.name`
  | `witness.${WitnessIndex}.${'name' | 'address' | 'mobile'}`
  | `disclaimant.${TriIndex}.${'name' | 'address' | 'relationship'}`
  | `office.${'name' | 'address' | 'pin' | 'code' | 'phone' | 'headOfficeName'}`
  | `preparer.${'name' | 'designation'}`
  | `deathCertificate.${'dateOfDeath' | 'placeOfDeath' | 'certificateNumber' | 'issuedBy'}`
  | `nameDifference.${'depositorNameOnDeathCertificate' | 'claimantNameAsPerId'}`
  | `payment.${'bankName' | 'bankBranch' | 'bankAccountNumber' | 'bankIfsc' | 'posbAccountNumber'}`
  | AccountScopedClaimDataField;

/**
 * M11 — the account-scoped subset: these need the caller's `accountIndex`
 * (the model keys them by `AccountChecklist.accountIndex`), so
 * `resolveClaimDataValue`'s model-level switch can't resolve them — use
 * `resolveAccountValue` (rule-engine) instead. Pre-M11 this was the single
 * special-cased "account.number"; now it's a proper named union.
 */
export type AccountScopedClaimDataField =
  `account.${'number' | 'amountClaimed' | 'nominationRegistrationNumber' | 'nominationDate'}`;

export function isAccountScopedField(
  field: ClaimDataField,
): field is AccountScopedClaimDataField {
  return field.startsWith('account.');
}

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
