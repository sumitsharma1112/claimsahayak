import { describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { once } from "node:events";
import { handleRequest } from "../src/server.js";

async function request(path: string): Promise<{ status: number; body: unknown }> {
  const server = createServer(handleRequest);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Expected an AddressInfo");
  }
  try {
    const res = await fetch(`http://127.0.0.1:${String(address.port)}${path}`);
    return { status: res.status, body: await res.json() };
  } finally {
    server.close();
  }
}

describe("backend scaffold server", () => {
  it("serves the health endpoint", async () => {
    const { status, body } = await request("/health");
    expect(status).toBe(200);
    expect(body).toMatchObject({ status: "ok", service: "claimsahayak-backend" });
  });

  it("returns structured 404 elsewhere", async () => {
    const { status, body } = await request("/anything-else");
    expect(status).toBe(404);
    expect(body).toEqual({ error: "not_found" });
  });
});
