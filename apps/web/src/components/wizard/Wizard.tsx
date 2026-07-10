"use client";

import { useMemo, useState } from "react";
import type { AnswerValue, LocalizedText, RulePack } from "@claimsahayak/shared-types";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";
import { ENGINE_VERSION, applyAnswerChange, resolveVisibleQuestions } from "@claimsahayak/rule-engine";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionRenderer } from "./QuestionRenderer";
import { ResumeBanner } from "./ResumeBanner";
import { RerouteBanner } from "./RerouteBanner";
import { DebugPanel } from "./DebugPanel";
import {
  answerToPatch,
  toAnswerMap,
  withoutQuestionKeys,
  type AnswersState,
} from "@/lib/wizardAnswers";
import { getCurrentQuestion } from "@/lib/wizardCurrentQuestion";
import { detectRerouteBanner } from "@/lib/wizardReroute";
import { getWizardDictionary } from "@/i18n/wizard";

/**
 * Wizard shell (Milestone 4.1 foundation + Milestone 4.2 navigation). Owns
 * the four allowed pieces of UI state — `answers`, `currentQuestion`
 * (derived), `locale`, and a `session` concept deferred to the persistence
 * milestone — plus two purely-structural navigation bookkeeping pieces
 * (`visited`, `editIndex`) that record WHICH questions the user has passed
 * through and whether they're currently revisiting one; neither carries
 * any business meaning (no route/scheme/threshold names appear in them).
 *
 * Every decision about which question is current, which are visible, what
 * gets cleared on an edit, and whether the route changed comes from the
 * frozen Rule Engine (`resolveVisibleQuestions`, `validateAnswers` via
 * `getCurrentQuestion`, `applyAnswerChange`, `resolveRoute` via
 * `detectRerouteBanner`). This file only sequences those calls and holds
 * the resulting state — it never itself evaluates a scheme, route,
 * threshold, or overlay condition.
 *
 * Multi-account looping (one wizard pass per ticked Q1 scheme) is still
 * out of scope (as in M4.1): this evaluates against the pack's first
 * scheme only, since `q1_schemes` — the only question guaranteed visible
 * before any scheme is chosen — never conditions on it.
 */
export function Wizard({ rulePack }: { readonly rulePack: RulePack }) {
  const [locale] = useState(DEFAULT_LOCALE);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [draft, setDraft] = useState<AnswerValue | undefined>(undefined);
  /** Ids of questions committed so far, in the order the user actually visited them. */
  const [visited, setVisited] = useState<readonly string[]>([]);
  /** Index into `visited` currently being revisited/edited, or null when at the forward frontier. */
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [rerouteBanner, setRerouteBanner] = useState<LocalizedText | undefined>(undefined);

  const scheme = rulePack.schemes[0];
  if (!scheme) {
    throw new Error("Rule Pack declares no schemes.");
  }

  const questionsById = useMemo(
    () => new Map(rulePack.questions.map((q) => [q.id, q])),
    [rulePack],
  );
  const flatAnswers = useMemo(() => toAnswerMap(answers), [answers]);
  const visibleQuestions = useMemo(
    () => resolveVisibleQuestions(rulePack, scheme, flatAnswers, undefined),
    [rulePack, scheme, flatAnswers],
  );
  const frontierQuestion = useMemo(
    () => getCurrentQuestion(rulePack, scheme, flatAnswers, answers),
    [rulePack, scheme, flatAnswers, answers],
  );
  const currentQuestion =
    editIndex !== null ? questionsById.get(visited[editIndex] ?? "") : frontierQuestion;

  const total = visibleQuestions.length;
  const current = currentQuestion
    ? visibleQuestions.findIndex((q) => q.id === currentQuestion.id) + 1
    : total;

  const canGoBack = editIndex !== null ? editIndex > 0 : visited.length > 0;

  const t = getWizardDictionary(locale);

  const handleContinue = () => {
    if (!currentQuestion || draft === undefined) {
      return;
    }
    const questionId = currentQuestion.id;
    const previousAnswer = answers[questionId];
    const changed = JSON.stringify(previousAnswer) !== JSON.stringify(draft);
    const wasEditing = editIndex !== null;

    const nextAnswers: Record<string, AnswerValue> = { ...answers, [questionId]: draft };
    let invalidatedIds: readonly string[] = [];
    let banner: LocalizedText | undefined;

    if (changed) {
      const previousFlatWithoutCurrent = withoutQuestionKeys(flatAnswers, questionId);
      const patch = answerToPatch(questionId, draft);
      const result = applyAnswerChange(rulePack, previousFlatWithoutCurrent, questionId, patch);
      invalidatedIds = result.invalidatedQuestionIds;
      for (const id of invalidatedIds) {
        Reflect.deleteProperty(nextAnswers, id);
      }
      if (wasEditing) {
        banner = detectRerouteBanner(rulePack, scheme, flatAnswers, result.answers);
      }
    }

    setAnswers(nextAnswers);
    setVisited((prev) => {
      if (editIndex !== null) {
        const truncated = prev.slice(0, editIndex + 1);
        return truncated.filter((id) => id === questionId || !invalidatedIds.includes(id));
      }
      return prev[prev.length - 1] === questionId ? prev : [...prev, questionId];
    });
    setEditIndex(null);
    setDraft(undefined);
    setRerouteBanner(banner);
  };

  const handleBack = () => {
    if (editIndex !== null) {
      if (editIndex === 0) {
        return;
      }
      const newIndex = editIndex - 1;
      setEditIndex(newIndex);
      setDraft(answers[visited[newIndex] ?? ""]);
    } else {
      if (visited.length === 0) {
        return;
      }
      const newIndex = visited.length - 1;
      setEditIndex(newIndex);
      setDraft(answers[visited[newIndex] ?? ""]);
    }
    setRerouteBanner(undefined);
  };

  return (
    <div className="flex flex-col gap-s4">
      <ResumeBanner visible={false} locale={locale} onResume={() => undefined} />
      <ProgressBar current={current} total={Math.max(total, 1)} />
      <RerouteBanner banner={rerouteBanner} locale={locale} />
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
          onBack={handleBack}
          canGoBack={canGoBack}
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
