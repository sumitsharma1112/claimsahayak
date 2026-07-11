"use client";

import type { AccountChecklist, ClaimDataModel, LocaleCode, Party } from "@claimsahayak/shared-types";
import { MAX_LEGAL_HEIRS, MAX_NOMINEES, MAX_WITNESSES } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";
import { getWizardDictionary } from "@/i18n/wizard";
import { addEmptyParty, removePartyAt, setPartyAt } from "@/lib/wizardClaimData";

/**
 * Milestone 7 Part 1/3 — the ONE place a claimant/postmaster enters
 * identifying details, so every generated document can auto-fill from
 * them instead of asking again. Lives entirely in `Wizard.tsx`'s React
 * state (passed in as `claimData`/`onChange`) — never `localStorage`,
 * never transmitted; closing the tab clears it (see claim-data.ts).
 *
 * Fields are optional here (nothing blocks printing) — `validateClaimPackage`
 * surfaces what's still missing as a non-blocking prompt in `ClaimPackage`,
 * since a real Postmaster may legitimately complete gaps by hand at the
 * counter.
 */
function TextField({
  id,
  label,
  value,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-s1">
      <span className="text-ink-soft">{label}</span>
      <input
        id={id}
        type="text"
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
  t,
}: {
  readonly idPrefix: string;
  readonly nameLabel: string;
  readonly party: Party;
  readonly onChange: (party: Party) => void;
  readonly includeAddress?: boolean;
  readonly includeRelationship?: boolean;
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
}: {
  readonly idPrefix: string;
  readonly heading: string;
  readonly list: readonly Party[];
  readonly max: number;
  readonly onChange: (list: readonly Party[]) => void;
  readonly t: ReturnType<typeof getWizardDictionary>;
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

  return (
    <section aria-labelledby="claim-details-heading" className="flex flex-col gap-s4 rounded-card border border-ink-soft/20 bg-paper p-s4">
      <h2 id="claim-details-heading" className="m-0 font-display text-question font-semibold text-ink">
        {t.claimDetailsHeading}
      </h2>
      <p className="m-0 text-ink-soft">{t.claimDetailsIntro}</p>

      <div className="flex flex-wrap gap-s3">
        <TextField
          id="office-name"
          label={t.claimDetailsOfficeLabel}
          value={claimData.officeName}
          onChange={(officeName) => {
            onChange({ ...claimData, officeName });
          }}
        />
      </div>

      <PartyFields
        idPrefix="claimant"
        nameLabel={t.claimDetailsClaimantLabel}
        party={claimData.claimant}
        includeAddress
        includeRelationship
        t={t}
        onChange={(claimant) => {
          onChange({ ...claimData, claimant });
        }}
      />

      <PartyFields
        idPrefix="depositor"
        nameLabel={t.claimDetailsDepositorLabel}
        party={claimData.depositor}
        t={t}
        onChange={(depositor) => {
          onChange({ ...claimData, depositor });
        }}
      />

      <PartyFields
        idPrefix="guardian"
        nameLabel={t.claimDetailsGuardianLabel}
        party={claimData.guardian ?? { name: "" }}
        t={t}
        onChange={(guardian) => {
          onChange({ ...claimData, guardian });
        }}
      />

      {accounts.length > 0 ? (
        <div className="flex flex-col gap-s2">
          <p className="m-0 font-semibold text-ink-soft">{t.claimDetailsAccountNumberLabel}</p>
          <div className="flex flex-wrap gap-s3">
            {accounts.map((account) => (
              <TextField
                key={account.accountIndex}
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
            ))}
          </div>
        </div>
      ) : null}

      <PartyListEditor
        idPrefix="nominee"
        heading={t.claimDetailsNomineeLabel}
        list={claimData.nominees}
        max={MAX_NOMINEES}
        onChange={(nominees) => {
          onChange({ ...claimData, nominees });
        }}
        t={t}
      />
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
      <PartyListEditor
        idPrefix="witness"
        heading={t.claimDetailsWitnessLabel}
        list={claimData.witnesses}
        max={MAX_WITNESSES}
        onChange={(witnesses) => {
          onChange({ ...claimData, witnesses });
        }}
        t={t}
      />
    </section>
  );
}
