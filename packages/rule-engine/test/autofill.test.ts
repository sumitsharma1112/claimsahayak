import { describe, expect, it } from "vitest";
import {
  EMPTY_CLAIM_DATA,
  isAccountScopedField,
  type ClaimDataField,
  type ClaimDataModel,
} from "@claimsahayak/shared-types";
import {
  resolveAccountNumber,
  resolveAccountValue,
  resolveClaimDataValue,
  resolveFieldValue,
} from "../src/index.js";

/**
 * Milestone 11 — the complete `ClaimDataField` union, enumerated once here
 * as data. TypeScript checks every literal below is a real member (a typo
 * is a compile error), and the never-invent guard below checks every
 * member resolves to undefined on an empty model. When a new field is
 * added to the union, add it here too — the count assertion fails
 * otherwise, which is this list's job.
 */
const PARTY_KEYS = ["name", "address", "relationship", "mobile", "idDocumentType", "idDocumentNumber", "sharePercent"] as const;
const ALL_CLAIM_DATA_FIELDS: readonly ClaimDataField[] = [
  ...PARTY_KEYS.map((k) => `claimant.${k}` as const),
  ...([0, 1, 2] as const).flatMap((i) => PARTY_KEYS.map((k) => `coClaimant.${i}.${k}` as const)),
  "depositor.name",
  "depositor.address",
  "guardian.name",
  "guardian.address",
  "guardian.relationship",
  "nominee.0.name",
  "nominee.1.name",
  "nominee.2.name",
  "nominee.3.name",
  "legalHeir.0.name",
  "legalHeir.1.name",
  "legalHeir.2.name",
  "legalHeir.3.name",
  ...([0, 1] as const).flatMap((i) => (["name", "address", "mobile"] as const).map((k) => `witness.${i}.${k}` as const)),
  ...([0, 1, 2] as const).flatMap((i) =>
    (["name", "address", "relationship"] as const).map((k) => `disclaimant.${i}.${k}` as const),
  ),
  "office.name",
  "office.address",
  "office.pin",
  "office.code",
  "office.phone",
  "office.headOfficeName",
  "preparer.name",
  "preparer.designation",
  "deathCertificate.dateOfDeath",
  "deathCertificate.placeOfDeath",
  "deathCertificate.certificateNumber",
  "deathCertificate.issuedBy",
  "nameDifference.depositorNameOnDeathCertificate",
  "nameDifference.claimantNameAsPerId",
  "payment.bankName",
  "payment.bankBranch",
  "payment.bankAccountNumber",
  "payment.bankIfsc",
  "payment.posbAccountNumber",
  "account.number",
  "account.amountClaimed",
  "account.nominationRegistrationNumber",
  "account.nominationDate",
];

/**
 * Milestone 7 — resolveClaimDataValue is a plain, exhaustive switch: every
 * ClaimDataField resolves to either the entered value or undefined (never
 * an empty string), so a renderer can tell "not filled in" apart from
 * "filled in blank."
 */
describe("resolveClaimDataValue", () => {
  it("returns undefined for every field on an empty Claim Data Model", () => {
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "claimant.name")).toBeUndefined();
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "guardian.name")).toBeUndefined();
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "nominee.0.name")).toBeUndefined();
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "witness.1.name")).toBeUndefined();
  });

  it("resolves entered claimant/depositor/office values", () => {
    const model: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      claimant: { name: "Asha Devi", address: "12 MG Road", relationship: "Daughter" },
      depositor: { name: "Ram Prasad" },
      officeName: "Connaught Place HO",
    };
    expect(resolveClaimDataValue(model, "claimant.name")).toBe("Asha Devi");
    expect(resolveClaimDataValue(model, "claimant.address")).toBe("12 MG Road");
    expect(resolveClaimDataValue(model, "claimant.relationship")).toBe("Daughter");
    expect(resolveClaimDataValue(model, "depositor.name")).toBe("Ram Prasad");
    expect(resolveClaimDataValue(model, "office.name")).toBe("Connaught Place HO");
  });

  it("resolves bounded nominee/legalHeir/witness slots by index, undefined past what was entered", () => {
    const model: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      nominees: [{ name: "Nominee One" }, { name: "Nominee Two" }],
      witnesses: [{ name: "Witness One" }],
    };
    expect(resolveClaimDataValue(model, "nominee.0.name")).toBe("Nominee One");
    expect(resolveClaimDataValue(model, "nominee.1.name")).toBe("Nominee Two");
    expect(resolveClaimDataValue(model, "nominee.2.name")).toBeUndefined();
    expect(resolveClaimDataValue(model, "witness.0.name")).toBe("Witness One");
    expect(resolveClaimDataValue(model, "witness.1.name")).toBeUndefined();
  });

  it("treats a whitespace-only entry as not filled in", () => {
    const model: ClaimDataModel = { ...EMPTY_CLAIM_DATA, claimant: { name: "   " } };
    expect(resolveClaimDataValue(model, "claimant.name")).toBeUndefined();
  });

  it("always returns undefined for account.number (resolved separately by accountIndex)", () => {
    expect(resolveClaimDataValue(EMPTY_CLAIM_DATA, "account.number")).toBeUndefined();
  });
});

describe("resolveAccountNumber", () => {
  it("resolves the number entered for a specific account index, undefined for others", () => {
    const model: ClaimDataModel = { ...EMPTY_CLAIM_DATA, accountNumbers: { 0: "SB-12345" } };
    expect(resolveAccountNumber(model, 0)).toBe("SB-12345");
    expect(resolveAccountNumber(model, 1)).toBeUndefined();
  });
});

describe("the Universal Claim Data Model (Milestone 11)", () => {
  it("enumerates the full closed field union (count guard)", () => {
    // 7 claimant + 21 coClaimant + 2 depositor + 3 guardian + 4 nominee +
    // 4 legalHeir + 6 witness + 9 disclaimant + 6 office + 2 preparer +
    // 4 deathCertificate + 2 nameDifference + 5 payment + 4 account = 79.
    expect(ALL_CLAIM_DATA_FIELDS).toHaveLength(79);
    expect(new Set(ALL_CLAIM_DATA_FIELDS).size).toBe(79);
  });

  it("NEVER invents a value: every field of the union resolves to undefined on an empty model", () => {
    for (const field of ALL_CLAIM_DATA_FIELDS) {
      expect(resolveFieldValue(EMPTY_CLAIM_DATA, 0, field), field).toBeUndefined();
    }
  });

  it("resolves every newly added entity's fields when populated", () => {
    const model: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      claimant: {
        name: "Asha Devi",
        mobile: "9800000001",
        idDocumentType: "Aadhaar",
        idDocumentNumber: "XXXX-1234",
        sharePercent: "50%",
      },
      coClaimants: [{ name: "Second Nominee", address: "14 MG Road", sharePercent: "50%" }],
      depositor: { name: "Ram Prasad", address: "12 MG Road" },
      guardian: { name: "Priya Sharma", address: "9 Park Lane", relationship: "Mother" },
      witnesses: [{ name: "Witness One", address: "1 Gali", mobile: "9800000002" }],
      disclaimants: [{ name: "Absent Nominee", address: "2 Gali", relationship: "Son" }],
      officeDetails: {
        address: "Main Road, Delhi",
        pin: "110001",
        code: "SOL-100",
        phone: "011-23456789",
        headOfficeName: "New Delhi HO",
      },
      preparer: { name: "S. Kumar", designation: "Sub Postmaster" },
      deathCertificate: {
        dateOfDeath: "12/01/2026",
        placeOfDeath: "Delhi",
        certificateNumber: "DC-9987",
        issuedBy: "MCD",
      },
      nameDifference: {
        depositorNameOnDeathCertificate: "Ram Prashad",
        claimantNameAsPerId: "Asha Debi",
      },
      payment: {
        bankName: "SBI",
        bankBranch: "Connaught Place",
        bankAccountNumber: "3011223344",
        bankIfsc: "SBIN0000691",
        posbAccountNumber: "POSB-778899",
      },
    };
    expect(resolveClaimDataValue(model, "claimant.mobile")).toBe("9800000001");
    expect(resolveClaimDataValue(model, "claimant.idDocumentType")).toBe("Aadhaar");
    expect(resolveClaimDataValue(model, "claimant.idDocumentNumber")).toBe("XXXX-1234");
    expect(resolveClaimDataValue(model, "claimant.sharePercent")).toBe("50%");
    expect(resolveClaimDataValue(model, "coClaimant.0.name")).toBe("Second Nominee");
    expect(resolveClaimDataValue(model, "coClaimant.0.sharePercent")).toBe("50%");
    expect(resolveClaimDataValue(model, "coClaimant.1.name")).toBeUndefined();
    expect(resolveClaimDataValue(model, "depositor.address")).toBe("12 MG Road");
    expect(resolveClaimDataValue(model, "guardian.address")).toBe("9 Park Lane");
    expect(resolveClaimDataValue(model, "guardian.relationship")).toBe("Mother");
    expect(resolveClaimDataValue(model, "witness.0.address")).toBe("1 Gali");
    expect(resolveClaimDataValue(model, "witness.0.mobile")).toBe("9800000002");
    expect(resolveClaimDataValue(model, "disclaimant.0.name")).toBe("Absent Nominee");
    expect(resolveClaimDataValue(model, "disclaimant.0.relationship")).toBe("Son");
    expect(resolveClaimDataValue(model, "disclaimant.1.name")).toBeUndefined();
    expect(resolveClaimDataValue(model, "office.address")).toBe("Main Road, Delhi");
    expect(resolveClaimDataValue(model, "office.pin")).toBe("110001");
    expect(resolveClaimDataValue(model, "office.code")).toBe("SOL-100");
    expect(resolveClaimDataValue(model, "office.phone")).toBe("011-23456789");
    expect(resolveClaimDataValue(model, "office.headOfficeName")).toBe("New Delhi HO");
    expect(resolveClaimDataValue(model, "preparer.name")).toBe("S. Kumar");
    expect(resolveClaimDataValue(model, "preparer.designation")).toBe("Sub Postmaster");
    expect(resolveClaimDataValue(model, "deathCertificate.dateOfDeath")).toBe("12/01/2026");
    expect(resolveClaimDataValue(model, "deathCertificate.placeOfDeath")).toBe("Delhi");
    expect(resolveClaimDataValue(model, "deathCertificate.certificateNumber")).toBe("DC-9987");
    expect(resolveClaimDataValue(model, "deathCertificate.issuedBy")).toBe("MCD");
    expect(resolveClaimDataValue(model, "nameDifference.depositorNameOnDeathCertificate")).toBe("Ram Prashad");
    expect(resolveClaimDataValue(model, "nameDifference.claimantNameAsPerId")).toBe("Asha Debi");
    expect(resolveClaimDataValue(model, "payment.bankName")).toBe("SBI");
    expect(resolveClaimDataValue(model, "payment.bankIfsc")).toBe("SBIN0000691");
    expect(resolveClaimDataValue(model, "payment.posbAccountNumber")).toBe("POSB-778899");
  });

  it("resolves the account-scoped fields per account index via resolveAccountValue/resolveFieldValue", () => {
    const model: ClaimDataModel = {
      ...EMPTY_CLAIM_DATA,
      accountNumbers: { 0: "SB-12345" },
      accountDetails: {
        0: { amountClaimed: "1,20,000", nominationRegistrationNumber: "NOM-42", nominationDate: "01/03/2019" },
      },
    };
    expect(resolveAccountValue(model, 0, "account.amountClaimed")).toBe("1,20,000");
    expect(resolveAccountValue(model, 0, "account.nominationRegistrationNumber")).toBe("NOM-42");
    expect(resolveAccountValue(model, 0, "account.nominationDate")).toBe("01/03/2019");
    expect(resolveAccountValue(model, 1, "account.amountClaimed")).toBeUndefined();
    // resolveFieldValue dispatches: account-scoped goes through the index,
    // model-level ignores it.
    expect(resolveFieldValue(model, 0, "account.number")).toBe("SB-12345");
    expect(resolveFieldValue(model, 1, "account.number")).toBeUndefined();
    expect(resolveFieldValue(model, 5, "depositor.name")).toBeUndefined();
  });

  it("classifies exactly the four account.* fields as account-scoped", () => {
    const scoped = ALL_CLAIM_DATA_FIELDS.filter((f) => isAccountScopedField(f));
    expect(scoped).toEqual([
      "account.number",
      "account.amountClaimed",
      "account.nominationRegistrationNumber",
      "account.nominationDate",
    ]);
  });
});
