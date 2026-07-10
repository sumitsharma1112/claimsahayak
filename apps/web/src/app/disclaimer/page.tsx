import type { Metadata } from "next";
import { BRAND } from "@claimsahayak/shared-config";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <>
      <MilestonePlaceholder
        title="Disclaimer"
        milestone="Milestone 7 (content pages); the binding lines below apply from day one"
      />
      <p className="rounded-card bg-notice-bg p-s4 text-notice">
        {BRAND.independenceStrip.en} {BRAND.notLegalAdvice.en}
      </p>
    </>
  );
}
