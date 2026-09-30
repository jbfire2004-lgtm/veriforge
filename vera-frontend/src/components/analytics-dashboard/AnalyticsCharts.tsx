"use client";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { AnalyticsDashboard } from "@/lib/analytics-dashboard-api";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const COLORS = {
  teal: "rgb(13, 148, 136)",
  amber: "rgb(245, 158, 11)",
  red: "rgb(220, 38, 38)",
  emerald: "rgb(5, 150, 105)",
  sky: "rgb(2, 132, 199)",
  zinc: "rgb(113, 113, 122)",
};

export function AnalyticsKpiCards({
  kpis,
}: {
  kpis: AnalyticsDashboard["kpis"];
}) {
  const cards = [
    { label: "Avg compliance", value: kpis.avgComplianceScore },
    { label: "Contractors", value: kpis.contractorCount },
    { label: "Docs expired", value: kpis.documentsExpired },
    { label: "Docs expiring", value: kpis.documentsExpiring },
    { label: "Audits (range)", value: kpis.auditsInRange },
    { label: "Open findings", value: kpis.openFindings },
    { label: "PVS coverage %", value: kpis.pvsCoveragePct },
    { label: "QC runs", value: kpis.quickCheckRuns },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <li key={c.label} className="border border-zinc-200 px-3 py-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            {c.label}
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {c.value}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DocumentExpiryChart({
  data,
}: {
  data: AnalyticsDashboard["charts"]["documentExpiry"];
}) {
  return (
    <ChartCard title="Document expiry (weekly)">
      <Bar
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "Expired",
              data: data.expired,
              backgroundColor: COLORS.red,
            },
            {
              label: "Expiring",
              data: data.expiring,
              backgroundColor: COLORS.amber,
            },
            {
              label: "Valid due",
              data: data.valid,
              backgroundColor: COLORS.emerald,
            },
          ],
        }}
        options={stackedOptions}
      />
    </ChartCard>
  );
}

export function AuditTrendsChart({
  data,
}: {
  data: AnalyticsDashboard["charts"]["auditTrends"];
}) {
  return (
    <ChartCard title="Audit score trends">
      <Line
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "Avg score",
              data: data.avgScore,
              borderColor: COLORS.teal,
              backgroundColor: "rgba(13,148,136,0.15)",
              fill: true,
              tension: 0.25,
            },
            {
              label: "Audits completed",
              data: data.count,
              borderColor: COLORS.sky,
              backgroundColor: "transparent",
              tension: 0.2,
              yAxisID: "y1",
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100, position: "left" },
            y1: {
              beginAtZero: true,
              position: "right",
              grid: { drawOnChartArea: false },
            },
          },
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </ChartCard>
  );
}

export function PvsCoverageChart({
  data,
}: {
  data: AnalyticsDashboard["charts"]["pvsCoverage"];
}) {
  return (
    <ChartCard title="PVS verification coverage">
      <Bar
        data={{
          labels: data.labels.length ? data.labels : ["(none)"],
          datasets: [
            {
              label: "Verified / exempt",
              data: data.verified.length ? data.verified : [0],
              backgroundColor: COLORS.emerald,
            },
            {
              label: "Other",
              data: data.other.length ? data.other : [0],
              backgroundColor: COLORS.zinc,
            },
          ],
        }}
        options={stackedOptions}
      />
    </ChartCard>
  );
}

export function InsuranceChart({
  data,
}: {
  data: AnalyticsDashboard["charts"]["insuranceCompliance"];
}) {
  const colors = data.labels.map((l) => {
    if (l === "valid") return COLORS.emerald;
    if (l === "expiring") return COLORS.amber;
    if (l === "expired" || l === "missing") return COLORS.red;
    return COLORS.zinc;
  });
  return (
    <ChartCard title="Insurance compliance">
      <Doughnut
        data={{
          labels: data.labels,
          datasets: [
            {
              data: data.values,
              backgroundColor: colors,
              borderWidth: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </ChartCard>
  );
}

export function QuickCheckRiskChart({
  data,
}: {
  data: AnalyticsDashboard["charts"]["quickCheckRisk"];
}) {
  return (
    <ChartCard title="QuickCheck risk distribution">
      <Doughnut
        data={{
          labels: data.labels.map((l) =>
            l === "green" ? "Low" : l === "yellow" ? "Medium" : "High",
          ),
          datasets: [
            {
              data: data.values,
              backgroundColor: [COLORS.emerald, COLORS.amber, COLORS.red],
              borderWidth: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </ChartCard>
  );
}

export function ComplianceBreakdownChart({
  data,
}: {
  data: AnalyticsDashboard["charts"]["complianceBreakdown"];
}) {
  return (
    <ChartCard title="Score components">
      <Bar
        data={{
          labels: data.map((d) => d.label),
          datasets: [
            {
              label: "Score",
              data: data.map((d) => d.value),
              backgroundColor: [
                COLORS.teal,
                COLORS.sky,
                COLORS.amber,
                COLORS.emerald,
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y" as const,
          scales: { x: { beginAtZero: true, max: 100 } },
          plugins: { legend: { display: false } },
        }}
      />
    </ChartCard>
  );
}

export function ComplianceHistogramChart({
  data,
}: {
  data: NonNullable<AnalyticsDashboard["charts"]["complianceHistogram"]>;
}) {
  return (
    <ChartCard title="Compliance score distribution">
      <Bar
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "Contractors",
              data: data.values,
              backgroundColor: COLORS.teal,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
          plugins: { legend: { display: false } },
        }}
      />
    </ChartCard>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-zinc-200 p-4">
      <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      <div className="h-56">{children}</div>
    </div>
  );
}

const stackedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
  },
  plugins: { legend: { position: "bottom" as const } },
};
