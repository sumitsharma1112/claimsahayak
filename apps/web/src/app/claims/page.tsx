import type { Metadata } from "next";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "Claims by scheme" };

export default function ClaimsPage() {
  return (
    <MilestonePlaceholder
      title="Claims by scheme"
      milestone="Milestone 9 (SEO pages) on the approved roadmap"
    />
  );
}
