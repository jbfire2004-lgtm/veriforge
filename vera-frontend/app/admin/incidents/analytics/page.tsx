"use client";

import { useEffect, useMemo, useState } from "react";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { BarChart3 } from "lucide-react";
import { apiFetchJson } from "@/lib/api-fetch";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Select,
  Skeleton,
} from "@/components/ui";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

type IncidentRow = {
  id: number;
  type?: string | null;
  category?: string | null;
  title?: string | null;
  severity?: string | null;
  createdAt: string;
  company?: { id?: number; name?: string | null } | null;
};

type IncidentAnalyticsResponse = {
  total: number;
  bySeverity?: Record<string, number>;
  rows: IncidentRow[];
};

const BREADCRUMBS = [
  { label: "Admin", href: "/admin" },
  { label: "Incidents", href: "/admin/incidents" },
  { label: "Analytics" },
];

export default function IncidentAnalyticsPage() {
  const [rows, setRows] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterRange, setFilterRange] = useState("30");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        if (filterType) params.append("type", filterType);
        if (filterSeverity) params.append("severity", filterSeverity);
        if (filterCompany) params.append("company", filterCompany);
        params.append("days", filterRange);

        const raw = await apiFetchJson<IncidentAnalyticsResponse | IncidentRow[]>(
          `/incidents/analytics?${params.toString()}`,
          { requireAuth: false }
        );
        if (cancelled) return;
        const next = Array.isArray(raw) ? raw : raw.rows ?? [];
        setRows(next);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load incident analytics"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filterType, filterSeverity, filterCompany, filterRange]);

  const { typeChart, severityChart, timelineChart, companyChart, isEmpty } =
    useMemo(() => buildCharts(rows), [rows]);

  return (
    <AdminPageShell
      title="Incident analytics"
      description="Filter incident history and explore distribution charts."
      breadcrumbs={BREADCRUMBS}
    >
      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-vera-4 md:grid-cols-4">
            <div className="space-y-vera-2">
              <Label htmlFor="filter-type">Type</Label>
              <Select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All types</option>
                <option value="injury">Injury</option>
                <option value="near-miss">Near miss</option>
                <option value="property-damage">Property damage</option>
                <option value="equipment-failure">Equipment failure</option>
              </Select>
            </div>
            <div className="space-y-vera-2">
              <Label htmlFor="filter-severity">Severity</Label>
              <Select id="filter-severity" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="">All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Moderate</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
            <div className="space-y-vera-2">
              <Label htmlFor="filter-company">Company</Label>
              <Input
                id="filter-company"
                type="text"
                placeholder="Company ID"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              />
            </div>
            <div className="space-y-vera-2">
              <Label htmlFor="filter-range">Range</Label>
              <Select id="filter-range" value={filterRange} onChange={(e) => setFilterRange(e.target.value)}>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 gap-vera-8 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl md:col-span-2" />
          <Skeleton className="h-64 w-full rounded-2xl md:col-span-2" />
        </div>
      ) : loadError ? (
        <ErrorState title="Couldn't load incident analytics" description={loadError} />
      ) : isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="No incidents match these filters"
          description="Try widening the range or clearing the severity filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-vera-8 md:grid-cols-2">
          <Card className="border-vera-charcoal/10">
            <CardHeader>
              <CardTitle>Incident types</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={typeChart} />
            </CardContent>
          </Card>
          <Card className="border-vera-charcoal/10">
            <CardHeader>
              <CardTitle>Severity levels</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={severityChart} />
            </CardContent>
          </Card>
          <Card className="border-vera-charcoal/10 md:col-span-2">
            <CardHeader>
              <CardTitle>Incidents over time</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={timelineChart} />
            </CardContent>
          </Card>
          <Card className="border-vera-charcoal/10 md:col-span-2">
            <CardHeader>
              <CardTitle>By company</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={companyChart} />
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageShell>
  );
}

function buildCharts(rows: IncidentRow[]) {
  const typeCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};
  const companyCounts: Record<string, number> = {};
  const timeline: Record<string, number> = {};

  for (const i of rows) {
    const typeKey = i.type ?? i.category ?? i.title ?? "Unknown";
    typeCounts[typeKey] = (typeCounts[typeKey] ?? 0) + 1;
    const sevKey = i.severity ?? "UNKNOWN";
    severityCounts[sevKey] = (severityCounts[sevKey] ?? 0) + 1;
    const company = i.company?.name ?? "Unknown";
    companyCounts[company] = (companyCounts[company] ?? 0) + 1;
    const day = new Date(i.createdAt).toLocaleDateString();
    timeline[day] = (timeline[day] ?? 0) + 1;
  }

  const typeChart = {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        data: Object.values(typeCounts),
        backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#2F85CC"],
      },
    ],
  };

  const severityChart = {
    labels: Object.keys(severityCounts),
    datasets: [
      {
        data: Object.values(severityCounts),
        backgroundColor: ["#22c55e", "#eab308", "#ef4444", "#7f1d1d", "#94a3b8"],
      },
    ],
  };

  const timelineChart = {
    labels: Object.keys(timeline),
    datasets: [
      {
        label: "Incidents",
        data: Object.values(timeline),
        borderColor: "#2F8F8C",
        backgroundColor: "rgba(13, 148, 136, 0.25)",
      },
    ],
  };

  const companyChart = {
    labels: Object.keys(companyCounts),
    datasets: [
      {
        label: "Incidents",
        data: Object.values(companyCounts),
        backgroundColor: "#247A78",
      },
    ],
  };

  return {
    typeChart,
    severityChart,
    timelineChart,
    companyChart,
    isEmpty: rows.length === 0,
  };
}
