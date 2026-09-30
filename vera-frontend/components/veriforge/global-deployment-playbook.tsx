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
  IconFieldGps,
  IconComplianceDocument,
  IconTrainingModule,
  IconEmergencyAlert,
  IconRiskScoring,
  IconWorkflow,
  IconContractorAccess,
} from "./icons";

export type DeploymentSection =
  | "infrastructure"
  | "localization"
  | "compliance"
  | "rollout"
  | "training"
  | "support"
  | "monitoring";

export type RegionCode =
  | "NA-EAST"
  | "NA-WEST"
  | "EU-CENTRAL"
  | "EU-WEST"
  | "APAC"
  | "LATAM"
  | "MEA";

export type DeploymentStatus =
  | "planned"
  | "in_progress"
  | "healthy"
  | "degraded"
  | "critical"
  | "complete";

export type RolloutPhase = "pilot" | "regional" | "global";
export type ComplianceFramework = "OSHA" | "COR" | "ISO" | "CSA" | "EU";

export type InfraNodeLocal = {
  id: string;
  region: RegionCode;
  role: "host" | "router" | "balancer" | "scaler" | "dr";
  label: string;
  capacity: number;
  load: number;
  healthy: boolean;
  tenantAware: boolean;
  timestamp: string;
};

export type LocalePackLocal = {
  id: string;
  code: string;
  label: string;
  region: RegionCode;
  complianceRules: ComplianceFramework[];
  trainingModules: number;
  active: boolean;
  timestamp: string;
};

export type ComplianceCardLocal = {
  id: string;
  framework: ComplianceFramework;
  region: RegionCode;
  title: string;
  templateCount: number;
  aligned: boolean;
  timestamp: string;
  tenantId: string;
};

export type RolloutMilestoneLocal = {
  id: string;
  phase: RolloutPhase;
  title: string;
  region: RegionCode;
  progress: number;
  status: DeploymentStatus;
  timestamp: string;
  tenantId: string;
};

export type SupportTicketLocal = {
  id: string;
  region: RegionCode;
  center: string;
  title: string;
  critical: boolean;
  open: boolean;
  timestamp: string;
  tenantId: string;
};

export type MonitorKpiLocal = {
  id: string;
  label: string;
  region: RegionCode | "GLOBAL";
  value: number;
  series: number[];
  critical: boolean;
  timestamp: string;
  tenantId: string;
};

export type DeploymentAnalyticsSnapshot = {
  totalRecords: number;
  criticalCount: number;
  healthyRegions: number;
  activeLocales: number;
  rolloutProgress: number;
  openCriticalTickets: number;
  globalReadinessScore: number;
  sectionCounts: Record<DeploymentSection, number>;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.deployment.analytics";
const TENANT_ID = "tenant-forge-global";

const SECTIONS: DeploymentSection[] = [
  "infrastructure",
  "localization",
  "compliance",
  "rollout",
  "training",
  "support",
  "monitoring",
];

const SECTION_LABEL: Record<DeploymentSection, string> = {
  infrastructure: "Infrastructure",
  localization: "Localization",
  compliance: "Compliance",
  rollout: "Rollout",
  training: "Training",
  support: "Support",
  monitoring: "Monitoring",
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const SEED_INFRA: InfraNodeLocal[] = [
  { id: "inf-1", region: "NA-EAST", role: "host", label: "Forge Host · us-east-1", capacity: 100, load: 62, healthy: true, tenantAware: true, timestamp: new Date().toISOString() },
  { id: "inf-2", region: "EU-CENTRAL", role: "balancer", label: "Steel LB · eu-central-1", capacity: 100, load: 71, healthy: true, tenantAware: true, timestamp: new Date().toISOString() },
  { id: "inf-3", region: "APAC", role: "scaler", label: "Auto-Scale · ap-southeast-1", capacity: 100, load: 84, healthy: false, tenantAware: true, timestamp: new Date().toISOString() },
  { id: "inf-4", region: "NA-WEST", role: "dr", label: "DR Mirror · us-west-2", capacity: 100, load: 18, healthy: true, tenantAware: true, timestamp: new Date().toISOString() },
  { id: "inf-5", region: "EU-WEST", role: "router", label: "Tenant Router · eu-west-1", capacity: 100, load: 55, healthy: true, tenantAware: true, timestamp: new Date().toISOString() },
  { id: "inf-6", region: "LATAM", role: "host", label: "Forge Host · sa-east-1", capacity: 100, load: 44, healthy: true, tenantAware: true, timestamp: new Date().toISOString() },
];

const SEED_LOCALES: LocalePackLocal[] = [
  { id: "loc-en-us", code: "en-US", label: "English (US)", region: "NA-EAST", complianceRules: ["OSHA", "ISO"], trainingModules: 24, active: true, timestamp: new Date().toISOString() },
  { id: "loc-en-ca", code: "en-CA", label: "English (Canada)", region: "NA-EAST", complianceRules: ["COR", "CSA", "ISO"], trainingModules: 22, active: true, timestamp: new Date().toISOString() },
  { id: "loc-fr-ca", code: "fr-CA", label: "Français (Canada)", region: "NA-EAST", complianceRules: ["COR", "CSA"], trainingModules: 18, active: true, timestamp: new Date().toISOString() },
  { id: "loc-en-gb", code: "en-GB", label: "English (UK)", region: "EU-WEST", complianceRules: ["ISO", "EU"], trainingModules: 20, active: true, timestamp: new Date().toISOString() },
  { id: "loc-de-de", code: "de-DE", label: "Deutsch", region: "EU-CENTRAL", complianceRules: ["ISO", "EU"], trainingModules: 16, active: true, timestamp: new Date().toISOString() },
  { id: "loc-es-mx", code: "es-MX", label: "Español (MX)", region: "LATAM", complianceRules: ["ISO"], trainingModules: 14, active: false, timestamp: new Date().toISOString() },
  { id: "loc-ja-jp", code: "ja-JP", label: "日本語", region: "APAC", complianceRules: ["ISO"], trainingModules: 12, active: true, timestamp: new Date().toISOString() },
];

const SEED_COMPLIANCE: ComplianceCardLocal[] = [
  { id: "cmp-osha", framework: "OSHA", region: "NA-EAST", title: "OSHA document templates", templateCount: 42, aligned: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "cmp-cor", framework: "COR", region: "NA-EAST", title: "COR regional alignment", templateCount: 28, aligned: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "cmp-iso", framework: "ISO", region: "EU-CENTRAL", title: "ISO 45001 pack", templateCount: 36, aligned: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "cmp-csa", framework: "CSA", region: "NA-EAST", title: "CSA standards pack", templateCount: 19, aligned: false, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "cmp-eu", framework: "EU", region: "EU-WEST", title: "EU directives pack", templateCount: 31, aligned: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
];

const SEED_ROLLOUT: RolloutMilestoneLocal[] = [
  { id: "ro-pilot", phase: "pilot", title: "Phase 1 · Pilot deployment", region: "NA-EAST", progress: 100, status: "complete", timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "ro-regional", phase: "regional", title: "Phase 2 · Regional rollout", region: "EU-CENTRAL", progress: 68, status: "in_progress", timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "ro-global", phase: "global", title: "Phase 3 · Global rollout", region: "APAC", progress: 22, status: "planned", timestamp: new Date().toISOString(), tenantId: TENANT_ID },
];

const SEED_TICKETS: SupportTicketLocal[] = [
  { id: "tkt-1", region: "APAC", center: "Singapore Support Forge", title: "Auto-scale thrash on ap-southeast-1", critical: true, open: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "tkt-2", region: "EU-CENTRAL", center: "Frankfurt Support Forge", title: "Locale pack sync lag de-DE", critical: false, open: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "tkt-3", region: "NA-EAST", center: "Virginia Support Forge", title: "Tenant router warm pool expand", critical: false, open: false, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "tkt-4", region: "LATAM", center: "São Paulo Support Forge", title: "es-MX training module publish blocked", critical: true, open: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
];

const SEED_KPIS: MonitorKpiLocal[] = [
  { id: "kpi-uptime", label: "Global uptime", region: "GLOBAL", value: 99, series: [98, 99, 99, 98, 99, 99, 99], critical: false, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "kpi-latency", label: "P95 latency index", region: "GLOBAL", value: 72, series: [60, 62, 65, 68, 70, 71, 72], critical: false, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "kpi-error", label: "Error budget burn", region: "APAC", value: 78, series: [40, 48, 55, 62, 68, 74, 78], critical: true, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
  { id: "kpi-tenants", label: "Active tenants", region: "GLOBAL", value: 86, series: [70, 74, 78, 80, 82, 84, 86], critical: false, timestamp: new Date().toISOString(), tenantId: TENANT_ID },
];

export function computeDeploymentAnalytics(
  infra: InfraNodeLocal[],
  locales: LocalePackLocal[],
  rollout: RolloutMilestoneLocal[],
  tickets: SupportTicketLocal[],
  kpis: MonitorKpiLocal[],
  recordCount = 7,
): DeploymentAnalyticsSnapshot {
  const sectionCounts = Object.fromEntries(SECTIONS.map((s) => [s, 1])) as Record<
    DeploymentSection,
    number
  >;
  sectionCounts.infrastructure = infra.length;
  sectionCounts.localization = locales.length;
  sectionCounts.compliance = 5;
  sectionCounts.rollout = rollout.length;
  sectionCounts.support = tickets.length;
  sectionCounts.monitoring = kpis.length;
  sectionCounts.training = locales.reduce((s, l) => s + (l.active ? 1 : 0), 0);

  const criticalCount =
    infra.filter((n) => !n.healthy).length +
    tickets.filter((t) => t.critical && t.open).length +
    kpis.filter((k) => k.critical).length;

  const healthyRegions = new Set(infra.filter((n) => n.healthy).map((n) => n.region)).size;
  const activeLocales = locales.filter((l) => l.active).length;
  const rolloutProgress = clamp(
    rollout.reduce((s, r) => s + r.progress, 0) / Math.max(1, rollout.length),
  );
  const openCriticalTickets = tickets.filter((t) => t.critical && t.open).length;
  const globalReadinessScore = clamp(
    100 - criticalCount * 6 - openCriticalTickets * 8 + rolloutProgress * 0.25 + activeLocales * 2,
  );

  return {
    totalRecords: recordCount,
    criticalCount,
    healthyRegions,
    activeLocales,
    rolloutProgress,
    openCriticalTickets,
    globalReadinessScore,
    sectionCounts,
    timestamp: new Date().toISOString(),
  };
}

export function persistDeploymentAnalytics(snapshot: DeploymentAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:deployment-analytics", { detail: snapshot }),
  );
}

export function readDeploymentAnalytics(): DeploymentAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DeploymentAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useDeploymentAnalyticsSync(
  fallback: DeploymentAnalyticsSnapshot = computeDeploymentAnalytics(
    SEED_INFRA,
    SEED_LOCALES,
    SEED_ROLLOUT,
    SEED_TICKETS,
    SEED_KPIS,
  ),
) {
  const [analytics, setAnalytics] = React.useState<DeploymentAnalyticsSnapshot>(
    () => readDeploymentAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as DeploymentAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<DeploymentAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:deployment-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:deployment-analytics",
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

function StatusChip({ status }: { status: DeploymentStatus }) {
  const critical = status === "critical" || status === "degraded";
  return (
    <span
      className={cn(
        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        critical
          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
          : status === "complete" || status === "healthy"
            ? "border-[#424242] bg-[#1f1f1f] text-[#cfcfcf]"
            : "border-[#424242] bg-[#151515] text-[#9f9f9f]",
      )}
    >
      {status.replace("_", " ")}
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

function MetaLine({
  region,
  tenantId,
  timestamp,
}: {
  region: string;
  tenantId: string;
  timestamp: string;
}) {
  return (
    <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-[#6f6f6f]">
      region {region} · tenant {tenantId} · {timestamp.slice(0, 19)}Z
    </p>
  );
}

export function VeriForgeGlobalDeploymentPlaybook() {
  const { push } = useVeriForgeNotifications();
  const [section, setSection] = React.useState<DeploymentSection>("infrastructure");
  const [infra, setInfra] = React.useState(SEED_INFRA);
  const [locales, setLocales] = React.useState(SEED_LOCALES);
  const [compliance] = React.useState(SEED_COMPLIANCE);
  const [rollout, setRollout] = React.useState(SEED_ROLLOUT);
  const [tickets, setTickets] = React.useState(SEED_TICKETS);
  const [kpis, setKpis] = React.useState(SEED_KPIS);
  const [selectedLocale, setSelectedLocale] = React.useState(
    SEED_LOCALES.find((l) => l.active)?.id ?? SEED_LOCALES[0].id,
  );
  const notified = React.useRef<Set<string>>(new Set());

  const analytics = React.useMemo(
    () => computeDeploymentAnalytics(infra, locales, rollout, tickets, kpis),
    [infra, locales, rollout, tickets, kpis],
  );

  React.useEffect(() => {
    persistDeploymentAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const t of tickets) {
      if (!t.critical || !t.open) continue;
      if (notified.current.has(t.id)) continue;
      notified.current.add(t.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL DEPLOYMENT ISSUE",
        message: `${t.title} · ${t.region} · tenant ${t.tenantId}`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Deployment",
      });
    }
    for (const n of infra) {
      if (n.healthy) continue;
      if (notified.current.has(n.id)) continue;
      notified.current.add(n.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL DEPLOYMENT ISSUE",
        message: `${n.label} unhealthy · load ${n.load}% · ${n.region}`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Deployment",
      });
    }
  }, [tickets, infra, push]);

  const scaleRegion = (region: RegionCode) => {
    setInfra((prev) =>
      prev.map((n) => {
        if (n.region !== region) return n;
        const load = clamp(n.load - 12 - Math.floor(Math.random() * 8));
        return {
          ...n,
          load,
          healthy: load < 85,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  };

  const toggleLocale = (id: string) => {
    setLocales((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, active: !l.active, timestamp: new Date().toISOString() }
          : l,
      ),
    );
    setSelectedLocale(id);
  };

  const advancePhase = (phase: RolloutPhase) => {
    setRollout((prev) =>
      prev.map((r) => {
        if (r.phase !== phase) return r;
        const progress = clamp(r.progress + 8 + Math.floor(Math.random() * 10));
        const status: DeploymentStatus =
          progress >= 100
            ? "complete"
            : progress >= 70
              ? "healthy"
              : progress >= 40
                ? "in_progress"
                : "planned";
        return {
          ...r,
          progress,
          status,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  };

  const resolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, open: false, critical: false, timestamp: new Date().toISOString() }
          : t,
      ),
    );
  };

  const refreshMonitoring = () => {
    setKpis((prev) =>
      prev.map((k) => {
        const value = clamp(k.value + Math.floor(Math.random() * 9) - 3);
        return {
          ...k,
          value,
          series: [...k.series.slice(1), value],
          critical:
            k.id === "kpi-error" ? value >= 70 : k.id === "kpi-uptime" ? value < 90 : false,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Global Deployment Playbook
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Infrastructure · localization · compliance · rollout · training · support ·
              monitoring — every action carries region, timestamp, and tenantId.
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
          <Metric label="Readiness" value={`${analytics.globalReadinessScore}%`} />
          <Metric
            label="Critical"
            value={String(analytics.criticalCount)}
            critical={analytics.criticalCount > 0}
          />
          <Metric label="Locales" value={String(analytics.activeLocales)} />
          <Metric label="Rollout" value={`${analytics.rolloutProgress}%`} />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label={`Global readiness · critical tickets ${analytics.openCriticalTickets}`}
            value={analytics.globalReadinessScore}
          />
        </div>
        <MetaLine
          region="GLOBAL"
          tenantId={TENANT_ID}
          timestamp={analytics.timestamp}
        />
      </VeriForgeFrame>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className={cn(
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
              section === s
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
                : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
            )}
          >
            /{s}
          </button>
        ))}
      </div>

      {/* 1. Infrastructure */}
      {(section === "infrastructure" || section === "monitoring") && (
        <VeriForgeFrame>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IconFieldGps tone="critical" size={20} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                1 · Infrastructure Deployment
              </p>
            </div>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Multi-region hosting · tenant-aware routing · load balancing · auto-scaling ·
            disaster recovery
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {infra.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border p-4",
                  "bg-[linear-gradient(160deg,#1A1A1A_0%,#121212_48%,#242424_100%)]",
                  n.healthy
                    ? "border-[#424242]"
                    : "border-[#1E6FB8] shadow-[0_0_16px_rgba(30, 111, 184,.4)]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                    {n.label}
                  </p>
                  <StatusChip status={n.healthy ? "healthy" : "critical"} />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  {n.role} · {n.region}
                  {n.tenantAware ? " · tenant-aware" : ""}
                </p>
                <div className="mt-3">
                  <VeriForgeProgressBar label={`Load ${n.load}%`} value={n.load} />
                </div>
                <div className="mt-3">
                  <VeriForgeButton
                    size="sm"
                    variant="secondary"
                    onClick={() => scaleRegion(n.region)}
                  >
                    Scale region
                  </VeriForgeButton>
                </div>
                <MetaLine region={n.region} tenantId={TENANT_ID} timestamp={n.timestamp} />
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      )}

      {/* 2. Localization */}
      {(section === "localization" || section === "training") && (
        <VeriForgeFrame>
          <div className="flex items-center gap-2">
            <IconWorkflow tone="neutral" size={20} />
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              2 · Localization
            </p>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Language packs · regional compliance rules · local training modules
          </p>

          <div className="mt-4 flex flex-wrap gap-2 border-b border-[#424242] pb-3">
            {locales.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedLocale(l.id)}
                className={cn(
                  "relative border px-3 py-2 text-[10px] uppercase tracking-[0.12em]",
                  selectedLocale === l.id
                    ? "border-[#1E6FB8] text-[#ffc9c9]"
                    : "border-[#424242] text-[#9f9f9f]",
                  !l.active && "opacity-50",
                )}
              >
                {l.code}
                {selectedLocale === l.id ? (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#1E6FB8] shadow-[0_0_8px_rgba(30, 111, 184,.6)]" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locales.map((l) => (
              <div
                key={l.id}
                className={cn(
                  "border p-4 bg-[#1A1A1A]",
                  selectedLocale === l.id
                    ? "border-[#1E6FB8]"
                    : "border-[#424242]",
                )}
              >
                <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                  {l.label}
                </p>
                <p className="mt-1 text-xs text-[#8a8a8a]">
                  {l.trainingModules} modules · {l.complianceRules.join(" · ")}
                </p>
                <div className="mt-3">
                  <VeriForgeButton
                    size="sm"
                    variant={l.active ? "secondary" : "primary"}
                    onClick={() => toggleLocale(l.id)}
                  >
                    {l.active ? "Pause pack" : "Activate pack"}
                  </VeriForgeButton>
                </div>
                <MetaLine region={l.region} tenantId={TENANT_ID} timestamp={l.timestamp} />
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      )}

      {/* 3. Compliance */}
      {section === "compliance" && (
        <VeriForgeFrame>
          <div className="flex items-center gap-2">
            <IconComplianceDocument tone="critical" size={20} />
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              3 · Compliance Alignment
            </p>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            OSHA · COR · ISO · CSA · EU directives · regional document templates
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {compliance.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "border p-4",
                  "bg-[linear-gradient(145deg,#1A1A1A_0%,#242424_100%)]",
                  c.aligned
                    ? "border-[#616161]"
                    : "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.3)]",
                )}
              >
                <p className="font-[var(--vf-font-primary)] text-sm uppercase tracking-[0.14em] text-[#FAFAFA]">
                  {c.framework}
                </p>
                <p className="mt-2 text-xs text-[#b8b8b8]">{c.title}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                  {c.templateCount} templates · {c.aligned ? "aligned" : "gap"}
                </p>
                <MetaLine region={c.region} tenantId={c.tenantId} timestamp={c.timestamp} />
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      )}

      {/* 4. Rollout */}
      {section === "rollout" && (
        <VeriForgeFrame>
          <div className="flex items-center gap-2">
            <IconContractorAccess tone="neutral" size={20} />
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              4 · Rollout Strategy
            </p>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Phase 1 Pilot → Phase 2 Regional → Phase 3 Global
          </p>

          <div className="mt-4 relative h-3 w-full overflow-hidden border border-[#424242] bg-[#121212]">
            <div
              className="h-full bg-[linear-gradient(90deg,#424242_0%,#1E6FB8_55%,#1A5F9E_100%)] shadow-[0_0_12px_rgba(30, 111, 184,.45)]"
              style={{ width: `${analytics.rolloutProgress}%` }}
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {rollout.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "border p-4",
                  "bg-[linear-gradient(160deg,#1A1A1A_0%,#1f1f1f_50%,#2a2a2a_100%)]",
                  r.status === "in_progress"
                    ? "border-[#1E6FB8]"
                    : "border-[#424242]",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                    {r.title}
                  </p>
                  <StatusChip status={r.status} />
                </div>
                <div className="mt-3">
                  <VeriForgeProgressBar label={`${r.progress}%`} value={r.progress} />
                </div>
                <div className="mt-3">
                  <VeriForgeButton
                    size="sm"
                    onClick={() => advancePhase(r.phase)}
                    disabled={r.progress >= 100}
                  >
                    Advance phase
                  </VeriForgeButton>
                </div>
                <MetaLine region={r.region} tenantId={r.tenantId} timestamp={r.timestamp} />
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      )}

      {/* 5. Training */}
      {section === "training" && (
        <VeriForgeFrame>
          <div className="flex items-center gap-2">
            <IconTrainingModule tone="neutral" size={20} />
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              5 · Training Deployment
            </p>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Localized modules · regional certification paths
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locales
              .filter((l) => l.active)
              .map((l) => (
                <div
                  key={l.id}
                  className="border border-[#424242] bg-[linear-gradient(160deg,#1A1A1A_0%,#242424_100%)] p-4"
                >
                  <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                    {l.label} path
                  </p>
                  <p className="mt-2 text-2xl text-[#FAFAFA]">{l.trainingModules}</p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
                    modules · cert · {l.complianceRules.join("/")}
                  </p>
                  <div className="mt-3">
                    <VeriForgeProgressBar
                      label="Deploy coverage"
                      value={clamp(60 + l.trainingModules)}
                    />
                  </div>
                  <MetaLine region={l.region} tenantId={TENANT_ID} timestamp={l.timestamp} />
                </div>
              ))}
          </div>
        </VeriForgeFrame>
      )}

      {/* 6. Support */}
      {section === "support" && (
        <VeriForgeFrame>
          <div className="flex items-center gap-2">
            <IconEmergencyAlert tone="critical" size={20} />
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              6 · Support Deployment
            </p>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Regional support centers · red glow for critical tickets
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "border p-4 bg-[#1A1A1A]",
                  t.critical && t.open
                    ? "border-[#1E6FB8] shadow-[0_0_18px_rgba(30, 111, 184,.45)]"
                    : "border-[#424242]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-[var(--vf-font-primary)] text-[11px] uppercase tracking-[0.12em] text-[#FAFAFA]">
                      {t.center}
                    </p>
                    <p className="mt-1 text-xs text-[#b8b8b8]">{t.title}</p>
                  </div>
                  {t.critical && t.open ? (
                    <span className="border border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#ffc9c9]">
                      critical
                    </span>
                  ) : (
                    <span className="border border-[#424242] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
                      {t.open ? "open" : "closed"}
                    </span>
                  )}
                </div>
                {t.open ? (
                  <div className="mt-3">
                    <VeriForgeButton size="sm" onClick={() => resolveTicket(t.id)}>
                      Resolve ticket
                    </VeriForgeButton>
                  </div>
                ) : null}
                <MetaLine region={t.region} tenantId={t.tenantId} timestamp={t.timestamp} />
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      )}

      {/* 7. Monitoring */}
      {section === "monitoring" && (
        <VeriForgeFrame>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconRiskScoring tone="critical" size={20} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                7 · Monitoring & Observability
              </p>
            </div>
            <VeriForgeButton size="sm" variant="secondary" onClick={refreshMonitoring}>
              Refresh KPIs
            </VeriForgeButton>
          </div>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Global dashboards · steel-grey charts · red highlights
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.id}
                className={cn(
                  "border p-4 bg-[#1A1A1A]",
                  k.critical
                    ? "border-[#1E6FB8] shadow-[0_0_14px_rgba(30, 111, 184,.35)]"
                    : "border-[#424242]",
                )}
              >
                <p className="font-[var(--vf-font-primary)] text-[10px] uppercase tracking-[0.12em] text-[#d0d0d0]">
                  {k.label}
                </p>
                <p className="mt-2 text-2xl text-[#FAFAFA]">{k.value}</p>
                <Sparkline series={k.series} critical={k.critical} />
                <MetaLine
                  region={k.region}
                  tenantId={k.tenantId}
                  timestamp={k.timestamp}
                />
              </div>
            ))}
          </div>
        </VeriForgeFrame>
      )}

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Playbook routes
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <span
              key={s}
              className="border border-[#424242] bg-[#151515] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]"
            >
              /deployment/{s}
            </span>
          ))}
        </div>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          Global rules: metadata (region · timestamp · tenantId) on every deployment ·
          critical issues fire red metallic notifications · status syncs to dashboard and
          mobile via <code className="text-[#cfcfcf]">veriforge.deployment.analytics</code>.
        </p>
      </VeriForgeFrame>
    </div>
  );
}
