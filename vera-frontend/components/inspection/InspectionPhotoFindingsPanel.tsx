"use client";

import { useEffect, useState } from "react";
import { InspectionItemPhotoFindings } from "@/components/inspection/InspectionItemPhotoFindings";
import { mapFindingsToDisplayItems } from "@/lib/inspection-photo-findings";
import {
  fetchPmInspectionPhotoFindings,
  type PmInspectionPhotoFinding,
} from "@/lib/pm-inspections";
import { SfCard } from "@/src/components/safety-forms/ui";

/** Standalone findings list — prefer inline `InspectionItemPhotoFindings` on checklist rows. */
export function InspectionPhotoFindingsPanel({
  inspectionId,
}: {
  inspectionId: string;
}) {
  const [findings, setFindings] = useState<PmInspectionPhotoFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchPmInspectionPhotoFindings(inspectionId)
      .then(setFindings)
      .catch(() => setFindings([]))
      .finally(() => setLoading(false));
  }, [inspectionId]);

  if (loading) {
    return (
      <SfCard className="p-4 text-sm text-[var(--sf-text-muted)]">
        Loading photo findings…
      </SfCard>
    );
  }

  if (!findings.length) return null;

  return (
    <SfCard className="p-5">
      <h2 className="mb-3 font-medium">Photo analysis findings</h2>
      <InspectionItemPhotoFindings displays={mapFindingsToDisplayItems(findings)} />
    </SfCard>
  );
}
