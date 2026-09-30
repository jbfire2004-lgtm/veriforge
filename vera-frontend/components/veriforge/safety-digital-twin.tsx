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
  IconFieldHazard,
  IconEquipmentDefect,
  IconCultureEngagement,
  IconIncidentSeverity,
  IconRiskHazard,
  IconRiskControl,
  IconRiskScoring,
} from "./icons";

export type TwinLayer =
  | "site"
  | "hazard"
  | "equipment"
  | "workforce"
  | "incident"
  | "risk"
  | "control"
  | "dashboard";

export type TwinEntityStatus = "normal" | "watch" | "critical" | "offline";

export type SiteZoneLocal = {
  id: string;
  siteId: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  critical: boolean;
  hazardDensity: number;
};

export type HazardNodeLocal = {
  id: string;
  siteId: string;
  zoneId: string;
  label: string;
  density: number;
  x: number;
  y: number;
  active: boolean;
  timestamp: string;
};

export type EquipmentNodeLocal = {
  id: string;
  siteId: string;
  label: string;
  status: TwinEntityStatus;
  inspectionDue: boolean;
  defectScore: number;
  x: number;
  y: number;
  timestamp: string;
};

export type WorkerNodeLocal = {
  id: string;
  siteId: string;
  label: string;
  readiness: number;
  missingTraining: boolean;
  missingVerification: boolean;
  x: number;
  y: number;
  pathTo: string | null;
  timestamp: string;
};

export type ControlNodeLocal = {
  id: string;
  siteId: string;
  label: string;
  effectiveness: number;
  linkedHazardId: string;
  timestamp: string;
};

export type RiskCellLocal = {
  id: string;
  siteId: string;
  label: string;
  likelihood: number;
  severity: number;
  score: number;
  predicted: boolean;
};

export type TwinEventLocal = {
  id: string;
  type: TwinLayer;
  title: string;
  message: string;
  siteId: string;
  hazardId: string | null;
  critical: boolean;
  timestamp: string;
};

export type TwinAnalyticsSnapshot = {
  siteId: string;
  zoneCount: number;
  activeHazards: number;
  criticalEquipment: number;
  lowReadinessWorkers: number;
  ineffectiveControls: number;
  predictedHighRisk: number;
  twinHealthScore: number;
  eventCount: number;
  criticalEvents: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.digital-twin.analytics";
const SITE_ID = "site-forge-alpha";

const LAYERS: TwinLayer[] = [
  "site",
  "hazard",
  "equipment",
  "workforce",
  "incident",
  "risk",
  "control",
  "dashboard",
];

const LAYER_LABEL: Record<TwinLayer, string> = {
  site: "Site Model",
  hazard: "Hazard Overlay",
  equipment: "Equipment",
  workforce: "Workforce",
  incident: "Incident Sim",
  risk: "Risk Forecast",
  control: "Controls",
  dashboard: "Dashboard",
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const SEED_ZONES: SiteZoneLocal[] = [
  { id: "z-crane", siteId: SITE_ID, label: "Crane Path", x: 8, y: 12, w: 28, h: 22, critical: true, hazardDensity: 78 },
  { id: "z-hot", siteId: SITE_ID, label: "Hot Work Bay", x: 42, y: 10, w: 24, h: 20, critical: false, hazardDensity: 44 },
  { id: "z-conf", siteId: SITE_ID, label: "Confined Space", x: 70, y: 14, w: 22, h: 18, critical: true, hazardDensity: 72 },
  { id: "z-muster", siteId: SITE_ID, label: "Muster Gate", x: 12, y: 48, w: 20, h: 16, critical: false, hazardDensity: 18 },
  { id: "z-field", siteId: SITE_ID, label: "Zone 3 Field", x: 40, y: 42, w: 32, h: 24, critical: true, hazardDensity: 66 },
  { id: "z-crib", siteId: SITE_ID, label: "Tool Crib", x: 76, y: 48, w: 16, h: 18, critical: false, hazardDensity: 22 },
];

const SEED_HAZARDS: HazardNodeLocal[] = [
  { id: "hz-1", siteId: SITE_ID, zoneId: "z-crane", label: "Struck-by density", density: 78, x: 18, y: 20, active: true, timestamp: new Date().toISOString() },
  { id: "hz-2", siteId: SITE_ID, zoneId: "z-conf", label: "Atmosphere risk", density: 72, x: 78, y: 22, active: true, timestamp: new Date().toISOString() },
  { id: "hz-3", siteId: SITE_ID, zoneId: "z-field", label: "Trip/fall cluster", density: 66, x: 52, y: 52, active: true, timestamp: new Date().toISOString() },
  { id: "hz-4", siteId: SITE_ID, zoneId: "z-hot", label: "Spark exposure", density: 44, x: 52, y: 18, active: false, timestamp: new Date().toISOString() },
];

const SEED_EQUIPMENT: EquipmentNodeLocal[] = [
  { id: "eq-crane-04", siteId: SITE_ID, label: "Crane-04", status: "critical", inspectionDue: true, defectScore: 69, x: 22, y: 24, timestamp: new Date().toISOString() },
  { id: "eq-welder-2", siteId: SITE_ID, label: "Welder-2", status: "normal", inspectionDue: false, defectScore: 18, x: 50, y: 20, timestamp: new Date().toISOString() },
  { id: "eq-fork-7", siteId: SITE_ID, label: "Fork-7", status: "watch", inspectionDue: true, defectScore: 41, x: 48, y: 54, timestamp: new Date().toISOString() },
  { id: "eq-gen-1", siteId: SITE_ID, label: "Gen-1", status: "normal", inspectionDue: false, defectScore: 12, x: 80, y: 54, timestamp: new Date().toISOString() },
];

const SEED_WORKERS: WorkerNodeLocal[] = [
  { id: "wk-1", siteId: SITE_ID, label: "Crew A", readiness: 88, missingTraining: false, missingVerification: false, x: 16, y: 54, pathTo: "z-crane", timestamp: new Date().toISOString() },
  { id: "wk-2", siteId: SITE_ID, label: "Crew B", readiness: 62, missingTraining: true, missingVerification: false, x: 46, y: 48, pathTo: "z-field", timestamp: new Date().toISOString() },
  { id: "wk-3", siteId: SITE_ID, label: "Crew C", readiness: 54, missingTraining: false, missingVerification: true, x: 74, y: 28, pathTo: "z-conf", timestamp: new Date().toISOString() },
  { id: "wk-4", siteId: SITE_ID, label: "Supervisor", readiness: 94, missingTraining: false, missingVerification: false, x: 30, y: 50, pathTo: null, timestamp: new Date().toISOString() },
];

const SEED_CONTROLS: ControlNodeLocal[] = [
  { id: "ctl-1", siteId: SITE_ID, label: "Exclusion zone", effectiveness: 82, linkedHazardId: "hz-1", timestamp: new Date().toISOString() },
  { id: "ctl-2", siteId: SITE_ID, label: "Gas monitor", effectiveness: 58, linkedHazardId: "hz-2", timestamp: new Date().toISOString() },
  { id: "ctl-3", siteId: SITE_ID, label: "Housekeeping sweep", effectiveness: 71, linkedHazardId: "hz-3", timestamp: new Date().toISOString() },
  { id: "ctl-4", siteId: SITE_ID, label: "Hot work permit", effectiveness: 90, linkedHazardId: "hz-4", timestamp: new Date().toISOString() },
];

const SEED_RISK: RiskCellLocal[] = [
  { id: "rk-1", siteId: SITE_ID, label: "Crane Path", likelihood: 4, severity: 5, score: 88, predicted: true },
  { id: "rk-2", siteId: SITE_ID, label: "Confined Space", likelihood: 3, severity: 5, score: 76, predicted: true },
  { id: "rk-3", siteId: SITE_ID, label: "Hot Work Bay", likelihood: 3, severity: 3, score: 52, predicted: false },
  { id: "rk-4", siteId: SITE_ID, label: "Zone 3 Field", likelihood: 4, severity: 4, score: 80, predicted: true },
  { id: "rk-5", siteId: SITE_ID, label: "Muster Gate", likelihood: 2, severity: 2, score: 28, predicted: false },
  { id: "rk-6", siteId: SITE_ID, label: "Tool Crib", likelihood: 1, severity: 2, score: 18, predicted: false },
];

export function computeTwinAnalytics(
  zones: SiteZoneLocal[],
  hazards: HazardNodeLocal[],
  equipment: EquipmentNodeLocal[],
  workers: WorkerNodeLocal[],
  controls: ControlNodeLocal[],
  risk: RiskCellLocal[],
  events: TwinEventLocal[],
  simulationActive: boolean,
): TwinAnalyticsSnapshot {
  const activeHazards = hazards.filter((h) => h.active && h.density >= 50).length;
  const criticalEquipment = equipment.filter(
    (e) => e.status === "critical" || e.inspectionDue,
  ).length;
  const lowReadinessWorkers = workers.filter(
    (w) => w.readiness < 70 || w.missingTraining || w.missingVerification,
  ).length;
  const ineffectiveControls = controls.filter((c) => c.effectiveness < 70).length;
  const predictedHighRisk = risk.filter((r) => r.predicted || r.score >= 70).length;
  const criticalEvents = events.filter((e) => e.critical).length;
  const twinHealthScore = clamp(
    100 -
      activeHazards * 6 -
      criticalEquipment * 8 -
      lowReadinessWorkers * 5 -
      ineffectiveControls * 4 -
      predictedHighRisk * 3 -
      (simulationActive ? 10 : 0),
  );
  return {
    siteId: SITE_ID,
    zoneCount: zones.length,
    activeHazards,
    criticalEquipment,
    lowReadinessWorkers,
    ineffectiveControls,
    predictedHighRisk,
    twinHealthScore,
    eventCount: events.length,
    criticalEvents,
    timestamp: new Date().toISOString(),
  };
}

export function persistTwinAnalytics(snapshot: TwinAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:digital-twin-analytics", { detail: snapshot }),
  );
}

export function readTwinAnalytics(): TwinAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TwinAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useDigitalTwinAnalyticsSync(
  fallback: TwinAnalyticsSnapshot = computeTwinAnalytics(
    SEED_ZONES,
    SEED_HAZARDS,
    SEED_EQUIPMENT,
    SEED_WORKERS,
    SEED_CONTROLS,
    SEED_RISK,
    [],
    false,
  ),
) {
  const [analytics, setAnalytics] = React.useState<TwinAnalyticsSnapshot>(
    () => readTwinAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as TwinAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<TwinAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "veriforge:digital-twin-analytics",
      onCustom as EventListener,
    );
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:digital-twin-analytics",
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
  hazardId,
  timestamp,
}: {
  siteId: string;
  hazardId?: string | null;
  timestamp: string;
}) {
  return (
    <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-[#6f6f6f]">
      site {siteId}
      {hazardId ? ` · hazard ${hazardId}` : ""} · {timestamp.slice(0, 19)}Z
    </p>
  );
}

export function VeriForgeSafetyDigitalTwinSystem() {
  const { push } = useVeriForgeNotifications();
  const [layer, setLayer] = React.useState<TwinLayer>("site");
  const [zones, setZones] = React.useState(SEED_ZONES);
  const [hazards, setHazards] = React.useState(SEED_HAZARDS);
  const [equipment, setEquipment] = React.useState(SEED_EQUIPMENT);
  const [workers] = React.useState(SEED_WORKERS);
  const [controls, setControls] = React.useState(SEED_CONTROLS);
  const [risk] = React.useState(SEED_RISK);
  const [events, setEvents] = React.useState<TwinEventLocal[]>([]);
  const [simulationActive, setSimulationActive] = React.useState(false);
  const [affectedZoneIds, setAffectedZoneIds] = React.useState<string[]>([]);
  const [propKey, setPropKey] = React.useState(0);
  const eventSeq = React.useRef(1);
  const notified = React.useRef<Set<string>>(new Set());

  const analytics = React.useMemo(
    () =>
      computeTwinAnalytics(
        zones,
        hazards,
        equipment,
        workers,
        controls,
        risk,
        events,
        simulationActive,
      ),
    [zones, hazards, equipment, workers, controls, risk, events, simulationActive],
  );

  React.useEffect(() => {
    persistTwinAnalytics(analytics);
  }, [analytics]);

  const pushLocalEvent = (partial: Omit<TwinEventLocal, "id" | "timestamp">) => {
    const event: TwinEventLocal = {
      ...partial,
      id: `te-${eventSeq.current++}`,
      timestamp: new Date().toISOString(),
    };
    setEvents((prev) => [event, ...prev].slice(0, 40));
    if (event.critical && !notified.current.has(event.id)) {
      notified.current.add(event.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL DIGITAL TWIN HAZARD",
        message: `${event.title} · site ${event.siteId}${event.hazardId ? ` · hazard ${event.hazardId}` : ""}`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Digital Twin",
      });
    }
    return event;
  };

  React.useEffect(() => {
    for (const h of hazards) {
      if (h.density < 70) continue;
      const key = `hz-${h.id}-${h.density}`;
      if (notified.current.has(key)) continue;
      notified.current.add(key);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL DIGITAL TWIN HAZARD",
        message: `${h.label} density ${h.density}% · site ${h.siteId} · hazard ${h.id}`,
        forgeStatus: "failed",
        userId: 1,
        actionLabel: "Open Digital Twin",
      });
    }
  }, [hazards, push]);

  const refreshHazards = () => {
    setHazards((prev) => {
      const next = prev.map((h) => {
        const density = clamp(h.density + Math.floor(Math.random() * 15) - 6);
        return {
          ...h,
          density,
          active: density >= 40,
          timestamp: new Date().toISOString(),
        };
      });
      setZones((zs) =>
        zs.map((z) => {
          const hz = next.filter((h) => h.zoneId === z.id);
          const density =
            hz.length === 0
              ? z.hazardDensity
              : clamp(hz.reduce((s, h) => s + h.density, 0) / hz.length);
          return { ...z, hazardDensity: density, critical: density >= 65 };
        }),
      );
      return next;
    });
    window.setTimeout(() => {
      pushLocalEvent({
        type: "hazard",
        title: "Hazard overlay refreshed",
        message: "Real-time density recalculated",
        siteId: SITE_ID,
        hazardId: "hz-1",
        critical: true,
      });
    }, 0);
  };

  const toggleEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const nextStatus: TwinEntityStatus =
          e.status === "critical" ? "watch" : e.status === "watch" ? "normal" : "critical";
        const updated = {
          ...e,
          status: nextStatus,
          inspectionDue: nextStatus !== "normal",
          defectScore:
            nextStatus === "critical"
              ? clamp(e.defectScore + 12)
              : clamp(e.defectScore - 10),
          timestamp: new Date().toISOString(),
        };
        if (updated.status === "critical") {
          pushLocalEvent({
            type: "equipment",
            title: "Equipment critical state",
            message: `${updated.label} defect ${updated.defectScore}`,
            siteId: SITE_ID,
            hazardId: null,
            critical: true,
          });
        }
        return updated;
      }),
    );
  };

  const runSimulation = () => {
    const origin = zones.find((z) => z.id === "z-crane") ?? zones[0];
    const affected = zones
      .filter((z) => z.id === origin.id || Math.abs(z.x - origin.x) < 40 || z.critical)
      .map((z) => z.id);
    setSimulationActive(true);
    setAffectedZoneIds(affected);
    setPropKey((k) => k + 1);
    setLayer("incident");
    pushLocalEvent({
      type: "incident",
      title: "Incident simulation started",
      message: `Origin ${origin.label} · ${affected.length} zones affected`,
      siteId: SITE_ID,
      hazardId: hazards.find((h) => h.zoneId === origin.id)?.id ?? null,
      critical: true,
    });
  };

  const clearSimulation = () => {
    setSimulationActive(false);
    setAffectedZoneIds([]);
    pushLocalEvent({
      type: "incident",
      title: "Incident simulation cleared",
      message: "Propagation overlay reset",
      siteId: SITE_ID,
      hazardId: null,
      critical: false,
    });
  };

  const boostControl = (id: string) => {
    setControls((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              effectiveness: clamp(
                c.effectiveness + 8 + Math.floor(Math.random() * 8),
              ),
              timestamp: new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  const showHazards = layer === "hazard" || layer === "site" || layer === "incident";
  const showEquipment = layer === "equipment" || layer === "site";
  const showWorkers = layer === "workforce" || layer === "site";
  const showRisk = layer === "risk";

  return (
    <div className="space-y-4">
      <VeriForgeFrame>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#ffc9c9]")}>
              Safety Digital Twin
            </p>
            <p className="mt-1 max-w-2xl text-sm text-[#b8b8b8]">
              Real-time site model · hazard overlays · equipment · workforce · incident
              simulation · risk forecast · control effectiveness
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
          <Metric label="Twin health" value={`${analytics.twinHealthScore}%`} />
          <Metric
            label="Hazards"
            value={String(analytics.activeHazards)}
            critical={analytics.activeHazards > 0}
          />
          <Metric
            label="Critical EQ"
            value={String(analytics.criticalEquipment)}
            critical={analytics.criticalEquipment > 0}
          />
          <Metric
            label="Low ready"
            value={String(analytics.lowReadinessWorkers)}
            critical={analytics.lowReadinessWorkers > 0}
          />
        </div>

        <div className="mt-4">
          <VeriForgeProgressBar
            label={`Twin health · predicted high-risk ${analytics.predictedHighRisk}`}
            value={analytics.twinHealthScore}
          />
        </div>
        <MetaLine siteId={SITE_ID} timestamp={analytics.timestamp} />
      </VeriForgeFrame>

      <div className="flex flex-wrap gap-2">
        {LAYERS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLayer(l)}
            className={cn(
              "border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]",
              layer === l
                ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] text-[#ffc9c9]"
                : "border-[#424242] bg-[#1A1A1A] text-[#b8b8b8]",
            )}
          >
            {LAYER_LABEL[l]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <VeriForgeButton size="sm" onClick={refreshHazards}>
          Refresh hazards
        </VeriForgeButton>
        <VeriForgeButton size="sm" variant="warning" onClick={runSimulation}>
          Run incident sim
        </VeriForgeButton>
        <VeriForgeButton size="sm" variant="secondary" onClick={clearSimulation}>
          Clear sim
        </VeriForgeButton>
      </div>

      {/* 3D-style angular canvas */}
      {(layer === "site" ||
        layer === "hazard" ||
        layer === "equipment" ||
        layer === "workforce" ||
        layer === "incident" ||
        layer === "risk") && (
        <VeriForgeFrame>
          <div className="flex items-center justify-between gap-2">
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              {LAYER_LABEL[layer]} · canvas
            </p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a8a8a]">
              site {SITE_ID}
            </p>
          </div>

          <div
            className="relative mt-4 h-[420px] w-full overflow-hidden border border-[#424242]"
            style={{
              background:
                "linear-gradient(160deg, #1A1A1A 0%, #121212 40%, #1f1f1f 70%, #0e0e0e 100%)",
              backgroundImage:
                "linear-gradient(160deg, #1A1A1A 0%, #121212 40%, #1f1f1f 70%, #0e0e0e 100%), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(66,66,66,.15) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(66,66,66,.15) 20px)",
            }}
          >
            {/* Perspective floor plane */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-40"
              style={{
                background:
                  "linear-gradient(to top, rgba(66,66,66,.35), transparent)",
                transform: "perspective(600px) rotateX(55deg)",
                transformOrigin: "bottom",
              }}
            />

            {/* Zones */}
            {zones.map((z) => {
              const affected = simulationActive && affectedZoneIds.includes(z.id);
              return (
                <div
                  key={z.id}
                  className={cn(
                    "absolute border",
                    "bg-[linear-gradient(145deg,#2a2a2a_0%,#1A1A1A_45%,#333_100%)]",
                    z.critical || affected
                      ? "border-[#1E6FB8] shadow-[0_0_18px_rgba(30, 111, 184,.45)]"
                      : "border-[#424242]",
                    affected && "vf-anim-red-glow-pulse",
                  )}
                  style={{
                    left: `${z.x}%`,
                    top: `${z.y}%`,
                    width: `${z.w}%`,
                    height: `${z.h}%`,
                    clipPath: "polygon(4% 0, 100% 0, 96% 100%, 0 100%)",
                  }}
                >
                  <div className="p-2">
                    <p className="font-[var(--vf-font-primary)] text-[9px] uppercase tracking-[0.1em] text-[#FAFAFA]">
                      {z.label}
                    </p>
                    {(layer === "hazard" || layer === "site") && (
                      <p className="mt-1 text-[9px] text-[#ffc9c9]">
                        dens {z.hazardDensity}%
                      </p>
                    )}
                  </div>
                  {/* Bevel edge */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,transparent,#8a8a8a,transparent)]" />
                </div>
              );
            })}

            {/* Hazard icons */}
            {showHazards &&
              hazards
                .filter((h) => h.active || layer === "hazard")
                .map((h) => (
                  <div
                    key={h.id}
                    className={cn(
                      "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border",
                      h.density >= 70
                        ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.35)] shadow-[0_0_14px_rgba(30, 111, 184,.6)]"
                        : "border-[#424242] bg-[#1A1A1A]",
                    )}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    title={`${h.label} ${h.density}%`}
                  >
                    <IconFieldHazard
                      size={16}
                      tone={h.density >= 70 ? "critical" : "neutral"}
                    />
                  </div>
                ))}

            {/* Equipment */}
            {showEquipment &&
              equipment.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEquipment(e.id)}
                  className={cn(
                    "absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border",
                    e.status === "critical"
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.3)] shadow-[0_0_16px_rgba(30, 111, 184,.55)]"
                      : e.status === "watch"
                        ? "border-[#1E6FB8] bg-[#1f1f1f]"
                        : "border-[#424242] bg-[#2a2a2a]",
                  )}
                  style={{ left: `${e.x}%`, top: `${e.y}%` }}
                  title={`${e.label} · ${e.status}`}
                >
                  <IconEquipmentDefect
                    size={16}
                    tone={e.status === "critical" ? "critical" : "neutral"}
                  />
                </button>
              ))}

            {/* Workers + paths */}
            {showWorkers &&
              workers.map((w) => {
                const low =
                  w.readiness < 70 || w.missingTraining || w.missingVerification;
                const target = w.pathTo
                  ? zones.find((z) => z.id === w.pathTo)
                  : null;
                return (
                  <React.Fragment key={w.id}>
                    {target ? (
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        aria-hidden
                      >
                        <line
                          x1={`${w.x}%`}
                          y1={`${w.y}%`}
                          x2={`${target.x + target.w / 2}%`}
                          y2={`${target.y + target.h / 2}%`}
                          stroke="#424242"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                      </svg>
                    ) : null}
                    <div
                      className={cn(
                        "absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center border",
                        low
                          ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.25)] shadow-[0_0_12px_rgba(30, 111, 184,.5)]"
                          : "border-[#424242] bg-[#1A1A1A]",
                      )}
                      style={{ left: `${w.x}%`, top: `${w.y}%` }}
                      title={`${w.label} · ${w.readiness}%`}
                    >
                      <IconCultureEngagement
                        size={14}
                        tone={low ? "critical" : "neutral"}
                      />
                    </div>
                  </React.Fragment>
                );
              })}

            {/* Incident propagation rings */}
            {layer === "incident" && simulationActive ? (
              <div
                key={`prop-${propKey}`}
                className="pointer-events-none absolute left-[22%] top-[24%] h-40 w-40 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="vf-anim-metallic-fade absolute inset-0 border-2 border-[#1E6FB8] opacity-60 shadow-[0_0_24px_rgba(30, 111, 184,.5)]" />
                <div className="vf-anim-angular-slide absolute inset-4 border border-[#1E6FB8]/60" />
                <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[#1E6FB8] bg-[rgba(30, 111, 184,.4)]">
                  <IconIncidentSeverity size={16} tone="critical" />
                </div>
              </div>
            ) : null}

            {/* Risk overlay labels */}
            {showRisk &&
              risk
                .filter((r) => r.predicted || r.score >= 70)
                .map((r, i) => (
                  <div
                    key={r.id}
                    className="absolute border border-[#1E6FB8] bg-[rgba(30, 111, 184,.2)] px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-[#ffc9c9] shadow-[0_0_10px_rgba(30, 111, 184,.4)]"
                    style={{ left: `${12 + i * 14}%`, top: `${70 + (i % 2) * 8}%` }}
                  >
                    {r.label} · {r.score}
                  </div>
                ))}
          </div>
        </VeriForgeFrame>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Equipment list */}
        {(layer === "equipment" || layer === "dashboard") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconEquipmentDefect tone="critical" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                3 · Equipment state
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {equipment.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEquipment(e.id)}
                  className={cn(
                    "flex w-full items-center justify-between border p-3 text-left",
                    e.status === "critical"
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.12)] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                  )}
                >
                  <div>
                    <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                      {e.label}
                    </p>
                    <p className="text-[10px] uppercase text-[#8a8a8a]">
                      {e.status} · defect {e.defectScore}
                      {e.inspectionDue ? " · overdue" : ""}
                    </p>
                  </div>
                  <VeriForgeProgressBar label="" value={100 - e.defectScore} />
                </button>
              ))}
            </div>
          </VeriForgeFrame>
        )}

        {/* Workforce */}
        {(layer === "workforce" || layer === "dashboard") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconCultureEngagement tone="neutral" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                4 · Workforce readiness
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {workers.map((w) => {
                const low =
                  w.readiness < 70 || w.missingTraining || w.missingVerification;
                return (
                  <div
                    key={w.id}
                    className={cn(
                      "border p-3",
                      low
                        ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.35)]"
                        : "border-[#424242] bg-[#1f1f1f]",
                    )}
                  >
                    <div className="flex justify-between">
                      <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                        {w.label}
                      </p>
                      <p className="text-[11px] text-[#FAFAFA]">{w.readiness}%</p>
                    </div>
                    <p className="mt-1 text-[10px] uppercase text-[#8a8a8a]">
                      {w.missingTraining ? "missing training · " : ""}
                      {w.missingVerification ? "missing verification · " : ""}
                      path {w.pathTo ?? "idle"}
                    </p>
                    <VeriForgeProgressBar label="Readiness" value={w.readiness} />
                    <MetaLine siteId={w.siteId} timestamp={w.timestamp} />
                  </div>
                );
              })}
            </div>
          </VeriForgeFrame>
        )}

        {/* Risk matrix */}
        {(layer === "risk" || layer === "dashboard") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconRiskHazard tone="critical" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                6 · Risk forecasting
              </p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {risk.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "border p-3",
                    "bg-[linear-gradient(145deg,#1A1A1A_0%,#242424_100%)]",
                    r.score >= 70 || r.predicted
                      ? "border-[#1E6FB8] shadow-[0_0_10px_rgba(30, 111, 184,.4)]"
                      : "border-[#424242]",
                  )}
                >
                  <p className="font-[var(--vf-font-primary)] text-[9px] uppercase text-[#FAFAFA]">
                    {r.label}
                  </p>
                  <p className="mt-1 text-lg text-[#FAFAFA]">{r.score}</p>
                  <p className="text-[9px] uppercase text-[#8a8a8a]">
                    L{r.likelihood}×S{r.severity}
                    {r.predicted ? " · predicted" : ""}
                  </p>
                </div>
              ))}
            </div>
          </VeriForgeFrame>
        )}

        {/* Controls */}
        {(layer === "control" || layer === "dashboard") && (
          <VeriForgeFrame>
            <div className="flex items-center gap-2">
              <IconRiskControl tone="neutral" size={18} />
              <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
                7 · Control effectiveness
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {controls.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "border p-3",
                    c.effectiveness < 70
                      ? "border-[#1E6FB8] shadow-[0_0_12px_rgba(30, 111, 184,.35)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                      {c.label}
                    </p>
                    <VeriForgeButton size="sm" variant="secondary" onClick={() => boostControl(c.id)}>
                      Boost
                    </VeriForgeButton>
                  </div>
                  <VeriForgeProgressBar
                    label={`Effectiveness · hazard ${c.linkedHazardId}`}
                    value={c.effectiveness}
                  />
                  <MetaLine
                    siteId={c.siteId}
                    hazardId={c.linkedHazardId}
                    timestamp={c.timestamp}
                  />
                </div>
              ))}
            </div>
          </VeriForgeFrame>
        )}
      </div>

      {/* Dashboard KPIs + events */}
      {(layer === "dashboard" || layer === "incident") && (
        <VeriForgeFrame>
          <div className="flex items-center gap-2">
            <IconRiskScoring tone="critical" size={18} />
            <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
              8 · Digital twin dashboard
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Zones" value={String(analytics.zoneCount)} />
            <Metric
              label="Ineffective ctl"
              value={String(analytics.ineffectiveControls)}
              critical={analytics.ineffectiveControls > 0}
            />
            <Metric
              label="Predicted risk"
              value={String(analytics.predictedHighRisk)}
              critical={analytics.predictedHighRisk > 0}
            />
            <Metric
              label="Critical events"
              value={String(analytics.criticalEvents)}
              critical={analytics.criticalEvents > 0}
            />
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              Event stream
            </p>
            {events.length === 0 ? (
              <p className="text-xs text-[#8a8a8a]">
                No twin events yet — refresh hazards or run a simulation.
              </p>
            ) : (
              events.slice(0, 8).map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    "border p-3",
                    e.critical
                      ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.1)]"
                      : "border-[#424242] bg-[#151515]",
                  )}
                >
                  <p className="font-[var(--vf-font-primary)] text-[11px] uppercase text-[#FAFAFA]">
                    {e.title}
                  </p>
                  <p className="mt-1 text-xs text-[#b8b8b8]">{e.message}</p>
                  <MetaLine
                    siteId={e.siteId}
                    hazardId={e.hazardId}
                    timestamp={e.timestamp}
                  />
                </div>
              ))
            )}
          </div>
        </VeriForgeFrame>
      )}

      <VeriForgeFrame>
        <p className={cn(veriforgeTypography.heading, "text-[11px] text-[#d0d0d0]")}>
          Twin layers
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LAYERS.map((l) => (
            <span
              key={l}
              className="border border-[#424242] bg-[#151515] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]"
            >
              {LAYER_LABEL[l]}
            </span>
          ))}
        </div>
        <VeriForgeDivider className="my-4" />
        <p className="text-xs text-[#8a8a8a]">
          Rules: every event stamps timestamp · siteId · hazardId · critical hazards fire
          red metallic notifications · sync{" "}
          <code className="text-[#cfcfcf]">veriforge.digital-twin.analytics</code>
        </p>
      </VeriForgeFrame>
    </div>
  );
}
