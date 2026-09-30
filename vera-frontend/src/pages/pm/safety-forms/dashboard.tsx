"use client";

import { AlertTriangle, BarChart3, ClipboardCheck, FileStack } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSafetyFormDashboard } from "@/lib/safety-forms";
import { SfButton, SfCard, SfKpiCard } from "@/src/components/safety-forms/ui";

export default function SafetyFormsDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchSafetyFormDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (data?.byStatus as Record<string, number>) ?? {};
  const byDefinition = (data?.byDefinition as Record<string, number>) ?? {};

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--sf-text)]">
            Safety intelligence
          </h1>
          <p className="text-sm text-[var(--sf-text-muted)]">
            Leading and lagging indicators across your organization
          </p>
        </section>
      </header>

      {loading ? (
        <p className="text-sm text-[var(--sf-text-muted)]">Loading dashboard…</p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SfKpiCard
              label="Total submissions"
              value={String(data?.total ?? 0)}
              icon={FileStack}
            />
            <SfKpiCard
              label="SIF flagged"
              value={String(data?.sifCount ?? 0)}
              icon={AlertTriangle}
              tone="danger"
            />
            <SfKpiCard
              label="HECA flagged"
              value={String(data?.hecaCount ?? 0)}
              icon={BarChart3}
              tone="warning"
            />
            <SfKpiCard
              label="Open corrective actions"
              value={String(data?.openCorrectiveActions ?? 0)}
              icon={ClipboardCheck}
              tone="success"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <SfCard padding="md">
              <h2 className="mb-4 text-base font-semibold text-[var(--sf-text)]">
                By status
              </h2>
              <ul className="space-y-2">
                {Object.entries(byStatus).map(([k, v]) => (
                  <li
                    key={k}
                    className="flex items-center justify-between rounded-[var(--sf-radius-sm)] px-2 py-2 transition-colors hover:bg-[var(--sf-surface-hover)]"
                  >
                    <span className="text-sm text-[var(--sf-text-muted)]">
                      {k.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-[var(--sf-text)]">
                      {v}
                    </span>
                  </li>
                ))}
              </ul>
            </SfCard>
            <SfCard padding="md">
              <h2 className="mb-4 text-base font-semibold text-[var(--sf-text)]">
                By form type
              </h2>
              <ul className="space-y-2">
                {Object.entries(byDefinition).map(([k, v]) => (
                  <li
                    key={k}
                    className="flex items-center justify-between rounded-[var(--sf-radius-sm)] px-2 py-2 transition-colors hover:bg-[var(--sf-surface-hover)]"
                  >
                    <span className="text-sm text-[var(--sf-text-muted)]">{k}</span>
                    <span className="text-sm font-semibold tabular-nums text-[var(--sf-text)]">
                      {v}
                    </span>
                  </li>
                ))}
              </ul>
            </SfCard>
          </section>
        </>
      )}
    </div>
  );
}
