import type { Metadata } from "next";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "Start your checklist" };

export default function StartPage() {
  return (
    <MilestonePlaceholder
      title="Start — prepare my claim papers"
      milestone="Milestone 4 (Wizard UI) on the approved roadmap"
    />
  );
}
