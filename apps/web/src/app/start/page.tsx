import type { Metadata } from "next";
import { RULE_PACK, OFFICIAL_FORM_LAYOUTS } from "@claimsahayak/rule-pack";
import { Wizard } from "@/components/wizard/Wizard";

export const metadata: Metadata = { title: "Start your checklist" };

export default function StartPage() {
  return <Wizard rulePack={RULE_PACK} officialFormLayouts={OFFICIAL_FORM_LAYOUTS} />;
}
