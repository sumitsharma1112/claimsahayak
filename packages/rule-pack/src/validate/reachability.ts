import type { Condition, RulePack, ConditionValue } from "@claimsahayak/shared-types";
import { collectVarRefs } from "../schema/condition.schema.js";
import { issue, warning, type ValidationIssue } from "../schema/issue.js";
import { evaluateCondition, type VarAssignment } from "./condition-evaluator.js";

const SCHEME_CAPABILITY_FLAGS = [
  "canBeJoint",
  "canBeMinorAccount",
  "continuableByClaimant",
  "bankTransferEligible",
] as const;

/**
 * A representative, bounded sample for the two numeric derived values.
 * This is an approximation (true integers are infinite), but it is
 * sufficient to prove or disprove satisfiability of every `>=` comparison
 * this pack actually authors, since every threshold compared against is a
 * small named constant (NO_NOMINATION_WAIT_MONTHS, FREEZE_YEARS).
 */
const DERIVED_NUMERIC_SAMPLE: readonly number[] = [0, 1, 3, 5, 6, 7, 9, 10, 11, 15, 20];

function buildVarDomains(pack: RulePack): Map<string, readonly ConditionValue[]> {
  const domains = new Map<string, readonly ConditionValue[]>();

  for (const question of pack.questions) {
    if (question.inputType === "boolean") {
      domains.set(`answers.${question.id}`, [true, false]);
    } else if (question.inputType === "single") {
      domains.set(
        `answers.${question.id}`,
        question.options.map((o) => o.id),
      );
    } else if (question.inputType === "multi") {
      for (const option of question.options) {
        domains.set(`answers.${question.id}.${option.id}`, [true, false]);
      }
    }
    // monthYear questions expose no direct condition variable (privacy).
  }

  domains.set(
    "account.schemeId",
    pack.schemes.map((s) => s.id),
  );

  for (const flag of SCHEME_CAPABILITY_FLAGS) {
    const valuesPresent = Array.from(new Set(pack.schemes.map((s) => s[flag])));
    domains.set(`scheme.${flag}`, valuesPresent.length > 0 ? valuesPresent : [true, false]);
  }

  domains.set("derived.monthsSinceDeath", DERIVED_NUMERIC_SAMPLE);
  domains.set("derived.yearsSinceDeath", DERIVED_NUMERIC_SAMPLE);

  for (const [key, value] of Object.entries(pack.constants)) {
    domains.set(`constants.${key}`, [value]);
  }

  return domains;
}

/**
 * Confirms every `{ var: "..." }` reference anywhere in the pack's
 * questions/routes resolves to a variable this validator (and, by the same
 * convention, the Milestone 3 engine) actually knows how to produce. This
 * is the check that catches a typo'd var path before it becomes a silent
 * always-false condition in production.
 */
export function checkVarReferencesExist(pack: RulePack): readonly ValidationIssue[] {
  const domains = buildVarDomains(pack);
  const issues: ValidationIssue[] = [];

  const checkOne = (condition: Condition, path: string): void => {
    for (const ref of collectVarRefs(condition)) {
      if (!domains.has(ref)) {
        issues.push(issue(path, `condition references unknown variable "${ref}"`));
      }
    }
  };

  pack.questions.forEach((q, i) => {
    checkOne(q.visibleWhen, `questions[${String(i)}].visibleWhen`);
  });
  pack.routes.forEach((r, i) => {
    checkOne(r.when, `routes[${String(i)}].when`);
  });

  return issues;
}

/**
 * Brute-force satisfiability: for every question's visibleWhen and every
 * route's when, checks whether AT LEAST ONE combination of the variables it
 * references makes it true. Every domain in this pack is small (question
 * options, 8 schemes, boolean capability flags, one sampled numeric range),
 * so a full cartesian product is cheap — this is a validation-time
 * convenience, not a general SAT solver, and does not attempt to model
 * cross-question answer consistency beyond what each condition expresses.
 */
export function checkSatisfiability(pack: RulePack): readonly ValidationIssue[] {
  const domains = buildVarDomains(pack);
  const issues: ValidationIssue[] = [];

  const isSatisfiable = (condition: Condition): boolean => {
    const refs = Array.from(new Set(collectVarRefs(condition)));
    const knownRefs = refs.filter((r) => domains.has(r));
    if (knownRefs.length === 0) {
      // ALWAYS, or a condition with only unknown vars (already reported by
      // checkVarReferencesExist) — treat as satisfiable to avoid
      // double-reporting the same root cause.
      return true;
    }
    const domainLists = knownRefs.map((r) => domains.get(r) ?? []);

    const assignment: Record<string, ConditionValue> = {};
    const recurse = (index: number): boolean => {
      if (index === knownRefs.length) {
        return evaluateCondition(condition, assignment as VarAssignment);
      }
      const ref = knownRefs[index];
      const values = domainLists[index];
      if (ref === undefined || values === undefined) {
        return false;
      }
      for (const value of values) {
        assignment[ref] = value;
        if (recurse(index + 1)) {
          return true;
        }
      }
      return false;
    };
    return recurse(0);
  };

  pack.questions.forEach((q, i) => {
    if (!isSatisfiable(q.visibleWhen)) {
      issues.push(
        issue(
          `questions[${String(i)}].visibleWhen`,
          `question "${q.id}" can never become visible — no combination of answers satisfies its condition`,
        ),
      );
    }
  });
  pack.routes.forEach((r, i) => {
    if (!isSatisfiable(r.when)) {
      issues.push(
        issue(
          `routes[${String(i)}].when`,
          `route "${r.id}" can never fire — no combination of answers satisfies its condition`,
        ),
      );
    }
  });

  return issues;
}

/**
 * Every route id AND every route's `target` (when kind === "route") counts
 * as a reachable identifier — a target names a shared route "bucket" that
 * more than one T-rule can resolve to (e.g. T9, T11, T13, T14 all target
 * "ROUTE_A"). See routes.ts's header comment for the full reasoning.
 *
 * Overlay items are also self-declaring buckets: each `OverlayRule`'s items
 * carry their own `routeId` (e.g. "OVERLAY_passbook_lost") that groups them
 * for output, the same way a route's `target` does — but that id has no
 * corresponding entry in `pack.routes`, since overlays are keyed off a Q10
 * flag rather than the route-priority pass. Those ids count as reachable
 * too, or every overlay output/fixture bucket would wrongly fail this
 * check.
 */
export function reachableRouteIdentifiers(pack: RulePack): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const route of pack.routes) {
    ids.add(route.id);
    if (route.kind === "route") {
      ids.add(route.target);
    }
  }
  for (const overlay of pack.overlays) {
    for (const item of overlay.items) {
      ids.add(item.routeId);
    }
  }
  return ids;
}

/** Every output's routeId must resolve to a reachable route id or target. */
export function checkOutputsReferenceReachableRoutes(
  pack: RulePack,
): readonly ValidationIssue[] {
  const reachable = reachableRouteIdentifiers(pack);
  const issues: ValidationIssue[] = [];
  pack.outputs.forEach((o, i) => {
    if (!reachable.has(o.routeId)) {
      issues.push(
        issue(
          `outputs[${String(i)}].routeId`,
          `output "${o.id}" references routeId "${o.routeId}", which is not any route's id or route-target`,
        ),
      );
    }
  });
  return issues;
}

/**
 * A typo'd `invalidates` target would otherwise silently invalidate
 * nothing — this confirms every named id is a real question.
 */
export function checkInvalidatesReferenceRealQuestions(
  pack: RulePack,
): readonly ValidationIssue[] {
  const questionIds = new Set(pack.questions.map((q) => q.id));
  const issues: ValidationIssue[] = [];
  pack.questions.forEach((q, i) => {
    q.invalidates.forEach((targetId, j) => {
      if (!questionIds.has(targetId)) {
        issues.push(
          issue(
            `questions[${String(i)}].invalidates[${String(j)}]`,
            `"${q.id}" invalidates unknown question id "${targetId}"`,
          ),
        );
      }
    });
  });
  return issues;
}

/** Every overlay's flagId should correspond to a real Q10 option, or a documented system flag. */
const KNOWN_SYSTEM_FLAGS = new Set(["system_frozen_10_years"]);

export function checkOverlayFlagsAreReal(pack: RulePack): readonly ValidationIssue[] {
  const q10 = pack.questions.find((q) => q.id === "q10_docs_check");
  const q10OptionIds = new Set((q10?.options ?? []).map((o) => o.id));
  const issues: ValidationIssue[] = [];
  pack.overlays.forEach((overlay, i) => {
    if (!q10OptionIds.has(overlay.flagId) && !KNOWN_SYSTEM_FLAGS.has(overlay.flagId)) {
      issues.push(
        warning(
          `overlays[${String(i)}].flagId`,
          `"${overlay.flagId}" is neither a q10_docs_check option id nor a documented system flag`,
        ),
      );
    }
  });
  return issues;
}
