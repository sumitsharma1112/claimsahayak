import type { Metadata } from "next";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "Find help" };

export default function FindHelpPage() {
  return (
    <MilestonePlaceholder
      title="Find help — delays & complaints"
      milestone="Milestone 7 (content pages) on the approved roadmap"
    />
  );
}
