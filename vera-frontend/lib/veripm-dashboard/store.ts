/**
 * In-memory VERIPM Dashboard store (preview).
 */

import { compareToIndustry } from "@/lib/dashboard-analytics/industry";
import { emitAnalyticsEvent, getAnalyticsRevision } from "@/lib/dashboard-analytics/events";
import { drillPermits, permitMetrics, projectPermitLoad } from "@/lib/veripm-fieldos-permits/store";
import { getPmFormula } from "./formulas";
import type {
  ContractorCard,
  Metric,
  RelatedCompany,
  VeriPmAssetDashboard,
  VeriPmCompanyDashboard,
  VeriPmDrillResponse,
  VeriPmProjectDashboard,
} from "./types";

type WorkOrder = {
  id: string;
  title: string;
  status: "open" | "overdue" | "completed" | "cancelled";
  completedOnTime?: boolean;
  dueAt: string;
  assetId: string;
  assetName: string;
  technician?: string;
  highRisk?: boolean;
  contractorCompanyId?: number;
  projectId: number;
  href: string;
  documentId: string;
};

type Downtime = {
  id: string;
  assetId: string;
  assetName: string;
  hours: number;
  reason: string;
  href: string;
};

type Failure = {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  href: string;
  documentId: string;
};

type SafetyLink = {
  id: string;
  title: string;
  type: "INCIDENT" | "FLHA" | "JHA";
  assetId?: string;
  workOrderId?: string;
  href: string;
  documentId: string;
};

type Asset = {
  id: string;
  name: string;
  warrantyDaysLeft: number | null;
  operatingHours: number;
};

type StoreState = {
  workOrders: WorkOrder[];
  downtime: Downtime[];
  failures: Failure[];
  safetyLinks: SafetyLink[];
  assets: Asset[];
  technicians: string[];
  contractors: ContractorCard[];
  relatedByProject: Record<number, RelatedCompany[]>;
  workHours: number;
  availableHours: number;
};

const g = globalThis as unknown as { __veripmDashStore?: StoreState };

function isoDaysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

function seed(): StoreState {
  const assets: Asset[] = [
    { id: "eq-1", name: "Excavator EX-220", warrantyDaysLeft: 45, operatingHours: 1200 },
    { id: "eq-2", name: "Crane CR-90", warrantyDaysLeft: 120, operatingHours: 800 },
    { id: "eq-3", name: "Generator GEN-12", warrantyDaysLeft: 12, operatingHours: 2100 },
    { id: "eq-4", name: "Compressor CP-4", warrantyDaysLeft: null, operatingHours: 950 },
  ];

  const workOrders: WorkOrder[] = [
    {
      id: "wo-1",
      title: "PM-500hr — Excavator EX-220",
      status: "completed",
      completedOnTime: true,
      dueAt: isoDaysAgo(5),
      assetId: "eq-1",
      assetName: "Excavator EX-220",
      technician: "Morgan Blake",
      projectId: 1,
      href: "/pm/equipment-safety/1",
      documentId: "wo-doc-1",
    },
    {
      id: "wo-2",
      title: "PM quarterly — Crane CR-90",
      status: "overdue",
      dueAt: isoDaysAgo(3),
      assetId: "eq-2",
      assetName: "Crane CR-90",
      technician: "Riley Park",
      highRisk: true,
      projectId: 1,
      href: "/pm/equipment-safety",
      documentId: "wo-doc-2",
    },
    {
      id: "wo-3",
      title: "Filter change — Generator GEN-12",
      status: "completed",
      completedOnTime: false,
      dueAt: isoDaysAgo(10),
      assetId: "eq-3",
      assetName: "Generator GEN-12",
      technician: "Morgan Blake",
      projectId: 1,
      contractorCompanyId: 201,
      href: "/pm/documents",
      documentId: "wo-doc-3",
    },
    {
      id: "wo-4",
      title: "LOTO inspection — Compressor CP-4",
      status: "open",
      dueAt: isoDaysAgo(-4),
      assetId: "eq-4",
      assetName: "Compressor CP-4",
      technician: "Avery Chen",
      highRisk: true,
      projectId: 1,
      href: "/pm/equipment-safety",
      documentId: "wo-doc-4",
    },
    {
      id: "wo-5",
      title: "Vendor service — Crane CR-90",
      status: "overdue",
      dueAt: isoDaysAgo(8),
      assetId: "eq-2",
      assetName: "Crane CR-90",
      technician: "Vendor — LiftCo",
      projectId: 1,
      contractorCompanyId: 203,
      href: "/pm/documents",
      documentId: "wo-doc-5",
    },
    {
      id: "wo-6",
      title: "PM monthly — Generator GEN-12",
      status: "completed",
      completedOnTime: true,
      dueAt: isoDaysAgo(20),
      assetId: "eq-3",
      assetName: "Generator GEN-12",
      technician: "Riley Park",
      projectId: 2,
      href: "/pm/equipment-safety",
      documentId: "wo-doc-6",
    },
    {
      id: "wo-7",
      title: "Hydraulic check — Excavator EX-220",
      status: "overdue",
      dueAt: isoDaysAgo(1),
      assetId: "eq-1",
      assetName: "Excavator EX-220",
      technician: "Morgan Blake",
      projectId: 1,
      href: "/pm/equipment-safety/1",
      documentId: "wo-doc-7",
    },
    {
      id: "wo-8",
      title: "PM belt — Compressor CP-4",
      status: "completed",
      completedOnTime: true,
      dueAt: isoDaysAgo(15),
      assetId: "eq-4",
      assetName: "Compressor CP-4",
      technician: "Avery Chen",
      projectId: 2,
      href: "/pm/equipment-safety",
      documentId: "wo-doc-8",
    },
  ];

  return {
    workOrders,
    downtime: [
      {
        id: "dt-1",
        assetId: "eq-2",
        assetName: "Crane CR-90",
        hours: 36,
        reason: "LOTO / failure",
        href: "/pm/equipment-safety",
      },
      {
        id: "dt-2",
        assetId: "eq-1",
        assetName: "Excavator EX-220",
        hours: 18,
        reason: "Planned PM",
        href: "/pm/equipment-safety/1",
      },
      {
        id: "dt-3",
        assetId: "eq-3",
        assetName: "Generator GEN-12",
        hours: 72,
        reason: "Failure",
        href: "/pm/equipment-safety",
      },
    ],
    failures: [
      {
        id: "fail-1",
        title: "Hydraulic leak — EX-220",
        assetId: "eq-1",
        assetName: "Excavator EX-220",
        href: "/pm/equipment-safety/1",
        documentId: "fail-doc-1",
      },
      {
        id: "fail-2",
        title: "Starter fault — GEN-12",
        assetId: "eq-3",
        assetName: "Generator GEN-12",
        href: "/pm/equipment-safety",
        documentId: "fail-doc-2",
      },
    ],
    safetyLinks: [
      {
        id: "sl-1",
        title: "Incident — Pinch point during PM",
        type: "INCIDENT",
        assetId: "eq-1",
        workOrderId: "wo-1",
        href: "/pm/incidents",
        documentId: "inc-pm-1",
      },
      {
        id: "sl-2",
        title: "FLHA — Crane LOTO",
        type: "FLHA",
        assetId: "eq-2",
        workOrderId: "wo-2",
        href: "/pm/documents",
        documentId: "flha-pm-1",
      },
      {
        id: "sl-3",
        title: "JHA — Generator service",
        type: "JHA",
        assetId: "eq-3",
        workOrderId: "wo-3",
        href: "/pm/jha-flha",
        documentId: "jha-pm-1",
      },
      {
        id: "sl-4",
        title: "Incident — Hot surface burn",
        type: "INCIDENT",
        assetId: "eq-3",
        href: "/pm/incidents",
        documentId: "inc-pm-2",
      },
    ],
    assets,
    technicians: ["Morgan Blake", "Riley Park", "Avery Chen"],
    contractors: [
      {
        contractorCompanyId: 201,
        name: "Northline Electrical",
        programScore: 82,
        grade: "B",
        incidentRate: 2.1,
        trainingCompliantPct: 88,
        pmCompletionRate: 88,
        failureCount: 1,
        href: "/core/contractor-scores?contractorCompanyId=201",
      },
      {
        contractorCompanyId: 203,
        name: "Apex Scaffolding",
        programScore: 88,
        grade: "B",
        incidentRate: 1.2,
        trainingCompliantPct: 91,
        pmCompletionRate: 70,
        failureCount: 0,
        href: "/core/contractor-scores?contractorCompanyId=203",
      },
      {
        contractorCompanyId: 202,
        name: "Summit Civil Sub",
        programScore: 71,
        grade: "C",
        incidentRate: 3.4,
        trainingCompliantPct: 76,
        pmCompletionRate: 62,
        failureCount: 2,
        href: "/core/contractor-scores?contractorCompanyId=202",
      },
    ],
    relatedByProject: {
      1: [
        {
          companyId: 1,
          name: "Acme Civil (prime)",
          linkRole: "prime",
          pmCompletionRate: 91,
          downtimeHours: 126,
          incidentRate: 1.8,
          programScore: null,
          grade: null,
          href: "/pm/dashboard?projectId=1",
        },
        {
          companyId: 201,
          name: "Northline Electrical",
          linkRole: "contractor",
          pmCompletionRate: 88,
          downtimeHours: 12,
          incidentRate: 2.1,
          programScore: 82,
          grade: "B",
          href: "/core/contractor-scores?contractorCompanyId=201",
        },
        {
          companyId: 203,
          name: "Apex Scaffolding",
          linkRole: "contractor",
          pmCompletionRate: 70,
          downtimeHours: 36,
          incidentRate: 1.2,
          programScore: 88,
          grade: "B",
          href: "/core/contractor-scores?contractorCompanyId=203",
        },
      ],
    },
    workHours: 42000,
    availableHours: 4 * 90 * 24 * 0.33,
  };
}

function store(): StoreState {
  if (!g.__veripmDashStore) g.__veripmDashStore = seed();
  return g.__veripmDashStore;
}

function metric(
  key: string,
  value: number | null,
  inputs: Record<string, number | null>,
  hoursBasis: Metric["hoursBasis"] = "actual",
): Metric {
  const f = getPmFormula(key);
  const industry = compareToIndustry(
    key === "asset.downtime_hours" ? "asset.downtime_pct" : key,
    key === "asset.downtime_hours"
      ? null
      : value,
  );
  // attach industry for known keys
  const withIndustry =
    key === "pm.completion_rate" ||
    key === "asset.downtime_pct" ||
    key === "pm_safety.incident_rate"
      ? compareToIndustry(key, value)
      : industry.industryValue != null
        ? industry
        : undefined;

  return {
    key,
    label: f.label,
    value,
    unit: f.unit,
    formula: f.formula,
    formulaId: f.formulaId,
    sourceQuery: f.sourceQuery,
    inputs,
    asOf: new Date().toISOString(),
    hoursBasis,
    industry: withIndustry,
  };
}

function filterWos(projectId?: number | null) {
  const s = store();
  return projectId
    ? s.workOrders.filter((w) => w.projectId === projectId)
    : s.workOrders;
}

export function getCompanyDashboard(opts: {
  companyId?: number;
  projectId?: number | null;
} = {}): VeriPmCompanyDashboard {
  const s = store();
  const rev = getAnalyticsRevision();
  const wos = filterWos(opts.projectId);
  const due = wos.filter((w) => w.status !== "cancelled");
  const completedOnTime = due.filter((w) => w.status === "completed" && w.completedOnTime).length;
  const dueCount = due.filter(
    (w) => w.status === "completed" || w.status === "overdue" || w.status === "open",
  ).length;
  const overdue = wos.filter((w) => w.status === "overdue").length;
  const downtimeHours = s.downtime.reduce((a, d) => a + d.hours, 0);
  const downtimePct =
    s.availableHours > 0
      ? Math.round((downtimeHours / s.availableHours) * 1000) / 10
      : 0;
  const opHours = s.assets.reduce((a, x) => a + x.operatingHours, 0);
  const failureRate =
    opHours > 0
      ? Math.round((s.failures.length / opHours) * 1000 * 100) / 100
      : null;
  const openWos = wos.filter((w) => w.status === "open" || w.status === "overdue").length;
  const workload =
    s.technicians.length > 0
      ? Math.round((openWos / s.technicians.length) * 10) / 10
      : openWos;
  const warranty = s.assets.filter(
    (a) => a.warrantyDaysLeft != null && a.warrantyDaysLeft <= 90,
  ).length;

  const maintIncidents = s.safetyLinks.filter((l) => l.type === "INCIDENT");
  const highRisk = wos.filter((w) => w.highRisk).length;
  const flhaJha = s.safetyLinks.filter((l) => l.type === "FLHA" || l.type === "JHA").length;
  const maintIncidentRate =
    s.workHours > 0
      ? Math.round((maintIncidents.length / s.workHours) * 200000 * 100) / 100
      : null;

  const pmCompletion =
    dueCount > 0 ? Math.round((completedOnTime / dueCount) * 1000) / 10 : 0;

  const permitStats = permitMetrics(opts.projectId);

  const pmCompletionMetric = metric("pm.completion_rate", pmCompletion, {
    pm_completed_on_time: completedOnTime,
    pm_due_in_period: dueCount,
  });
  const downtimePctMetric = metric("asset.downtime_pct", downtimePct, {
    downtime_hours: downtimeHours,
    available_hours: Math.round(s.availableHours),
  });
  const maintIncidentRateMetric = metric(
    "pm_safety.incident_rate",
    maintIncidentRate,
    {
      maint_incidents: maintIncidents.length,
      work_hours: s.workHours,
    },
  );

  return {
    generatedAt: rev.generatedAt,
    revision: rev.revision,
    companyId: opts.companyId ?? 1,
    projectId: opts.projectId ?? null,
    period: { start: isoDaysAgo(90), end: new Date().toISOString() },
    maintenance: {
      pmCompletionRate: pmCompletionMetric,
      overduePmCount: metric("pm.overdue_count", overdue, { overdue }),
      downtimeHours: metric("asset.downtime_hours", downtimeHours, {
        downtime_hours: downtimeHours,
      }),
      downtimePct: downtimePctMetric,
      failureRate: metric("asset.failure_rate", failureRate, {
        failures: s.failures.length,
        operating_hours: opHours,
      }),
      technicianWorkload: metric("pm.technician_workload", workload, {
        open_work_orders: openWos,
        active_technicians: s.technicians.length,
      }),
      warrantyExpiring: metric("pm.warranty_expiring", warranty, {
        expiring_90d: warranty,
      }),
      industry: {
        pmCompletionRate:
          pmCompletionMetric.industry ?? compareToIndustry("pm.completion_rate", pmCompletion),
        downtimePct:
          downtimePctMetric.industry ?? compareToIndustry("asset.downtime_pct", downtimePct),
        maintenanceIncidentRate:
          maintIncidentRateMetric.industry ??
          compareToIndustry("pm_safety.incident_rate", maintIncidentRate),
      },
    },
    safetyFromMaintenance: {
      incidentCount: metric("pm_safety.incident_count", maintIncidents.length, {
        maint_incidents: maintIncidents.length,
      }),
      incidentRate: maintIncidentRateMetric,
      highRiskPm: metric("pm_safety.high_risk_pm", highRisk, {
        high_risk_count: highRisk,
      }),
      flhaJhaLinked: metric("pm_safety.flha_jha_linked", flhaJha, {
        linked_count: flhaJha,
      }),
    },
    permits: {
      activeOpen: metric("pm.permits_active", permitStats.permitProtectedWork, {
        open_permits: permitStats.permitProtectedWork,
      }),
      highRiskOpen: metric("pm.permits_high_risk", permitStats.highRiskOpen, {
        high_risk_open: permitStats.highRiskOpen,
      }),
      fieldOsLinked: metric("pm.permits_by_status", permitStats.fieldOsLinked, {
        fieldos_linked: permitStats.fieldOsLinked,
      }),
      byStatus: permitStats.byStatus,
    },
    contractors: s.contractors,
    projectsSummary: [
      {
        projectId: 1,
        name: "Aurora North Expansion",
        pmCompletionRate: pmCompletion,
        overduePmCount: overdue,
        downtimeHours,
        contractorCount: s.contractors.length,
      },
      {
        projectId: 2,
        name: "South Gate Tie-in",
        pmCompletionRate: 95,
        overduePmCount: 1,
        downtimeHours: 24,
        contractorCount: 2,
      },
    ],
    freshness: {
      lastEventAt: rev.lastEvent?.at ?? null,
      lastRebuildAt: rev.generatedAt,
      pendingInvalidation: rev.pendingInvalidation,
    },
  };
}

export function getProjectDashboard(projectId: number): VeriPmProjectDashboard {
  const s = store();
  const base = getCompanyDashboard({ projectId });
  const wos = filterWos(projectId);
  const overdue = wos.filter((w) => w.status === "overdue").length;
  const completedOnTime = wos.filter((w) => w.status === "completed" && w.completedOnTime).length;
  const dueCount = wos.filter((w) => w.status !== "cancelled").length;
  const load = projectPermitLoad(projectId);
  return {
    ...base,
    relatedCompanies: s.relatedByProject[projectId] ?? [],
    projectPerformance: {
      pmCompletionRate:
        dueCount > 0 ? Math.round((completedOnTime / dueCount) * 1000) / 10 : 0,
      overduePmCount: overdue,
      downtimeHours: s.downtime.reduce((a, d) => a + d.hours, 0),
      maintIncidentCount: s.safetyLinks.filter((l) => l.type === "INCIDENT").length,
    },
    projectPermits: load,
    permits: {
      ...base.permits,
      byRisk: load.byRisk,
      contractorCompliancePct: load.contractorCompliancePct,
    },
  };
}

export function getAssetDashboard(assetId: string): VeriPmAssetDashboard | null {
  const s = store();
  const asset = s.assets.find((a) => a.id === assetId);
  if (!asset) return null;
  const wos = s.workOrders.filter((w) => w.assetId === assetId);
  const overdue = wos.filter((w) => w.status === "overdue").length;
  const completedOnTime = wos.filter((w) => w.status === "completed" && w.completedOnTime).length;
  const dueCount = wos.filter((w) => w.status !== "cancelled").length;
  const downtimeHours = s.downtime
    .filter((d) => d.assetId === assetId)
    .reduce((a, d) => a + d.hours, 0);
  const failures = s.failures.filter((f) => f.assetId === assetId);
  const failureRate =
    asset.operatingHours > 0
      ? Math.round((failures.length / asset.operatingHours) * 1000 * 100) / 100
      : null;
  const rev = getAnalyticsRevision();

  return {
    asset: {
      assetId: asset.id,
      name: asset.name,
      pmCompletionRate:
        dueCount > 0 ? Math.round((completedOnTime / dueCount) * 1000) / 10 : 0,
      overdueCount: overdue,
      downtimeHours,
      failureRate,
      warrantyDaysLeft: asset.warrantyDaysLeft,
    },
    metrics: [
      metric("pm.completion_rate", dueCount ? Math.round((completedOnTime / dueCount) * 1000) / 10 : 0, {
        pm_completed_on_time: completedOnTime,
        pm_due_in_period: dueCount,
      }),
      metric("pm.overdue_count", overdue, { overdue }),
      metric("asset.downtime_hours", downtimeHours, { downtime_hours: downtimeHours }),
      metric("asset.failure_rate", failureRate, {
        failures: failures.length,
        operating_hours: asset.operatingHours,
      }),
    ],
    recentWorkOrders: wos.map((w) => ({
      id: w.id,
      title: w.title,
      status: w.status,
      dueAt: w.dueAt,
      href: w.href,
    })),
    linkedSafety: s.safetyLinks
      .filter((l) => l.assetId === assetId)
      .map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        href: l.href,
      })),
    revision: rev.revision,
    generatedAt: rev.generatedAt,
  };
}

export function getDrill(
  metricKey: string,
  opts: { projectId?: number; assetId?: string; page?: number; pageSize?: number } = {},
): VeriPmDrillResponse {
  const s = store();
  const f = getPmFormula(metricKey);
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 25;
  let items: VeriPmDrillResponse["items"] = [];
  let inputs: Record<string, number | null> = {};

  const wos = filterWos(opts.projectId).filter((w) =>
    opts.assetId ? w.assetId === opts.assetId : true,
  );

  if (metricKey.startsWith("pm.permits")) {
    const d = drillPermits(metricKey, opts.projectId);
    return {
      metricKey,
      label: f.label,
      formula: f.formula,
      formulaId: f.formulaId,
      sourceQuery: f.sourceQuery,
      inputs: d.inputs,
      filters: d.filters,
      page,
      pageSize,
      total: d.total,
      items: d.items.map((i) => ({
        id: i.id,
        title: i.title,
        subtitle: i.subtitle,
        status: i.status,
        dueAt: i.dueAt,
        href: i.href,
        documentId: i.documentId,
        documentType: i.documentType,
        related: i.related as Record<string, string | number | null | undefined>,
      })),
    };
  }

  if (metricKey === "pm.overdue_count" || metricKey === "pm.completion_rate") {
    const rows =
      metricKey === "pm.overdue_count"
        ? wos.filter((w) => w.status === "overdue")
        : wos;
    inputs = {
      overdue: wos.filter((w) => w.status === "overdue").length,
      pm_due_in_period: wos.length,
    };
    items = rows.map((w) => ({
      id: w.id,
      title: w.title,
      subtitle: `${w.assetName}${w.technician ? ` · ${w.technician}` : ""}`,
      status: w.status,
      dueAt: w.dueAt,
      href: w.href,
      documentId: w.documentId,
      documentType: "WorkOrder",
      related: {
        assetId: w.assetId,
        assetName: w.assetName,
        contractorId: w.contractorCompanyId,
      },
    }));
  } else if (metricKey.startsWith("asset.downtime")) {
    const rows = s.downtime.filter((d) =>
      opts.assetId ? d.assetId === opts.assetId : true,
    );
    inputs = { downtime_hours: rows.reduce((a, d) => a + d.hours, 0) };
    items = rows.map((d) => ({
      id: d.id,
      title: `${d.assetName} — ${d.hours}h`,
      subtitle: d.reason,
      href: d.href,
      related: { assetId: d.assetId, assetName: d.assetName },
    }));
  } else if (metricKey === "asset.failure_rate") {
    items = s.failures.map((f) => ({
      id: f.id,
      title: f.title,
      subtitle: f.assetName,
      href: f.href,
      documentId: f.documentId,
      documentType: "FailureReport",
      related: { assetId: f.assetId, assetName: f.assetName },
    }));
    inputs = { failures: s.failures.length };
  } else if (metricKey === "pm.technician_workload") {
    const byTech = new Map<string, number>();
    for (const w of wos.filter((x) => x.status === "open" || x.status === "overdue")) {
      const t = w.technician ?? "Unassigned";
      byTech.set(t, (byTech.get(t) ?? 0) + 1);
    }
    items = [...byTech.entries()].map(([tech, count]) => ({
      id: tech,
      title: tech,
      subtitle: `${count} open WOs`,
      status: String(count),
      href: "/pm/dashboard",
      related: { workerName: tech },
    }));
    inputs = { open_work_orders: wos.filter((w) => w.status !== "completed").length };
  } else if (metricKey === "pm.warranty_expiring") {
    items = s.assets
      .filter((a) => a.warrantyDaysLeft != null && a.warrantyDaysLeft <= 90)
      .map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: `${a.warrantyDaysLeft} days left`,
        href: `/pm/dashboard?assetId=${a.id}`,
        related: { assetId: a.id, assetName: a.name },
      }));
    inputs = { expiring_90d: items.length };
  } else if (metricKey.startsWith("pm_safety")) {
    let rows = s.safetyLinks;
    if (metricKey === "pm_safety.incident_count" || metricKey === "pm_safety.incident_rate") {
      rows = rows.filter((l) => l.type === "INCIDENT");
    }
    if (metricKey === "pm_safety.flha_jha_linked") {
      rows = rows.filter((l) => l.type === "FLHA" || l.type === "JHA");
    }
    if (metricKey === "pm_safety.high_risk_pm") {
      items = wos
        .filter((w) => w.highRisk)
        .map((w) => ({
          id: w.id,
          title: w.title,
          subtitle: "High-risk PM",
          status: w.status,
          href: w.href,
          documentId: w.documentId,
          documentType: "WorkOrder",
          related: { assetId: w.assetId, assetName: w.assetName, riskRating: "high" },
        }));
      inputs = { high_risk_count: items.length };
    } else {
      items = rows.map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: l.type,
        href: l.href,
        documentId: l.documentId,
        documentType: l.type,
        related: { assetId: l.assetId, jobId: l.workOrderId },
      }));
      inputs = { count: rows.length };
    }
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    metricKey,
    label: f.label,
    formula: f.formula,
    formulaId: f.formulaId,
    sourceQuery: f.sourceQuery,
    inputs,
    filters: {
      projectId: opts.projectId != null ? String(opts.projectId) : undefined,
      assetId: opts.assetId,
    },
    page,
    pageSize,
    total,
    items: items.slice(start, start + pageSize),
  };
}

export function emitPmEvent(eventName: string) {
  const s = store();
  if (eventName.includes("work_order") || eventName.includes("pm")) {
    s.workOrders.unshift({
      id: `wo-live-${Date.now()}`,
      title: "PM — Live update",
      status: "completed",
      completedOnTime: true,
      dueAt: new Date().toISOString(),
      assetId: "eq-1",
      assetName: "Excavator EX-220",
      technician: "Morgan Blake",
      projectId: 1,
      href: "/pm/equipment-safety/1",
      documentId: `wo-live-${Date.now()}`,
    });
  }
  if (eventName.includes("failure")) {
    s.failures.unshift({
      id: `fail-live-${Date.now()}`,
      title: "Failure — Live event",
      assetId: "eq-4",
      assetName: "Compressor CP-4",
      href: "/pm/equipment-safety",
      documentId: `fail-live-${Date.now()}`,
    });
  }
  if (eventName.includes("flha") || eventName.includes("incident")) {
    s.safetyLinks.unshift({
      id: `sl-live-${Date.now()}`,
      title: eventName.includes("incident")
        ? "Incident — Live maint link"
        : "FLHA — Live PM link",
      type: eventName.includes("incident") ? "INCIDENT" : "FLHA",
      assetId: "eq-2",
      workOrderId: "wo-2",
      href: "/pm/documents",
      documentId: `sl-live-${Date.now()}`,
    });
  }
  emitAnalyticsEvent(eventName, { domain: "VERIPM", scopeType: "company", scopeId: "1" });
  return getCompanyDashboard({});
}

export function listAssets() {
  return store().assets.map((a) => ({ id: a.id, name: a.name }));
}
