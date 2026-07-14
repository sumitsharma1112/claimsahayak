import { describe, expect, it } from "vitest";
import { formatClaimFieldValue } from "@/lib/formatClaimFieldValue";

describe("formatClaimFieldValue — amounts", () => {
  it("formats a clean digit string as Indian currency", () => {
    expect(formatClaimFieldValue("account.amountClaimed", "250000")).toBe("₹2,50,000");
  });

  it("strips stray formatting characters before parsing", () => {
    expect(formatClaimFieldValue("account.amountClaimed", "₹2,50,000")).toBe("₹2,50,000");
  });

  it("falls back to the raw trimmed value when nothing digit-like is present — never invents a number", () => {
    expect(formatClaimFieldValue("account.amountClaimed", "  not an amount  ")).toBe("not an amount");
  });
});

describe("formatClaimFieldValue — dates", () => {
  it("converts a clean ISO date (from a type=date input) to DD-MM-YYYY", () => {
    expect(formatClaimFieldValue("deathCertificate.dateOfDeath", "2025-03-14")).toBe("14-03-2025");
    expect(formatClaimFieldValue("account.nominationDate", "2019-06-01")).toBe("01-06-2019");
  });

  it("leaves a non-ISO date string unchanged — never guesses the intended format", () => {
    expect(formatClaimFieldValue("deathCertificate.dateOfDeath", "14/03/2025")).toBe("14/03/2025");
    expect(formatClaimFieldValue("deathCertificate.dateOfDeath", "March 2025")).toBe("March 2025");
  });
});

describe("formatClaimFieldValue — everything else", () => {
  it("trims whitespace and returns the value unchanged otherwise", () => {
    expect(formatClaimFieldValue("claimant.name", "  Asha Devi  ")).toBe("Asha Devi");
    expect(formatClaimFieldValue("office.name", "Connaught Place HO")).toBe("Connaught Place HO");
  });
});
