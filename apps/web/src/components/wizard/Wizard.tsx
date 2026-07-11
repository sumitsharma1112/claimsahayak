"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AnswerValue,
  ClaimDataModel,
  LocalizedText,
  OfficialFormLayout,
  RulePack,
} from "@claimsahayak/shared-types";
import { EMPTY_CLAIM_DATA } from "@claimsahayak/shared-types";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";
import {
  ENGINE_VERSION,
  applyAnswerChange,
  evaluateChecklist,
} from "@claimsahayak/rule-engine";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionRenderer } from "./QuestionRenderer";
import { ResumeBanner } from "./ResumeBanner";
import { RerouteBanner } from "./RerouteBanner";
import { WizardCard } from "./WizardCard";
import { ClaimDecisionSummary } from "./ClaimDecisionSummary";
import { ChecklistResults } from "./ChecklistResults";
import { DocumentNotes } from "./DocumentNotes";
import { PrintChecklistButton } from "./PrintChecklistButton";
import { ClaimDetailsForm } from "./ClaimDetailsForm";
import { ClaimPackage } from "./ClaimPackage";
import { ConfirmDialog } from "./ConfirmDialog";
import { DebugPanel } from "./DebugPanel";
import {
  answerToPatch,
  toAnswerMap,
  withoutQuestionKeys,
  type AnswersState,
} from "@/lib/wizardAnswers";
import { computeSessionDerived } from "@/lib/wizardDerived";
import {
  getCurrentQuestionUnion,
  resolveActiveSchemes,
  resolveSchemeRoutes,
  resolveUnionVisibleQuestions,
} from "@/lib/wizardSchemes";
import { detectRerouteBanner } from "@/lib/wizardReroute";
import { clearSession, loadSession, saveSession } from "@/lib/wizardSession";
import { getWizardDictionary } from "@/i18n/wizard";
import type { SessionState } from "@claimsahayak/shared-types";

/**
 * Wizard shell (M4.1 foundation + M4.2 navigation + M4.3 sessions/cards +
 * M6.2 multi-account). Owns the four allowed pieces of UI state —
 * `answers`, `currentQuestion` (derived), `locale`, and `session` (a
 * pending resume decision plus the local-storage read/write around it) —
 * alongside purely-structural navigation bookkeeping (`visited`,
 * `editIndex`) with no business meaning.
 *
 * Every decision about which question is current, which are visible, what
 * gets cleared on an edit, whether the route changed, and what each
 * account's terminal outcome is comes from the frozen Rule Engine
 * (`isQuestionVisible`/`resolveRoute` via wizardSchemes.ts,
 * `applyAnswerChange`, `evaluateAccount`/`evaluateChecklist`). This file
 * only sequences those calls, holds the resulting state, and
 * persists/restores it — it never itself evaluates a scheme, route,
 * threshold, or overlay condition.
 *
 * Multi-account (Milestone 6 Part 2): every scheme ticked in Q1 is
 * evaluated against the one shared answer set. Questions follow UNION
 * visibility (asked if any live — non-carded — scheme needs them); the
 * session is terminal only when every ticked scheme has reached a card or
 * a route-kind decision, at which point a single account renders exactly
 * as it did in M4/M5 (card or decision summary) and two-plus accounts
 * render the engine's whole `ChecklistDocument` via `ChecklistResults`.
 */
export function Wizard({
  rulePack,
  officialFormLayouts = [],
}: {
  readonly rulePack: RulePack;
  /** Milestone 7, Tier A of the document-fidelity model — see claim-data.ts. */
  readonly officialFormLayouts?: readonly OfficialFormLayout[];
}) {
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
  // Milestone 7 — the Claim Data Model lives ONLY in this component's React
  // state: never passed to saveSession/localStorage (see claim-data.ts's
  // privacy note), reset on Start Over exactly like every other piece of
  // wizard state. `showClaimPackage` is purely a display toggle — the
  // default terminal (ClaimDecisionSummary/ChecklistResults, unchanged
  // since M5/M6) always renders first; the full auto-filled package is
  // opt-in via a button, so this milestone adds nothing to the default path.
  const [claimData, setClaimData] = useState<ClaimDataModel>(EMPTY_CLAIM_DATA);
  const [showClaimPackage, setShowClaimPackage] = useState(false);

  // Storage only exists client-side; checking after mount avoids a hydration mismatch.
  useEffect(() => {
    setPendingSession(loadSession() ?? null);
  }, []);

  if (rulePack.schemes.length === 0) {
    throw new Error("Rule Pack declares no schemes.");
  }

  const questionsById = useMemo(
    () => new Map(rulePack.questions.map((q) => [q.id, q])),
    [rulePack],
  );
  const flatAnswers = useMemo(() => toAnswerMap(answers), [answers]);
  // Milestone 6 Part 1: the derived date-math bag (monthsSinceDeath etc.),
  // computed OUTSIDE the pure engine from the monthYear answer and the
  // session-start instant — `startedAtIso` (persisted/restored with the
  // session) rather than a per-render "now", so the same answers resolve
  // the same route for the whole sitting. See wizardDerived.ts.
  const derived = useMemo(
    () => computeSessionDerived(answers, startedAtIso, rulePack.constants),
    [answers, startedAtIso, rulePack],
  );
  // Milestone 6 Part 2: every scheme ticked in Q1 (or the neutral first
  // scheme before Q1 / for the no-real-scheme case) — see wizardSchemes.ts.
  const activeSchemes = useMemo(
    () => resolveActiveSchemes(rulePack, flatAnswers),
    [rulePack, flatAnswers],
  );
  const schemeRoutes = useMemo(
    () => resolveSchemeRoutes(rulePack, activeSchemes, flatAnswers, derived),
    [rulePack, activeSchemes, flatAnswers, derived],
  );
  // Progress denominator: union over every ACTIVE scheme (not just live
  // ones), so the total never shrinks when one scheme cards out early.
  const visibleQuestions = useMemo(
    () => resolveUnionVisibleQuestions(rulePack, activeSchemes, flatAnswers, derived),
    [rulePack, activeSchemes, flatAnswers, derived],
  );
  const frontierQuestion = useMemo(
    () => getCurrentQuestionUnion(rulePack, activeSchemes, flatAnswers, answers, derived),
    [rulePack, activeSchemes, flatAnswers, answers, derived],
  );
  const currentQuestion =
    editIndex !== null ? questionsById.get(visited[editIndex] ?? "") : frontierQuestion;

  // Single-account terminals render exactly as they did in M4/M5: the
  // card, or the account's decision summary. (`frontierQuestion` is
  // already undefined whenever the only scheme has carded — a card
  // short-circuits its scheme's remaining questions.)
  const onlyScheme = activeSchemes.length === 1 ? activeSchemes[0] : undefined;
  const onlyResolution = onlyScheme ? schemeRoutes.get(onlyScheme.id) : undefined;
  const terminalCard = useMemo(() => {
    if (onlyResolution?.terminal?.kind !== "card") {
      return undefined;
    }
    return rulePack.cards.find((c) => c.id === onlyResolution.terminal?.target);
  }, [rulePack, onlyResolution]);
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

  // Milestone 6: the whole-document evaluation (one account per ticked
  // scheme) once no question remains — the multi-account results view
  // renders it directly; the single-account decision view (M5's
  // ClaimDecisionSummary, unchanged) reads its one account from it; and
  // the print/PDF output (Part 3) always covers the full document either
  // way.
  const checklistEvaluation = useMemo(() => {
    if (frontierQuestion !== undefined) {
      return undefined;
    }
    return evaluateChecklist(rulePack, flatAnswers, derived);
  }, [rulePack, frontierQuestion, flatAnswers, derived]);
  // Milestone 5 Part 6: the single-account "route"-kind terminal (a real,
  // payable-or-not decision, as opposed to a pause/stop/info card).
  const singleAccount =
    onlyResolution?.terminal?.kind === "route"
      ? checklistEvaluation?.document.accounts[0]
      : undefined;
  // Milestone 7: every account whose decision is genuinely PAYABLE — never
  // a card-kind terminal (stop/wait/pause never reach this point at all)
  // and never a route-kind "not_payable"/"not_applicable"/"pending_information"
  // decision (e.g. a dispute-forces-court-order referral, or the survivor
  // "no claim needed" outcome) — auto-filling a full document package only
  // makes sense once there is a real amount to actually pay out.
  const packageAccounts = useMemo(
    () => checklistEvaluation?.document.accounts.filter((a) => a.decision?.decisionStatus === "payable") ?? [],
    [checklistEvaluation],
  );

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
        // Derived values are re-computed for the post-edit answer state
        // (after invalidation) — a month-of-death edit changes no flat
        // key, only `derived`, so passing before/after bags is the only
        // way a date-driven route change is detectable at all. With
        // several accounts in play, the first scheme whose terminal
        // changed with a banner-declaring reroute rule provides the text.
        const nextDerived = computeSessionDerived(nextAnswers, startedAtIso, rulePack.constants);
        for (const s of activeSchemes) {
          banner = detectRerouteBanner(rulePack, s, flatAnswers, result.answers, derived, nextDerived);
          if (banner) {
            break;
          }
        }
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
    setClaimData(EMPTY_CLAIM_DATA);
    setShowClaimPackage(false);
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
      ) : showClaimPackage && packageAccounts.length > 0 ? (
        <div className="flex flex-col gap-s4">
          <ClaimDetailsForm
            claimData={claimData}
            onChange={setClaimData}
            accounts={packageAccounts}
            locale={locale}
          />
          <div className="cs-print-area flex flex-col gap-s4">
            <ClaimPackage
              accounts={packageAccounts}
              rulePack={rulePack}
              officialFormLayouts={officialFormLayouts}
              claimData={claimData}
              locale={locale}
              onBack={() => {
                setShowClaimPackage(false);
              }}
              canGoBack
            />
          </div>
          <PrintChecklistButton locale={locale} />
        </div>
      ) : activeSchemes.length >= 2 && checklistEvaluation ? (
        <div className="flex flex-col gap-s4">
          <div className="cs-print-area flex flex-col gap-s4">
            <ChecklistResults
              document={checklistEvaluation.document}
              rulePack={rulePack}
              locale={locale}
              onBack={handleBack}
              canGoBack={canGoBack}
            />
          </div>
          <div className="flex flex-wrap gap-s3">
            <PrintChecklistButton locale={locale} />
            {packageAccounts.length > 0 ? (
              <button
                type="button"
                className="cs-btn-primary"
                onClick={() => {
                  setShowClaimPackage(true);
                }}
              >
                {t.generateClaimPackageLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : singleAccount?.decision && checklistEvaluation ? (
        <div className="flex flex-col gap-s4">
          <div className="cs-print-area flex flex-col gap-s4">
            <ClaimDecisionSummary
              account={singleAccount}
              decision={singleAccount.decision}
              locale={locale}
              onBack={handleBack}
              canGoBack={canGoBack}
            />
            <DocumentNotes document={checklistEvaluation.document} locale={locale} />
          </div>
          <div className="flex flex-wrap gap-s3">
            <PrintChecklistButton locale={locale} />
            {packageAccounts.length > 0 ? (
              <button
                type="button"
                className="cs-btn-primary"
                onClick={() => {
                  setShowClaimPackage(true);
                }}
              >
                {t.generateClaimPackageLabel}
              </button>
            ) : null}
          </div>
        </div>
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
        derived={derived}
      />
    </div>
  );
}
