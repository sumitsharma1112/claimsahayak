/**
 * Generic Indian-locale formatting helpers (presentation only — thresholds
 * themselves live in the Rule Pack constants).
 */

/** Formats an integer with Indian digit grouping: 500000 → "5,00,000". */
export function formatIndianNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Cannot format non-finite number: ${String(value)}`);
  }
  const negative = value < 0;
  const digits = Math.trunc(Math.abs(value)).toString();
  if (digits.length <= 3) {
    return `${negative ? "-" : ""}${digits}`;
  }
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${grouped},${last3}`;
}

/** "₹5,00,000" */
export function formatInr(value: number): string {
  return `\u20B9${formatIndianNumber(value)}`;
}
