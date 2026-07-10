import { formatInr } from "@claimsahayak/shared-utils";
import { CONSTANTS } from "./constants.js";

/**
 * Every prose string below is BUILT from CONSTANTS, never typed as a literal
 * number. If a future SB Order changes AFFIDAVIT_LIMIT_INR, every sentence
 * that mentions the limit updates from this one source — that is the whole
 * point of "no hardcoded thresholds" (Master Prompt 2, rule 2).
 */

export const affidavitLimitPhraseEn = `${formatInr(CONSTANTS["AFFIDAVIT_LIMIT_INR"])} (${inrToWordsEn(CONSTANTS["AFFIDAVIT_LIMIT_INR"])})`;

export const noNominationWaitPhraseEn = `${String(CONSTANTS["NO_NOMINATION_WAIT_MONTHS"])} months`;

export const freezeYearsPhraseEn = `${String(CONSTANTS["FREEZE_YEARS"])} years`;

/**
 * Small, closed-domain number-to-words for the two constant values this pack
 * actually needs to spell out (V2 §5.7: money is always shown in both digit
 * and word form). Not a general-purpose converter — deliberately narrow.
 */
function inrToWordsEn(value: number): string {
  if (value === 500_000) {
    return "five lakh rupees";
  }
  if (value % 100_000 === 0) {
    const lakhs = value / 100_000;
    return `${String(lakhs)} lakh rupees`;
  }
  return `${formatInr(value)} rupees`;
}
