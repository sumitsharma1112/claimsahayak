import type { RulePackConstants } from "@claimsahayak/shared-types";

/**
 * Derived values (Milestone 3 §4). `monthsSinceDeath` / `yearsSinceDeath`
 * are the only two that are real Condition variables the Rule Pack
 * actually references (`derived.monthsSinceDeath`, `derived.yearsSinceDeath`
 * — see routes T17/T19). `overSixMonths`, `overTenYears`, and
 * `freezeRequired` are named booleans this milestone's brief asks the
 * engine to compute explicitly; they are derived from the same two
 * numbers and the Rule Pack's own named constants (never a hardcoded
 * threshold), and are exposed for callers/tests even though today's pack
 * expresses its own routing directly against the numeric variables.
 *
 * PURITY: this module never reads the wall clock. A month/year-of-death
 * answer alone cannot determine "how long has it been" without knowing
 * "as of when" — so callers supply `asOfIso` explicitly (typically "now",
 * captured once by the caller, e.g. the wizard UI, outside the pure
 * engine boundary). `evaluate()`/`evaluateChecklist()` never compute this
 * themselves; they only ever accept a `derived` bag as input, exactly the
 * shape the truth-table fixtures already provide it in
 * (`fixture.derived = { monthsSinceDeath, yearsSinceDeath }`).
 */
export interface MonthYear {
  readonly month: number; // 1-12
  readonly year: number;
}

export interface DerivedValues {
  readonly monthsSinceDeath?: number;
  readonly yearsSinceDeath?: number;
  readonly overSixMonths?: boolean;
  readonly overTenYears?: boolean;
  readonly freezeRequired?: boolean;
}

/** Whole months elapsed between `deathMonthYear` and `asOfIso`, floor-based, never negative. */
export function monthsBetween(deathMonthYear: MonthYear, asOfIso: string): number {
  const asOf = new Date(asOfIso);
  const totalMonthsNow = asOf.getUTCFullYear() * 12 + (asOf.getUTCMonth() + 1);
  const totalMonthsDeath = deathMonthYear.year * 12 + deathMonthYear.month;
  const diff = totalMonthsNow - totalMonthsDeath;
  return diff < 0 ? 0 : diff;
}

/**
 * Computes the full derived-value bag from a month/year-of-death answer,
 * an explicit "as of" instant, and the pack's own constants (never a
 * hardcoded 6 or 10). This is a pure helper a caller may use to build the
 * `derived` input to `evaluate()` / `evaluateChecklist()` — it is NOT
 * itself invoked internally by those functions.
 */
export function computeDerivedValues(
  deathMonthYear: MonthYear,
  asOfIso: string,
  constants: RulePackConstants,
): Required<DerivedValues> {
  const monthsSinceDeath = monthsBetween(deathMonthYear, asOfIso);
  const yearsSinceDeath = Math.floor(monthsSinceDeath / 12);
  const overSixMonths = monthsSinceDeath >= constants.NO_NOMINATION_WAIT_MONTHS;
  const overTenYears = yearsSinceDeath >= constants.FREEZE_YEARS;
  return {
    monthsSinceDeath,
    yearsSinceDeath,
    overSixMonths,
    overTenYears,
    freezeRequired: overTenYears,
  };
}
