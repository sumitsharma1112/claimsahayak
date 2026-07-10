"use client";

import { useMemo, useState } from "react";
import type { AnswerValue, RulePack } from "@claimsahayak/shared-types";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";
import { ENGINE_VERSION, resolveVisibleQuestions } from "@claimsahayak/rule-engine";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionRenderer } from "./QuestionRenderer";
import { ResumeBanner } from "./ResumeBanner";
import { DebugPanel } from "./DebugPanel";
import { toAnswerMap, type AnswersState } from "@/lib/wizardAnswers";
import { getCurrentQuestion } from "@/lib/wizardCurrentQuestion";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Wizard shell (Milestone 4.1): owns the four allowed pieces of UI state —
 * `answers`, `currentQuestion` (derived), `locale`, and a `session` concept
 * deferred to the persistence milestone — and renders exactly one question
 * at a time via the single generic `QuestionRenderer`. It never branches on
 * scheme, route, nominee, amount, or overlay: every decision it makes
 * (which question is current, which questions are visible) comes from the
 * frozen Rule Engine (`resolveVisibleQuestions` / `validateAnswers`).
 *
 * Multi-account looping (one wizard pass per ticked Q1 scheme) belongs to
 * the full wizard (a later milestone); this foundation always evaluates
 * against the pack's first scheme, since `q1_schemes` — the only question
 * guaranteed visible before any scheme is chosen — never conditions on it.
 */
export function Wizard({ rulePack }: { readonly rulePack: RulePack }) {
  const [locale] = useState(DEFAULT_LOCALE);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [draft, setDraft] = useState<AnswerValue | undefined>(undefined);

  const scheme = rulePack.schemes[0];
  if (!scheme) {
    throw new Error("Rule Pack declares no schemes.");
  }

  const flatAnswers = useMemo(() => toAnswerMap(answers), [answers]);
  const visibleQuestions = useMemo(
    () => resolveVisibleQuestions(rulePack, scheme, flatAnswers, undefined),
    [rulePack, scheme, flatAnswers],
  );
  const currentQuestion = useMemo(
    () => getCurrentQuestion(rulePack, scheme, flatAnswers),
    [rulePack, scheme, flatAnswers],
  );

  const total = visibleQuestions.length;
  const current = currentQuestion
    ? visibleQuestions.findIndex((q) => q.id === currentQuestion.id) + 1
    : total;

  const t = getWizardDictionary(locale);

  function handleContinue() {
    if (!currentQuestion || draft === undefined) {
      return;
    }
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: draft }));
    setDraft(undefined);
  }

  return (
    <div className="flex flex-col gap-s4">
      <ResumeBanner visible={false} locale={locale} onResume={() => undefined} />
      <ProgressBar current={current} total={Math.max(total, 1)} />
      {currentQuestion ? (
        <QuestionRenderer
          questionId={currentQuestion.id}
          text={currentQuestion.text}
          whyText={currentQuestion.whyStrip}
          options={currentQuestion.options}
          type={currentQuestion.inputType}
          visible
          locale={locale}
          answer={draft}
          onAnswer={setDraft}
          onContinue={handleContinue}
        />
      ) : (
        <div role="status" className="rounded-control border border-ok/30 bg-ok-bg p-s4">
          <p className="m-0 font-semibold text-ok">{t.foundationCompleteTitle}</p>
          <p className="mb-0 mt-s2 text-ink-soft">{t.foundationCompleteBody}</p>
        </div>
      )}
      <DebugPanel
        rulePackVersion={rulePack.meta.version}
        engineVersion={ENGINE_VERSION}
        currentQuestionId={currentQuestion?.id}
        locale={locale}
        answers={answers}
        visibleQuestionIds={visibleQuestions.map((q) => q.id)}
      />
    </div>
  );
}
