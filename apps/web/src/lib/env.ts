/** Public environment access — the only place process.env is read in the web app. */
import { SITE } from "@claimsahayak/shared-config";

export function siteUrl(): string {
  const fromEnv = process.env["NEXT_PUBLIC_SITE_URL"];
  return fromEnv && fromEnv.length > 0 ? fromEnv : SITE.defaultUrl;
}

export function analyticsEndpoint(): string | null {
  const value = process.env["NEXT_PUBLIC_ANALYTICS_ENDPOINT"];
  return value && value.length > 0 ? value : null;
}
