/**
 * Wizard session state — lives ONLY in the browser (localStorage, 24 h
 * expiry, user-clearable). Never transmitted. V2 FR-8 / V3 I-2.
 */
import type { LocaleCode } from './locale.js';

export interface SessionState {
  readonly schemaVersion: 1;
  /** Rule-pack version this session is pinned to (V3 §2.6 mid-wizard consistency). */
  readonly rulePackVersion: string;
  readonly locale: LocaleCode;
  readonly startedAtIso: string;
  readonly updatedAtIso: string;
  /** Expiry enforced at read time: updatedAt + 24 h. */
  readonly answers: Readonly<Record<string, AnswerValue>>;
  readonly currentStepId: string;
}

export type AnswerValue =
  | { readonly kind: 'single'; readonly optionId: string }
  | { readonly kind: 'multi'; readonly optionIds: readonly string[] }
  | { readonly kind: 'boolean'; readonly value: boolean }
  /** Month/year of death: stays on-device; only derived booleans ever leave. */
  | { readonly kind: 'monthYear'; readonly month: number; readonly year: number };

export const SESSION_STORAGE_KEY = 'claimsahayak.session.v1';
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
