import { describe, expect, it } from "vitest";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { buildVarAssignment, resolveRoute } from "../src/index.js";

/**
 * T5 ("the child died, not SSA/PPF — reroute to Q5 with the guardian
 * acting as claimant") and T6 ("both the child and guardian died —
 * reroute to Q5") are not covered by any of the 25 Milestone 2
 * truth-table fixtures. Milestone 3 explicitly asks for "every T1-T21
 * route" to be tested, so these two fixtures are authored directly here
 * rather than by editing the frozen `packages/rule-pack` fixture file.
 */
describe("T5 / T6 route coverage", () => {
  it("T5: child died (non-SSA/PPF scheme) reroutes to Q5, then resolves normally", () => {
    const scheme = RULE_PACK.schemes.find((s) => s.id === "SB");
    if (!scheme) throw new Error("SB scheme missing from pack");
    const vars = buildVarAssignment(
      RULE_PACK,
      scheme,
      {
        q2_who_died: "child",
        q3_holding: "one_name",
        q5_nomination: "yes_alive",
        q9_payment: "own_posb",
      },
      undefined,
    );
    const resolution = resolveRoute(RULE_PACK, vars);
    expect(resolution.firedRouteIds).toEqual(["T5", "T9"]);
    expect(resolution.terminal?.kind).toBe("route");
    expect(resolution.terminal?.target).toBe("ROUTE_A");
  });

  it("T6: both child and guardian died reroutes to Q5, then resolves normally", () => {
    const scheme = RULE_PACK.schemes.find((s) => s.id === "SB");
    if (!scheme) throw new Error("SB scheme missing from pack");
    const vars = buildVarAssignment(
      RULE_PACK,
      scheme,
      {
        q2_who_died: "both",
        q3_holding: "one_name",
        q5_nomination: "yes_alive",
        q9_payment: "own_posb",
      },
      undefined,
    );
    const resolution = resolveRoute(RULE_PACK, vars);
    expect(resolution.firedRouteIds).toEqual(["T6", "T9"]);
    expect(resolution.terminal?.kind).toBe("route");
    expect(resolution.terminal?.target).toBe("ROUTE_A");
  });

  it("T3/T4 take priority over T5 for SSA/PPF minor-account schemes", () => {
    const ssa = RULE_PACK.schemes.find((s) => s.id === "SSA");
    const ppf = RULE_PACK.schemes.find((s) => s.id === "PPF");
    if (!ssa || !ppf) throw new Error("SSA/PPF scheme missing from pack");

    const ssaVars = buildVarAssignment(RULE_PACK, ssa, { q2_who_died: "child" }, undefined);
    expect(resolveRoute(RULE_PACK, ssaVars).firedRouteIds).toEqual(["T3"]);

    const ppfVars = buildVarAssignment(RULE_PACK, ppf, { q2_who_died: "child" }, undefined);
    expect(resolveRoute(RULE_PACK, ppfVars).firedRouteIds).toEqual(["T4"]);
  });
});
