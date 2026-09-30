"use client";

import { useEffect, useState } from "react";
import { CompanyDashboardView } from "@/components/vera-core-ui";
import { fetchCoreReadinessSummary } from "@/lib/core/vera-core-platform";
import type { CompanyWorker } from "./types";

type Props = {
  companyId: number;
  companyName: string;
  workers: CompanyWorker[];
  equipmentCount: number;
  trainingCount: number;
  children: React.ReactNode;
};

export function CompanyDashboardClient({
  companyId,
  companyName,
  workers,
  equipmentCount,
  trainingCount,
  children,
}: Props) {
  const [readinessScore, setReadinessScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchCoreReadinessSummary(companyId)
      .then((summary) => {
        if (cancelled) return;
        const dims = summary.dimensions ?? [];
        if (dims.length > 0) {
          const avg =
            dims.reduce((sum, d) => sum + (d.score ?? 0), 0) / dims.length;
          setReadinessScore(Math.round(avg));
        } else {
          setReadinessScore(Math.round(summary.workers?.score ?? 0));
        }
      })
      .catch(() => {
        if (!cancelled) setReadinessScore(null);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const trainingTotal = workers.reduce(
    (n, w) => n + (w.trainingRecords?.length ?? 0),
    0,
  );

  return (
    <CompanyDashboardView
      companyId={companyId}
      companyName={companyName}
      workerCount={workers.length}
      equipmentCount={equipmentCount}
      trainingCount={trainingCount || trainingTotal}
      readinessScore={readinessScore ?? undefined}
      workers={workers.map((w) => ({
        id: w.id,
        firstName: w.firstName ?? undefined,
        lastName: w.lastName ?? undefined,
        compliance: (w.trainingRecords?.length ?? 0) > 0 ? "ok" : "at_risk",
      }))}
    >
      {children}
    </CompanyDashboardView>
  );
}
