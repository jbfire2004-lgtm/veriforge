"use client";

import { CoreSiteRiskForm } from "@/src/components/core-site-risk/CoreSiteRiskForm";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreSiteRiskNewPage() {
  return (
    <VeraPageLayout
      title="New site risk"
      description="Record a site hazard, exposure, or mitigation in the risk register."
    >
      <CoreSiteRiskForm />
    </VeraPageLayout>
  );
}
