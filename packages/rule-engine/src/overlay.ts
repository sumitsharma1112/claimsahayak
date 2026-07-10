import type { LocalizedText, OutputRule, OverlayRule, RulePack } from "@claimsahayak/shared-types";
import type { AnswerMap } from "./variables.js";
import { isOptionTicked } from "./variables.js";
import type { DerivedValues } from "./derived.js";

/** Deep link into `/fix`, one per matched overlay (Milestone 3 §9). */
export interface OverlayExtra {
  readonly id: string;
  readonly label: LocalizedText;
  readonly fixSlug: string;
}

export interface OverlayResolution {
  readonly items: readonly OutputRule[];
  readonly extras: readonly OverlayExtra[];
  readonly matchedFlagIds: readonly string[];
}

/**
 * The Q10 tick-box question this pack's overlays key off (see
 * `overlays.ts`'s doc-comment: "`flagId` values here match the Q10 option
 * ids ... one-for-one"). This is a fixed structural wiring point, not a
 * business threshold — the actual flag IDs and their meaning are entirely
 * pack data (`rulePack.overlays[].flagId`), never hardcoded here.
 */
const DOCS_CHECK_QUESTION_ID = "q10_docs_check";

/**
 * Which Q10 options were ticked, plus the one SYSTEM-computed flag this
 * milestone's brief calls out (§4's `freezeRequired`, matched against the
 * `system_frozen_10_years` overlay `docs/rule-pack.md` documents). The
 * system flag fires on EITHER a direct claimant-reported answer
 * (`q8_maturity == "matured_over_10_years"`) or the date-derived
 * `freezeRequired` boolean, whichever is available — the two are
 * independent signals for the same real-world fact.
 */
function resolveTickedFlags(answers: AnswerMap, derived: DerivedValues | undefined): readonly string[] {
  const flags = new Set<string>();
  for (const key of Object.keys(answers)) {
    const prefix = `${DOCS_CHECK_QUESTION_ID}.`;
    if (key.startsWith(prefix) && isOptionTicked(answers, DOCS_CHECK_QUESTION_ID, key.slice(prefix.length))) {
      flags.add(key.slice(prefix.length));
    }
  }
  flags.delete("none");

  const answeredFrozen = answers["q8_maturity"] === "matured_over_10_years";
  if (answeredFrozen || derived?.freezeRequired === true) {
    flags.add("system_frozen_10_years");
  }

  return Array.from(flags);
}

/**
 * Applies every matched overlay's items (Milestone 3 §9), deduped by the
 * caller's later refId pass (`sections.ts`) — this stage only needs to
 * avoid adding the same OVERLAY item id twice if the same flag were
 * somehow ticked more than once, which the Set-based flag collection
 * above already prevents.
 */
export function resolveOverlays(
  rulePack: RulePack,
  answers: AnswerMap,
  derived: DerivedValues | undefined,
): OverlayResolution {
  const matchedFlagIds = resolveTickedFlags(answers, derived);
  const items: OutputRule[] = [];
  const extras: OverlayExtra[] = [];

  for (const flagId of matchedFlagIds) {
    const overlay: OverlayRule | undefined = rulePack.overlays.find((o) => o.flagId === flagId);
    if (!overlay) {
      continue;
    }
    items.push(...overlay.items);
    const firstItem = overlay.items[0];
    extras.push({
      id: `extra_${overlay.flagId}`,
      label: firstItem?.label ?? { en: overlay.flagId },
      fixSlug: overlay.fixSlug,
    });
  }

  return { items, extras, matchedFlagIds };
}
