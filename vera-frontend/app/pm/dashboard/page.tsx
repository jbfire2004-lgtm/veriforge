import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { VeriPmDashboardPageClient } from "./VeriPmDashboardPageClient";

export const metadata = {
  title: "VERIPM Dashboard — Vera PM",
  description:
    "Preventive maintenance, downtime, failures, and maintenance-linked safety with industry comparison.",
};

export default function VeriPmDashboardPage() {
  return (
    <VeraPageLayout
      title="VERIPM Dashboard"
      description="Smart maintenance command surface — PM, assets, contractors, and safety links."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading dashboard…</p>}>
        <VeriPmDashboardPageClient />
      </Suspense>
    </VeraPageLayout>
  );
}
