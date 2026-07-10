import { type ReactNode } from "react";
import type { Metadata } from "next";
import { rootCssVariables } from "@claimsahayak/design-tokens";

export const metadata: Metadata = {
  title: "ClaimSahayak Admin",
  robots: { index: false, follow: false }
};

export default function AdminRootLayout({
  children
}: {
  readonly children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "var(--cs-font-body)",
          background: "var(--cs-color-paper)",
          color: "var(--cs-color-ink)"
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: rootCssVariables() }} />
        <main id="main-content" style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
