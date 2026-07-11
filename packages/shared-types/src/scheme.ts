import type { LocalizedText } from "./locale.js";

/**
 * The nine in-scope schemes. Originally eight per SRS v1 §1.3 (SCSS out of
 * scope); SCSS was added under the ClaimSahayak Official Rule Book v1.0
 * integration (CS-SCH-005) since it has verified settlement rules of its
 * own. PLI/RPLI and discontinued schemes remain out of scope; discontinued
 * schemes are handled by the T1 info-end card, not by a scheme entry.
 */
export type SchemeId =
  | "SB"
  | "RD"
  | "TD"
  | "MIS"
  | "PPF"
  | "SSA"
  | "NSC"
  | "KVP"
  | "SCSS";

export const SCHEME_IDS: readonly SchemeId[] = [
  "SB",
  "RD",
  "TD",
  "MIS",
  "PPF",
  "SSA",
  "NSC",
  "KVP",
  "SCSS",
];

/**
 * Scheme capability matrix (V3 §2.2 — data, never code). Capability VALUES
 * are authored in the Milestone 2 Rule Pack; this interface is structure only.
 */
export interface SchemeDefinition {
  readonly id: SchemeId;
  readonly displayName: LocalizedText;
  readonly description: LocalizedText;
  /** Joint holding possible. */
  readonly canBeJoint: boolean;
  /** Account may be held by / for a minor. */
  readonly canBeMinorAccount: boolean;
  /** Claimant may continue instead of closing. */
  readonly continuableByClaimant: boolean;
  /** Direct bank transfer (ECS) payment eligible. */
  readonly bankTransferEligible: boolean;
  /** Optional passbook illustration asset id (lazy-loaded, alt-texted). */
  readonly illustrationId?: string;
  readonly sortOrder: number;
}
