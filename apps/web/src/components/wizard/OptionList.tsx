import type { AnswerValue } from "@claimsahayak/shared-types";
import type { LocaleCode, LocalizedText, QuestionInputType } from "@claimsahayak/shared-types";
import { OptionCard } from "./OptionCard";
import { getWizardDictionary } from "@/i18n/wizard";

export interface QuestionOptionView {
  readonly id: string;
  readonly label: LocalizedText;
  readonly help?: LocalizedText | undefined;
  readonly exclusive?: boolean | undefined;
}

const currentYear = new Date().getFullYear();
const MONTH_YEAR_RANGE_YEARS = 100;

/**
 * Renders the answer control for ONE question, chosen only by its
 * structural `type` (never by question id, scheme, or any business
 * condition). `single`/`boolean` become a radio group; `multi` becomes a
 * checkbox group honoring each option's pack-declared `exclusive` flag
 * (a generic "clears everything else" behavior, not specific to any one
 * question); `monthYear` becomes two plain selects.
 */
export function OptionList({
  questionId,
  type,
  options,
  locale,
  answer,
  onAnswer,
}: {
  readonly questionId: string;
  readonly type: QuestionInputType;
  readonly options: readonly QuestionOptionView[];
  readonly locale: LocaleCode;
  readonly answer: AnswerValue | undefined;
  readonly onAnswer: (next: AnswerValue) => void;
}) {
  const t = getWizardDictionary(locale);

  if (type === "single") {
    const selected = answer?.kind === "single" ? answer.optionId : undefined;
    return (
      <div role="radiogroup" aria-labelledby={`question-${questionId}-heading`} className="flex flex-col gap-s2">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            inputKind="radio"
            name={questionId}
            optionId={option.id}
            label={option.label}
            help={option.help}
            locale={locale}
            checked={selected === option.id}
            onChange={() => {
              onAnswer({ kind: "single", optionId: option.id });
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "boolean") {
    const selected = answer?.kind === "boolean" ? answer.value : undefined;
    return (
      <div role="radiogroup" aria-labelledby={`question-${questionId}-heading`} className="flex flex-col gap-s2">
        <OptionCard
          inputKind="radio"
          name={questionId}
          optionId="true"
          label={{ en: t.yesLabel }}
          locale={locale}
          checked={selected === true}
          onChange={() => {
            onAnswer({ kind: "boolean", value: true });
          }}
        />
        <OptionCard
          inputKind="radio"
          name={questionId}
          optionId="false"
          label={{ en: t.noLabel }}
          locale={locale}
          checked={selected === false}
          onChange={() => {
            onAnswer({ kind: "boolean", value: false });
          }}
        />
      </div>
    );
  }

  if (type === "multi") {
    const tickedIds = answer?.kind === "multi" ? answer.optionIds : [];
    const toggle = (optionId: string, isExclusive: boolean | undefined, checked: boolean) => {
      if (!checked) {
        onAnswer({ kind: "multi", optionIds: tickedIds.filter((id) => id !== optionId) });
        return;
      }
      if (isExclusive) {
        onAnswer({ kind: "multi", optionIds: [optionId] });
        return;
      }
      const withoutExclusive = tickedIds.filter((id) => {
        const tickedOption = options.find((o) => o.id === id);
        return !tickedOption?.exclusive;
      });
      onAnswer({ kind: "multi", optionIds: [...withoutExclusive, optionId] });
    };
    return (
      <div role="group" aria-labelledby={`question-${questionId}-heading`} className="flex flex-col gap-s2">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            inputKind="checkbox"
            name={questionId}
            optionId={option.id}
            label={option.label}
            help={option.help}
            locale={locale}
            checked={tickedIds.includes(option.id)}
            onChange={(checked) => {
              toggle(option.id, option.exclusive, checked);
            }}
          />
        ))}
      </div>
    );
  }

  // monthYear: no Rule-Pack-declared options (privacy — see rule-engine/variables.ts).
  const month = answer?.kind === "monthYear" ? answer.month : undefined;
  const year = answer?.kind === "monthYear" ? answer.year : undefined;
  const years = Array.from({ length: MONTH_YEAR_RANGE_YEARS + 1 }, (_, i) => currentYear - i);
  return (
    <div className="flex gap-s3" aria-labelledby={`question-${questionId}-heading`} role="group">
      <label className="flex flex-col gap-s1">
        <span className="text-ink-soft">{t.monthLabel}</span>
        <select
          className="min-h-touch rounded-control border-card border-ink-soft/30 bg-paper px-s3"
          value={month ?? ""}
          onChange={(e) => {
            const nextMonth = Number(e.target.value);
            onAnswer({ kind: "monthYear", month: nextMonth, year: year ?? currentYear });
          }}
        >
          <option value="" disabled>
            {t.monthYearPlaceholder}
          </option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-s1">
        <span className="text-ink-soft">{t.yearLabel}</span>
        <select
          className="min-h-touch rounded-control border-card border-ink-soft/30 bg-paper px-s3"
          value={year ?? ""}
          onChange={(e) => {
            const nextYear = Number(e.target.value);
            onAnswer({ kind: "monthYear", month: month ?? 1, year: nextYear });
          }}
        >
          <option value="" disabled>
            {t.monthYearPlaceholder}
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
