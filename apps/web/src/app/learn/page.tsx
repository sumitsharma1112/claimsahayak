import type { Metadata } from "next";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return (
    <MilestonePlaceholder
      title="Learn — how Post Office claims work"
      milestone="Milestone 7 (Learn pages) on the approved roadmap"
    />
  );
}
