"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography, VeriForgeDivider, VeriForgeFrame } from "./theme";
import { VeriForgeButton } from "./button";
import { VeriForgeTextField, VeriForgeSelect } from "./inputs";
import { VeriForgeProgressBar } from "./progress";
import { useVeriForgeNotifications } from "./notifications";
import { AnvilIcon, ForgeBoltIcon, HeatEdgeIcon, ShieldGridIcon } from "./icons";

export type HazardRisk = "critical" | "high" | "moderate" | "low";
export type ZoneTone = "high_risk" | "restricted" | "neutral" | "safe";
export type ControlType = "engineering" | "administrative" | "ppe";
export type ControlStatus = "in_place" | "missing" | "partial";
export type WorkerReadiness = "compliant" | "missing_training" | "missing_verification";
export type BriefStatus = "draft" | "issued" | "acknowledged";
export type PermitType = "hot_work" | "confined_space" | "electrical" | "excavation";
export type PermitStatus = "active" | "expired" | "pending";

export type SitePlanLocal = {
  id: string;
  siteId: string;
  name: string;
  location: string;
  completeness: number;
  safetyScore: number;
  timestamp: string;
  userId: number;
};

export type HazardZoneLocal = {
  id: string;
  siteId: string;
  name: string;
  risk: HazardRisk;
  tone: ZoneTone;
  x: number;
  y: number;
  description: string;
  timestamp: string;
  userId: number;
};

export type SafetyControlLocal = {
  id: string;
  siteId: string;
  hazardId: string | null;
  name: string;
  type: ControlType;
  status: ControlStatus;
  timestamp: string;
  userId: number;
};

export type SafeWorkProcedureLocal = {
  id: string;
  siteId: string;
  title: string;
  criticalSteps: string[];
  status: "active" | "draft";
  timestamp: string;
  userId: number;
};

export type SiteMapRouteLocal = {
  id: string;
  siteId: string;
  name: string;
  fromZone: string;
  toZone: string;
  restricted: boolean;
  timestamp: string;
  userId: number;
};

export type WorkerAssignmentLocal = {
  id: string;
  siteId: string;
  name: string;
  role: string;
  readiness: WorkerReadiness;
  timestamp: string;
  userId: number;
};

export type PreJobBriefLocal = {
  id: string;
  siteId: string;
  jobScope: string;
  hazards: string;
  controls: string;
  roles: string;
  status: BriefStatus;
  timestamp: string;
  userId: number;
};

export type WorkPermitLocal = {
  id: string;
  siteId: string;
  type: PermitType;
  title: string;
  expiresAt: string;
  status: PermitStatus;
  timestamp: string;
  userId: number;
};

export type SiteSafetyAnalyticsSnapshot = {
  siteCount: number;
  hazardDensity: number;
  criticalHazards: number;
  controlCoverage: number;
  missingControls: number;
  workerReadiness: number;
  nonCompliantWorkers: number;
  expiredPermits: number;
  briefAcknowledgement: number;
  averageSafetyScore: number;
  averageCompleteness: number;
  timestamp: string;
};

const STORAGE_KEY = "veriforge.site-safety.analytics";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskTone(risk: HazardRisk): ZoneTone {
  if (risk === "critical" || risk === "high") return "high_risk";
  if (risk === "moderate") return "restricted";
  return "neutral";
}

function permitStatus(expiresAt: string): PermitStatus {
  return new Date(expiresAt).getTime() < Date.now() ? "expired" : "active";
}

export function computeSiteSafetyAnalytics(input: {
  sites: SitePlanLocal[];
  hazards: HazardZoneLocal[];
  controls: SafetyControlLocal[];
  workers: WorkerAssignmentLocal[];
  briefs: PreJobBriefLocal[];
  permits: WorkPermitLocal[];
}): SiteSafetyAnalyticsSnapshot {
  const missingControls = input.controls.filter((c) => c.status === "missing").length;
  const nonCompliantWorkers = input.workers.filter((w) => w.readiness !== "compliant").length;
  const acknowledged = input.briefs.filter((b) => b.status === "acknowledged").length;
  return {
    siteCount: input.sites.length,
    hazardDensity:
      input.sites.length === 0
        ? 0
        : Math.round((input.hazards.length / input.sites.length) * 10) / 10,
    criticalHazards: input.hazards.filter((h) => h.risk === "critical").length,
    controlCoverage:
      input.controls.length === 0
        ? 0
        : clamp(
            (input.controls.filter((c) => c.status === "in_place").length /
              input.controls.length) *
              100,
          ),
    missingControls,
    workerReadiness:
      input.workers.length === 0
        ? 0
        : clamp(((input.workers.length - nonCompliantWorkers) / input.workers.length) * 100),
    nonCompliantWorkers,
    expiredPermits: input.permits.filter((p) => p.status === "expired").length,
    briefAcknowledgement:
      input.briefs.length === 0 ? 0 : clamp((acknowledged / input.briefs.length) * 100),
    averageSafetyScore:
      input.sites.length === 0
        ? 0
        : clamp(input.sites.reduce((s, x) => s + x.safetyScore, 0) / input.sites.length),
    averageCompleteness:
      input.sites.length === 0
        ? 0
        : clamp(input.sites.reduce((s, x) => s + x.completeness, 0) / input.sites.length),
    timestamp: new Date().toISOString(),
  };
}

export function persistSiteSafetyAnalytics(snapshot: SiteSafetyAnalyticsSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(
    new CustomEvent("veriforge:site-safety-analytics", { detail: snapshot }),
  );
}

export function readSiteSafetyAnalytics(): SiteSafetyAnalyticsSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SiteSafetyAnalyticsSnapshot;
  } catch {
    return null;
  }
}

export function useSiteSafetyAnalyticsSync(
  fallback: SiteSafetyAnalyticsSnapshot = {
    siteCount: 2,
    hazardDensity: 2,
    criticalHazards: 2,
    controlCoverage: 50,
    missingControls: 2,
    workerReadiness: 50,
    nonCompliantWorkers: 2,
    expiredPermits: 1,
    briefAcknowledgement: 0,
    averageSafetyScore: 64,
    averageCompleteness: 63,
    timestamp: new Date().toISOString(),
  },
) {
  const [analytics, setAnalytics] = React.useState<SiteSafetyAnalyticsSnapshot>(
    () => readSiteSafetyAnalytics() ?? fallback,
  );

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setAnalytics(JSON.parse(event.newValue) as SiteSafetyAnalyticsSnapshot);
      } catch {
        /* ignore */
      }
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<SiteSafetyAnalyticsSnapshot>).detail;
      if (detail) setAnalytics(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("veriforge:site-safety-analytics", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "veriforge:site-safety-analytics",
        onCustom as EventListener,
      );
    };
  }, []);

  return { analytics, setAnalytics };
}

function scoreSite(input: {
  siteId: string;
  hazards: HazardZoneLocal[];
  controls: SafetyControlLocal[];
  procedures: SafeWorkProcedureLocal[];
  routes: SiteMapRouteLocal[];
  workers: WorkerAssignmentLocal[];
  briefs: PreJobBriefLocal[];
  permits: WorkPermitLocal[];
}): { completeness: number; safetyScore: number } {
  const siteHazards = input.hazards.filter((h) => h.siteId === input.siteId);
  const siteControls = input.controls.filter((c) => c.siteId === input.siteId);
  const siteWorkers = input.workers.filter((w) => w.siteId === input.siteId);
  const siteBriefs = input.briefs.filter((b) => b.siteId === input.siteId);
  const sitePermits = input.permits.filter((p) => p.siteId === input.siteId);
  const siteProcedures = input.procedures.filter((p) => p.siteId === input.siteId);
  const siteRoutes = input.routes.filter((r) => r.siteId === input.siteId);

  const controlCoverage =
    siteControls.length === 0
      ? 40
      : clamp(
          (siteControls.filter((c) => c.status === "in_place").length / siteControls.length) *
            100,
        );
  const workerReady =
    siteWorkers.length === 0
      ? 50
      : clamp(
          (siteWorkers.filter((w) => w.readiness === "compliant").length / siteWorkers.length) *
            100,
        );
  const briefReady =
    siteBriefs.length === 0
      ? 40
      : clamp(
          (siteBriefs.filter((b) => b.status === "acknowledged").length / siteBriefs.length) *
            100,
        );
  const permitReady =
    sitePermits.length === 0
      ? 50
      : clamp(
          (sitePermits.filter((p) => p.status === "active").length / sitePermits.length) * 100,
        );

  const completeness = clamp(
    (Math.min(siteHazards.length, 4) / 4) * 20 +
      (Math.min(siteControls.length, 4) / 4) * 20 +
      (Math.min(siteProcedures.length, 2) / 2) * 15 +
      (Math.min(siteRoutes.length, 2) / 2) * 10 +
      (Math.min(siteWorkers.length, 3) / 3) * 15 +
      (Math.min(siteBriefs.length, 1) / 1) * 10 +
      (Math.min(sitePermits.length, 1) / 1) * 10,
  );

  const criticalPenalty = siteHazards.filter((h) => h.risk === "critical").length * 8;
  const missingPenalty = siteControls.filter((c) => c.status === "missing").length * 6;

  const safetyScore = clamp(
    controlCoverage * 0.35 +
      workerReady * 0.25 +
      briefReady * 0.15 +
      permitReady * 0.15 +
      completeness * 0.1 -
      criticalPenalty -
      missingPenalty,
  );

  return { completeness, safetyScore };
}

function seed() {
  const now = new Date().toISOString();
  return {
    sites: [
      {
        id: "site-1",
        siteId: "site-1",
        name: "Forge Yard Alpha",
        location: "Bay 1–4",
        completeness: 72,
        safetyScore: 68,
        timestamp: now,
        userId: 1,
      },
      {
        id: "site-2",
        siteId: "site-2",
        name: "Mill Line West",
        location: "West Corridor",
        completeness: 54,
        safetyScore: 61,
        timestamp: now,
        userId: 1,
      },
    ] as SitePlanLocal[],
    hazards: [
      {
        id: "hz-1",
        siteId: "site-1",
        name: "Hot Work Zone A",
        risk: "critical" as const,
        tone: "high_risk" as const,
        x: 22,
        y: 30,
        description: "Open flame and molten splash risk",
        timestamp: now,
        userId: 1,
      },
      {
        id: "hz-2",
        siteId: "site-1",
        name: "Crane Path",
        risk: "high" as const,
        tone: "restricted" as const,
        x: 58,
        y: 48,
        description: "Overhead lift corridor",
        timestamp: now,
        userId: 1,
      },
      {
        id: "hz-3",
        siteId: "site-1",
        name: "Staging Pad",
        risk: "low" as const,
        tone: "neutral" as const,
        x: 78,
        y: 72,
        description: "Material staging",
        timestamp: now,
        userId: 1,
      },
      {
        id: "hz-4",
        siteId: "site-2",
        name: "Confined Pit",
        risk: "critical" as const,
        tone: "high_risk" as const,
        x: 35,
        y: 55,
        description: "Atmospheric hazard",
        timestamp: now,
        userId: 1,
      },
    ] as HazardZoneLocal[],
    controls: [
      {
        id: "ctl-1",
        siteId: "site-1",
        hazardId: "hz-1",
        name: "Spark screens",
        type: "engineering" as const,
        status: "in_place" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ctl-2",
        siteId: "site-1",
        hazardId: "hz-1",
        name: "Hot work watch",
        type: "administrative" as const,
        status: "partial" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ctl-3",
        siteId: "site-1",
        hazardId: "hz-1",
        name: "FR clothing + face shield",
        type: "ppe" as const,
        status: "in_place" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ctl-4",
        siteId: "site-1",
        hazardId: "hz-2",
        name: "Exclusion zone barriers",
        type: "engineering" as const,
        status: "missing" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ctl-5",
        siteId: "site-2",
        hazardId: "hz-4",
        name: "Gas monitoring",
        type: "engineering" as const,
        status: "missing" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "ctl-6",
        siteId: "site-2",
        hazardId: "hz-4",
        name: "Entry attendant",
        type: "administrative" as const,
        status: "in_place" as const,
        timestamp: now,
        userId: 1,
      },
    ] as SafetyControlLocal[],
    procedures: [
      {
        id: "swp-1",
        siteId: "site-1",
        title: "Hot Work SWP",
        criticalSteps: [
          "Isolate combustibles",
          "Issue permit",
          "Post fire watch",
          "Verify extinguisher",
        ],
        status: "active" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "swp-2",
        siteId: "site-1",
        title: "Crane Lift SWP",
        criticalSteps: ["Inspect rigging", "Clear path", "Signal protocol"],
        status: "active" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "swp-3",
        siteId: "site-2",
        title: "Confined Space Entry",
        criticalSteps: ["Atmosphere test", "Lockout energy", "Rescue plan ready"],
        status: "draft" as const,
        timestamp: now,
        userId: 1,
      },
    ] as SafeWorkProcedureLocal[],
    routes: [
      {
        id: "rt-1",
        siteId: "site-1",
        name: "Primary egress",
        fromZone: "Hot Work Zone A",
        toZone: "Muster North",
        restricted: false,
        timestamp: now,
        userId: 1,
      },
      {
        id: "rt-2",
        siteId: "site-1",
        name: "Crane underpass",
        fromZone: "Staging Pad",
        toZone: "Bay 3",
        restricted: true,
        timestamp: now,
        userId: 1,
      },
      {
        id: "rt-3",
        siteId: "site-2",
        name: "Pit access",
        fromZone: "Confined Pit",
        toZone: "Rescue Cache",
        restricted: true,
        timestamp: now,
        userId: 1,
      },
    ] as SiteMapRouteLocal[],
    workers: [
      {
        id: "wk-1",
        siteId: "site-1",
        name: "M. Reyes",
        role: "Welder",
        readiness: "compliant" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "wk-2",
        siteId: "site-1",
        name: "J. Okonkwo",
        role: "Rigger",
        readiness: "missing_verification" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "wk-3",
        siteId: "site-1",
        name: "A. Chen",
        role: "Fire Watch",
        readiness: "compliant" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "wk-4",
        siteId: "site-2",
        name: "S. Patel",
        role: "Entrant",
        readiness: "missing_training" as const,
        timestamp: now,
        userId: 1,
      },
    ] as WorkerAssignmentLocal[],
    briefs: [
      {
        id: "br-1",
        siteId: "site-1",
        jobScope: "Replace furnace door seals",
        hazards: "Heat, sparks, pinch points",
        controls: "Screens, FR PPE, LOTO",
        roles: "Welder, Fire Watch, Supervisor",
        status: "issued" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "br-2",
        siteId: "site-2",
        jobScope: "Pit pump service",
        hazards: "Atmosphere, engulfment",
        controls: "Gas monitor, attendant, rescue",
        roles: "Entrant, Attendant, Rescue",
        status: "draft" as const,
        timestamp: now,
        userId: 1,
      },
    ] as PreJobBriefLocal[],
    permits: [
      {
        id: "pm-1",
        siteId: "site-1",
        type: "hot_work" as const,
        title: "Furnace door hot work",
        expiresAt: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        status: "active" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "pm-2",
        siteId: "site-2",
        type: "confined_space" as const,
        title: "Pit entry permit",
        expiresAt: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
        status: "expired" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "pm-3",
        siteId: "site-1",
        type: "electrical" as const,
        title: "Panel isolation",
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        status: "active" as const,
        timestamp: now,
        userId: 1,
      },
      {
        id: "pm-4",
        siteId: "site-2",
        type: "excavation" as const,
        title: "Trench shore check",
        expiresAt: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
        status: "pending" as const,
        timestamp: now,
        userId: 1,
      },
    ] as WorkPermitLocal[],
  };
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

export function VeriForgeSiteSafetyPlanningSystem() {
  const { push } = useVeriForgeNotifications();
  const initial = React.useMemo(() => seed(), []);
  const [sites, setSites] = React.useState(initial.sites);
  const [hazards, setHazards] = React.useState(initial.hazards);
  const [controls, setControls] = React.useState(initial.controls);
  const [procedures, setProcedures] = React.useState(initial.procedures);
  const [routes, setRoutes] = React.useState(initial.routes);
  const [workers, setWorkers] = React.useState(initial.workers);
  const [briefs, setBriefs] = React.useState(initial.briefs);
  const [permits, setPermits] = React.useState(initial.permits);
  const [selectedSite, setSelectedSite] = React.useState("site-1");
  const notified = React.useRef<Set<string>>(new Set(["hz-1", "hz-4", "pm-2"]));
  const seq = React.useRef(40);

  const [siteName, setSiteName] = React.useState("");
  const [siteLocation, setSiteLocation] = React.useState("");
  const [hzName, setHzName] = React.useState("");
  const [hzRisk, setHzRisk] = React.useState<HazardRisk>("high");
  const [hzDesc, setHzDesc] = React.useState("");
  const [ctlName, setCtlName] = React.useState("");
  const [ctlType, setCtlType] = React.useState<ControlType>("engineering");
  const [ctlStatus, setCtlStatus] = React.useState<ControlStatus>("in_place");
  const [swpTitle, setSwpTitle] = React.useState("");
  const [swpSteps, setSwpSteps] = React.useState("");
  const [rtName, setRtName] = React.useState("");
  const [rtFrom, setRtFrom] = React.useState("");
  const [rtTo, setRtTo] = React.useState("");
  const [rtRestricted, setRtRestricted] = React.useState("false");
  const [wkName, setWkName] = React.useState("");
  const [wkRole, setWkRole] = React.useState("");
  const [wkReady, setWkReady] = React.useState<WorkerReadiness>("compliant");
  const [brScope, setBrScope] = React.useState("");
  const [brHazards, setBrHazards] = React.useState("");
  const [brControls, setBrControls] = React.useState("");
  const [brRoles, setBrRoles] = React.useState("");
  const [pmTitle, setPmTitle] = React.useState("");
  const [pmType, setPmType] = React.useState<PermitType>("hot_work");
  const [pmExpires, setPmExpires] = React.useState("");

  const activeSite = sites.find((s) => s.siteId === selectedSite) ?? sites[0];

  const siteHazards = hazards.filter((h) => h.siteId === selectedSite);
  const siteControls = controls.filter((c) => c.siteId === selectedSite);
  const siteProcedures = procedures.filter((p) => p.siteId === selectedSite);
  const siteRoutes = routes.filter((r) => r.siteId === selectedSite);
  const siteWorkers = workers.filter((w) => w.siteId === selectedSite);
  const siteBriefs = briefs.filter((b) => b.siteId === selectedSite);
  const sitePermits = permits.filter((p) => p.siteId === selectedSite);

  React.useEffect(() => {
    setSites((prev) =>
      prev.map((site) => {
        const scored = scoreSite({
          siteId: site.siteId,
          hazards,
          controls,
          procedures,
          routes,
          workers,
          briefs,
          permits,
        });
        return {
          ...site,
          completeness: scored.completeness,
          safetyScore: scored.safetyScore,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }, [hazards, controls, procedures, routes, workers, briefs, permits]);

  const analytics = React.useMemo(
    () =>
      computeSiteSafetyAnalytics({
        sites,
        hazards,
        controls,
        workers,
        briefs,
        permits,
      }),
    [sites, hazards, controls, workers, briefs, permits],
  );

  React.useEffect(() => {
    persistSiteSafetyAnalytics(analytics);
  }, [analytics]);

  React.useEffect(() => {
    for (const hazard of hazards) {
      if (hazard.risk !== "critical") continue;
      if (notified.current.has(hazard.id)) continue;
      notified.current.add(hazard.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "CRITICAL SITE HAZARD",
        message: `${hazard.name}: ${hazard.description}`,
        forgeStatus: "failed",
        userId: hazard.userId,
        actionLabel: "Open Site Safety",
      });
    }
    for (const permit of permits) {
      if (permit.status !== "expired") continue;
      if (notified.current.has(permit.id)) continue;
      notified.current.add(permit.id);
      push({
        category: "compliance",
        tone: "critical",
        title: "PERMIT EXPIRED",
        message: `${permit.title} (${permit.type}) expired.`,
        forgeStatus: "failed",
        userId: permit.userId,
      });
    }
  }, [hazards, permits, push]);

  const createSite = () => {
    if (!siteName.trim() || !siteLocation.trim()) return;
    const id = `site-${seq.current++}`;
    setSites((prev) => [
      {
        id,
        siteId: id,
        name: siteName.trim(),
        location: siteLocation.trim(),
        completeness: 20,
        safetyScore: 50,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setSelectedSite(id);
    setSiteName("");
    setSiteLocation("");
  };

  const addHazard = () => {
    if (!activeSite || !hzName.trim() || !hzDesc.trim()) return;
    setHazards((prev) => [
      {
        id: `hz-${seq.current++}`,
        siteId: activeSite.siteId,
        name: hzName.trim(),
        risk: hzRisk,
        tone: riskTone(hzRisk),
        x: 20 + Math.round(Math.random() * 60),
        y: 20 + Math.round(Math.random() * 55),
        description: hzDesc.trim(),
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setHzName("");
    setHzDesc("");
  };

  const addControl = () => {
    if (!activeSite || !ctlName.trim()) return;
    setControls((prev) => [
      {
        id: `ctl-${seq.current++}`,
        siteId: activeSite.siteId,
        hazardId: siteHazards[0]?.id ?? null,
        name: ctlName.trim(),
        type: ctlType,
        status: ctlStatus,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setCtlName("");
  };

  const toggleControl = (id: string) => {
    setControls((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "missing" ? "in_place" : "missing",
              timestamp: new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  const addProcedure = () => {
    if (!activeSite || !swpTitle.trim()) return;
    setProcedures((prev) => [
      {
        id: `swp-${seq.current++}`,
        siteId: activeSite.siteId,
        title: swpTitle.trim(),
        criticalSteps: swpSteps
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status: "active",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setSwpTitle("");
    setSwpSteps("");
  };

  const addRoute = () => {
    if (!activeSite || !rtName.trim() || !rtFrom.trim() || !rtTo.trim()) return;
    setRoutes((prev) => [
      {
        id: `rt-${seq.current++}`,
        siteId: activeSite.siteId,
        name: rtName.trim(),
        fromZone: rtFrom.trim(),
        toZone: rtTo.trim(),
        restricted: rtRestricted === "true",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setRtName("");
    setRtFrom("");
    setRtTo("");
  };

  const assignWorker = () => {
    if (!activeSite || !wkName.trim() || !wkRole.trim()) return;
    setWorkers((prev) => [
      {
        id: `wk-${seq.current++}`,
        siteId: activeSite.siteId,
        name: wkName.trim(),
        role: wkRole.trim(),
        readiness: wkReady,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setWkName("");
    setWkRole("");
  };

  const createBrief = () => {
    if (!activeSite || !brScope.trim()) return;
    setBriefs((prev) => [
      {
        id: `br-${seq.current++}`,
        siteId: activeSite.siteId,
        jobScope: brScope.trim(),
        hazards: brHazards.trim() || "TBD",
        controls: brControls.trim() || "TBD",
        roles: brRoles.trim() || "Crew",
        status: "issued",
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setBrScope("");
    setBrHazards("");
    setBrControls("");
    setBrRoles("");
  };

  const acknowledgeBrief = (id: string) => {
    setBriefs((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "acknowledged", timestamp: new Date().toISOString(), userId: 1 }
          : b,
      ),
    );
  };

  const issuePermit = () => {
    if (!activeSite || !pmTitle.trim() || !pmExpires) return;
    const status = permitStatus(pmExpires);
    setPermits((prev) => [
      {
        id: `pm-${seq.current++}`,
        siteId: activeSite.siteId,
        type: pmType,
        title: pmTitle.trim(),
        expiresAt: pmExpires,
        status,
        timestamp: new Date().toISOString(),
        userId: 1,
      },
      ...prev,
    ]);
    setPmTitle("");
    setPmExpires("");
  };

  return (
    <div className="space-y-4">
      <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={cn(veriforgeTypography.heading, "text-lg text-[#FAFAFA]")}>
              Site Safety Planning System
            </h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              Hazard mapping, controls, procedures, maps, assignments, briefs, permits, analytics.
            </p>
          </div>
          <ShieldGridIcon className="text-[#1E6FB8]" />
        </div>
        <VeriForgeDivider className="my-3" />
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Sites" value={String(analytics.siteCount)} />
          <Metric
            label="Critical Hazards"
            value={String(analytics.criticalHazards)}
            critical={analytics.criticalHazards > 0}
          />
          <Metric
            label="Missing Controls"
            value={String(analytics.missingControls)}
            critical={analytics.missingControls > 0}
          />
          <Metric
            label="Expired Permits"
            value={String(analytics.expiredPermits)}
            critical={analytics.expiredPermits > 0}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <VeriForgeProgressBar label="Site Safety Score" value={analytics.averageSafetyScore} />
          <VeriForgeProgressBar label="Planning Completeness" value={analytics.averageCompleteness} />
          <VeriForgeProgressBar label="Control Coverage" value={analytics.controlCoverage} />
        </div>
      </VeriForgeFrame>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Sites + Hazard Mapping */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            Sites · 1. Hazard Mapping
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {sites.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => setSelectedSite(site.siteId)}
                className={cn(
                  "w-full border px-3 py-2 text-left",
                  selectedSite === site.siteId
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.16)] shadow-[inset_3px_0_0_#1E6FB8]"
                    : site.safetyScore < 65
                      ? "border-[#1E6FB8] bg-[#1f1f1f] shadow-[0_0_12px_rgba(30, 111, 184,.25)]"
                      : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{site.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {site.location} · score {site.safetyScore}% · complete {site.completeness}%
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  siteId: {site.siteId} · userId: {site.userId} · {site.timestamp.slice(0, 19)}
                </p>
              </button>
            ))}
          </div>
          <div className="mb-3 space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField
              label="Site name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
            <VeriForgeTextField
              label="Location"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={createSite}>
              Create Site Plan
            </VeriForgeButton>
          </div>

          <div className="relative mb-3 h-48 overflow-hidden border border-[#424242] bg-[linear-gradient(160deg,#1f1f1f_0%,#141414_55%,#1a1212_100%)]">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(#424242_1px,transparent_1px),linear-gradient(90deg,#424242_1px,transparent_1px)] [background-size:24px_24px]" />
            {siteHazards.map((hz) => (
              <div
                key={hz.id}
                className={cn(
                  "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border text-[9px] uppercase",
                  hz.tone === "high_risk"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.35)] text-[#ffc9c9] shadow-[0_0_14px_rgba(30, 111, 184,.55)]"
                    : hz.tone === "restricted"
                      ? "border-[#1E6FB8] bg-[#2a1a1a] text-[#ffd0d0]"
                      : "border-[#424242] bg-[#2a2a2a] text-[#cfcfcf]",
                )}
                style={{ left: `${hz.x}%`, top: `${hz.y}%` }}
                title={`${hz.name}: ${hz.description}`}
              >
                {hz.risk.slice(0, 1)}
              </div>
            ))}
            <p className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.12em] text-[#9f9f9f]">
              Map overlay · red = high-risk
            </p>
          </div>

          <div className="mb-3 space-y-2">
            {siteHazards.map((hz) => (
              <div
                key={hz.id}
                className={cn(
                  "border px-3 py-2",
                  hz.risk === "critical"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{hz.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {hz.risk} · {hz.description}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Hazard name" value={hzName} onChange={(e) => setHzName(e.target.value)} />
            <VeriForgeSelect
              label="Risk"
              value={hzRisk}
              onChange={(e) => setHzRisk(e.target.value as HazardRisk)}
              options={[
                { label: "Critical", value: "critical" },
                { label: "High", value: "high" },
                { label: "Moderate", value: "moderate" },
                { label: "Low", value: "low" },
              ]}
            />
            <VeriForgeTextField label="Description" value={hzDesc} onChange={(e) => setHzDesc(e.target.value)} />
            <VeriForgeButton className="w-full" onClick={addHazard}>
              Map Hazard
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* Control Planning */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            2. Control Planning
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {siteControls.map((ctl) => (
              <button
                key={ctl.id}
                type="button"
                onClick={() => toggleControl(ctl.id)}
                className={cn(
                  "w-full border px-3 py-2 text-left",
                  ctl.status === "missing"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]"
                    : "border-[#424242] bg-[#1f1f1f]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{ctl.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {ctl.type} · {ctl.status} · tap to toggle
                </p>
              </button>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField label="Control name" value={ctlName} onChange={(e) => setCtlName(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Type"
                value={ctlType}
                onChange={(e) => setCtlType(e.target.value as ControlType)}
                options={[
                  { label: "Engineering", value: "engineering" },
                  { label: "Administrative", value: "administrative" },
                  { label: "PPE", value: "ppe" },
                ]}
              />
              <VeriForgeSelect
                label="Status"
                value={ctlStatus}
                onChange={(e) => setCtlStatus(e.target.value as ControlStatus)}
                options={[
                  { label: "In place", value: "in_place" },
                  { label: "Partial", value: "partial" },
                  { label: "Missing", value: "missing" },
                ]}
              />
            </div>
            <VeriForgeButton className="w-full" onClick={addControl}>
              Add Control
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Safe Work Procedures */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            3. Safe Work Procedures
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {siteProcedures.map((swp) => (
              <div
                key={swp.id}
                className="border border-[#424242] bg-[linear-gradient(145deg,#262626_0%,#171717_100%)]"
              >
                <div className="border-b border-[#424242] bg-[linear-gradient(90deg,#2a2a2a_0%,#1a1a1a_100%)] px-3 py-2">
                  <p className="text-sm text-[#FAFAFA]">{swp.title}</p>
                  <div className="mt-1 h-0.5 w-16 bg-[#1E6FB8]" />
                </div>
                <div className="space-y-1 px-3 py-2">
                  {swp.criticalSteps.map((step, idx) => (
                    <p key={`${swp.id}-${idx}`} className="flex items-start gap-2 text-xs text-[#cfcfcf]">
                      <span className="mt-1 h-2 w-2 shrink-0 bg-[#1E6FB8]" />
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Procedure title" value={swpTitle} onChange={(e) => setSwpTitle(e.target.value)} />
            <VeriForgeTextField
              label="Critical steps (comma-separated)"
              value={swpSteps}
              onChange={(e) => setSwpSteps(e.target.value)}
            />
            <VeriForgeButton className="w-full" onClick={addProcedure}>
              Add Procedure
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* Site Maps */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            4. Site Maps
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="relative mb-3 h-40 border border-[#424242] bg-[#151515] p-3">
            {siteRoutes.map((rt, idx) => (
              <div
                key={rt.id}
                className={cn(
                  "mb-2 flex items-center gap-2 border-l-2 px-2 py-1",
                  rt.restricted
                    ? "border-l-[#1E6FB8] bg-[rgba(30, 111, 184,.12)] shadow-[0_0_8px_rgba(30, 111, 184,.2)]"
                    : "border-l-[#8a8a8a] bg-[#1f1f1f]",
                )}
                style={{ marginLeft: `${idx * 8}px` }}
              >
                <ForgeBoltIcon className={cn("h-3 w-3", rt.restricted ? "text-[#1E6FB8]" : "text-[#9a9a9a]")} />
                <div>
                  <p className="text-xs text-[#f0f0f0]">{rt.name}</p>
                  <p className="text-[10px] text-[#aaaaaa]">
                    {rt.fromZone} → {rt.toZone}
                    {rt.restricted ? " · restricted" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Route name" value={rtName} onChange={(e) => setRtName(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeTextField label="From" value={rtFrom} onChange={(e) => setRtFrom(e.target.value)} />
              <VeriForgeTextField label="To" value={rtTo} onChange={(e) => setRtTo(e.target.value)} />
            </div>
            <VeriForgeSelect
              label="Restricted"
              value={rtRestricted}
              onChange={(e) => setRtRestricted(e.target.value)}
              options={[
                { label: "No", value: "false" },
                { label: "Yes", value: "true" },
              ]}
            />
            <VeriForgeButton className="w-full" onClick={addRoute}>
              Add Map Route
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Worker Assignments */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            5. Worker Assignments
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {siteWorkers.map((wk) => (
              <div
                key={wk.id}
                className={cn(
                  "border px-3 py-2",
                  wk.readiness === "compliant"
                    ? "border-[#424242] bg-[#1f1f1f]"
                    : "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_10px_rgba(30, 111, 184,.28)]",
                )}
              >
                <p className="text-sm text-[#f0f0f0]">{wk.name}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {wk.role} · {wk.readiness.replaceAll("_", " ")}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Worker name" value={wkName} onChange={(e) => setWkName(e.target.value)} />
            <VeriForgeTextField label="Role" value={wkRole} onChange={(e) => setWkRole(e.target.value)} />
            <VeriForgeSelect
              label="Readiness"
              value={wkReady}
              onChange={(e) => setWkReady(e.target.value as WorkerReadiness)}
              options={[
                { label: "Compliant", value: "compliant" },
                { label: "Missing training", value: "missing_training" },
                { label: "Missing verification", value: "missing_verification" },
              ]}
            />
            <VeriForgeButton className="w-full" onClick={assignWorker}>
              Assign Worker
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* Pre-Job Briefs */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            6. Pre-Job Briefs
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {siteBriefs.map((br) => (
              <div key={br.id} className="border border-[#424242] bg-[#1f1f1f] p-3">
                <p className="text-sm text-[#f0f0f0]">{br.jobScope}</p>
                <p className="mt-1 text-xs text-[#aaaaaa]">Hazards: {br.hazards}</p>
                <p className="text-xs text-[#aaaaaa]">Controls: {br.controls}</p>
                <p className="text-xs text-[#aaaaaa]">Roles: {br.roles}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
                  {br.status} · siteId: {br.siteId} · userId: {br.userId}
                </p>
                {br.status !== "acknowledged" ? (
                  <VeriForgeButton
                    className="mt-2 w-full shadow-[0_0_12px_rgba(30, 111, 184,.35)]"
                    onClick={() => acknowledgeBrief(br.id)}
                  >
                    Acknowledge Brief
                  </VeriForgeButton>
                ) : (
                  <p className="mt-2 text-xs text-[#b8e0b8]">Brief acknowledged.</p>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2 border border-[#424242] bg-[linear-gradient(145deg,#222_0%,#171717_100%)] p-3">
            <VeriForgeTextField label="Job scope" value={brScope} onChange={(e) => setBrScope(e.target.value)} />
            <VeriForgeTextField label="Hazards" value={brHazards} onChange={(e) => setBrHazards(e.target.value)} />
            <VeriForgeTextField label="Controls" value={brControls} onChange={(e) => setBrControls(e.target.value)} />
            <VeriForgeTextField label="Roles" value={brRoles} onChange={(e) => setBrRoles(e.target.value)} />
            <VeriForgeButton className="w-full" onClick={createBrief}>
              Issue Brief
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Permits */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
            7. Permits
          </h3>
          <VeriForgeDivider className="my-3" />
          <div className="mb-3 space-y-2">
            {sitePermits.map((pm) => (
              <div
                key={pm.id}
                className={cn(
                  "border px-3 py-2",
                  pm.status === "expired"
                    ? "border-[#1E6FB8] bg-[rgba(30, 111, 184,.14)] shadow-[0_0_12px_rgba(30, 111, 184,.3)]"
                    : "border-[#6a6a6a] bg-[linear-gradient(145deg,#222_0%,#171717_100%)]",
                )}
              >
                <div className="mb-1 h-0.5 w-12 bg-[#1E6FB8]" />
                <p className="text-sm text-[#f0f0f0]">{pm.title}</p>
                <p className="text-xs text-[#aaaaaa]">
                  {pm.type.replaceAll("_", " ")} · expires {pm.expiresAt} · {pm.status}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <VeriForgeTextField label="Permit title" value={pmTitle} onChange={(e) => setPmTitle(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-2">
              <VeriForgeSelect
                label="Type"
                value={pmType}
                onChange={(e) => setPmType(e.target.value as PermitType)}
                options={[
                  { label: "Hot work", value: "hot_work" },
                  { label: "Confined space", value: "confined_space" },
                  { label: "Electrical", value: "electrical" },
                  { label: "Excavation", value: "excavation" },
                ]}
              />
              <VeriForgeTextField
                label="Expires"
                type="date"
                value={pmExpires}
                onChange={(e) => setPmExpires(e.target.value)}
              />
            </div>
            <VeriForgeButton className="w-full" onClick={issuePermit}>
              Issue Permit
            </VeriForgeButton>
          </div>
        </VeriForgeFrame>

        {/* Analytics */}
        <VeriForgeFrame className="border-[#424242] bg-[#1A1A1A] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className={cn(veriforgeTypography.heading, "text-sm text-[#FAFAFA]")}>
              8. Site Safety Analytics
            </h3>
            <HeatEdgeIcon className="text-[#1E6FB8]" />
          </div>
          <VeriForgeDivider className="my-3" />
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.1em] text-[#9f9f9f]">
                <span>Hazard density</span>
                <span className="text-[#ffc9c9]">{analytics.hazardDensity}/site</span>
              </div>
              <div className="h-2 border border-[#424242] bg-[#151515]">
                <div
                  className="h-full bg-[linear-gradient(90deg,#424242_0%,#1E6FB8_100%)]"
                  style={{ width: `${Math.min(100, analytics.hazardDensity * 25)}%` }}
                />
              </div>
            </div>
            <VeriForgeProgressBar label="Control coverage" value={analytics.controlCoverage} />
            <VeriForgeProgressBar label="Worker readiness" value={analytics.workerReadiness} />
            <VeriForgeProgressBar
              label="Brief acknowledgement"
              value={analytics.briefAcknowledgement}
            />
            <div className="grid gap-2 md:grid-cols-2">
              <Metric
                label="Non-compliant workers"
                value={String(analytics.nonCompliantWorkers)}
                critical={analytics.nonCompliantWorkers > 0}
              />
              <Metric
                label="Avg safety score"
                value={`${analytics.averageSafetyScore}%`}
                critical={analytics.averageSafetyScore < 70}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f8f8f]">
              Synced · {analytics.timestamp.slice(0, 19)} · dashboard + mobile
            </p>
          </div>
        </VeriForgeFrame>
      </div>

      {activeSite ? (
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#8f8f8f]">
          Active plan metadata · timestamp: {activeSite.timestamp.slice(0, 19)} · userId:{" "}
          {activeSite.userId} · siteId: {activeSite.siteId}
        </p>
      ) : null}
      <div className="flex gap-3 text-[#1E6FB8]">
        <AnvilIcon />
        <ForgeBoltIcon />
        <ShieldGridIcon />
      </div>
    </div>
  );
}
