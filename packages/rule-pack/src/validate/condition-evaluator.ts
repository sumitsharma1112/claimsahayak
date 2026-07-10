import type { Condition, ConditionValue, Operand } from "@claimsahayak/shared-types";

/**
 * A flat variable assignment used only by the reachability/satisfiability
 * checker below. This is NOT the production Decision Engine (Milestone 3):
 * it has no notion of accounts, invalidation cascades, or checklist
 * assembly — it exists purely so the validation pipeline can ask "is there
 * ANY combination of answers that makes this condition true", which is
 * exactly what "every question/route is reachable" (V3 §2.5) means.
 *
 * Semantics matter here because they are the contract Milestone 3's real
 * engine must also honour: a variable that is absent from the assignment
 * evaluates as absent, `==`/`in` against an absent variable is false, and
 * `>=` against an absent variable is false (see the convention comment at
 * the top of data/questions.ts).
 */
export type VarAssignment = Readonly<Record<string, ConditionValue>>;

function resolveOperand(
  operand: Operand,
  assignment: VarAssignment,
): ConditionValue | undefined {
  if (typeof operand === "object" && operand !== null && "var" in operand) {
    return assignment[operand.var];
  }
  return operand;
}

export function evaluateCondition(
  condition: Condition,
  assignment: VarAssignment,
): boolean {
  if ("and" in condition) {
    return condition.and.every((c) => evaluateCondition(c, assignment));
  }
  if ("or" in condition) {
    return condition.or.some((c) => evaluateCondition(c, assignment));
  }
  if ("not" in condition) {
    return !evaluateCondition(condition.not, assignment);
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
    if (
      typeof leftValue !== "number" ||
      typeof rightValue !== "number"
    ) {
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
