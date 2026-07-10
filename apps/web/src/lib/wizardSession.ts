import type { LocaleCode, SessionState } from "@claimsahayak/shared-types";
import { SESSION_STORAGE_KEY, SESSION_TTL_MS } from "@claimsahayak/shared-types";
import type { AnswersState } from "./wizardAnswers";

/**
 * Session persistence (Milestone 4.3): a thin read/write/expire wrapper
 * around the frozen `SessionState` contract (shared-types/session.ts) —
 * that type was deliberately shaped for exactly this milestone in M4.1
 * ("so a later persistence milestone can wrap this directly into a
 * SessionState without a shape migration"), so `answers` here is the
 * wizard's own `AnswersState` with no conversion needed.
 *
 * Deliberately NOT stored: the resolved route/card. It's derived data —
 * recomputing it from the persisted `answers` via the frozen Rule Engine
 * at resume time is exactly as cheap as reading a stored field, and never
 * risks drifting from what the engine would actually decide (storing a
 * route id here would just be a second, potentially-stale copy of a
 * Rule-Engine decision sitting in the UI layer).
 */

function isValidSessionState(value: unknown): value is SessionState {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.rulePackVersion === "string" &&
    typeof candidate.locale === "string" &&
    typeof candidate.startedAtIso === "string" &&
    typeof candidate.updatedAtIso === "string" &&
    typeof candidate.currentStepId === "string" &&
    typeof candidate.answers === "object" &&
    candidate.answers !== null
  );
}

/**
 * Reads the stored session, or `undefined` if none exists, it's corrupt,
 * it's a schema version this build doesn't understand, or it's expired
 * (`updatedAtIso` + 24 h has passed — V2 FR-8). Never throws: storage can
 * be unavailable (private browsing) or hold garbage from a future/past
 * build, and neither should crash the wizard.
 */
export function loadSession(): SessionState | undefined {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSessionState(parsed)) {
      return undefined;
    }
    const updatedAtMs = Date.parse(parsed.updatedAtIso);
    if (Number.isNaN(updatedAtMs) || Date.now() - updatedAtMs > SESSION_TTL_MS) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

/** Writes the session, refreshing `updatedAtIso` (and so the 24 h expiry window). */
export function saveSession(params: {
  readonly rulePackVersion: string;
  readonly locale: LocaleCode;
  readonly startedAtIso: string;
  readonly answers: AnswersState;
  readonly currentStepId: string;
}): void {
  const session: SessionState = {
    schemaVersion: 1,
    rulePackVersion: params.rulePackVersion,
    locale: params.locale,
    startedAtIso: params.startedAtIso,
    updatedAtIso: new Date().toISOString(),
    answers: params.answers,
    currentStepId: params.currentStepId,
  };
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Non-fatal: storage unavailable (quota exceeded / private mode).
  }
}

/** Deletes the stored session entirely ("Start Over" / "Clear Previous"). */
export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Non-fatal.
  }
}
