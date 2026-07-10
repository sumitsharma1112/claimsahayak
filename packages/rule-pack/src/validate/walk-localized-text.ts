function looksLikeLocalizedText(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Record<string, unknown>)["en"] === "string"
  );
}

/**
 * Walks an arbitrary JSON-shaped value (a whole RulePack, or any part of
 * one) looking for LocalizedText leaves. A leaf is detected structurally —
 * an object whose "en" field is a string — rather than by a fixed list of
 * field names, so this keeps working as new content shapes are added.
 */
export function collectLocalizedTexts(
  value: unknown,
  out: Record<string, string>[] = [],
): Record<string, string>[] {
  if (looksLikeLocalizedText(value)) {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectLocalizedTexts(item, out);
    }
    return out;
  }
  if (typeof value === "object" && value !== null) {
    for (const v of Object.values(value)) {
      collectLocalizedTexts(v, out);
    }
  }
  return out;
}
