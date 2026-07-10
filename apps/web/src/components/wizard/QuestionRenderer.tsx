import type { AnswerValue, LocaleCode, LocalizedText, QuestionInputType } from "@claimsahayak/shared-types";
import { QuestionCard } from "./QuestionCard";
import { WhyPanel } from "./WhyPanel";
import { OptionList, type QuestionOptionView } from "./OptionList";
import { ContinueButton } from "./ContinueButton";
import { PreviousButton } from "./PreviousButton";
import { ReadAloudButton } from "./ReadAloudButton";

/**
 * The ONE generic renderer for every Rule Pack question, regardless of
 * scheme, route, or content. It renders entirely from the six pieces of
 * Rule Pack data named in the Milestone 4.1 spec (id, text, whyText,
 * options, type, visible) plus the minimal interaction plumbing a
 * functioning control requires (current answer, change/continue
 * callbacks) — no scheme/route/threshold/overlay knowledge exists here or
 * anywhere below it.
 */
export interface QuestionRendererProps {
  readonly questionId: string;
  readonly text: LocalizedText;
  readonly whyText: LocalizedText;
  readonly options: readonly QuestionOptionView[];
  readonly type: QuestionInputType;
  readonly visible: boolean;
  readonly locale: LocaleCode;
  readonly answer: AnswerValue | undefined;
  readonly onAnswer: (next: AnswerValue) => void;
  readonly onContinue: () => void;
  readonly onBack: () => void;
  readonly canGoBack: boolean;
}

function hasCompleteAnswer(answer: AnswerValue | undefined): boolean {
  if (!answer) {
    return false;
  }
  switch (answer.kind) {
    case "single":
      return answer.optionId.length > 0;
    case "boolean":
      return true;
    case "multi":
      return answer.optionIds.length > 0;
    case "monthYear":
      return Boolean(answer.month) && Boolean(answer.year);
  }
}

export function QuestionRenderer({
  questionId,
  text,
  whyText,
  options,
  type,
  visible,
  locale,
  answer,
  onAnswer,
  onContinue,
  onBack,
  canGoBack,
}: QuestionRendererProps) {
  if (!visible) {
    return null;
  }
  return (
    <section aria-labelledby={`question-${questionId}-heading`} className="flex flex-col gap-s3">
      <QuestionCard questionId={questionId} text={text} locale={locale} />
      <ReadAloudButton text={text} locale={locale} />
      <WhyPanel questionId={questionId} whyText={whyText} locale={locale} />
      <OptionList
        questionId={questionId}
        type={type}
        options={options}
        locale={locale}
        answer={answer}
        onAnswer={onAnswer}
      />
      <div className="mt-s4 flex gap-s3">
        <PreviousButton locale={locale} disabled={!canGoBack} onClick={onBack} />
        <ContinueButton locale={locale} disabled={!hasCompleteAnswer(answer)} onClick={onContinue} />
      </div>
    </section>
  );
}
