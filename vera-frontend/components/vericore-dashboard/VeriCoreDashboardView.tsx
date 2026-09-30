"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  emitDashboardEvent,
  fetchCompanyDashboard,
  fetchContractorDetail,
  fetchDrill,
  fetchDashboardRevision,
  fetchProjectDashboard,
  refreshDashboard,
} from "@/lib/vericore-dashboard";
import type {
  DrillResponse,
  Metric,
  RoleBand,
  VeriCoreCompanyDashboard,
  VeriCoreProjectDashboard,
} from "@/lib/vericore-dashboard/types";
import { VeriCoreMetricCard } from "@/components/vericore-dashboard/VeriCoreMetricCard";
import { VeriCoreDrillSheet } from "@/components/vericore-dashboard/VeriCoreDrillSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  companyId?: number;
  initialProjectId?: number | null;
  initialContractorId?: number | null;
};

function gradeClass(grade: string) {
  if (grade === "A") return "border-[#4FAF6F]/50 bg-[#E8F6EE] text-[#2A2E33]";
  if (grade === "B") return "border-[#1E6FB8]/40 bg-[#E8F1F8] text-[#2A2E33]";
  if (grade === "C") return "border-[#C89F3D]/50 bg-[#FBF8F0] text-[#2A2E33]";
  return "border-[#B33A3A]/40 bg-[#F8ECEC] text-[#2A2E33]";
}

export function VeriCoreDashboardView({
  companyId = 1,
  initialProjectId = null,
  initialContractorId = null,
}: Props) {
  const [projectId, setProjectId] = useState<number | null>(initialProjectId);
  const [locationId, setLocationId] = useState<string>("");
  const [roleBand, setRoleBand] = useState<RoleBand | "">("");
  const [dash, setDash] = useState<VeriCoreCompanyDashboard | VeriCoreProjectDashboard | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drill, setDrill] = useState<DrillResponse | null>(null);
  const [drillKey, setDrillKey] = useState<string | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [contractorDetail, setContractorDetail] = useState<Awaited<
    ReturnType<typeof fetchContractorDetail>
  > | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = {
        companyId,
        locationId: locationId || undefined,
        roleBand: (roleBand || undefined) as RoleBand | undefined,
      };
      const data = projectId
        ? await fetchProjectDashboard(projectId, q)
        : await fetchCompanyDashboard(q);
      setDash(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      setDash(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, locationId, roleBand]);

  useEffect(() => {
    void load();
  }, [load]);

  // Poll revision for smart updates
  useEffect(() => {
    const id = window.setInterval(() => {
      void (async () => {
        try {
          const rev = await fetchDashboardRevision(companyId, projectId ?? undefined);
          setDash((prev) => {
            if (!prev) return prev;
            if (rev.revision > prev.revision || rev.pendingInvalidation) {
              void load();
            }
            return prev;
          });
        } catch {
          /* ignore poll errors */
        }
      })();
    }, 25000);
    return () => window.clearInterval(id);
  }, [companyId, projectId, load]);

  useEffect(() => {
    if (initialContractorId) {
      void fetchContractorDetail(initialContractorId)
        .then(setContractorDetail)
        .catch(() => setContractorDetail(null));
    }
  }, [initialContractorId]);

  async function openDrill(metric: Metric) {
    setDrillKey(metric.key);
    setDrillLoading(true);
    try {
      const data = await fetchDrill(metric.key, {
        locationId: locationId || undefined,
        roleBand: (roleBand || undefined) as RoleBand | undefined,
        projectId: projectId ?? undefined,
      });
      setDrill(data);
    } catch {
      setDrill(null);
    } finally {
      setDrillLoading(false);
    }
  }

  async function reloadDrill(nextLoc?: string, nextRole?: string) {
    if (!drillKey) return;
    setDrillLoading(true);
    try {
      const data = await fetchDrill(drillKey, {
        locationId: (nextLoc ?? locationId) || undefined,
        roleBand: ((nextRole ?? roleBand) || undefined) as RoleBand | undefined,
        projectId: projectId ?? undefined,
      });
      setDrill(data);
    } finally {
      setDrillLoading(false);
    }
  }

  const projectDash = dash && "combined" in dash ? dash : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-[#5A6169]/25 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
            VERICore · Safety / SMS
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2A2E33]">
            VERICore Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#5a6b7c]">
            Company training, safety performance, contractor program scores, and project rollups —
            with industry comparison and drill-down on every metric.
          </p>
          {dash ? (
            <p className="mt-2 text-xs text-[#8A9199]">
              Rev {dash.revision} · rebuilt {new Date(dash.freshness.lastRebuildAt).toLocaleString()}
              {dash.freshness.pendingInvalidation ? " · updating…" : " · live"}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-[3px] border border-[#5A6169] bg-white px-2 text-sm"
            value={projectId ?? ""}
            onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Company view</option>
            <option value="1">Project: Aurora North</option>
            <option value="2">Project: South Gate</option>
          </select>
          <select
            className="h-9 rounded-[3px] border border-[#5A6169] bg-white px-2 text-sm"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">All locations</option>
            <option value="loc-north">North Yard</option>
            <option value="loc-south">South Gate</option>
            <option value="loc-hq">HQ Office</option>
          </select>
          <select
            className="h-9 rounded-[3px] border border-[#5A6169] bg-white px-2 text-sm"
            value={roleBand}
            onChange={(e) => setRoleBand(e.target.value as RoleBand | "")}
          >
            <option value="">All roles</option>
            <option value="field">Field</option>
            <option value="supervisor">Supervisor</option>
            <option value="office">Office</option>
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void refreshDashboard(companyId, projectId ?? undefined).then(load)}
          >
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              void emitDashboardEvent("training.completed").then((d) => setDash(d))
            }
          >
            Simulate training
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              void emitDashboardEvent("document.flha.completed").then((d) => setDash(d))
            }
          >
            Simulate FLHA
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[3px] border border-[#C89F3D]/50 bg-[#FBF8F0] px-4 py-3 text-sm text-[#2A2E33]">
          {error}
          <Button type="button" size="sm" variant="outline" className="ml-3" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading && !dash ? <Skeleton className="h-40 w-full rounded-[3px]" /> : null}

      {dash ? (
        <>
          {/* Training */}
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#2A2E33]">
                Company training snapshot
              </h2>
              <p className="mt-1 text-sm text-[#5a6b7c]">
                Compliance vs industry mean {dash.training.industry.industryMean}% ·{" "}
                {dash.training.industry.percentileRank}th percentile (n=
                {dash.training.industry.cohortSize})
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <VeriCoreMetricCard
                metric={dash.training.compliantPct}
                onOpen={openDrill}
                tone="teal"
              />
              <VeriCoreMetricCard
                metric={dash.training.overduePct}
                onOpen={openDrill}
                tone="amber"
              />
              <div className="rounded-[3px] border border-[#5A6169]/40 bg-white p-4 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
                  By role
                </p>
                <ul className="mt-3 space-y-2">
                  {dash.training.byRole.map((r) => (
                    <li key={r.roleBand} className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        className="capitalize text-[#1E6FB8] hover:underline"
                        onClick={() => {
                          setRoleBand(r.roleBand);
                          void openDrill(dash.training.overduePct);
                        }}
                      >
                        {r.roleBand} ({r.headcount})
                      </button>
                      <span className="tabular-nums text-[#2A2E33]">
                        {r.compliantPct}% compliant · {r.overduePct}% overdue
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="overflow-auto rounded-[3px] border border-[#5A6169]/40">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#F0F3F5] text-[11px] uppercase tracking-[0.06em] text-[#5a6b7c]">
                  <tr>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Headcount</th>
                    <th className="px-3 py-2">Compliant</th>
                    <th className="px-3 py-2">Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.training.byLocation.map((loc) => (
                    <tr key={loc.locationId} className="border-t border-[#5A6169]/25">
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="text-[#1E6FB8] hover:underline"
                          onClick={() => {
                            setLocationId(loc.locationId);
                            void openDrill(dash.training.overduePct);
                          }}
                        >
                          {loc.locationName}
                        </button>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{loc.headcount}</td>
                      <td className="px-3 py-2 tabular-nums">{loc.compliantPct}%</td>
                      <td className="px-3 py-2 tabular-nums">{loc.overduePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Safety */}
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#2A2E33]">
                Safety performance snapshot
              </h2>
              <p className="mt-1 text-sm text-[#5a6b7c]">
                Industry compare on incident, near miss, and CAPA closure — click any card for
                documents + formula.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <VeriCoreMetricCard metric={dash.safety.flhaCompleted} onOpen={openDrill} />
              <VeriCoreMetricCard metric={dash.safety.jhaCompleted} onOpen={openDrill} />
              <VeriCoreMetricCard metric={dash.safety.highRiskFlha} onOpen={openDrill} tone="amber" />
              <VeriCoreMetricCard metric={dash.safety.flhaJhaPer1k} onOpen={openDrill} />
              <VeriCoreMetricCard metric={dash.safety.incidentRate} onOpen={openDrill} />
              <VeriCoreMetricCard metric={dash.safety.nearMissRate} onOpen={openDrill} tone="teal" />
              <VeriCoreMetricCard metric={dash.safety.capaClosureDays} onOpen={openDrill} />
              <VeriCoreMetricCard
                metric={dash.safety.toolboxTalks}
                onOpen={openDrill}
                tone="teal"
              />
              <VeriCoreMetricCard
                metric={dash.safety.permitsProtected}
                onOpen={openDrill}
              />
              <VeriCoreMetricCard
                metric={dash.safety.permitsHighRisk}
                onOpen={openDrill}
                tone="amber"
              />
            </div>
          </section>

          {/* Project combined */}
          {projectDash ? (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#2A2E33]">
                Project combined safety snapshot
              </h2>
              <div className="grid gap-3 md:grid-cols-3">
                {(
                  [
                    ["Company workers", projectDash.combined.companyWorkers],
                    ["Contractors", projectDash.combined.contractors],
                    ["Rollup", projectDash.combined.rollup],
                  ] as const
                ).map(([label, slice]) => (
                  <div
                    key={label}
                    className="rounded-[3px] border border-[#5A6169]/40 bg-white p-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
                      {label}
                    </p>
                    <dl className="mt-3 space-y-1 text-sm text-[#2A2E33]">
                      <div className="flex justify-between">
                        <dt>Hours</dt>
                        <dd className="tabular-nums">{slice.workHours.toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Training</dt>
                        <dd className="tabular-nums">{slice.trainingCompliantPct}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Incident rate</dt>
                        <dd className="tabular-nums">{slice.incidentRate ?? "—"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>High-risk FLHA/JHA</dt>
                        <dd className="tabular-nums">{slice.highRiskFlhaCount}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#5a6b7c]">
                  Related companies
                </h3>
                <div className="overflow-auto rounded-[3px] border border-[#5A6169]/40">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#F0F3F5] text-[11px] uppercase tracking-[0.06em] text-[#5a6b7c]">
                      <tr>
                        <th className="px-3 py-2">Company</th>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Training</th>
                        <th className="px-3 py-2">Incident</th>
                        <th className="px-3 py-2">Program</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectDash.relatedCompanies.map((c) => (
                        <tr key={`${c.companyId}-${c.linkRole}`} className="border-t border-[#5A6169]/25">
                          <td className="px-3 py-2">
                            <Link href={c.href} className="font-medium text-[#1E6FB8] hover:underline">
                              {c.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2 capitalize">{c.linkRole}</td>
                          <td className="px-3 py-2 tabular-nums">
                            {c.trainingCompliantPct != null ? `${c.trainingCompliantPct}%` : "—"}
                          </td>
                          <td className="px-3 py-2 tabular-nums">{c.incidentRate ?? "—"}</td>
                          <td className="px-3 py-2">
                            {c.programScore != null ? (
                              <span
                                className={`inline-flex rounded-[3px] border px-2 py-0.5 text-xs font-semibold ${gradeClass(c.grade ?? "C")}`}
                              >
                                {c.programScore} {c.grade}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}

          {/* Contractors */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#2A2E33]">
                  Contractors
                </h2>
                <p className="mt-1 text-sm text-[#5a6b7c]">
                  ISNetworld-style program scores with incident, training, and FLHA/JHA completion.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  void openDrill({
                    key: "contractor.program_score",
                    label: "Contractor program score",
                    value: null,
                    unit: "score",
                    formula: "Σ (pillar × weight)",
                    formulaId: "css.overall.v1",
                    inputs: {},
                    asOf: new Date().toISOString(),
                    hoursBasis: "unavailable",
                  })
                }
              >
                Drill all contractors
              </Button>
            </div>
            <div className="overflow-auto rounded-[3px] border border-[#5A6169]/40">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#F0F3F5] text-[11px] uppercase tracking-[0.06em] text-[#5a6b7c]">
                  <tr>
                    <th className="px-3 py-2">Contractor</th>
                    <th className="px-3 py-2">Program score</th>
                    <th className="px-3 py-2">Incident rate</th>
                    <th className="px-3 py-2">Training</th>
                    <th className="px-3 py-2">FLHA/JHA</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.contractors.map((c) => (
                    <tr key={c.contractorCompanyId} className="border-t border-[#5A6169]/25">
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            className="text-left font-medium text-[#1E6FB8] hover:underline"
                            onClick={() =>
                              void fetchContractorDetail(c.contractorCompanyId).then(
                                setContractorDetail,
                              )
                            }
                          >
                            {c.name}
                          </button>
                          <Link
                            href={`/core/contractor-scores?contractorCompanyId=${c.contractorCompanyId}`}
                            className="text-[11px] text-[#5a6b7c] hover:text-[#1E6FB8] hover:underline"
                          >
                            Full CSS profile
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-[3px] border px-2 py-0.5 text-xs font-semibold ${gradeClass(c.grade)}`}
                        >
                          {c.programScore} {c.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{c.incidentRate ?? "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{c.trainingCompliantPct}%</td>
                      <td className="px-3 py-2 tabular-nums">{c.flhaJhaCompletionPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Projects list (company view) */}
          {!projectDash ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#2A2E33]">
                Projects
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {dash.projectsSummary.map((p) => (
                  <button
                    key={p.projectId}
                    type="button"
                    onClick={() => setProjectId(p.projectId)}
                    className="rounded-[3px] border border-[#5A6169]/40 bg-white p-4 text-left hover:border-[#1E6FB8]"
                  >
                    <p className="font-medium text-[#2A2E33]">{p.name}</p>
                    <p className="mt-1 text-xs text-[#5a6b7c]">
                      Alert {p.alertScore} · Training {p.trainingCompliantPct}% · Incident{" "}
                      {p.incidentRate ?? "—"} · {p.contractorCount} contractors
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {contractorDetail ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-[3px] border border-[#5A6169]/40 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
                  Contractor profile
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#2A2E33]">
                  {contractorDetail.name}
                </h3>
                <p className="mt-1 text-sm text-[#5a6b7c]">
                  {contractorDetail.formula.label}: {contractorDetail.formula.formula}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => setContractorDetail(null)}>
                Close
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span
                className={`inline-flex rounded-[3px] border px-3 py-1 text-sm font-semibold ${gradeClass(contractorDetail.grade)}`}
              >
                {contractorDetail.programScore} {contractorDetail.grade}
              </span>
              <span className="text-xs text-[#5a6b7c]">
                Incident {contractorDetail.incidentRate} · Training{" "}
                {contractorDetail.trainingCompliantPct}% · FLHA/JHA{" "}
                {contractorDetail.flhaJhaCompletionPct}%
              </span>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(contractorDetail.pillars).map(([k, v]) => (
                <li
                  key={k}
                  className="rounded-[3px] border border-[#5A6169]/30 bg-[#F7FAFC] px-3 py-2"
                >
                  <span className="text-xs capitalize text-[#5a6b7c]">
                    {k.replace(/([A-Z])/g, " $1")}
                  </span>
                  <p className="font-semibold tabular-nums text-[#2A2E33]">{v}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5a6b7c]">
                Documents
              </p>
              <ul className="mt-2 divide-y divide-[#5A6169]/25 rounded-[3px] border border-[#5A6169]/30">
                {contractorDetail.documents.map((d) => (
                  <li key={d.id} className="flex justify-between px-3 py-2 text-sm">
                    <span>
                      {d.title}{" "}
                      <span className="text-xs text-[#8A9199]">({d.type})</span>
                    </span>
                    <Link href={d.href} className="text-[#1E6FB8] hover:underline">
                      Open
                    </Link>
                  </li>
                ))}
                {contractorDetail.documents.length === 0 ? (
                  <li className="px-3 py-4 text-sm text-[#5a6b7c]">No linked documents in preview.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <VeriCoreDrillSheet
        drill={drill}
        loading={drillLoading}
        onClose={() => {
          setDrill(null);
          setDrillKey(null);
        }}
        locationId={locationId}
        roleBand={roleBand}
        onLocationChange={(v) => {
          setLocationId(v);
          void reloadDrill(v, roleBand);
        }}
        onRoleChange={(v) => {
          setRoleBand(v as RoleBand | "");
          void reloadDrill(locationId, v);
        }}
      />
    </div>
  );
}
