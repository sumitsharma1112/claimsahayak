/**
 * Deterministic JSON serialization (object keys sorted recursively).
 * Required by V3 I-1: identical inputs must produce byte-identical
 * Checklist JSON; used later for contentHash verification and snapshots.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    const out: Record<string, unknown> = {};
    for (const [k, v] of entries) {
      out[k] = sortValue(v);
    }
    return out;
  }
  return value;
}
