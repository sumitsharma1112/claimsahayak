/**
 * Environment parsing — the only place process.env is read in the backend.
 * Fails fast with a precise message; never logs secret values.
 */
export interface BackendEnv {
  readonly port: number;
  readonly host: string;
  /** Present from Milestone 10; optional in the M1 scaffold. */
  readonly databaseUrl: string | null;
}

export function parseEnv(
  source: Readonly<Record<string, string | undefined>>
): BackendEnv {
  const portRaw = source["BACKEND_PORT"] ?? "8080";
  const port = Number.parseInt(portRaw, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `BACKEND_PORT must be an integer between 1 and 65535, received "${portRaw}"`
    );
  }
  const host = source["BACKEND_HOST"] ?? "0.0.0.0";
  const databaseUrl = source["DATABASE_URL"] ?? null;
  return { port, host, databaseUrl };
}
