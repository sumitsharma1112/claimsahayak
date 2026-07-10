import type { ChecklistDocument, LocalizedText, ResolvedCard, RulePack } from "@claimsahayak/shared-types";
import type { AnswerMap } from "./variables.js";
import { getAnswer } from "./variables.js";
import type { DerivedValues } from "./derived.js";
import { evaluateAccount } from "./account.js";
import type { EngineIssue } from "./errors.js";
import { ENGINE_VERSION } from "./version.js";

export interface ChecklistEvaluation {
  readonly document: ChecklistDocument;
  readonly issues: readonly EngineIssue[];
}

/**
 * The Rule Pack's own disclaimer copy has no dedicated data location yet
 * (Milestone 2's content pages cover /learn, /fix, /faq, /glossary, not a
 * short legal footer) — a fixed, non-business-rule disclaimer string is
 * the only reasonable placeholder until a future milestone gives this a
 * real authored home. It never varies by route, scheme, or account, so
 * keeping it here does not violate "no business rules outside the Rule
 * Pack" (there is no rule in it — it's a static legal notice).
 */
const STANDARD_DISCLAIMER: LocalizedText = {
  en: "This checklist is general guidance, not legal advice, and does not replace confirmation from the Post Office itself.",
};

/**
 * Builds one account per scheme ticked in Q1 (Milestone 3 §8 — "never
 * merge accounts; every account produces its own checklist"), never from
 * a hardcoded scheme list — the candidate scheme ids come from the Rule
 * Pack's own `schemes[]`, and whether each is "in play" comes from the
 * caller's answers under the `q1_schemes.<id>` convention.
 *
 * If ONLY the "older/discontinued scheme" option was ticked (Q1's
 * `OLD_UNSURE`, `exclusive: true` in the pack, so no real scheme should
 * also be ticked alongside it), there is no real per-scheme account to
 * build; the engine instead resolves whichever account-independent
 * terminal route the pack decides for this state (T1's info-end card in
 * the authored pack; the bundled fallback pack's own always-on card when
 * `rulePack.schemes` is empty) using the first available scheme purely as
 * a neutral evaluation context, and surfaces only the resulting card —
 * no AccountChecklist is added for it.
 */
export function evaluateChecklist(
  rulePack: RulePack,
  answers: AnswerMap,
  derived?: DerivedValues,
): ChecklistEvaluation {
  const issues: EngineIssue[] = [];
  const cards: ResolvedCard[] = [];
  const goodToKnowSeen = new Set<string>();
  const goodToKnow: LocalizedText[] = [];
  const verificationPanelSeen = new Set<string>();
  const verificationPanel: LocalizedText[] = [];

  const schemeCandidates = rulePack.schemes.filter((s) => getAnswer(answers, `q1_schemes.${s.id}`) === true);

  const liftShared = (
    items: readonly { readonly id: string; readonly label: LocalizedText }[],
    seen: Set<string>,
    into: LocalizedText[],
  ): void => {
    for (const item of items) {
      if (seen.has(item.id)) {
        continue;
      }
      seen.add(item.id);
      into.push(item.label);
    }
  };

  if (schemeCandidates.length > 0) {
    const accounts = schemeCandidates.map((scheme, accountIndex) =>
      evaluateAccount(rulePack, scheme.id, answers, derived, accountIndex),
    );
    for (const evaluation of accounts) {
      if (evaluation.card) {
        cards.push(evaluation.card);
      }
      liftShared(evaluation.liftedGoodToKnow, goodToKnowSeen, goodToKnow);
      liftShared(evaluation.liftedVerificationPanel, verificationPanelSeen, verificationPanel);
      issues.push(...evaluation.issues);
    }

    const document: ChecklistDocument = {
      rulePackVersion: rulePack.meta.version,
      engineVersion: ENGINE_VERSION,
      locale: "en",
      accounts: accounts.map((a) => a.account),
      cards,
      verificationPanel,
      goodToKnow,
      disclaimers: [STANDARD_DISCLAIMER],
    };
    return { document, issues };
  }

  // No real scheme selected: resolve an account-independent terminal
  // (e.g. T1, or the fallback pack's always-on route) using a neutral
  // scheme context, with no AccountChecklist added.
  const neutralSchemeId = rulePack.schemes[0]?.id ?? "UNKNOWN";
  const probe = evaluateAccount(rulePack, neutralSchemeId, answers, derived, 0);
  if (probe.card) {
    cards.push(probe.card);
  }
  issues.push(...probe.issues);

  const document: ChecklistDocument = {
    rulePackVersion: rulePack.meta.version,
    engineVersion: ENGINE_VERSION,
    locale: "en",
    accounts: [],
    cards,
    verificationPanel,
    goodToKnow,
    disclaimers: [STANDARD_DISCLAIMER],
  };
  return { document, issues };
}
