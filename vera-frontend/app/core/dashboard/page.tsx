import { Suspense } from "react";
import { VeraPageLayout } from "@/src/components/navigation";
import { VeriCoreDashboardPageClient } from "./VeriCoreDashboardPageClient";

export const metadata = {
  title: "VERICore Dashboard — Vera Core",
  description:
    "Company training, safety performance, contractor scores, and industry comparison with full drill-down.",
};

export default function VeriCoreDashboardPage() {
  return (
    <VeraPageLayout
      title="VERICore Dashboard"
      description="Smart SMS command surface — training, safety, contractors, projects, and industry benchmarks."
    >
      <Suspense fallback={<p className="text-sm text-slate-500">Loading dashboard…</p>}>
        <VeriCoreDashboardPageClient />
      </Suspense>
    </VeraPageLayout>
  );
}
