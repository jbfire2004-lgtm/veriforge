import { useMemo } from "react";
import { useWorkers } from "../hooks/use-workers";
import { LifecycleState } from "../types";

type CompanyGroup = {
  companyId: string;
  total: number;
  counts: Record<LifecycleState, number>;
};

export function CompanyDashboardPage() {
  const { data, isLoading, isError } = useWorkers();

  const groups = useMemo<CompanyGroup[]>(() => {
    const map = new Map<string, CompanyGroup>();

    for (const worker of data ?? []) {
      const existing =
        map.get(worker.companyId) ??
        ({
          companyId: worker.companyId,
          total: 0,
          counts: {
            active: 0,
            inactive: 0,
            expired: 0,
            missing_docs: 0,
            not_seen: 0,
          },
        } as CompanyGroup);

      existing.total += 1;
      existing.counts[worker.lifecycleState] += 1;
      map.set(worker.companyId, existing);
    }

    return [...map.values()].sort((a, b) => a.companyId.localeCompare(b.companyId));
  }, [data]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Company Worker Dashboard</h1>
      {isLoading && <p className="rounded border bg-white p-4">Loading...</p>}
      {isError && <p className="rounded border bg-white p-4 text-red-600">Failed to load company stats.</p>}
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.companyId} className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{group.companyId}</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-sm">Total: {group.total}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
              <div className="rounded bg-green-50 p-2 text-green-700">Active: {group.counts.active}</div>
              <div className="rounded bg-slate-100 p-2 text-slate-700">Inactive: {group.counts.inactive}</div>
              <div className="rounded bg-red-50 p-2 text-red-700">Expired: {group.counts.expired}</div>
              <div className="rounded bg-yellow-50 p-2 text-yellow-700">
                Missing Docs: {group.counts.missing_docs}
              </div>
              <div className="rounded bg-orange-50 p-2 text-orange-700">
                Not Seen: {group.counts.not_seen}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
