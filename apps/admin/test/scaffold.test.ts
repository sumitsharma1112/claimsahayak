import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

describe("admin scaffold guardrails", () => {
  it("admin pages are marked noindex", () => {
    const layout = readFileSync(
      fileURLToPath(new URL("../src/app/layout.tsx", import.meta.url)),
      "utf8"
    );
    expect(layout).toContain("index: false");
  });
});
