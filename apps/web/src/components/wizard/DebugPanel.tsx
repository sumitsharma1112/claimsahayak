import type { LocaleCode } from "@claimsahayak/shared-types";
import { getWizardDictionary } from "@/i18n/wizard";
import type { AnswersState } from "@/lib/wizardAnswers";

/**
 * Development-only inspector: Rule Pack version, Engine version, and the
 * wizard's current allowed state (currentQuestion/answers/locale) plus
 * whichever questions the engine currently reports visible. Renders
 * nothing at all outside development — checked at render time (not
 * module load) so it responds to `NODE_ENV` per-render in tests.
 */
export function DebugPanel({
  rulePackVersion,
  engineVersion,
  currentQuestionId,
  locale,
  answers,
  visibleQuestionIds,
}: {
  readonly rulePackVersion: string;
  readonly engineVersion: string;
  readonly currentQuestionId: string | undefined;
  readonly locale: LocaleCode;
  readonly answers: AnswersState;
  readonly visibleQuestionIds: readonly string[];
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  const t = getWizardDictionary(locale);
  return (
    <aside
      aria-label={t.debugPanelTitle}
      className="mt-s6 rounded-control border border-ink-soft/30 bg-paper p-s3 text-[16px]"
    >
      <p className="m-0 font-semibold text-ink-soft">{t.debugPanelTitle}</p>
      <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-s3 gap-y-s1">
        <dt className="text-ink-soft">{t.debugRulePackVersion}</dt>
        <dd className="m-0">{rulePackVersion}</dd>
        <dt className="text-ink-soft">{t.debugEngineVersion}</dt>
        <dd className="m-0">{engineVersion}</dd>
        <dt className="text-ink-soft">{t.debugCurrentQuestion}</dt>
        <dd className="m-0">{currentQuestionId ?? "—"}</dd>
        <dt className="text-ink-soft">{t.debugLocale}</dt>
        <dd className="m-0">{locale}</dd>
        <dt className="text-ink-soft">{t.debugVisibleQuestions}</dt>
        <dd className="m-0">{visibleQuestionIds.join(", ") || "—"}</dd>
        <dt className="text-ink-soft">{t.debugAnswers}</dt>
        <dd className="m-0">
          <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(answers, null, 2)}
          </pre>
        </dd>
      </dl>
    </aside>
  );
}
