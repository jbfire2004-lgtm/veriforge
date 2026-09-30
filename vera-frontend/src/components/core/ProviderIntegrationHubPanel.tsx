"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plug,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  fetchProviderIntegrationHubSummary,
  type ProviderIntegrationHubSummary,
} from "@/lib/core/vera-core-platform";
import { getCompaniesReadinessList } from "@/lib/api/reporting";
import {
  CompanySelectField,
  type CompanyOption,
} from "@/src/components/core/CompanySelectField";
import { Button } from "@/components/ui/button";

function resolveInitialCompanyId(
  companies: CompanyOption[],
  fromQuery?: string | null,
): string {
  if (fromQuery && /^\d+$/.test(fromQuery)) return fromQuery;
  if (companies.length === 1) return String(companies[0]!.id);
  return "";
}

function channelStatusStyles(status: "healthy" | "degraded" | "offline") {
  if (status === "healthy") {
    return {
      icon: CheckCircle2,
      badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
      label: "Healthy",
    };
  }
  if (status === "degraded") {
    return {
      icon: AlertTriangle,
      badge: "bg-amber-50 text-amber-800 ring-amber-200",
      label: "Degraded",
    };
  }
  return {
    icon: XCircle,
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    label: "Offline",
  };
}

export function ProviderIntegrationHubPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [data, setData] = useState<ProviderIntegrationHubSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCompaniesReadinessList()
      .then((res) => {
        const rows = (res.rows ?? []).map((row) => ({
          id: row.companyId,
          name: row.companyName,
        }));
        setCompanies(rows);
        setCompanyId(
          (current) =>
            current || resolveInitialCompanyId(rows, searchParams?.get("companyId")),
        );
      })
      .catch(() => setCompanies([]));
  }, [searchParams]);

  const loadSummary = useCallback(async () => {
    const cid = Number(companyId);
    if (!Number.isFinite(cid) || cid <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const summary = await fetchProviderIntegrationHubSummary(cid);
      setData(summary);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Failed to load provider hub summary.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) void loadSummary();
  }, [companyId, loadSummary]);

  const onCompanyChange = (next: string) => {
    setCompanyId(next);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next) params.set("companyId", next);
    else params.delete("companyId");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6" data-testid="provider-integration-hub">
      <div className="flex flex-wrap items-end gap-3">
        <CompanySelectField
          companies={companies}
          value={companyId}
          onChange={onCompanyChange}
          label="Company"
        />
        <Button type="button" variant="outline" onClick={() => void loadSummary()} disabled={loading}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading && !data ? (
        <p className="text-sm text-slate-500">Loading provider integration hub…</p>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Active providers" value={data.metrics.providersActive} />
            <MetricCard
              label="Pending approval"
              value={data.metrics.providersPendingApproval}
            />
            <MetricCard
              label="Ingestion success (90d)"
              value={`${data.metrics.ingestionSuccessRate90d}%`}
            />
            <MetricCard
              label="Records from providers (90d)"
              value={data.metrics.recordsFromProviders90d}
            />
            <MetricCard
              label="Validation failures (90d)"
              value={data.metrics.validationFailures90d}
            />
            <MetricCard
              label="Pending verification"
              value={data.metrics.pendingVerification}
            />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Plug className="h-5 w-5 text-teal-600" aria-hidden />
              Integration channels
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {data.channels.map((channel) => {
                const style = channelStatusStyles(channel.status);
                const Icon = style.icon;
                return (
                  <div
                    key={channel.key}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{channel.label}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Last activity:{" "}
                          {channel.lastActivityAt
                            ? new Date(channel.lastActivityAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Pending: {channel.pendingCount} · Failed (24h): {channel.failedCount24h}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Training providers</h2>
            {data.providers.length === 0 ? (
              <p className="text-sm text-slate-500">No active training providers found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Provider</th>
                      <th className="px-4 py-2">Approval</th>
                      <th className="px-4 py-2">Compliance</th>
                      <th className="px-4 py-2">Records (90d)</th>
                      <th className="px-4 py-2">Last record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.providers.map((provider) => (
                      <tr key={provider.id}>
                        <td className="px-4 py-2 font-medium text-slate-900">
                          {provider.name}
                          {provider.code ? (
                            <span className="ml-1 text-xs text-slate-500">({provider.code})</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-2">{provider.approvalStatus}</td>
                        <td className="px-4 py-2">{provider.complianceStatus ?? "—"}</td>
                        <td className="px-4 py-2">{provider.recordCount90d}</td>
                        <td className="px-4 py-2 text-slate-600">
                          {provider.lastRecordAt
                            ? new Date(provider.lastRecordAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent ingestion</h2>
              {data.recentIngestion.length === 0 ? (
                <p className="text-sm text-slate-500">No ingestion runs in the last 90 days.</p>
              ) : (
                <ul className="divide-y rounded-xl border border-slate-200 bg-white">
                  {data.recentIngestion.map((run) => (
                    <li key={run.id} className="px-4 py-3 text-sm">
                      <p className="font-medium text-slate-900">
                        {run.originalFilename} · {run.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        {run.sourceChannel} · {run.recordsCreated} records ·{" "}
                        {new Date(run.createdAt).toLocaleString()}
                      </p>
                      {run.errorMessage ? (
                        <p className="mt-1 text-xs text-red-700">{run.errorMessage}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-slate-500">
                <Link href="/core/verification" className="text-teal-700 hover:underline">
                  Open verification hub
                </Link>
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Validation failures
              </h2>
              {data.recentValidationFailures.length === 0 ? (
                <p className="text-sm text-slate-500">No validation failures in the last 90 days.</p>
              ) : (
                <ul className="divide-y rounded-xl border border-slate-200 bg-white">
                  {data.recentValidationFailures.map((row) => (
                    <li key={row.id} className="px-4 py-3 text-sm">
                      <p className="font-medium text-slate-900">
                        {row.outcome} · {row.subjectType}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(row.validatedAt).toLocaleString()}
                        {row.trainingRecordId
                          ? ` · Record #${row.trainingRecordId}`
                          : ""}
                      </p>
                      {row.missingStandardCodes.length > 0 ? (
                        <p className="mt-1 text-xs text-amber-800">
                          Missing: {row.missingStandardCodes.join(", ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Activity className="h-4 w-4 text-teal-600" aria-hidden />
              Event flow
            </h2>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {data.eventFlow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-slate-500">
              Generated {new Date(data.generatedAt).toLocaleString()}
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
