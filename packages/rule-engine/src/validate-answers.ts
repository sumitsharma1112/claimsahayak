import type { RulePack, SchemeDefinition } from "@claimsahayak/shared-types";
import type { AnswerMap } from "./variables.js";
import { engineIssue, type EngineIssue } from "./errors.js";
import { buildVarAssignment } from "./variables.js";
import { isQuestionVisible } from "./visibility.js";

/**
 * Structural validation of an answer set against the Rule Pack's own
 * question/option ids (Milestone 3 §13): every answer key must resolve to
 * a real question, and single/multi answers must name a real option.
 * Never throws — always returns a (possibly empty) issue list, so a
 * caller can decide whether to block on it or just log it.
 */
export function validateAnswers(
  rulePack: RulePack,
  answers: AnswerMap,
  scheme: SchemeDefinition,
): readonly EngineIssue[] {
  const issues: EngineIssue[] = [];
  const questionsById = new Map(rulePack.questions.map((q) => [q.id, q]));
  const vars = buildVarAssignment(rulePack, scheme, answers, undefined);

  for (const key of Object.keys(answers)) {
    const dot = key.indexOf(".");
    const questionId = dot === -1 ? key : key.slice(0, dot);
    const optionId = dot === -1 ? undefined : key.slice(dot + 1);

    const question = questionsById.get(questionId);
    if (!question) {
      issues.push(engineIssue("unknown_question", `"${questionId}" is not a question in this Rule Pack.`, key));
      continue;
    }
    if (optionId !== undefined && question.inputType === "multi") {
      const hasOption = question.options.some((o) => o.id === optionId);
      if (!hasOption) {
        issues.push(
          engineIssue("unknown_option", `"${questionId}" has no option "${optionId}".`, key),
        );
      }
    }
  }

  // Best-effort: flag visible-but-unanswered questions as informational
  // issues (never fatal — a mid-wizard answer set is expected to be
  // incomplete; `evaluateChecklist` still runs on whatever is present).
  for (const question of rulePack.questions) {
    if (!isQuestionVisible(question, vars)) {
      continue;
    }
    const answered =
      question.inputType === "multi"
        ? Object.keys(answers).some((k) => k.startsWith(`${question.id}.`))
        : Object.prototype.hasOwnProperty.call(answers, question.id);
    if (!answered) {
      issues.push(
        engineIssue(
          "unanswered_question",
          `Visible question "${question.id}" has no answer yet.`,
          question.id,
        ),
      );
    }
  }

  return issues;
}
