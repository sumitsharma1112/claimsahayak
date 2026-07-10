import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/env.js";

describe("backend env parsing", () => {
  it("applies documented defaults", () => {
    const env = parseEnv({});
    expect(env).toEqual({ port: 8080, host: "0.0.0.0", databaseUrl: null });
  });

  it("parses provided values", () => {
    const env = parseEnv({
      BACKEND_PORT: "9090",
      BACKEND_HOST: "127.0.0.1",
      DATABASE_URL: "postgres://u:p@h:5432/db"
    });
    expect(env.port).toBe(9090);
    expect(env.host).toBe("127.0.0.1");
    expect(env.databaseUrl).toBe("postgres://u:p@h:5432/db");
  });

  it("rejects invalid ports with a precise error", () => {
    expect(() => parseEnv({ BACKEND_PORT: "abc" })).toThrow(/BACKEND_PORT/);
    expect(() => parseEnv({ BACKEND_PORT: "70000" })).toThrow(/between 1 and 65535/);
  });
});
