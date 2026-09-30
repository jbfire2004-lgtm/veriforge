import { useMemo, useState } from "react";
import { useWorkers } from "../hooks/use-workers";
import { WorkerTable } from "../components/worker-table";
import { LifecycleState } from "../types";
import { StatCard } from "../components/stat-card";

const stateOptions: Array<LifecycleState | "all"> = [
  "all",
  "active",
  "inactive",
  "expired",
  "missing_docs",
  "not_seen",
];

export function WorkerDashboardPage() {
  const [stateFilter, setStateFilter] = useState<LifecycleState | "all">("all");
  const { data, isLoading, isError } = useWorkers(
    stateFilter === "all" ? undefined : { lifecycleState: stateFilter },
  );

  const counts = useMemo(() => {
    const items = data ?? [];
    return {
      active: items.filter((w) => w.lifecycleState === "active").length,
      inactive: items.filter((w) => w.lifecycleState === "inactive").length,
      expired: items.filter((w) => w.lifecycleState === "expired").length,
      missing_docs: items.filter((w) => w.lifecycleState === "missing_docs").length,
      not_seen: items.filter((w) => w.lifecycleState === "not_seen").length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold">Worker Lifecycle Dashboard</h1>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as LifecycleState | "all")}
          className="rounded-md border bg-white px-3 py-2 text-sm"
        >
          {stateOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All States" : option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Active" value={counts.active} tone="green" />
        <StatCard label="Inactive" value={counts.inactive} tone="slate" />
        <StatCard label="Expired" value={counts.expired} tone="red" />
        <StatCard label="Missing Docs" value={counts.missing_docs} tone="yellow" />
        <StatCard label="Not Seen" value={counts.not_seen} tone="orange" />
      </div>

      {isLoading && <p className="rounded border bg-white p-4">Loading workers...</p>}
      {isError && <p className="rounded border bg-white p-4 text-red-600">Failed to load workers.</p>}
      {data && <WorkerTable workers={data} />}
    </div>
  );
}
