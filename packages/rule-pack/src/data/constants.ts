import type { RulePackConstants } from "@claimsahayak/shared-types";

/**
 * Every threshold a future SB Order could change lives here, by name, and
 * nowhere else. Routes/outputs reference these via `{ var: "constants.KEY" }`
 * inside a Condition, or cite the resolved value in prose that interpolates
 * from this module (never a typed-in number) — see data/format.ts.
 */
export const CONSTANTS: RulePackConstants = {
  /** Handbook §3.1(c): affidavit-route ceiling, ₹5,00,000. */
  AFFIDAVIT_LIMIT_INR: 500_000,
  /** Handbook §3.1(a)/FAQ 28: minimum wait before a no-legal-evidence claim. */
  NO_NOMINATION_WAIT_MONTHS: 6,
  /** Handbook §5.4-10/FAQ 18: account freezes to Head-Post-Office-only after this many years post-maturity. */
  FREEZE_YEARS: 10,
};
