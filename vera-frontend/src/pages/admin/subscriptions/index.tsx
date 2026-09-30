"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminSubscriptions,
  fetchAdminSubscriptionsGrowth,
  fetchAdminSubscriptionsMap,
  fetchAdminSubscriptionsSummary,
  type SubscriptionGrowth,
  type SubscriptionMapPin,
  type SubscriptionRow,
  type SubscriptionSummary,
} from "@/lib/admin-subscriptions-api";
import {
  AdminPageLayout,
  GrowthTimeline,
  KpiCard,
  ModuleAdoptionChart,
  SubscriptionMap,
  SubscriptionTable,
} from "@/src/components/admin/subscriptions";
import { ErrorState, Skeleton } from "@/components/ui";

export default function AdminSubscriptionMapPage() {
  const [rows, setRows] = useState<SubscriptionRow[] | null>(null);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [mapPins, setMapPins] = useState<SubscriptionMapPin[] | null>(null);
  const [growth, setGrowth] = useState<SubscriptionGrowth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, sum, map, gro] = await Promise.all([
        fetchAdminSubscriptions(),
        fetchAdminSubscriptionsSummary(),
        fetchAdminSubscriptionsMap(),
        fetchAdminSubscriptionsGrowth(),
      ]);
      setRows(list);
      setSummary(sum);
      setMapPins(map);
      setGrowth(gro);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscription data");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <AdminPageLayout title="Subscription map" description="Admin subscription & user tracking">
        <ErrorState message={error} onRetry={() => void load()} />
      </AdminPageLayout>
    );
  }

  if (!rows || !summary || !mapPins || !growth) {
    return (
      <AdminPageLayout title="Subscription map" description="Loading platform subscription data…">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[420px] w-full" />
        <Skeleton className="h-64 w-full" />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Subscription map"
      description="Companies, tiers, seats, modules, and geographic distribution across Vera."
      actions={
        <button
          type="button"
          className="rounded-lg bg-vera-teal px-4 py-2 text-sm font-medium text-white hover:bg-vera-teal/90"
          onClick={() => void load()}
        >
          Refresh
        </button>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard label="Total active users" value={summary.totalActiveUsers} />
        <KpiCard label="Total companies" value={summary.totalCompanies} />
        <KpiCard label="Seats purchased" value={summary.totalSeatsPurchased} />
        <KpiCard label="Seats used" value={summary.totalSeatsUsed} />
        <KpiCard
          label="Avg seats / company"
          value={summary.averageSeatsPerCompany}
        />
        <KpiCard
          label="Top tier adoption"
          value={summary.topTierAdoption.tier}
          hint={`${summary.topTierAdoption.count} companies`}
        />
        <KpiCard
          label="Fastest growing module"
          value={summary.fastestGrowingModule.module}
          hint={`${summary.fastestGrowingModule.growthPercent}% of activity`}
          tone="success"
        />
        <KpiCard
          label="Companies at risk"
          value={summary.companiesAtRisk}
          tone={summary.companiesAtRisk > 0 ? "warning" : "default"}
        />
        <KpiCard
          label="Near seat limit (90%+)"
          value={summary.companiesNearSeatLimit}
          tone={summary.companiesNearSeatLimit > 0 ? "warning" : "default"}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-vera-muted">
          Geographic distribution
        </h2>
        <SubscriptionMap
          pins={mapPins}
          onSelectCompany={(id) => {
            setHighlightId(id);
            document.getElementById("subscription-table")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      <section id="subscription-table">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-vera-muted">
          All subscriptions
        </h2>
        <SubscriptionTable
          rows={rows}
          onUpdated={() => void load()}
          highlightCompanyId={highlightId}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ModuleAdoptionChart
          adoptionByModule={summary.adoptionByModule}
          totalCompanies={summary.totalCompanies}
        />
        <GrowthTimeline growth={growth} />
      </section>
    </AdminPageLayout>
  );
}
