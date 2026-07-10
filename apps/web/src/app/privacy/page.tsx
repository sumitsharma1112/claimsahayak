import type { Metadata } from "next";
import { MilestonePlaceholder } from "@/components/MilestonePlaceholder";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <MilestonePlaceholder
      title="Privacy — your answers never leave your device"
      milestone="Full privacy content ships with Milestone 11 (the published event list is auto-generated from the analytics schema)"
    />
  );
}
