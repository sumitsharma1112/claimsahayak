/**
 * Restricted JSON-logic subset (V3 §2.3): and / or / not / == / in / >= / var.
 * Deliberately closed — no arbitrary expressions, statically validatable,
 * termination guaranteed. The Decision Engine (Milestone 3) is its only
 * evaluator; the Admin Portal condition builder (Milestone 10) is its only
 * authoring surface.
 */
export type ConditionValue = string | number | boolean;

/** Reference to an answer id, derived value id, or named constant. */
export interface VarRef {
  readonly var: string;
}

/** Either side of a comparison may be a variable reference or a literal. */
export type Operand = VarRef | ConditionValue;

export type Condition =
  | { readonly and: readonly Condition[] }
  | { readonly or: readonly Condition[] }
  | { readonly not: Condition }
  | { readonly "==": readonly [Operand, Operand] }
  | { readonly in: readonly [Operand, readonly ConditionValue[]] }
  | { readonly ">=": readonly [Operand, Operand] };

/** A condition that is always true; used for unconditional rows. */
export const ALWAYS: Condition = { and: [] };
