import type {
  AccountChecklist,
  CardDefinition,
  LocalizedText,
  ResolvedCard,
  RulePack,
  SchemeDefinition,
  SchemeId,
} from "@claimsahayak/shared-types";
import { buildVarAssignment, type AnswerMap } from "./variables.js";
import type { DerivedValues } from "./derived.js";
import { resolveRoute } from "./routing.js";
import { collectOutputBucketIds, collectOutputItems } from "./outputs.js";
import { resolveOverlays } from "./overlay.js";
import { buildSections } from "./sections.js";
import { engineIssue, type EngineIssue } from "./errors.js";
import { resolveClaimDecision } from "./decision.js";

export interface AccountEvaluation {
  readonly account: AccountChecklist;
  readonly card?: ResolvedCard;
  readonly liftedGoodToKnow: readonly { readonly id: string; readonly label: LocalizedText }[];
  readonly liftedVerificationPanel: readonly { readonly id: string; readonly label: LocalizedText }[];
  readonly issues: readonly EngineIssue[];
}

/**
 * `T1` (Blueprint v2's "older/discontinued scheme" info-end card) is the
 * one route in this pack whose account is not really a checklist-bearing
 * account at all — the truth-table fixture for it (`fx21`) expects an
 * EMPTY output-bucket set, not even the normally-always-on GLOBAL good-
 * to-know/verification-panel block. Every other card-kind route (T2, T15,
 * T18, T18A, T19, T20) still gets GLOBAL. This is the one structural
 * exception the fixtures require; it is keyed off the route id the pack
 * itself assigns to that scenario, not a hardcoded scheme or threshold.
 */
const OUT_OF_SCOPE_ROUTE_ID = "T1";

function humanizeBucketId(bucketId: string): LocalizedText {
  const withoutPrefix = bucketId.replace(/^ROUTE_/, "");
  const words = withoutPrefix
    .split("_")
    .filter(Boolean)
    .map((w) => (w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()));
  return { en: `Route ${words.join(" ")}`.trim() };
}

function resolveScheme(
  rulePack: RulePack,
  schemeId: string,
): { scheme: SchemeDefinition; issue?: EngineIssue } {
  const found = rulePack.schemes.find((s) => s.id === schemeId);
  if (found) {
    return { scheme: found };
  }
  const synthetic: SchemeDefinition = {
    // Cast: `schemeId` here is deliberately unvalidated (this whole branch
    // only runs when it did NOT match any real scheme in the pack), but
    // `SchemeDefinition.id` is typed against the closed `SchemeId` union.
    // The synthetic scheme is a safe-defaults placeholder, never a real
    // capability claim, so widening the type at this one boundary is
    // preferable to weakening `SchemeDefinition.id` itself.
    id: schemeId as SchemeId,
    displayName: { en: schemeId },
    description: { en: "" },
    canBeJoint: false,
    canBeMinorAccount: false,
    continuableByClaimant: false,
    bankTransferEligible: false,
    sortOrder: 0,
  };
  return {
    scheme: synthetic,
    issue: engineIssue(
      "unknown_scheme",
      `Scheme "${schemeId}" is not in this Rule Pack; using safe defaults.`,
      schemeId,
    ),
  };
}

function resolveCard(rulePack: RulePack, cardId: string): { card?: CardDefinition; issue?: EngineIssue } {
  const card = rulePack.cards.find((c) => c.id === cardId);
  if (card) {
    return { card };
  }
  return { issue: engineIssue("unknown_card", `Card id "${cardId}" is not in this Rule Pack.`, cardId) };
}

/**
 * Evaluates ONE account (one scheme) against a complete answer set
 * (Milestone 3 §1, §8). Pure and side-effect free: same `rulePack` +
 * `schemeId` + `answers` + `derived` always produce the same result.
 */
export function evaluateAccount(
  rulePack: RulePack,
  schemeId: string,
  answers: AnswerMap,
  derived: DerivedValues | undefined,
  accountIndex = 0,
): AccountEvaluation {
  const issues: EngineIssue[] = [];
  const { scheme, issue: schemeIssue } = resolveScheme(rulePack, schemeId);
  if (schemeIssue) {
    issues.push(schemeIssue);
  }

  const vars = buildVarAssignment(rulePack, scheme, answers, derived);
  const resolution = resolveRoute(rulePack, vars);

  const isOutOfScope = resolution.terminal?.id === OUT_OF_SCOPE_ROUTE_ID;

  let resolvedCard: ResolvedCard | undefined;
  let routeId = "UNRESOLVED";
  let routeName: LocalizedText = { en: "Unresolved" };

  if (!resolution.terminal) {
    issues.push(
      engineIssue(
        "unresolved_route",
        `No route matched for scheme "${schemeId}" with the given answers.`,
        schemeId,
      ),
    );
  } else if (resolution.terminal.kind === "card") {
    const { card, issue: cardIssue } = resolveCard(rulePack, resolution.terminal.target);
    if (cardIssue) {
      issues.push(cardIssue);
    }
    if (card) {
      resolvedCard = {
        id: card.id,
        kind: card.kind,
        title: card.title,
        nextPhysicalStep: card.nextPhysicalStep,
        ...(card.templateId === undefined ? {} : { templateId: card.templateId }),
      };
      routeId = card.id;
      routeName = card.title;
    } else {
      routeId = resolution.terminal.target;
      routeName = { en: resolution.terminal.target };
    }
  } else {
    routeId = resolution.terminal.target;
    routeName = humanizeBucketId(resolution.terminal.target);
  }

  const { decision, issue: decisionIssue } = resolveClaimDecision(rulePack, routeId);
  if (decisionIssue) {
    issues.push(decisionIssue);
  }

  if (isOutOfScope) {
    const account: AccountChecklist = {
      accountIndex,
      schemeId,
      schemeName: scheme.displayName,
      routeId,
      routeName,
      timelineNote: { en: "" },
      sections: [],
      extras: [],
      ...(decision === undefined ? {} : { decision }),
    };
    return {
      account,
      ...(resolvedCard === undefined ? {} : { card: resolvedCard }),
      liftedGoodToKnow: [],
      liftedVerificationPanel: [],
      issues,
    };
  }

  const bucketIds = collectOutputBucketIds(resolution, answers, true);
  const outputItems = collectOutputItems(rulePack, bucketIds);
  const overlays = resolveOverlays(rulePack, answers, derived);
  const { sections, liftedGoodToKnow, liftedVerificationPanel } = buildSections([
    ...outputItems,
    ...overlays.items,
  ]);

  const timelineOutput = rulePack.outputs.find((o) => o.id === "GLOBAL_timeline");
  const timelineNote: LocalizedText =
    timelineOutput?.label ?? { en: "Timing depends on which route this account follows." };

  let paymentNote: LocalizedText | undefined;
  if (bucketIds.includes("PAYMENT_BANK_TRANSFER")) {
    paymentNote = rulePack.outputs.find((o) => o.id === "PAYMENT_BANK_TRANSFER_availability_note")?.label;
  } else if (bucketIds.includes("PAYMENT_OWN_POSB")) {
    paymentNote = rulePack.outputs.find((o) => o.id === "PAYMENT_OWN_POSB_no_revisit_note")?.label;
  }

  const account: AccountChecklist = {
    accountIndex,
    schemeId,
    schemeName: scheme.displayName,
    routeId,
    routeName,
    timelineNote,
    sections,
    extras: overlays.extras,
    ...(paymentNote === undefined ? {} : { paymentNote }),
    ...(decision === undefined ? {} : { decision }),
  };

  return {
    account,
    ...(resolvedCard === undefined ? {} : { card: resolvedCard }),
    liftedGoodToKnow,
    liftedVerificationPanel,
    issues,
  };
}
