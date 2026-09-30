import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi, getApiErrorMessage, type AdminOrgFilters } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { ModuleCode, OrgStatus } from "../../types/api";
import { MODULE_META } from "../../types/api";

function displayLifecycle(org: {
  status: OrgStatus;
  isTrialActive: boolean;
  subscription: { status: string } | null;
}): string {
  if (org.status === "suspended") return "suspended";
  if (org.isTrialActive || org.subscription?.status === "trialing") return "trial";
  if (org.subscription?.status === "active") return "active";
  return org.status;
}

export function AdminOrgList() {
  const [filters, setFilters] = useState<AdminOrgFilters>({ take: 100 });

  const query = useQuery({
    queryKey: ["admin-orgs", filters],
    queryFn: async () => {
      const { data } = await adminApi.listOrganizations(filters);
      return data;
    },
  });

  const rows = query.data?.items ?? [];

  const filterBar = useMemo(
    () => (
      <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="text-sm">
          <span className="mb-1 block text-white/60">Lifecycle</span>
          <select
            className="rounded-lg border border-white/15 bg-[#0c1210] px-3 py-2"
            value={filters.lifecycle ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                lifecycle: (e.target.value || undefined) as AdminOrgFilters["lifecycle"],
              }))
            }
          >
            <option value="">All</option>
            <option value="trial">Trial</option>
            <option value="active">Active (paid)</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-white/60">Org status</span>
          <select
            className="rounded-lg border border-white/15 bg-[#0c1210] px-3 py-2"
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: (e.target.value || undefined) as OrgStatus | undefined,
              }))
            }
          >
            <option value="">All</option>
            <option value="active">active</option>
            <option value="suspended">suspended</option>
            <option value="closed">closed</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-white/60">Module enabled</span>
          <select
            className="rounded-lg border border-white/15 bg-[#0c1210] px-3 py-2"
            value={filters.module ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                module: (e.target.value || undefined) as ModuleCode | undefined,
                moduleEnabled: e.target.value ? true : undefined,
              }))
            }
          >
            <option value="">Any</option>
            <option value="vericore">VeriCore</option>
            <option value="veripm">VeriPM</option>
            <option value="verihub">VeriHub</option>
          </select>
        </label>
      </div>
    ),
    [filters],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Organizations</h1>
        <p className="mt-1 text-white/60">
          {query.data ? `${query.data.total} total` : "Manage tenants, trials, and modules"}
        </p>
      </div>

      {filterBar}

      {query.isLoading && <p className="text-white/60">Loading…</p>}
      {query.error && (
        <p className="text-red-300">{getApiErrorMessage(query.error)}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Billing</th>
              <th className="px-4 py-3 font-medium">Trial</th>
              <th className="px-4 py-3 font-medium">Modules</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((org) => {
              const enabled = org.modules
                .filter((m) => m.enabled)
                .map((m) => MODULE_META[m.module.code as ModuleCode]?.label ?? m.module.code);
              return (
                <tr key={org.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/organizations/${org.id}`}
                      className="font-semibold text-emerald-300 hover:underline"
                    >
                      {org.name}
                    </Link>
                    <p className="text-xs text-white/40">{org.slug}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <StatusPill value={displayLifecycle(org)} />
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {org.defaultBillingCycle}
                    {org.subscription ? (
                      <span className="block text-xs text-white/40">{org.subscription.status}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/70">
                    <div>{org.isTrialActive ? "active" : "inactive"}</div>
                    <div>
                      {formatDate(org.trialStart)} → {formatDate(org.trialEnd)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/80">
                    {enabled.length ? enabled.join(", ") : "—"}
                  </td>
                </tr>
              );
            })}
            {!query.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                  No organizations match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const tone =
    value === "trial"
      ? "bg-amber-500/20 text-amber-200"
      : value === "active"
        ? "bg-emerald-500/20 text-emerald-200"
        : value === "suspended"
          ? "bg-red-500/20 text-red-200"
          : "bg-white/10 text-white/70";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tone}`}>
      {value}
    </span>
  );
}
