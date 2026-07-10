import type { Metadata } from "next";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "Fix an issue" };

export default function FixPage() {
  return (
    <MilestonePlaceholder
      title="The Post Office asked me for another document"
      milestone="Milestone 8 (Recovery module) on the approved roadmap"
    />
  );
}
