"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  VsDashboardShell,
  VsSection,
  KpiTile,
} from "@/components/verisuite-intelligence-ui";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";
import {
  fetchSmsMonitoringOverview,
  type SmsMonitoringOverview,
  type SmsPlane,
} from "@/lib/verisuite-sms-api";

const HEALTH_COLOR: Record<string, string> = {
  healthy: VS_COLORS.emerald,
  watch: VS_COLORS.orange,
  critical: VS_COLORS.critical,
  unknown: "#64748B",
};

export function SmsPostLaunchOpsView({
  companyId = 1,
  projectId,
  plane = "company",
}: {
  companyId?: number;
  projectId?: number;
  plane?: SmsPlane;
}) {
  const [data, setData] = useState<SmsMonitoringOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSmsMonitoringOverview({ companyId, projectId, plane, days: 30 })
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load monitoring");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, projectId, plane]);

  const ai = data?.aiPerformance;
  const compliance = data?.compliance;

  return (
    <VsDashboardShell
      eyebrow="VeriSuite SMS · Post-launch ops"
      title="Monitoring & release cycle"
      description="AI decisions, incident trends, inspections, FLHA/JHA/ERP quality, competency risk, benchmarking — plus monthly / quarterly / annual release tracks."
      meta={`${plane} · ${data?.windowDays ?? 30}d window · design ${data?.designLock?.version ?? "—"}`}
    >
      <VsSection band="controls" label="Ops links">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/pm/sms-dashboards" style={{ color: VS_COLORS.blue }}>
            Assembled dashboards →
          </Link>
          <Link href="/pm" style={{ color: VS_COLORS.blue }}>
            Home hub →
          </Link>
          <Link href="/pm/sms" style={{ color: VS_COLORS.blue }}>
            SMS Core →
          </Link>
        </div>
      </VsSection>

      <VsSection band="kpi" label="AI performance">
        {loading ? (
          <p className="text-sm opacity-70">Loading monitoring…</p>
        ) : error ? (
          <p className="text-sm" style={{ color: VS_COLORS.critical }}>
            {error}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile label="AI decisions" value={String(ai?.total ?? 0)} />
            <KpiTile
              label="Accept rate"
              value={
                ai?.acceptRate != null
                  ? `${Math.round(ai.acceptRate * 100)}%`
                  : "—"
              }
            />
            <KpiTile label="Accepted" value={String(ai?.accepted ?? 0)} />
            <KpiTile label="Dismissed" value={String(ai?.dismissed ?? 0)} />
          </div>
        )}
      </VsSection>

      <VsSection band="trend" label="Compliance posture">
        {compliance ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: VS_COLORS.white }}>
              Overall: {compliance.overall}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {compliance.checks.map((c) => (
                <li
                  key={c.id}
                  className="rounded border px-3 py-2 text-xs"
                  style={{
                    borderColor: c.ok ? VS_COLORS.emerald : VS_COLORS.critical,
                  }}
                >
                  <span className="font-medium">{c.id}</span>
                  <span className="opacity-80"> — {c.detail}</span>
                  <span className="float-right">{c.ok ? "OK" : "FAIL"}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </VsSection>

      <VsSection band="detail" label="Monitoring domains">
        <div className="grid gap-3 md:grid-cols-2">
          {(data?.domains ?? []).map((d) => (
            <div
              key={d.id}
              className="rounded border p-3"
              style={{
                borderColor: HEALTH_COLOR[d.health] ?? VS_COLORS.slate,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-sm font-semibold"
                  style={{ color: VS_COLORS.white }}
                >
                  {d.name}
                </p>
                <span
                  className="text-xs uppercase tracking-wide"
                  style={{ color: HEALTH_COLOR[d.health] }}
                >
                  {d.health}
                </span>
              </div>
              <p className="mt-1 text-xs opacity-80">{d.summary}</p>
              <p className="mt-2 text-[10px] opacity-60">
                {d.behaviors.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </VsSection>

      <VsSection band="narrative" label="Release cycle">
        <div className="grid gap-3 lg:grid-cols-2">
          {(data?.releaseCycle?.tracks ?? []).map((t) => (
            <div
              key={t.id}
              className="rounded border border-white/10 p-3 text-xs"
            >
              <p
                className="text-sm font-semibold"
                style={{ color: VS_COLORS.blue }}
              >
                {t.name}
              </p>
              <p className="mt-1 opacity-70">{t.interval}</p>
              <p className="mt-2 opacity-90">{t.purpose}</p>
              <p className="mt-2 opacity-60">
                Exit: {t.exitCriteria.slice(0, 2).join(" · ")}
              </p>
            </div>
          ))}
        </div>
        {data?.releaseCycle?.calendar ? (
          <p className="mt-4 text-xs opacity-70">
            Continuous AI tuning:{" "}
            {data.releaseCycle.calendar.continuousAiTuning.cadence}. Annual UI:{" "}
            {data.releaseCycle.calendar.annualUi.window}.
          </p>
        ) : null}
      </VsSection>
    </VsDashboardShell>
  );
}
