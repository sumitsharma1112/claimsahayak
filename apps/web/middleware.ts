import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request CSP nonce (V3 §5.5 controls, M1 architecture decision).
 *
 * `script-src 'self'` alone blocks the inline `<script>self.__next_f.push(...)`
 * tags Next.js's App Router injects on every page to stream RSC/hydration
 * data — with no `'unsafe-inline'` and no nonce, the browser silently
 * refuses every one of them, so React never hydrates and no client
 * component (e.g. the Milestone 4.1 Wizard) ever becomes interactive. A
 * per-request nonce is the standard fix that keeps `script-src` locked down
 * (see https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy):
 * Next.js reads the nonce back off this same CSP header and applies it to
 * its own injected scripts automatically.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Every route except static assets and image optimization, which need
    // no per-request CSP nonce.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
