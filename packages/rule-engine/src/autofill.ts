import type {
  AccountScopedClaimDataField,
  ClaimDataField,
  ClaimDataModel,
} from "@claimsahayak/shared-types";
import { isAccountScopedField } from "@claimsahayak/shared-types";

/**
 * Milestone 7 Part 3 — auto-fill; Milestone 11 — extended to the Universal
 * Claim Data Model. A plain, exhaustive switch over the closed
 * `ClaimDataField` union — deliberately NOT a dynamic dotted-path resolver
 * (no `eval`, no string-keyed reflection): an invalid field reference is a
 * compile error here, not a runtime typo that silently prints nothing on a
 * real claim form. The switch has no `default` case on purpose — if
 * `ClaimDataField` ever grows a member this file doesn't handle,
 * TypeScript's own exhaustiveness check fails the build (M7 handover §19).
 *
 * Returns `undefined` (never an empty string) when nothing has been
 * entered yet, so a renderer can distinguish "not filled in" from "filled
 * in with an empty value" and fall back to a blank line / manual-fill
 * affordance — the never-invent guarantee: an absent fact renders as a
 * hand-fill blank, never as a fabricated value.
 */
export function resolveClaimDataValue(
  model: ClaimDataModel,
  field: ClaimDataField,
): string | undefined {
  if (isAccountScopedField(field)) {
    // Account-scoped fields are keyed by AccountChecklist.accountIndex,
    // which this function has no access to — see resolveAccountValue below.
    return undefined;
  }
  switch (field) {
    case "claimant.name":
      return empty(model.claimant.name);
    case "claimant.address":
      return empty(model.claimant.address);
    case "claimant.relationship":
      return empty(model.claimant.relationship);
    case "claimant.mobile":
      return empty(model.claimant.mobile);
    case "claimant.idDocumentType":
      return empty(model.claimant.idDocumentType);
    case "claimant.idDocumentNumber":
      return empty(model.claimant.idDocumentNumber);
    case "claimant.sharePercent":
      return empty(model.claimant.sharePercent);
    case "coClaimant.0.name":
      return empty(model.coClaimants[0]?.name);
    case "coClaimant.0.address":
      return empty(model.coClaimants[0]?.address);
    case "coClaimant.0.relationship":
      return empty(model.coClaimants[0]?.relationship);
    case "coClaimant.0.mobile":
      return empty(model.coClaimants[0]?.mobile);
    case "coClaimant.0.idDocumentType":
      return empty(model.coClaimants[0]?.idDocumentType);
    case "coClaimant.0.idDocumentNumber":
      return empty(model.coClaimants[0]?.idDocumentNumber);
    case "coClaimant.0.sharePercent":
      return empty(model.coClaimants[0]?.sharePercent);
    case "coClaimant.1.name":
      return empty(model.coClaimants[1]?.name);
    case "coClaimant.1.address":
      return empty(model.coClaimants[1]?.address);
    case "coClaimant.1.relationship":
      return empty(model.coClaimants[1]?.relationship);
    case "coClaimant.1.mobile":
      return empty(model.coClaimants[1]?.mobile);
    case "coClaimant.1.idDocumentType":
      return empty(model.coClaimants[1]?.idDocumentType);
    case "coClaimant.1.idDocumentNumber":
      return empty(model.coClaimants[1]?.idDocumentNumber);
    case "coClaimant.1.sharePercent":
      return empty(model.coClaimants[1]?.sharePercent);
    case "coClaimant.2.name":
      return empty(model.coClaimants[2]?.name);
    case "coClaimant.2.address":
      return empty(model.coClaimants[2]?.address);
    case "coClaimant.2.relationship":
      return empty(model.coClaimants[2]?.relationship);
    case "coClaimant.2.mobile":
      return empty(model.coClaimants[2]?.mobile);
    case "coClaimant.2.idDocumentType":
      return empty(model.coClaimants[2]?.idDocumentType);
    case "coClaimant.2.idDocumentNumber":
      return empty(model.coClaimants[2]?.idDocumentNumber);
    case "coClaimant.2.sharePercent":
      return empty(model.coClaimants[2]?.sharePercent);
    case "depositor.name":
      return empty(model.depositor.name);
    case "depositor.address":
      return empty(model.depositor.address);
    case "guardian.name":
      return empty(model.guardian?.name);
    case "guardian.address":
      return empty(model.guardian?.address);
    case "guardian.relationship":
      return empty(model.guardian?.relationship);
    case "nominee.0.name":
      return empty(model.nominees[0]?.name);
    case "nominee.1.name":
      return empty(model.nominees[1]?.name);
    case "nominee.2.name":
      return empty(model.nominees[2]?.name);
    case "nominee.3.name":
      return empty(model.nominees[3]?.name);
    case "legalHeir.0.name":
      return empty(model.legalHeirs[0]?.name);
    case "legalHeir.1.name":
      return empty(model.legalHeirs[1]?.name);
    case "legalHeir.2.name":
      return empty(model.legalHeirs[2]?.name);
    case "legalHeir.3.name":
      return empty(model.legalHeirs[3]?.name);
    case "witness.0.name":
      return empty(model.witnesses[0]?.name);
    case "witness.0.address":
      return empty(model.witnesses[0]?.address);
    case "witness.0.mobile":
      return empty(model.witnesses[0]?.mobile);
    case "witness.1.name":
      return empty(model.witnesses[1]?.name);
    case "witness.1.address":
      return empty(model.witnesses[1]?.address);
    case "witness.1.mobile":
      return empty(model.witnesses[1]?.mobile);
    case "disclaimant.0.name":
      return empty(model.disclaimants[0]?.name);
    case "disclaimant.0.address":
      return empty(model.disclaimants[0]?.address);
    case "disclaimant.0.relationship":
      return empty(model.disclaimants[0]?.relationship);
    case "disclaimant.1.name":
      return empty(model.disclaimants[1]?.name);
    case "disclaimant.1.address":
      return empty(model.disclaimants[1]?.address);
    case "disclaimant.1.relationship":
      return empty(model.disclaimants[1]?.relationship);
    case "disclaimant.2.name":
      return empty(model.disclaimants[2]?.name);
    case "disclaimant.2.address":
      return empty(model.disclaimants[2]?.address);
    case "disclaimant.2.relationship":
      return empty(model.disclaimants[2]?.relationship);
    case "office.name":
      return empty(model.officeName);
    case "office.address":
      return empty(model.officeDetails.address);
    case "office.pin":
      return empty(model.officeDetails.pin);
    case "office.code":
      return empty(model.officeDetails.code);
    case "office.phone":
      return empty(model.officeDetails.phone);
    case "office.headOfficeName":
      return empty(model.officeDetails.headOfficeName);
    case "preparer.name":
      return empty(model.preparer.name);
    case "preparer.designation":
      return empty(model.preparer.designation);
    case "deathCertificate.dateOfDeath":
      return empty(model.deathCertificate.dateOfDeath);
    case "deathCertificate.placeOfDeath":
      return empty(model.deathCertificate.placeOfDeath);
    case "deathCertificate.certificateNumber":
      return empty(model.deathCertificate.certificateNumber);
    case "deathCertificate.issuedBy":
      return empty(model.deathCertificate.issuedBy);
    case "nameDifference.depositorNameOnDeathCertificate":
      return empty(model.nameDifference.depositorNameOnDeathCertificate);
    case "nameDifference.claimantNameAsPerId":
      return empty(model.nameDifference.claimantNameAsPerId);
    case "payment.bankName":
      return empty(model.payment.bankName);
    case "payment.bankBranch":
      return empty(model.payment.bankBranch);
    case "payment.bankAccountNumber":
      return empty(model.payment.bankAccountNumber);
    case "payment.bankIfsc":
      return empty(model.payment.bankIfsc);
    case "payment.posbAccountNumber":
      return empty(model.payment.posbAccountNumber);
  }
}

/**
 * M11 — resolves the account-scoped fields (`account.*`), which need the
 * caller's `accountIndex`. `resolveAccountNumber` (M7) remains below,
 * unchanged, for existing callers; this is its generalisation.
 */
export function resolveAccountValue(
  model: ClaimDataModel,
  accountIndex: number,
  field: AccountScopedClaimDataField,
): string | undefined {
  switch (field) {
    case "account.number":
      return empty(model.accountNumbers[accountIndex]);
    case "account.amountClaimed":
      return empty(model.accountDetails[accountIndex]?.amountClaimed);
    case "account.nominationRegistrationNumber":
      return empty(model.accountDetails[accountIndex]?.nominationRegistrationNumber);
    case "account.nominationDate":
      return empty(model.accountDetails[accountIndex]?.nominationDate);
  }
}

/**
 * M11 — the one resolver every renderer should call: dispatches between
 * the model-level and account-scoped resolution so no caller needs its own
 * `field === "account.number"`-style special case (three separate callers
 * had grown one by M10).
 */
export function resolveFieldValue(
  model: ClaimDataModel,
  accountIndex: number,
  field: ClaimDataField,
): string | undefined {
  return isAccountScopedField(field)
    ? resolveAccountValue(model, accountIndex, field)
    : resolveClaimDataValue(model, field);
}

/** `account.number` needs the account index, so it's resolved separately from the closed-field switch above. */
export function resolveAccountNumber(
  model: ClaimDataModel,
  accountIndex: number,
): string | undefined {
  return resolveAccountValue(model, accountIndex, "account.number");
}

function empty(value: string | undefined): string | undefined {
  return value === undefined || value.trim().length === 0 ? undefined : value;
}
