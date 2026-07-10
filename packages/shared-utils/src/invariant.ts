/** Throws with a stable message when a condition that must hold does not. */
export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}

/** Exhaustiveness helper for discriminated unions. */
export function assertNever(value: never, context: string): never {
  throw new Error(`Unhandled variant in ${context}: ${String(value)}`);
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
