import type { Metadata } from "next";
import { RULE_PACK } from "@claimsahayak/rule-pack";
import { Wizard } from "@/components/wizard/Wizard";

export const metadata: Metadata = { title: "Start your checklist" };

export default function StartPage() {
  return <Wizard rulePack={RULE_PACK} />;
}
