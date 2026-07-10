import type { Condition, ConditionValue, Operand } from "@claimsahayak/shared-types";

/**
 * A flat variable assignment: the ONLY thing `evaluate()` needs besides a
 * `Condition` to produce a boolean. Every `visibleWhen` / `RouteRule.when`
 * in the Rule Pack is written against variables named with the convention
 * documented at the top of the pack's `data/questions.ts`:
 *
 *   answers.<questionId>              -> selected option id, or true/false
 *   answers.<questionId>.<optionId>   -> true/false, for a multi question
 *   account.schemeId                  -> the scheme id of the account
 *                                        currently being resolved
 *   scheme.<capabilityFlag>            -> the CURRENT account's scheme
 *                                        capability (canBeJoint, etc.)
 *   derived.monthsSinceDeath / .yearsSinceDeath
 *                                      -> computed from Q4, never the raw
 *                                        month/year itself (privacy)
 *   constants.<KEY>                    -> a named RulePackConstants value
 *
 * A variable that is absent from the assignment evaluates as absent:
 * `==`/`in` against an absent variable is false, and `>=` against an
 * absent variable is false. This engine is the pack's ONLY evaluator
 * (Milestone 2's `validate/condition-evaluator.ts` is a satisfiability
 * checker for the authoring pipeline, not this).
 *
 * NOTE on operator coverage: the frozen `Condition` union
 * (`packages/shared-types/src/condition.ts`) is a closed type that
 * defines exactly `and | or | not | == | in | >=`. Milestone 3's brief
 * additionally names `>`, `<`, and `<=`, but the Rule Pack schema is
 * frozen for this milestone ("Do NOT modify Rule Pack schema") and no
 * route or question in the authored pack uses those three operators —
 * every numeric comparison in the pack is phrased as `>=` against a named
 * constant. Implementing operators the closed union cannot even express
 * would require widening that frozen type, so this evaluator implements
 * exactly the six the schema defines, and this note stands in for that
 * gap until a future milestone (if ever) widens `Condition`.
 */
export type VarAssignment = Readonly<Record<string, ConditionValue>>;

function resolveOperand(operand: Operand, assignment: VarAssignment): ConditionValue | undefined {
  if (typeof operand === "object" && operand !== null && "var" in operand) {
    return assignment[operand.var];
  }
  return operand;
}

/**
 * Evaluates a `Condition` against a flat variable assignment. Pure: no
 * side effects, no reads of ambient state (time, randomness, network).
 */
export function evaluate(condition: Condition, assignment: VarAssignment): boolean {
  if ("and" in condition) {
    return condition.and.every((c) => evaluate(c, assignment));
  }
  if ("or" in condition) {
    return condition.or.some((c) => evaluate(c, assignment));
  }
  if ("not" in condition) {
    return !evaluate(condition.not, assignment);
  }
  if ("==" in condition) {
    const [left, right] = condition["=="];
    const leftValue = resolveOperand(left, assignment);
    const rightValue = resolveOperand(right, assignment);
    if (leftValue === undefined || rightValue === undefined) {
      return false;
    }
    return leftValue === rightValue;
  }
  if (">=" in condition) {
    const [left, right] = condition[">="];
    const leftValue = resolveOperand(left, assignment);
    const rightValue = resolveOperand(right, assignment);
    if (typeof leftValue !== "number" || typeof rightValue !== "number") {
      return false;
    }
    return leftValue >= rightValue;
  }
  if ("in" in condition) {
    const [needleOperand, haystack] = condition.in;
    const needle = resolveOperand(needleOperand, assignment);
    if (needle === undefined) {
      return false;
    }
    return haystack.includes(needle);
  }
  return false;
}

/** Collects every `{ var: ... }` reference inside a Condition (diagnostics/tests). */
export function collectVarRefs(condition: Condition): readonly string[] {
  const refs: string[] = [];
  const walkOperand = (operand: Operand): void => {
    if (typeof operand === "object" && operand !== null && "var" in operand) {
      refs.push(operand.var);
    }
  };
  const walk = (c: Condition): void => {
    if ("and" in c) {
      c.and.forEach(walk);
    } else if ("or" in c) {
      c.or.forEach(walk);
    } else if ("not" in c) {
      walk(c.not);
    } else if ("==" in c) {
      c["=="].forEach(walkOperand);
    } else if (">=" in c) {
      c[">="].forEach(walkOperand);
    } else if ("in" in c) {
      walkOperand(c.in[0]);
    }
  };
  walk(condition);
  return refs;
}
