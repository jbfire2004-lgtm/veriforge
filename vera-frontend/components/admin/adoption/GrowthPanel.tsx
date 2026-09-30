"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { GrowthStatsResponse } from "@vera/api-contract";
import { fetchGrowthStats } from "@/lib/adoption/api";
import { Card, CardContent, ErrorState, Skeleton } from "@/components/ui";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function lineFromBuckets(
  label: string,
  buckets: { month: string; count: number }[],
  color: string,
) {
  return {
    labels: buckets.map((b) => b.month),
    datasets: [
      {
        label,
        data: buckets.map((b) => b.count),
        borderColor: color,
        backgroundColor: `${color}33`,
        tension: 0.3,
        fill: true,
      },
    ],
  };
}

export function GrowthPanel() {
  const [data, setData] = useState<GrowthStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchGrowthStats()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load growth stats");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const companiesChart = useMemo(
    () =>
      data
        ? lineFromBuckets("New companies", data.newCompaniesByMonth, "#1e4a7a")
        : null,
    [data],
  );
  const workersChart = useMemo(
    () =>
      data ? lineFromBuckets("New workers", data.newWorkersByMonth, "#2F8F8C") : null,
    [data],
  );

  if (error) return <ErrorState title="Growth" message={error} />;
  if (!data) return <Skeleton className="h-64 w-full rounded-2xl" />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-[#2A2E33]/10">
        <CardContent className="pt-6">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#2A2E33]">
            New companies per month
          </p>
          {companiesChart ? (
            <Line data={companiesChart} options={{ responsive: true }} />
          ) : null}
        </CardContent>
      </Card>
      <Card className="border-[#2A2E33]/10">
        <CardContent className="pt-6">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#2A2E33]">
            New workers per month
          </p>
          {workersChart ? <Line data={workersChart} options={{ responsive: true }} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
