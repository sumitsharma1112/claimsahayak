"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnswerValue, LocalizedText, RulePack } from "@claimsahayak/shared-types";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";
import {
  ENGINE_VERSION,
  applyAnswerChange,
  buildVarAssignment,
  resolveRoute,
  resolveVisibleQuestions,
} from "@claimsahayak/rule-engine";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionRenderer } from "./QuestionRenderer";
import { ResumeBanner } from "./ResumeBanner";
import { RerouteBanner } from "./RerouteBanner";
import { WizardCard } from "./WizardCard";
import { ConfirmDialog } from "./ConfirmDialog";
import { DebugPanel } from "./DebugPanel";
import {
  answerToPatch,
  toAnswerMap,
  withoutQuestionKeys,
  type AnswersState,
} from "@/lib/wizardAnswers";
import { getCurrentQuestion } from "@/lib/wizardCurrentQuestion";
import { detectRerouteBanner } from "@/lib/wizardReroute";
import { clearSession, loadSession, saveSession } from "@/lib/wizardSession";
import { getWizardDictionary } from "@/i18n/wizard";
import type { SessionState } from "@claimsahayak/shared-types";

/**
 * Wizard shell (M4.1 foundation + M4.2 navigation + M4.3 sessions/cards).
 * Owns the four allowed pieces of UI state — `answers`, `currentQuestion`
 * (derived), `locale`, and now `session` (a pending resume decision plus
 * the local-storage read/write around it) — alongside purely-structural
 * navigation bookkeeping (`visited`, `editIndex`) with no business meaning.
 *
 * Every decision about which question is current, which are visible, what
 * gets cleared on an edit, whether the route changed, and whether the
 * account has reached a terminal Card outcome comes from the frozen Rule
 * Engine (`resolveVisibleQuestions`, `validateAnswers` via
 * `getCurrentQuestion`, `applyAnswerChange`, `resolveRoute` via
 * `detectRerouteBanner` and the card check below). This file only
 * sequences those calls, holds the resulting state, and persists/restores
 * it — it never itself evaluates a scheme, route, threshold, or overlay
 * condition.
 *
 * Multi-account looping (one wizard pass per ticked Q1 scheme) is still
 * out of scope: this evaluates against the pack's first scheme only, since
 * `q1_schemes` — the only question guaranteed visible before any scheme is
 * chosen — never conditions on it.
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
  const [startedAtIso, setStartedAtIso] = useState(() => new Date().toISOString());
  /** undefined = not checked yet (client-only); null = checked, nothing to resume. */
  const [pendingSession, setPendingSession] = useState<SessionState | null | undefined>(undefined);
  const [startOverOpen, setStartOverOpen] = useState(false);

  // Storage only exists client-side; checking after mount avoids a hydration mismatch.
  useEffect(() => {
    setPendingSession(loadSession() ?? null);
  }, []);

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

  const routeResolution = useMemo(() => {
    const vars = buildVarAssignment(rulePack, scheme, flatAnswers, undefined);
    return resolveRoute(rulePack, vars);
  }, [rulePack, scheme, flatAnswers]);
  const terminalCard = useMemo(() => {
    if (routeResolution.terminal?.kind !== "card") {
      return undefined;
    }
    return rulePack.cards.find((c) => c.id === routeResolution.terminal?.target);
  }, [rulePack, routeResolution]);
  const terminalTemplate = useMemo(() => {
    if (!terminalCard?.templateId) {
      return undefined;
    }
    return rulePack.templates.find((tpl) => tpl.id === terminalCard.templateId);
  }, [rulePack, terminalCard]);
  // A terminal Card only short-circuits the forward frontier — actively
  // revisiting a past answer (editIndex !== null) always shows that
  // question, regardless of what the not-yet-committed draft would resolve to.
  const showingCard = editIndex === null && terminalCard !== undefined;

  const total = visibleQuestions.length;
  const current =
    showingCard || !currentQuestion
      ? total
      : visibleQuestions.findIndex((q) => q.id === currentQuestion.id) + 1;

  const canGoBack = editIndex !== null ? editIndex > 0 : visited.length > 0;

  const t = getWizardDictionary(locale);

  // Persist after every answer change (skip the empty initial state — an
  // all-empty session has nothing worth offering to resume later).
  useEffect(() => {
    if (Object.keys(answers).length === 0) {
      return;
    }
    saveSession({
      rulePackVersion: rulePack.meta.version,
      locale,
      startedAtIso,
      answers,
      currentStepId: currentQuestion?.stepId ?? questionsById.get(visited[visited.length - 1] ?? "")?.stepId ?? "",
    });
  }, [answers, rulePack, locale, startedAtIso, currentQuestion, questionsById, visited]);

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

  const resetWizardState = () => {
    setAnswers({});
    setDraft(undefined);
    setVisited([]);
    setEditIndex(null);
    setRerouteBanner(undefined);
    setStartedAtIso(new Date().toISOString());
  };

  const handleResume = () => {
    if (!pendingSession) {
      return;
    }
    setAnswers(pendingSession.answers);
    setStartedAtIso(pendingSession.startedAtIso);
    setVisited(Object.keys(pendingSession.answers));
    setEditIndex(null);
    setPendingSession(null);
  };

  const handleStartNew = () => {
    // Soft dismiss: the old session is left in storage in case the user
    // reconsiders after a refresh — only "Clear Previous" deletes it.
    setPendingSession(null);
  };

  const handleClearPrevious = () => {
    clearSession();
    setPendingSession(null);
  };

  const handleStartOverConfirm = () => {
    clearSession();
    resetWizardState();
    setStartOverOpen(false);
  };

  return (
    <div className="flex flex-col gap-s4">
      {/* Page-level h1 (WCAG 1.3.1/2.4.6): every question/card heading below
          is an h2, so the document must start one level up, not skip to h2.
          Visually hidden — the question itself is the page's visual focus;
          screen-reader users navigating by heading still get a real h1. */}
      <h1 className="cs-visually-hidden">{t.pageTitle}</h1>
      <ResumeBanner
        visible={Boolean(pendingSession)}
        locale={locale}
        onResume={handleResume}
        onStartNew={handleStartNew}
        onClearPrevious={handleClearPrevious}
      />
      <ProgressBar current={current} total={Math.max(total, 1)} />
      <RerouteBanner banner={rerouteBanner} locale={locale} />
      {editIndex === null && terminalCard ? (
        <WizardCard
          card={terminalCard}
          template={terminalTemplate}
          locale={locale}
          onBack={handleBack}
          canGoBack={canGoBack}
        />
      ) : currentQuestion ? (
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
      <div>
        <button type="button" className="cs-btn-secondary" onClick={() => { setStartOverOpen(true); }}>
          {t.startOverLabel}
        </button>
      </div>
      <ConfirmDialog
        open={startOverOpen}
        titleId="start-over-confirm-title"
        title={t.startOverConfirmTitle}
        body={t.startOverConfirmBody}
        confirmLabel={t.startOverConfirmAction}
        cancelLabel={t.startOverCancelAction}
        onConfirm={handleStartOverConfirm}
        onCancel={() => {
          setStartOverOpen(false);
        }}
      />
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
