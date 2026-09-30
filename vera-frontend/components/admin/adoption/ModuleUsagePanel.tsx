"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import type { ModuleUsageResponse } from "@vera/api-contract";
import { fetchModuleUsage } from "@/lib/adoption/api";
import {
  Card,
  CardContent,
  ErrorState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function formatEventLabel(key: string): string {
  return key.replace(/_/g, " ");
}

export function ModuleUsagePanel() {
  const [data, setData] = useState<ModuleUsageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchModuleUsage()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load module usage");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const barData = useMemo(() => {
    if (!data) return null;
    const labels = Object.keys(data.globalTotals).map(formatEventLabel);
    const values = Object.values(data.globalTotals);
    return {
      labels,
      datasets: [
        {
          label: "Events (30d rollup)",
          data: values,
          backgroundColor: "#2F8F8C",
        },
      ],
    };
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return null;
    const labels = Object.keys(data.moduleAdoptionPercent).map(formatEventLabel);
    const values = Object.values(data.moduleAdoptionPercent);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#2F8F8C", "#1e4a7a", "#2F85CC", "#C89F3D", "#64748b", "#3AA39F"],
        },
      ],
    };
  }, [data]);

  if (error) return <ErrorState title="Module usage" message={error} />;
  if (!data) return <Skeleton className="h-64 w-full rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#2A2E33]/10">
          <CardContent className="pt-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#2A2E33]">
              Module event volume
            </p>
            {barData ? <Bar data={barData} options={{ responsive: true }} /> : null}
          </CardContent>
        </Card>
        <Card className="border-[#2A2E33]/10">
          <CardContent className="pt-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#2A2E33]">
              % of companies using module
            </p>
            {pieData ? <Pie data={pieData} options={{ responsive: true }} /> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#2A2E33]/10">
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Active users</TableHead>
                <TableHead>Churn risk</TableHead>
                <TableHead>Modules</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.companies.map((c) => (
                <TableRow key={c.companyId}>
                  <TableCell className="font-medium">{c.companyName}</TableCell>
                  <TableCell>{c.activeUsers30d}</TableCell>
                  <TableCell>{c.churnRiskScore.toFixed(0)}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-[#64748b]">
                    {Object.keys(c.modulesUsed).join(", ") || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
