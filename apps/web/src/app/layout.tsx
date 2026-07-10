import { type ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { BRAND } from "@claimsahayak/shared-config";
import { color } from "@claimsahayak/design-tokens";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AccessibilityProvider } from "@/providers/AccessibilityProvider";
import { SkipLink } from "@/components/SkipLink";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfflineBanner } from "@/components/OfflineBanner";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import { siteUrl } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline.en}`,
    template: `%s — ${BRAND.name}`
  },
  description: `${BRAND.tagline.en}. ${BRAND.independenceStrip.en}`,
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: color.paper,
  width: "device-width",
  initialScale: 1
};

/**
 * Application shell (Master Prompt 1 §6): ARIA landmarks (banner / nav /
 * main / contentinfo), skip link first in the tab order, theme +
 * accessibility providers, offline banner, service-worker registration.
 * `lang` is English at the root; Hindi pages render under /hi with lang="hi"
 * when the locale content track lands (V2 §8.2).
 */
export default function RootLayout({
  children
}: {
  readonly children: ReactNode;
}) {
  return (
    <html lang="en" data-large-text="false">
      <body className="bg-paper font-body text-body text-ink">
        <ThemeProvider>
          <AccessibilityProvider>
            <SkipLink />
            <OfflineBanner />
            <Header />
            <main
              id="main-content"
              tabIndex={-1}
              className="mx-auto w-full max-w-content px-s4 py-s5 outline-none desktop:max-w-4xl"
            >
              {children}
            </main>
            <Footer />
            <RegisterServiceWorker />
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
