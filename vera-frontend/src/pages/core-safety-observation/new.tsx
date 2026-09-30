"use client";

import { SafetyObservationForm } from "@/src/components/safety-observation/SafetyObservationForm";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreSafetyObservationNewPage() {
  return (
    <VeraPageLayout
      title="New safety observation"
      description="Record a field hazard, near miss, or positive safety note."
    >
      <SafetyObservationForm />
    </VeraPageLayout>
  );
}
