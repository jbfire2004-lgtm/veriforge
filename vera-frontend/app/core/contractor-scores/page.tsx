import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { ContractorScoresPageClient } from "./ContractorScoresPageClient";

export const metadata = {
  title: "Contractor Safety Scores — Vera Core",
  description:
    "ISNetworld-style contractor program assessment scores with evidence drill-down.",
};

export default function ContractorScoresPage() {
  return (
    <VeraPageLayout
      title="Contractor Safety Scores"
      description="Program assessment (0–100) with grade, subscores, and evidence from policies, training, incidents, CAPA, audits, and toolbox talks."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading scores…</p>}>
        <ContractorScoresPageClient />
      </Suspense>
    </VeraPageLayout>
  );
}
