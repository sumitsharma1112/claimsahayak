import { type ReactNode } from "react";
import { rootCssVariables } from "@claimsahayak/design-tokens";

/**
 * Injects the design-token CSS custom properties exactly once, at the root.
 * Server component — zero client JS. Components must consume tokens via
 * var(--cs-*) or the Tailwind preset; literal values are forbidden.
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <style
        // Token values come from the typed design-tokens package, not user input.
        dangerouslySetInnerHTML={{ __html: rootCssVariables() }}
      />
      {children}
    </>
  );
}
