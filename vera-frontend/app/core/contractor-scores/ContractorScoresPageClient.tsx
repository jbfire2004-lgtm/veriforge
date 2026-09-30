"use client";

import { useSearchParams } from "next/navigation";
import { ContractorSafetyScoreView } from "@/components/contractor-safety-score/ContractorSafetyScoreView";

export function ContractorScoresPageClient() {
  const search = useSearchParams();
  const raw = search.get("contractorCompanyId");
  return (
    <ContractorSafetyScoreView
      initialContractorId={raw ? Number(raw) : null}
    />
  );
}
