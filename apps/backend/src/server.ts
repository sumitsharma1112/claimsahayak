import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { parseEnv } from "./env.js";

/**
 * Backend scaffold (Milestone 1): a minimal HTTP server with a health
 * endpoint and clean shutdown. It is intentionally dependency-free until
 * Milestone 10 introduces the content store, publish pipeline, and the
 * Milestone 11 event-ingestion edge. The public website has NO runtime
 * dependency on this service (V3 invariant I-3).
 */

const SERVICE = "claimsahayak-backend";
const VERSION = "0.1.0";

export function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  if (req.method === "GET" && req.url === "/health") {
    const body = JSON.stringify({ status: "ok", service: SERVICE, version: VERSION });
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "content-length": Buffer.byteLength(body)
    });
    res.end(body);
    return;
  }
  const body = JSON.stringify({ error: "not_found" });
  res.writeHead(404, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

function main(): void {
  const env = parseEnv(process.env);
  const server = createServer(handleRequest);

  server.listen(env.port, env.host, () => {
    process.stdout.write(
      `${SERVICE} ${VERSION} listening on http://${env.host}:${String(env.port)}\n`
    );
  });

  const shutdown = (signal: string): void => {
    process.stdout.write(`${SERVICE} received ${signal}, shutting down\n`);
    server.close(() => {
      process.exit(0);
    });
    // Hard exit if connections refuse to drain.
    setTimeout(() => {
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });
}

// Start only when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1] ?? ""}`) {
  main();
}
