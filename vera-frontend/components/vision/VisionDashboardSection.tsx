"use client";

import { useEffect } from "react";
import { AlertTriangle, FileStack, ShieldAlert } from "lucide-react";
import { useVisionDashboard } from "@/lib/vision";
import { WidgetContainer } from "@/components/dashboard/engine/WidgetContainer";
import { DocumentReviewPanel } from "./DocumentReviewPanel";

type Props = { companyId?: number };

export function VisionDashboardSection({ companyId }: Props) {
  const { dashboard, loading, refresh } = useVisionDashboard(companyId);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const d = dashboard;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-vera-charcoal">Vision & documents</h2>
      {loading && <p className="text-sm text-vera-muted">Loading vision metrics…</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WidgetContainer title="Document backlog" subtitle="Awaiting review" icon={FileStack}>
          <p className="text-2xl font-semibold">{d?.documentBacklog ?? 0}</p>
        </WidgetContainer>
        <WidgetContainer title="Fraud alerts" subtitle="Flagged documents" icon={ShieldAlert} tone="danger">
          <p className="text-2xl font-semibold">{d?.fraudAlerts ?? 0}</p>
        </WidgetContainer>
        <WidgetContainer title="Requires review" subtitle="Manual QA queue" icon={AlertTriangle} tone="warning">
          <p className="text-2xl font-semibold">{d?.requiresReview ?? 0}</p>
        </WidgetContainer>
        <WidgetContainer title="Auto-mapped" subtitle="Successful matches" icon={FileStack} tone="success">
          <p className="text-2xl font-semibold">{d?.autoMapped ?? 0}</p>
        </WidgetContainer>
      </div>
      <DocumentReviewPanel companyId={companyId} />
    </section>
  );
}
