import type { LocaleCode, LocalizedText } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";

/**
 * Presentation only: the question's own heading, straight from the Rule
 * Pack's `text` field. No logic — not even a11y wiring, since the heading
 * `id` it exposes is consumed by `QuestionRenderer` for `aria-labelledby`.
 */
export function QuestionCard({
  questionId,
  text,
  locale,
}: {
  readonly questionId: string;
  readonly text: LocalizedText;
  readonly locale: LocaleCode;
}) {
  return (
    <h2
      id={`question-${questionId}-heading`}
      className="m-0 font-display text-question font-semibold text-ink"
    >
      {pickText(text, locale)}
    </h2>
  );
}
