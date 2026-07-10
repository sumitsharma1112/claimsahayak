import type { Metadata } from "next";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <MilestonePlaceholder
      title="About ClaimSahayak"
      milestone="Milestone 7 (content pages) on the approved roadmap"
    />
  );
}
