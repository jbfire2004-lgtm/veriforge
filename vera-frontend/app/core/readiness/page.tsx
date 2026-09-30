import { Suspense } from "react";
import { CoreReadinessDashboard } from "@/src/components/core/CoreReadinessDashboard";
import { VeraPageLayout } from "@/src/components/navigation";

export const metadata = {
  title: "Readiness engine — Vera Core",
  description: "Worker, equipment, training expiry, and project readiness scores.",
};

export default function CoreReadinessPage() {
  return (
    <VeraPageLayout
      title="Readiness engine"
      description="Unified compliance scoring across workers, equipment, training expiry, projects, and company assessment engines (SPCE & Smart Gap Analysis)."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading readiness…</p>}>
        <CoreReadinessDashboard />
      </Suspense>
    </VeraPageLayout>
  );
}
