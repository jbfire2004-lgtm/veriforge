"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import {
  AnvilIcon,
  ForgeBoltIcon,
  HeatEdgeIcon,
  ShieldGridIcon,
  IconEmergencyAlert,
  IconIncidentSeverity,
  IconCultureEngagement,
  IconEquipmentInspection,
  IconComplianceDocument,
  IconRiskHazard,
  IconEmergencyMuster,
  IconRiskScoring,
} from "./icons";

export type RegionCode =
  | "NA-EAST"
  | "NA-WEST"
  | "EU-CENTRAL"
  | "EU-WEST"
  | "APAC"
  | "LATAM";

export type SiteStatus = "stable" | "watch" | "critical" | "offline";
export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type CommandSiteLocal = {
  id: string;
  name: string;
  region: RegionCode;
  status: SiteStatus;
  readiness: number;
  compliance: number;
  equipmentHealth: number;
  riskScore: number;
  openIncidents: number;
  emergencyActive: boolean;
  musterComplete: number;
  timestamp: string;
};

export type CommandAlertLocal = {
  id: string;
  siteId: string;
  region: RegionCode;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
};

export type CommandIncidentLocal = {
  id: string;
  siteId: string;
  region: RegionCode;
  title: string;
  severity: IncidentSeverity;
  status: "open" | "investigating" | "contained" | "closed";
  timestamp: string;
};

export type CommandAnalyticsSnapshot = {
  totalSites: number;
  criticalSites: number;
  openIncidents: number;
  activeEmergencies: number;
  averageReadiness: number;
  averageCompliance: number;
  averageRisk: number;
  alertCount: number;
  commandHealthScore: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.command-center.analytics";

type PanelKey =
  | "grid"
  | "alerts"
  | "incidents"
  | "workforce"
  | "equipment"
  | "compliance"
  | "risk"
  | "emergency"
  | "kpi";

const PANELS: { key: PanelKey; label: string }[] = [
  { key: "grid", label: "Site Grid" },
  { key: "alerts", label: "Alerts" },
  { key: "incidents", label: "Incidents" },
  { key: "workforce", label: "Workforce" },
  { key: "equipment", label: "Equipment" },
  { key: "compliance", label: "Compliance" },
  { key: "risk", label: "Risk" },
  { key: "emergency", label: "Emergency" },
  { key: "kpi", label: "KPIs" },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const SEED_SITES: CommandSiteLocal[] = [
  { id: "site-alpha", name: "Forge Alpha", region: "NA-EAST", status: "watch", readiness: 78, compliance: 86, equipmentHealth: 72, riskScore: 64, openIncidents: 2, emergencyActive: false, musterComplete: 94, timestamp: new Date().toISOString() },
  { id: "site-bravo", name: "Forge Bravo", region: "NA-WEST", status: "stable", readiness: 91, compliance: 92, equipmentHealth: 88, riskScore: 38, openIncidents: 0, emergencyActive: false, musterComplete: 100, timestamp: new Date().toISOString() },
  { id: "site-charlie", name: "Forge Charlie", region: "EU-CENTRAL", status: "critical", readiness: 62, compliance: 71, equipmentHealth: 58, riskScore: 82, openIncidents: 3, emergencyActive: true, musterComplete: 67, timestamp: new Date().toISOString() },
  { id: "site-delta", name: "Forge Delta", region: "EU-WEST", status: "stable", readiness: 85, compliance: 88, equipmentHealth: 90, riskScore: 42, openIncidents: 1, emergencyActive: false, musterComplete: 98, timestamp: new Date().toISOString() },
  { id: "site-echo", name: "Forge Echo", region: "APAC", status: "critical", readiness: 55, compliance: 64, equipmentHealth: 49, riskScore: 88, openIncidents: 4, emergencyActive: true, musterComplete: 41, timestamp: new Date().toISOString() },
  { id: "site-foxtrot", name: "Forge Foxtrot", region: "LATAM", status: "watch", readiness: 74, compliance: 69, equipmentHealth: 76, riskScore: 58, openIncidents: 1, emergencyActive: false, musterComplete: 82, timestamp: new Date().toISOString() },
];

const SEED_ALERTS: CommandAlertLocal[] = [
  { id: "al-1", siteId: "site-charlie", region: "EU-CENTRAL", title: "EMERGENCY ACTIVE", message: "Confined space atmosphere alarm — muster incomplete", severity: "emergency", timestamp: new Date().toISOString() },
  { id: "al-2", siteId: "site-echo", region: "APAC", title: "CRITICAL INCIDENT CLUSTER", message: "4 open incidents · crane path struck-by risk", severity: "critical", timestamp: new Date().toISOString() },
  { id: "al-3", siteId: "site-alpha", region: "NA-EAST", title: "Equipment overdue", message: "Crane-04 inspection overdue · defect score rising", severity: "warning", timestamp: new Date().toISOString() },
  { id: "al-4", siteId: "site-foxtrot", region: "LATAM", title: "Compliance gap", message: "Document expiry cluster within 10 days", severity: "warning", timestamp: new Date().toISOString() },
  { id: "al-5", siteId: "site-bravo", region: "NA-WEST", title: "Shift readiness nominal", message: "All crews verified · muster 100%", severity: "info", timestamp: new Date().toISOString() },
];

const SEED_INCIDENTS: CommandIncidentLocal[] = [
  { id: "inc-1", siteId: "site-charlie", region: "EU-CENTRAL", title: "Atmosphere excursion · Bay C", severity: "critical", status: "investigating", timestamp: new Date().toISOString() },
  { id: "inc-2", siteId: "site-echo", region: "APAC", title: "Struck-by near miss · Crane path", severity: "high", status: "open", timestamp: new Date().toISOString() },
  { id: "inc-3", siteId: "site-echo", region: "APAC", title: "Hot work permit breach", severity: "critical", status: "contained", timestamp: new Date().toISOString() },
  { id: "inc-4", siteId: "site-alpha", region: "NA-EAST", title: "Trip/fall · Zone 3", severity: "medium", status: "investigating", timestamp: new Date().toISOString() },
  { id: "inc-5", siteId: "site-foxtrot", region: "LATAM", title: "Contractor access mismatch", severity: "low", status: "open", timestamp: new Date().toISOString() },
];

export function computeCommandAnalytics(
  sites: CommandSiteLocal[],
  alerts: CommandAlertLocal[],
  incidents: CommandIncidentLocal[],
): CommandAnalyticsSnapshot {
  const criticalSites = sites.filter((s) => s.status === "critical" || s.emergencyActive).length;
  const openIncidents = incidents.filter((i) => i.status !== "closed").length;
  const activeEmergencies = sites.filter((s) => s.emergencyActive).length;
  const averageReadiness =
    sites.length === 0 ? 0 : clamp(sites.reduce((s, x) => s + x.readiness, 0) / sites.length);
  const averageCompliance =
    sites.length === 0 ? 0 : clamp(sites.reduce((s, x) => s + x.compliance, 0) / sites.length);
  const averageRisk =
    sites.length === 0 ? 0 : clamp(sites.reduce((s, x) => s + x.riskScore, 0) / sites.length);
  const commandHealthScore = clamp(
    100 -
      criticalSites * 10 -
      activeEmergencies * 12 -
      openIncidents * 3 +
      averageReadiness * 0.15 +
      averageCompliance * 0.1,
  );
  return {
    totalSites: sites.length,
    criticalSites,
    openIncidents,
    activeEmergencies,
    averageReadiness,
    averageCompliance,
    averageRisk,
    alertCount: alerts.length,
    commandHealthScore,
    timestamp: new Date().toISOString(),
  };
}

export function persistCommandAnalytics(snapshot: CommandAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:command-center-analytics", { detail: snapshot }),
  );
}

export function readCommandAnalytics(): CommandAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CommandAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useCommandCenterAnalyticsSync(
  fallback: CommandAnalyticsSnapshot = computeCommandAnalytics(
    SEED_SITES,
    SEED_ALERTS,
    SEED_INCIDENTS,
  ),
) {
  const [analytics, setAnalytics] = React.useState<CommandAnalyticsSnapshot>(
    () => readCommandAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as CommandAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<CommandAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:command-center-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:command-center-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function Metric({
  label,
  value,
  critical,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "border px-3 py-2",
        critical
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.25)]"
          : "border-[#424242] bg-[#1f1f1f]",
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">{label}</p>
      <p className="mt-1 font-[var(--vf-font-primary)] text-lg text-[#FAFAFA]">{value}</p>
    </div>
  );
}

function MetaLine({
  siteId,
  region,
  timestamp,
}: {
  siteId: string;
  region: string;
  timestamp: string;
}) {
  return (
    <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-[#6f6f6f]">
      site {siteId} · region {region} · {timestamp.slice(0, 19)}Z
    </p>
  );
}

function StatusChip({ status }: { status: SiteStatus }) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        status === "critical"
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.25)] text-[#ffc9c9]"
          : status === "watch"
            ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.1)] text-[#ffb0b0]"
            : "border-[#424242] bg-[#151515] text-[#9f9f9f]",
      )}
    >
      {status}
    </span>
  );
}

function Sparkline({ series, critical }: { series: number[]; critical?: boolean }) {
  const max = Math.max(...series, 1);
  const points = series
    .map((v, i) => {
      const x = (i / Math.max(1, series.length - 1)) * 100;
      const y = 36 - (v / max) * 32;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" aria-hidden>
      <polyline
        fill="none"
        stroke={critical ? "#1E6FB8" : "#424242"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

function siteName(sites: CommandSiteLocal[], id: string) {
  return sites.find((s) => s.id === id)?.name ?? id;
}

export function VeriForgeMultiSiteCommandCenter() {
  const { push } = useVeriForgeNotifications();
  const [panel, setPanel] = React.useState<PanelKey>("grid");
  const [sites, setSites] = React.useState(SEED_SITES);
  const [alerts, setAlerts] = React.useState(SEED_ALERTS);
  const [incidents, setIncidents] = React.useState(SEED_INCIDENTS);
  const [selectedSiteId, setSelectedSiteId] = React.useState(SEED_SITES[0]?.id ?? null);
  const alertSeq = React.useRef(20);
  const notified = React.useRef<Set<string>>(new Set());

  const analytics = React.useMemo(
    () => computeCommandAnalytics(sites, alerts, incidents),
    [sites, alerts, incidents],
  );

  React.useEffect(() => {
    persistCommandAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const s of sites) {
      if (s.status !== "critical" && !s.emergencyActive) continue;
      const key = `${s.id}-${s.status}-${s.emergencyActive}`;
      if (notified.current.has(key)) continue;
      notified.current.add(key);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL COMMAND CENTER EVENT",
        message: `${s.name} · site ${s.id} · region ${s.region} · ${s.emergencyActive ? "emergency" : s.status}`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Command",
      });
    }
  }, [sites, push]);

  const selected = sites.find((s) => s.id === selectedSiteId) ?? sites[0];

  const refreshSite = (id: string) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const readiness = clamp(s.readiness + Math.floor(Math.random() * 11) - 4);
        const compliance = clamp(s.compliance + Math.floor(Math.random() * 9) - 3);
        const equipmentHealth = clamp(
          s.equipmentHealth + Math.floor(Math.random() * 11) - 4,
        );
        const riskScore = clamp(s.riskScore + Math.floor(Math.random() * 11) - 4);
        const status: SiteStatus =
          s.emergencyActive || riskScore >= 80 || readiness < 60
            ? "critical"
            : riskScore >= 60 || compliance < 75
              ? "watch"
              : "stable";
        return {
          ...s,
          readiness,
          compliance,
          equipmentHealth,
          riskScore,
          status,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  };

  const toggleEmergency = (id: string) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const emergencyActive = !s.emergencyActive;
        const updated = {
          ...s,
          emergencyActive,
          status: (emergencyActive
            ? "critical"
            : s.riskScore >= 60
              ? "watch"
              : "stable") as SiteStatus,
          musterComplete: emergencyActive
            ? clamp(s.musterComplete - 20)
            : clamp(s.musterComplete + 15),
          timestamp: new Date().toISOString(),
        };
        if (emergencyActive) {
          setAlerts((a) => [
            {
              id: `al-${alertSeq.current++}`,
              siteId: updated.id,
              region: updated.region,
              title: "EMERGENCY ACTIVE",
              message: `Emergency coordination opened for ${updated.name}`,
              severity: "emergency" as AlertSeverity,
              timestamp: updated.timestamp,
            },
            ...a,
          ]);
        }
        return updated;
      }),
    );
  };

  const ackAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const escalateIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const severity: IncidentSeverity =
          i.severity === "low"
            ? "medium"
            : i.severity === "medium"
              ? "high"
              : "critical";
        const updated = {
          ...i,
          severity,
          status: "investigating" as const,
          timestamp: new Date().toISOString(),
        };
        setAlerts((a) => [
          {
            id: `al-${alertSeq.current++}`,
            siteId: updated.siteId,
            region: updated.region,
            title: "INCIDENT ESCALATED",
            message: `${updated.title} → ${severity}`,
            severity: (severity === "critical" ? "critical" : "warning") as AlertSeverity,
            timestamp: updated.timestamp,
          },
          ...a,
        ]);
        return updated;
      }),
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Multi-Site Command Center
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Monitor · alert · coordinate · every event stamped with timestamp, siteId,
              and region.
            </p>
          </div>
          <div className="flex gap-2 text-[#1E6FB8]">
            <AnvilIcon />
            <ForgeBoltIcon />
            <ShieldGridIcon />
            <HeatEdgeIcon />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Sites" value={String(analytics.totalSites)} />
          <Metric
            label="Critical"
            value={String(analytics.criticalSites)}
            critical={analytics.criticalSites > 0}
          />
          <Metric
            label="Emergencies"
            value={String(analytics.activeEmergencies)}
            critical={analytics.activeEmergencies > 0}
          />
          <Metric label="Health" value={`${analytics.commandHealthScore}%`} />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label={`Command health · incidents ${analytics.openIncidents} · alerts ${analytics.alertCount}`}
            value={analytics.commandHealthScore}
          />
        </div>
      </VeriForgeFrame>

      <div className="flex flex-wrap gap-2">
        {PANELS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPanel(p.key)}
            className={cn(
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
              panel === p.key
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
                : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 1. Site Grid */}
      {(panel === "grid" || panel === "kpi") && (
        <VeriForgeFrame>
          <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
            1 · Site Grid
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sites.map((s) => {
              const critical = s.status === "critical" || s.emergencyActive;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSiteId(s.id)}
                  className={cn(
                    "border p-4 text-left",
                    "bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_48%,#242424_100%)]",
                    selectedSiteId === s.id || critical
                      ? "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.4)]"
                      : "border-[#424242]",
                    critical && "vf-anim-red-glow-pulse",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                      {s.name}
                    </p>
                    <StatusChip status={s.status} />
                  </div>
                  <p className="mt-1 text-[10px] uppercase text-[#8a8a8a]">{s.region}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] uppercase text-[#9f9f9f]">
                    <span>Ready {s.readiness}%</span>
                    <span>Risk {s.riskScore}</span>
                    <span>Comp {s.compliance}%</span>
                    <span>EQ {s.equipmentHealth}%</span>
                  </div>
                  {s.emergencyActive ? (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#ffc9c9]">
                      Emergency active · muster {s.musterComplete}%
                    </p>
                  ) : null}
                  <MetaLine siteId={s.id} region={s.region} timestamp={s.timestamp} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <VeriForgeButton
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshSite(s.id);
                      }}
                    >
                      Refresh
                    </VeriForgeButton>
                    <VeriForgeButton
                      size="sm"
                      variant={s.emergencyActive ? "secondary" : "warning"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEmergency(s.id);
                      }}
                    >
                      {s.emergencyActive ? "Clear emerg" : "Emergency"}
                    </VeriForgeButton>
                  </div>
                </button>
              );
            })}
          </div>
        </VeriForgeFrame>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 2. Alerts */}
        {(panel === "alerts" || panel === "grid") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconEmergencyAlert tone="critical" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                2 · Global Alert Stream
              </p>
            </div>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {alerts.map((a) => {
                const hot = a.severity === "critical" || a.severity === "emergency";
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "border p-3",
                      hot
                        ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)] shadow-[0_0_12px_rgba(30, 111, 184,.35)]"
                        : a.severity === "warning"
                          ? "border-[#424242] bg-[#1f1f1f]"
                          : "border-[#424242] bg-[#151515]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                        {a.title}
                      </p>
                      <span className="text-[9px] uppercase text-[#8a8a8a]">{a.severity}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#b8b8b8]">{a.message}</p>
                    <MetaLine siteId={a.siteId} region={a.region} timestamp={a.timestamp} />
                    <div className="mt-2">
                      <VeriForgeButton size="sm" variant="secondary" onClick={() => ackAlert(a.id)}>
                        Acknowledge
                      </VeriForgeButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </VeriForgeFrame>
        )}

        {/* 3. Incidents */}
        {(panel === "incidents" || panel === "grid") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconIncidentSeverity tone="critical" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                3 · Cross-Site Incidents
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {incidents.map((i) => {
                const critical = i.severity === "critical" || i.severity === "high";
                return (
                  <div
                    key={i.id}
                    className={cn(
                      "border p-3",
                      critical
                        ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                        : "border-[#424242] bg-[#1f1f1f]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                        {i.title}
                      </p>
                      <span
                        className={cn(
                          "border px-2 py-0.5 text-[9px] uppercase",
                          critical
                            ? "border-[#1E6FB8] text-[#ffc9c9]"
                            : "border-[#424242] text-[#9f9f9f]",
                        )}
                      >
                        {i.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] uppercase text-[#8a8a8a]">
                      {siteName(sites, i.siteId)} · {i.status}
                    </p>
                    <MetaLine siteId={i.siteId} region={i.region} timestamp={i.timestamp} />
                    {i.severity !== "critical" ? (
                      <div className="mt-2">
                        <VeriForgeButton size="sm" onClick={() => escalateIncident(i.id)}>
                          Escalate
                        </VeriForgeButton>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </VeriForgeFrame>
        )}

        {/* 4. Workforce */}
        {(panel === "workforce" || panel === "kpi") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconCultureEngagement tone="neutral" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                4 · Workforce Readiness
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {sites.map((s) => {
                const low = s.readiness < 70;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "border p-3",
                      low
                        ? "border-[#1E6FB8] shadow-[0_0_10px_rgba(30, 111, 184,.3)]"
                        : "border-[#424242] bg-[#1f1f1f]",
                    )}
                  >
                    <div className="flex justify-between">
                      <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-[#FAFAFA]">{s.readiness}%</p>
                    </div>
                    <VeriForgeProgressBar label="Readiness" value={s.readiness} />
                    <MetaLine siteId={s.id} region={s.region} timestamp={s.timestamp} />
                  </div>
                );
              })}
            </div>
          </VeriForgeFrame>
        )}

        {/* 5. Equipment */}
        {(panel === "equipment" || panel === "kpi") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconEquipmentInspection tone="neutral" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                5 · Equipment Health
              </p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {sites.map((s) => {
                const overdue = s.equipmentHealth < 70;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "border p-3",
                      overdue
                        ? "border-[#1E6FB8] shadow-[0_0_10px_rgba(30, 111, 184,.3)]"
                        : "border-[#424242] bg-[#1f1f1f]",
                    )}
                  >
                    <p className="font-[var(--vf-font-primary)] text-[10px] uppercase text-[#FAFAFA]">
                      {s.name}
                    </p>
                    <p className="mt-1 text-lg text-[#FAFAFA]">{s.equipmentHealth}%</p>
                    <p className="text-[9px] uppercase text-[#8a8a8a]">
                      {overdue ? "overdue / defects" : "nominal"}
                    </p>
                  </div>
                );
              })}
            </div>
          </VeriForgeFrame>
        )}

        {/* 6. Compliance */}
        {(panel === "compliance" || panel === "kpi") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconComplianceDocument tone="critical" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                6 · Compliance Status
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {sites.map((s) => {
                const gap = s.compliance < 75;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "border p-3",
                      gap
                        ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.1)]"
                        : "border-[#424242] bg-[#1f1f1f]",
                    )}
                  >
                    <div className="flex justify-between">
                      <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                        {s.name}
                      </p>
                      {gap ? (
                        <span className="text-[9px] uppercase text-[#ffc9c9]">expiry risk</span>
                      ) : null}
                    </div>
                    <VeriForgeProgressBar label="Coverage" value={s.compliance} />
                    <MetaLine siteId={s.id} region={s.region} timestamp={s.timestamp} />
                  </div>
                );
              })}
            </div>
          </VeriForgeFrame>
        )}

        {/* 7. Risk */}
        {(panel === "risk" || panel === "kpi") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconRiskHazard tone="critical" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                7 · Risk Intelligence
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sites.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "border p-3",
                    "bg-[linear-gradient(145deg,#1A1A1A_0%,#242424_100%)]",
                    s.riskScore >= 70
                      ? "border-[#1E6FB8] shadow-[0_0_10px_rgba(30, 111, 184,.4)]"
                      : "border-[#424242]",
                  )}
                >
                  <p className="font-[var(--vf-font-primary)] text-[9px] uppercase text-[#FAFAFA]">
                    {s.name}
                  </p>
                  <p className="mt-1 text-lg text-[#FAFAFA]">{s.riskScore}</p>
                  <p className="text-[9px] uppercase text-[#8a8a8a]">{s.region}</p>
                </div>
              ))}
            </div>
          </VeriForgeFrame>
        )}

        {/* 8. Emergency */}
        {(panel === "emergency" || panel === "alerts") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconEmergencyMuster tone="critical" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                8 · Emergency Coordination
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {sites
                .filter((s) => s.emergencyActive || s.status === "critical")
                .map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "border p-4",
                      s.emergencyActive
                        ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_18px_rgba(30, 111, 184,.45)]"
                        : "border-[#424242] bg-[#1f1f1f]",
                    )}
                  >
                    <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                      {s.name}
                    </p>
                    <p className="mt-1 text-xs text-[#b8b8b8]">
                      {s.emergencyActive ? "Active emergency" : "Critical watch"} · muster{" "}
                      {s.musterComplete}%
                    </p>
                    <VeriForgeProgressBar label="Muster complete" value={s.musterComplete} />
                    <MetaLine siteId={s.id} region={s.region} timestamp={s.timestamp} />
                    <div className="mt-2">
                      <VeriForgeButton size="sm" onClick={() => toggleEmergency(s.id)}>
                        {s.emergencyActive ? "Clear emergency" : "Activate"}
                      </VeriForgeButton>
                    </div>
                  </div>
                ))}
              {sites.every((s) => !s.emergencyActive && s.status !== "critical") ? (
                <p className="text-xs text-[#8a8a8a]">No active emergencies.</p>
              ) : null}
            </div>
          </VeriForgeFrame>
        )}
      </div>

      {/* 9. KPI Dashboard */}
      {(panel === "kpi" || panel === "grid") && (
        <VeriForgeFrame>
          <div className="flex items-center gap-2">
            <IconRiskScoring tone="critical" size={18} />
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              9 · Global KPI Dashboard
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Avg readiness" value={`${analytics.averageReadiness}%`} />
            <Metric label="Avg compliance" value={`${analytics.averageCompliance}%`} />
            <Metric
              label="Avg risk"
              value={String(analytics.averageRisk)}
              critical={analytics.averageRisk >= 60}
            />
            <Metric label="Open incidents" value={String(analytics.openIncidents)} critical={analytics.openIncidents > 0} />
          </div>
          {selected ? (
            <div className="mt-4 border border-[#424242] bg-[#151515] p-4">
              <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                Focus · {selected.name}
              </p>
              <div className="mt-3">
                <Sparkline
                  series={[
                    selected.riskScore - 18,
                    selected.riskScore - 12,
                    selected.riskScore - 8,
                    selected.riskScore - 4,
                    selected.riskScore - 2,
                    selected.riskScore,
                    selected.riskScore,
                  ].map(clamp)}
                  critical={selected.riskScore >= 70}
                />
              </div>
              <MetaLine
                siteId={selected.id}
                region={selected.region}
                timestamp={selected.timestamp}
              />
            </div>
          ) : null}
        </VeriForgeFrame>
      )}

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Command panels
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PANELS.map((p) => (
            <span
              key={p.key}
              className="border border-[#424242] bg-[#151515] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]"
            >
              {p.label}
            </span>
          ))}
        </div>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          Rules: metadata (timestamp · siteId · region) on every event · critical events
          fire red metallic notifications · sync{" "}
          <code className="text-[#cfcfcf]">veriforge.command-center.analytics</code>
        </p>
      </VeriForgeFrame>
    </div>
  );
}
