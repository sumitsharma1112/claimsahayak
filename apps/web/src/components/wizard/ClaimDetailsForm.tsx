"use client";

import { useMemo } from "react";
import type {
  AccountChecklist,
  AccountExtraDetails,
  ClaimDataModel,
  LocaleCode,
  Party,
} from "@claimsahayak/shared-types";
import { MAX_CO_CLAIMANTS, MAX_DISCLAIMANTS, MAX_LEGAL_HEIRS, MAX_WITNESSES } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { addEmptyParty, removePartyAt, setPartyAt } from "@/lib/wizardClaimData";

/**
 * Milestone 7 Part 1/3 — the ONE place a claimant/postmaster enters
 * identifying details, so every generated document can auto-fill from
 * them instead of asking again. Milestone 11 — extended to the Universal
 * Claim Data Model, organised into entity sections, several of them
 * CONDITIONAL: a section only renders when the account's own
 * Rule-Engine-computed checklist actually selected a document that reads
 * its fields (the same engine-output-driven conditioning M10's
 * `officeTemplateIdsForAccount` established — reading what the engine
 * already resolved, never re-implementing a routing/overlay condition
 * here). Lives entirely in `Wizard.tsx`'s React state (passed in as
 * `claimData`/`onChange`) — never `localStorage`, never transmitted;
 * closing the tab clears it (see claim-data.ts).
 *
 * Fields are optional here (nothing blocks printing) — `validateClaimPackage`
 * surfaces what's still missing as a non-blocking prompt in `ClaimPackage`,
 * since a real Postmaster may legitimately complete gaps by hand at the
 * counter.
 */

// Internal artifact ids the engine's resolved checklist references
// (`ChecklistItem.refId`) — logic-only lookups, never rendered as text,
// following the M10 precedent (`ClaimPackage.tsx`). Each keys one
// conditional section below to "did this claim actually select the
// document that reads these fields".
const RECONCILIATION_DEPOSITOR_TEMPLATE_ID = "template_reconciliation_depositor";
const RECONCILIATION_CLAIMANT_TEMPLATE_ID = "template_reconciliation_claimant";
const DISCLAIMER_FORM_ID = "form_14";
const AFFIDAVIT_FORM_ID = "form_13";
const BANK_TRANSFER_DOC_ID = "doc_bank_passbook_first_page";
const OWN_POSB_DOC_ID = "doc_own_posb_passbook_copy";
const MINOR_ALIVE_DOC_ID = "doc_minor_alive_certificate";
const GUARDIANSHIP_DOC_ID = "doc_guardianship_certificate";

const EMPTY_ACCOUNT_EXTRAS: AccountExtraDetails = {
  amountClaimed: "",
  nominationRegistrationNumber: "",
  nominationDate: "",
};

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  /** Milestone 15 — "date" gives a native picker and a canonical ISO
   * value, so `formatClaimFieldValue` can reliably reformat it for
   * display on generated documents (DD-MM-YYYY) instead of printing
   * whatever free-text shape a postmaster happened to type. */
  readonly type?: "text" | "date";
}) {
  return (
    <label className="flex flex-col gap-s1">
      <span className="text-ink-soft">{label}</span>
      <input
        id={id}
        type={type}
        className="min-h-touch rounded-control border-card border-ink-soft/30 bg-paper px-s3"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </label>
  );
}

function PartyFields({
  idPrefix,
  nameLabel,
  party,
  onChange,
  includeAddress,
  includeRelationship,
  includeMobile,
  includeIdDocument,
  includeShare,
  t,
}: {
  readonly idPrefix: string;
  readonly nameLabel: string;
  readonly party: Party;
  readonly onChange: (party: Party) => void;
  readonly includeAddress?: boolean;
  readonly includeRelationship?: boolean;
  readonly includeMobile?: boolean;
  readonly includeIdDocument?: boolean;
  readonly includeShare?: boolean;
  readonly t: ReturnType<typeof getWizardDictionary>;
}) {
  return (
    <div className="flex flex-wrap gap-s3">
      <TextField
        id={`${idPrefix}-name`}
        label={nameLabel}
        value={party.name}
        onChange={(name) => {
          onChange({ ...party, name });
        }}
      />
      {includeRelationship ? (
        <TextField
          id={`${idPrefix}-relationship`}
          label={t.claimDetailsRelationshipLabel}
          value={party.relationship ?? ""}
          onChange={(relationship) => {
            onChange({ ...party, relationship });
          }}
        />
      ) : null}
      {includeAddress ? (
        <TextField
          id={`${idPrefix}-address`}
          label={t.claimDetailsAddressLabel}
          value={party.address ?? ""}
          onChange={(address) => {
            onChange({ ...party, address });
          }}
        />
      ) : null}
      {includeMobile ? (
        <TextField
          id={`${idPrefix}-mobile`}
          label={t.claimDetailsMobileLabel}
          value={party.mobile ?? ""}
          onChange={(mobile) => {
            onChange({ ...party, mobile });
          }}
        />
      ) : null}
      {includeIdDocument ? (
        <>
          <TextField
            id={`${idPrefix}-id-type`}
            label={t.claimDetailsIdTypeLabel}
            value={party.idDocumentType ?? ""}
            onChange={(idDocumentType) => {
              onChange({ ...party, idDocumentType });
            }}
          />
          <TextField
            id={`${idPrefix}-id-number`}
            label={t.claimDetailsIdNumberLabel}
            value={party.idDocumentNumber ?? ""}
            onChange={(idDocumentNumber) => {
              onChange({ ...party, idDocumentNumber });
            }}
          />
        </>
      ) : null}
      {includeShare ? (
        <TextField
          id={`${idPrefix}-share`}
          label={t.claimDetailsShareLabel}
          value={party.sharePercent ?? ""}
          onChange={(sharePercent) => {
            onChange({ ...party, sharePercent });
          }}
        />
      ) : null}
    </div>
  );
}

function PartyListEditor({
  idPrefix,
  heading,
  list,
  max,
  onChange,
  t,
  includeAddress,
  includeRelationship,
  includeMobile,
  includeShare,
}: {
  readonly idPrefix: string;
  readonly heading: string;
  readonly list: readonly Party[];
  readonly max: number;
  readonly onChange: (list: readonly Party[]) => void;
  readonly t: ReturnType<typeof getWizardDictionary>;
  readonly includeAddress?: boolean;
  readonly includeRelationship?: boolean;
  readonly includeMobile?: boolean;
  readonly includeShare?: boolean;
}) {
  return (
    <div className="flex flex-col gap-s2">
      <p className="m-0 font-semibold text-ink-soft">{heading}</p>
      {list.map((party, i) => (
        <div key={`${idPrefix}-${String(i)}`} className="flex flex-wrap items-end gap-s2">
          <PartyFields
            idPrefix={`${idPrefix}-${String(i)}`}
            nameLabel={`${heading} ${String(i + 1)}`}
            party={party}
            t={t}
            includeAddress={includeAddress ?? false}
            includeRelationship={includeRelationship ?? false}
            includeMobile={includeMobile ?? false}
            includeShare={includeShare ?? false}
            onChange={(next) => {
              onChange(setPartyAt(list, i, next));
            }}
          />
          <button
            type="button"
            className="cs-btn-secondary"
            onClick={() => {
              onChange(removePartyAt(list, i));
            }}
          >
            {t.claimDetailsRemoveLabel}
          </button>
        </div>
      ))}
      {list.length < max ? (
        <button
          type="button"
          className="cs-btn-secondary self-start"
          onClick={() => {
            onChange(addEmptyParty(list, max));
          }}
        >
          {t.claimDetailsAddLabel} {heading}
        </button>
      ) : null}
    </div>
  );
}

function SectionHeading({ text }: { readonly text: string }) {
  return <h3 className="m-0 mt-s2 border-b border-ink-soft/20 pb-s1 font-display text-[18px] font-semibold text-ink">{text}</h3>;
}

export function ClaimDetailsForm({
  claimData,
  onChange,
  accounts,
  locale,
}: {
  readonly claimData: ClaimDataModel;
  readonly onChange: (next: ClaimDataModel) => void;
  readonly accounts: readonly AccountChecklist[];
  readonly locale: LocaleCode;
}) {
  const t = getWizardDictionary(locale);

  // Every artifact id the engine selected for ANY account in this claim —
  // the single source the conditional sections below read. Purely a lookup
  // over engine output; no routing/overlay condition is re-evaluated here.
  const selectedRefIds = useMemo(() => {
    const ids = new Set<string>();
    for (const account of accounts) {
      for (const section of account.sections) {
        for (const item of section.items) {
          if (item.refId !== undefined) {
            ids.add(item.refId);
          }
        }
      }
    }
    return ids;
  }, [accounts]);

  const showDepositorNameDifference = selectedRefIds.has(RECONCILIATION_DEPOSITOR_TEMPLATE_ID);
  const showClaimantNameDifference = selectedRefIds.has(RECONCILIATION_CLAIMANT_TEMPLATE_ID);
  const showDisclaimants = selectedRefIds.has(DISCLAIMER_FORM_ID);
  // Keyed on the affidavit (the genuinely heir-driven form), NOT on
  // form_14 — in the T14 multiple-nominee context the people signing the
  // disclaimer are absent NOMINEES, collected as `disclaimants` below;
  // soliciting a "legal heir" list there would name the wrong concept.
  const showLegalHeirs = selectedRefIds.has(AFFIDAVIT_FORM_ID);
  const showBankPayment = selectedRefIds.has(BANK_TRANSFER_DOC_ID);
  const showPosbPayment = selectedRefIds.has(OWN_POSB_DOC_ID);
  const showGuardian = selectedRefIds.has(MINOR_ALIVE_DOC_ID) || selectedRefIds.has(GUARDIANSHIP_DOC_ID);

  const accountExtras = (accountIndex: number): AccountExtraDetails =>
    claimData.accountDetails[accountIndex] ?? EMPTY_ACCOUNT_EXTRAS;
  const setAccountExtras = (accountIndex: number, patch: Partial<AccountExtraDetails>) => {
    onChange({
      ...claimData,
      accountDetails: {
        ...claimData.accountDetails,
        [accountIndex]: { ...accountExtras(accountIndex), ...patch },
      },
    });
  };

  return (
    <section aria-labelledby="claim-details-heading" className="flex flex-col gap-s4 rounded-card border border-ink-soft/20 bg-paper p-s4">
      <h2 id="claim-details-heading" className="m-0 font-display text-question font-semibold text-ink">
        {t.claimDetailsHeading}
      </h2>
      <p className="m-0 text-ink-soft">{t.claimDetailsIntro}</p>

      <SectionHeading text={t.claimDetailsOfficeSectionHeading} />
      <div className="flex flex-wrap gap-s3">
        <TextField
          id="office-name"
          label={t.claimDetailsOfficeLabel}
          value={claimData.officeName}
          onChange={(officeName) => {
            onChange({ ...claimData, officeName });
          }}
        />
        <TextField
          id="office-address"
          label={t.claimDetailsOfficeAddressLabel}
          value={claimData.officeDetails.address}
          onChange={(address) => {
            onChange({ ...claimData, officeDetails: { ...claimData.officeDetails, address } });
          }}
        />
        <TextField
          id="office-pin"
          label={t.claimDetailsOfficePinLabel}
          value={claimData.officeDetails.pin}
          onChange={(pin) => {
            onChange({ ...claimData, officeDetails: { ...claimData.officeDetails, pin } });
          }}
        />
        <TextField
          id="office-code"
          label={t.claimDetailsOfficeCodeLabel}
          value={claimData.officeDetails.code}
          onChange={(code) => {
            onChange({ ...claimData, officeDetails: { ...claimData.officeDetails, code } });
          }}
        />
        <TextField
          id="office-phone"
          label={t.claimDetailsOfficePhoneLabel}
          value={claimData.officeDetails.phone}
          onChange={(phone) => {
            onChange({ ...claimData, officeDetails: { ...claimData.officeDetails, phone } });
          }}
        />
        <TextField
          id="office-head-office"
          label={t.claimDetailsHeadOfficeLabel}
          value={claimData.officeDetails.headOfficeName}
          onChange={(headOfficeName) => {
            onChange({ ...claimData, officeDetails: { ...claimData.officeDetails, headOfficeName } });
          }}
        />
        <TextField
          id="preparer-name"
          label={t.claimDetailsPreparerNameLabel}
          value={claimData.preparer.name}
          onChange={(name) => {
            onChange({ ...claimData, preparer: { ...claimData.preparer, name } });
          }}
        />
        <TextField
          id="preparer-designation"
          label={t.claimDetailsPreparerDesignationLabel}
          value={claimData.preparer.designation}
          onChange={(designation) => {
            onChange({ ...claimData, preparer: { ...claimData.preparer, designation } });
          }}
        />
      </div>

      <SectionHeading text={t.claimDetailsDepositorSectionHeading} />
      <PartyFields
        idPrefix="depositor"
        nameLabel={t.claimDetailsDepositorLabel}
        party={claimData.depositor}
        includeAddress
        t={t}
        onChange={(depositor) => {
          onChange({ ...claimData, depositor });
        }}
      />
      <div className="flex flex-wrap gap-s3">
        <TextField
          id="death-date"
          type="date"
          label={t.claimDetailsDateOfDeathLabel}
          value={claimData.deathCertificate.dateOfDeath}
          onChange={(dateOfDeath) => {
            onChange({ ...claimData, deathCertificate: { ...claimData.deathCertificate, dateOfDeath } });
          }}
        />
        <TextField
          id="death-place"
          label={t.claimDetailsPlaceOfDeathLabel}
          value={claimData.deathCertificate.placeOfDeath}
          onChange={(placeOfDeath) => {
            onChange({ ...claimData, deathCertificate: { ...claimData.deathCertificate, placeOfDeath } });
          }}
        />
        <TextField
          id="death-cert-number"
          label={t.claimDetailsDeathCertNumberLabel}
          value={claimData.deathCertificate.certificateNumber}
          onChange={(certificateNumber) => {
            onChange({ ...claimData, deathCertificate: { ...claimData.deathCertificate, certificateNumber } });
          }}
        />
        <TextField
          id="death-cert-issued-by"
          label={t.claimDetailsDeathCertIssuedByLabel}
          value={claimData.deathCertificate.issuedBy}
          onChange={(issuedBy) => {
            onChange({ ...claimData, deathCertificate: { ...claimData.deathCertificate, issuedBy } });
          }}
        />
        {showDepositorNameDifference ? (
          <TextField
            id="depositor-name-on-death-cert"
            label={t.claimDetailsDepositorNameOnDeathCertLabel}
            value={claimData.nameDifference.depositorNameOnDeathCertificate}
            onChange={(depositorNameOnDeathCertificate) => {
              onChange({
                ...claimData,
                nameDifference: { ...claimData.nameDifference, depositorNameOnDeathCertificate },
              });
            }}
          />
        ) : null}
      </div>

      <SectionHeading text={t.claimDetailsClaimantSectionHeading} />
      <PartyFields
        idPrefix="claimant"
        nameLabel={t.claimDetailsClaimantLabel}
        party={claimData.claimant}
        includeAddress
        includeRelationship
        includeMobile
        includeIdDocument
        includeShare={claimData.coClaimants.length > 0}
        t={t}
        onChange={(claimant) => {
          onChange({ ...claimData, claimant });
        }}
      />
      {showClaimantNameDifference ? (
        <div className="flex flex-wrap gap-s3">
          <TextField
            id="claimant-name-as-per-id"
            label={t.claimDetailsClaimantNameAsPerIdLabel}
            value={claimData.nameDifference.claimantNameAsPerId}
            onChange={(claimantNameAsPerId) => {
              onChange({ ...claimData, nameDifference: { ...claimData.nameDifference, claimantNameAsPerId } });
            }}
          />
        </div>
      ) : null}
      <PartyListEditor
        idPrefix="co-claimant"
        heading={t.claimDetailsCoClaimantLabel}
        list={claimData.coClaimants}
        max={MAX_CO_CLAIMANTS}
        includeAddress
        includeRelationship
        includeShare
        onChange={(coClaimants) => {
          onChange({ ...claimData, coClaimants });
        }}
        t={t}
      />

      {showDisclaimants ? (
        <PartyListEditor
          idPrefix="disclaimant"
          heading={t.claimDetailsDisclaimantLabel}
          list={claimData.disclaimants}
          max={MAX_DISCLAIMANTS}
          includeAddress
          includeRelationship
          onChange={(disclaimants) => {
            onChange({ ...claimData, disclaimants });
          }}
          t={t}
        />
      ) : null}

      {showGuardian ? (
        <PartyFields
          idPrefix="guardian"
          nameLabel={t.claimDetailsGuardianLabel}
          party={claimData.guardian ?? { name: "" }}
          includeAddress
          includeRelationship
          t={t}
          onChange={(guardian) => {
            onChange({ ...claimData, guardian });
          }}
        />
      ) : null}

      {showLegalHeirs ? (
        <PartyListEditor
          idPrefix="legal-heir"
          heading={t.claimDetailsLegalHeirLabel}
          list={claimData.legalHeirs}
          max={MAX_LEGAL_HEIRS}
          onChange={(legalHeirs) => {
            onChange({ ...claimData, legalHeirs });
          }}
          t={t}
        />
      ) : null}

      <SectionHeading text={t.claimDetailsAccountSectionHeading} />
      {accounts.map((account) => (
        <div key={account.accountIndex} className="flex flex-wrap gap-s3">
          <TextField
            id={`account-number-${String(account.accountIndex)}`}
            label={`${t.claimDetailsAccountNumberLabel} — ${pickText(account.schemeName, locale)}`}
            value={claimData.accountNumbers[account.accountIndex] ?? ""}
            onChange={(value) => {
              onChange({
                ...claimData,
                accountNumbers: { ...claimData.accountNumbers, [account.accountIndex]: value },
              });
            }}
          />
          <TextField
            id={`account-amount-${String(account.accountIndex)}`}
            label={`${t.claimDetailsAmountClaimedLabel} — ${pickText(account.schemeName, locale)}`}
            value={accountExtras(account.accountIndex).amountClaimed}
            onChange={(amountClaimed) => {
              setAccountExtras(account.accountIndex, { amountClaimed });
            }}
          />
          <TextField
            id={`account-nomination-reg-${String(account.accountIndex)}`}
            label={`${t.claimDetailsNominationRegNumberLabel} — ${pickText(account.schemeName, locale)}`}
            value={accountExtras(account.accountIndex).nominationRegistrationNumber}
            onChange={(nominationRegistrationNumber) => {
              setAccountExtras(account.accountIndex, { nominationRegistrationNumber });
            }}
          />
          <TextField
            id={`account-nomination-date-${String(account.accountIndex)}`}
            type="date"
            label={`${t.claimDetailsNominationDateLabel} — ${pickText(account.schemeName, locale)}`}
            value={accountExtras(account.accountIndex).nominationDate}
            onChange={(nominationDate) => {
              setAccountExtras(account.accountIndex, { nominationDate });
            }}
          />
        </div>
      ))}

      {showBankPayment || showPosbPayment ? (
        <>
          <SectionHeading text={t.claimDetailsPaymentSectionHeading} />
          <div className="flex flex-wrap gap-s3">
            {showBankPayment ? (
              <>
                <TextField
                  id="payment-bank-name"
                  label={t.claimDetailsBankNameLabel}
                  value={claimData.payment.bankName}
                  onChange={(bankName) => {
                    onChange({ ...claimData, payment: { ...claimData.payment, bankName } });
                  }}
                />
                <TextField
                  id="payment-bank-branch"
                  label={t.claimDetailsBankBranchLabel}
                  value={claimData.payment.bankBranch}
                  onChange={(bankBranch) => {
                    onChange({ ...claimData, payment: { ...claimData.payment, bankBranch } });
                  }}
                />
                <TextField
                  id="payment-bank-account"
                  label={t.claimDetailsBankAccountLabel}
                  value={claimData.payment.bankAccountNumber}
                  onChange={(bankAccountNumber) => {
                    onChange({ ...claimData, payment: { ...claimData.payment, bankAccountNumber } });
                  }}
                />
                <TextField
                  id="payment-ifsc"
                  label={t.claimDetailsIfscLabel}
                  value={claimData.payment.bankIfsc}
                  onChange={(bankIfsc) => {
                    onChange({ ...claimData, payment: { ...claimData.payment, bankIfsc } });
                  }}
                />
              </>
            ) : null}
            {showPosbPayment ? (
              <TextField
                id="payment-posb-account"
                label={t.claimDetailsPosbAccountLabel}
                value={claimData.payment.posbAccountNumber}
                onChange={(posbAccountNumber) => {
                  onChange({ ...claimData, payment: { ...claimData.payment, posbAccountNumber } });
                }}
              />
            ) : null}
          </div>
        </>
      ) : null}

      <PartyListEditor
        idPrefix="witness"
        heading={t.claimDetailsWitnessLabel}
        list={claimData.witnesses}
        max={MAX_WITNESSES}
        includeAddress
        includeMobile
        onChange={(witnesses) => {
          onChange({ ...claimData, witnesses });
        }}
        t={t}
      />
    </section>
  );
}
