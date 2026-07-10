/** Minimal class-name joiner (truthy strings only). */
export function cn(
  ...parts: ReadonlyArray<string | false | null | undefined>
): string {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}
