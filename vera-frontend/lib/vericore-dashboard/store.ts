/**
 * In-memory VERICore Dashboard store (preview).
 * Replace with Nest + Prisma per docs/VERIFORGE-VERICORE-DASHBOARD.md.
 */

import { getFormula } from "./formulas";
import type {
  ContractorCard,
  ContractorGrade,
  DrillItem,
  DrillResponse,
  IndustryCompare,
  Metric,
  RelatedCompany,
  RoleBand,
  SafetySlice,
  VeriCoreCompanyDashboard,
  VeriCoreProjectDashboard,
  VeriCoreWorkerDashboard,
  WorkerSummary,
} from "./types";
import { emitAnalyticsEvent } from "@/lib/dashboard-analytics/events";
import { drillPermits, permitMetrics } from "@/lib/veripm-fieldos-permits/store";

type TrainingRow = {
  id: string;
  workerId: string;
  workerName: string;
  roleBand: RoleBand;
  locationId: string;
  locationName: string;
  courseName: string;
  status: "compliant" | "expiring_soon" | "overdue" | "missing";
  dueAt: string | null;
  href: string;
};

type DocRow = {
  id: string;
  kind: "FLHA" | "JHA" | "INCIDENT" | "NEAR_MISS" | "CAPA" | "TOOLBOX";
  title: string;
  status: string;
  highRisk?: boolean;
  contractorCompanyId?: number;
  projectId: number;
  workerId?: string;
  workerName?: string;
  completedAt: string;
  href: string;
  documentId: string;
};

type StoreState = {
  revision: number;
  generatedAt: string;
  lastEventAt: string | null;
  pendingInvalidation: boolean;
  workHours: number;
  training: TrainingRow[];
  docs: DocRow[];
  contractors: ContractorCard[];
  relatedByProject: Record<number, RelatedCompany[]>;
};

const g = globalThis as unknown as { __vericoreDashStore?: StoreState };

function isoDaysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

function gradeFromScore(score: number): ContractorGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

function seed(): StoreState {
  const training: TrainingRow[] = [
    {
      id: "tr-1",
      workerId: "42",
      workerName: "Jordan Lee",
      roleBand: "field",
      locationId: "loc-north",
      locationName: "North Yard",
      courseName: "Fall Protection",
      status: "overdue",
      dueAt: isoDaysAgo(12),
      href: "/core/workers/42",
    },
    {
      id: "tr-2",
      workerId: "42",
      workerName: "Jordan Lee",
      roleBand: "field",
      locationId: "loc-north",
      locationName: "North Yard",
      courseName: "Confined Space",
      status: "compliant",
      dueAt: isoDaysAgo(-90),
      href: "/core/workers/42",
    },
    {
      id: "tr-3",
      workerId: "51",
      workerName: "Sam Ortiz",
      roleBand: "field",
      locationId: "loc-south",
      locationName: "South Gate",
      courseName: "H2S Awareness",
      status: "overdue",
      dueAt: isoDaysAgo(5),
      href: "/core/workers/51",
    },
    {
      id: "tr-4",
      workerId: "60",
      workerName: "Avery Chen",
      roleBand: "supervisor",
      locationId: "loc-north",
      locationName: "North Yard",
      courseName: "Supervisor Due Diligence",
      status: "compliant",
      dueAt: isoDaysAgo(-120),
      href: "/core/workers/60",
    },
    {
      id: "tr-5",
      workerId: "61",
      workerName: "Riley Park",
      roleBand: "supervisor",
      locationId: "loc-south",
      locationName: "South Gate",
      courseName: "Incident Investigation",
      status: "expiring_soon",
      dueAt: isoDaysAgo(-20),
      href: "/core/workers/61",
    },
    {
      id: "tr-6",
      workerId: "70",
      workerName: "Casey Ng",
      roleBand: "office",
      locationId: "loc-hq",
      locationName: "HQ Office",
      courseName: "WHMIS",
      status: "compliant",
      dueAt: isoDaysAgo(-200),
      href: "/core/workers/70",
    },
    {
      id: "tr-7",
      workerId: "71",
      workerName: "Morgan Blake",
      roleBand: "office",
      locationId: "loc-hq",
      locationName: "HQ Office",
      courseName: "Emergency Response",
      status: "compliant",
      dueAt: isoDaysAgo(-60),
      href: "/core/workers/71",
    },
    {
      id: "tr-8",
      workerId: "52",
      workerName: "Taylor Brooks",
      roleBand: "field",
      locationId: "loc-north",
      locationName: "North Yard",
      courseName: "Ground Disturbance",
      status: "overdue",
      dueAt: isoDaysAgo(3),
      href: "/core/workers/52",
    },
    {
      id: "tr-9",
      workerId: "53",
      workerName: "Jamie Cruz",
      roleBand: "field",
      locationId: "loc-south",
      locationName: "South Gate",
      courseName: "First Aid",
      status: "compliant",
      dueAt: isoDaysAgo(-40),
      href: "/core/workers/53",
    },
    {
      id: "tr-10",
      workerId: "62",
      workerName: "Quinn Hayes",
      roleBand: "supervisor",
      locationId: "loc-north",
      locationName: "North Yard",
      courseName: "Leadership in Safety",
      status: "compliant",
      dueAt: isoDaysAgo(-80),
      href: "/core/workers/62",
    },
  ];

  const docs: DocRow[] = [
    {
      id: "d-1",
      kind: "FLHA",
      title: "FLHA — Line 4 Morning",
      status: "Completed",
      highRisk: false,
      projectId: 1,
      workerId: "42",
      workerName: "Jordan Lee",
      completedAt: isoDaysAgo(1),
      href: "/documents/completed?q=FLHA%20Line%204",
      documentId: "doc-0001",
    },
    {
      id: "d-2",
      kind: "FLHA",
      title: "FLHA — Hot work bay",
      status: "Completed",
      highRisk: true,
      projectId: 1,
      workerId: "51",
      workerName: "Sam Ortiz",
      completedAt: isoDaysAgo(2),
      href: "/documents/completed?q=Hot%20work",
      documentId: "doc-0002",
    },
    {
      id: "d-3",
      kind: "JHA",
      title: "JHA — Scaffold erect",
      status: "Completed",
      projectId: 1,
      contractorCompanyId: 201,
      workerId: "42",
      workerName: "Jordan Lee",
      completedAt: isoDaysAgo(3),
      href: "/pm/jha-flha",
      documentId: "doc-0003",
    },
    {
      id: "d-4",
      kind: "JHA",
      title: "JHA — Excavation trench",
      status: "Completed",
      highRisk: true,
      projectId: 1,
      workerId: "60",
      workerName: "Avery Chen",
      completedAt: isoDaysAgo(4),
      href: "/pm/jha-flha",
      documentId: "doc-0004",
    },
    {
      id: "d-5",
      kind: "INCIDENT",
      title: "Recordable — Hand laceration",
      status: "Open",
      projectId: 1,
      contractorCompanyId: 202,
      workerId: "52",
      workerName: "Taylor Brooks",
      completedAt: isoDaysAgo(10),
      href: "/pm/incidents",
      documentId: "doc-0005",
    },
    {
      id: "d-6",
      kind: "INCIDENT",
      title: "Recordable — Slip on ice",
      status: "Closed",
      projectId: 1,
      workerId: "42",
      workerName: "Jordan Lee",
      completedAt: isoDaysAgo(40),
      href: "/pm/incidents",
      documentId: "doc-0006",
    },
    {
      id: "d-7",
      kind: "NEAR_MISS",
      title: "Near miss — Dropped tool",
      status: "Closed",
      projectId: 1,
      workerId: "51",
      workerName: "Sam Ortiz",
      completedAt: isoDaysAgo(6),
      href: "/core/safety-observations",
      documentId: "doc-0007",
    },
    {
      id: "d-8",
      kind: "NEAR_MISS",
      title: "Near miss — Unsecured load",
      status: "Closed",
      projectId: 1,
      workerId: "53",
      workerName: "Jamie Cruz",
      completedAt: isoDaysAgo(8),
      href: "/core/safety-observations",
      documentId: "doc-0008",
    },
    {
      id: "d-9",
      kind: "NEAR_MISS",
      title: "Near miss — Energized panel",
      status: "Closed",
      highRisk: true,
      projectId: 1,
      workerId: "42",
      workerName: "Jordan Lee",
      completedAt: isoDaysAgo(15),
      href: "/core/safety-observations",
      documentId: "doc-0009",
    },
    {
      id: "d-10",
      kind: "CAPA",
      title: "CAPA — Guardrail repair",
      status: "Closed",
      projectId: 1,
      completedAt: isoDaysAgo(12),
      href: "/pm/corrective-actions",
      documentId: "doc-0010",
    },
    {
      id: "d-11",
      kind: "CAPA",
      title: "CAPA — LOTO procedure update",
      status: "Closed",
      projectId: 1,
      completedAt: isoDaysAgo(20),
      href: "/pm/corrective-actions",
      documentId: "doc-0011",
    },
    {
      id: "d-13",
      kind: "TOOLBOX",
      title: "Toolbox — Line 4 morning brief",
      status: "Completed",
      projectId: 1,
      workerId: "42",
      workerName: "Jordan Lee",
      completedAt: isoDaysAgo(1),
      href: "/core/meeting-records",
      documentId: "doc-0013",
    },
    {
      id: "d-14",
      kind: "TOOLBOX",
      title: "Toolbox — Hot work controls",
      status: "Completed",
      projectId: 1,
      workerId: "60",
      workerName: "Avery Chen",
      completedAt: isoDaysAgo(3),
      href: "/core/meeting-records",
      documentId: "doc-0014",
    },
    {
      id: "d-15",
      kind: "TOOLBOX",
      title: "Toolbox — South Gate excavation",
      status: "Completed",
      projectId: 2,
      workerId: "51",
      workerName: "Sam Ortiz",
      completedAt: isoDaysAgo(5),
      href: "/core/meeting-records",
      documentId: "doc-0015",
    },
    {
      id: "d-12",
      kind: "FLHA",
      title: "FLHA — Contractor electrical",
      status: "Completed",
      projectId: 1,
      contractorCompanyId: 201,
      completedAt: isoDaysAgo(2),
      href: "/documents/completed",
      documentId: "doc-0012",
    },
  ];

  const contractors: ContractorCard[] = [
    {
      contractorCompanyId: 201,
      name: "Northline Electrical",
      programScore: 82,
      grade: gradeFromScore(82),
      incidentRate: 2.1,
      trainingCompliantPct: 88,
      flhaJhaCompletionPct: 94,
      href: "/core/dashboard?contractorId=201",
    },
    {
      contractorCompanyId: 202,
      name: "Summit Civil Sub",
      programScore: 71,
      grade: gradeFromScore(71),
      incidentRate: 3.4,
      trainingCompliantPct: 76,
      flhaJhaCompletionPct: 81,
      href: "/core/dashboard?contractorId=202",
    },
    {
      contractorCompanyId: 203,
      name: "Apex Scaffolding",
      programScore: 88,
      grade: gradeFromScore(88),
      incidentRate: 1.2,
      trainingCompliantPct: 91,
      flhaJhaCompletionPct: 97,
      href: "/core/dashboard?contractorId=203",
    },
  ];

  const relatedByProject: Record<number, RelatedCompany[]> = {
    1: [
      {
        companyId: 1,
        name: "Acme Civil (prime)",
        linkRole: "prime",
        includeInRollup: true,
        trainingCompliantPct: 87,
        incidentRate: 1.8,
        programScore: null,
        grade: null,
        href: "/core/dashboard?projectId=1",
      },
      {
        companyId: 900,
        name: "Owner Co",
        linkRole: "owner",
        includeInRollup: false,
        trainingCompliantPct: null,
        incidentRate: null,
        programScore: null,
        grade: null,
        href: "/core/dashboard?companyId=900&projectId=1",
      },
      {
        companyId: 201,
        name: "Northline Electrical",
        linkRole: "contractor",
        includeInRollup: true,
        trainingCompliantPct: 88,
        incidentRate: 2.1,
        programScore: 82,
        grade: "B",
        href: "/core/dashboard?contractorId=201&projectId=1",
      },
      {
        companyId: 202,
        name: "Summit Civil Sub",
        linkRole: "contractor",
        includeInRollup: true,
        trainingCompliantPct: 76,
        incidentRate: 3.4,
        programScore: 71,
        grade: "C",
        href: "/core/dashboard?contractorId=202&projectId=1",
      },
    ],
  };

  return {
    revision: 1,
    generatedAt: new Date().toISOString(),
    lastEventAt: isoDaysAgo(0),
    pendingInvalidation: false,
    workHours: 42000,
    training,
    docs,
    contractors,
    relatedByProject,
  };
}

function store(): StoreState {
  if (!g.__vericoreDashStore) g.__vericoreDashStore = seed();
  return g.__vericoreDashStore;
}

function metric(
  key: string,
  value: number | null,
  inputs: Record<string, number | null>,
  hoursBasis: Metric["hoursBasis"] = "actual",
  industry?: IndustryCompare,
): Metric {
  const f = getFormula(key);
  return {
    key,
    label: f.label,
    value,
    unit: f.unit,
    formula: f.formula,
    formulaId: f.formulaId,
    inputs,
    asOf: new Date().toISOString(),
    hoursBasis,
    industry,
  };
}

function industryCompare(
  companyValue: number,
  industryMean: number,
  percentileRank: number,
  direction: IndustryCompare["direction"],
  cohortSize = 42,
): IndustryCompare {
  return {
    companyValue,
    industryMean,
    percentileRank,
    cohortSize,
    sampleSuppressed: cohortSize < 5,
    period: "2026-Q2",
    direction,
  };
}

function uniqueWorkers(rows: TrainingRow[]) {
  return [...new Set(rows.map((r) => r.workerId))];
}

function workerStatuses(rows: TrainingRow[]) {
  const byWorker = new Map<string, TrainingRow[]>();
  for (const r of rows) {
    const list = byWorker.get(r.workerId) ?? [];
    list.push(r);
    byWorker.set(r.workerId, list);
  }
  let compliant = 0;
  let overdue = 0;
  for (const list of byWorker.values()) {
    if (list.every((x) => x.status === "compliant" || x.status === "expiring_soon")) {
      compliant += 1;
    }
    if (list.some((x) => x.status === "overdue" || x.status === "missing")) {
      overdue += 1;
    }
  }
  return { total: byWorker.size, compliant, overdue };
}

function filterTraining(
  rows: TrainingRow[],
  filters: { locationId?: string; roleBand?: RoleBand },
) {
  return rows.filter((r) => {
    if (filters.locationId && r.locationId !== filters.locationId) return false;
    if (filters.roleBand && r.roleBand !== filters.roleBand) return false;
    return true;
  });
}

function buildTrainingBlock(
  rows: TrainingRow[],
  filters: { locationId?: string; roleBand?: RoleBand },
) {
  const filtered = filterTraining(rows, filters);
  const { total, compliant, overdue } = workerStatuses(filtered);
  const compliantPct = total ? Math.round((compliant / total) * 1000) / 10 : 0;
  const overduePct = total ? Math.round((overdue / total) * 1000) / 10 : 0;
  const industry = industryCompare(compliantPct, 81, 72, "higher_better");

  const roles: RoleBand[] = ["field", "supervisor", "office"];
  const byRole = roles.map((roleBand) => {
    const subset = filtered.filter((r) => r.roleBand === roleBand);
    const s = workerStatuses(subset);
    return {
      roleBand,
      compliantPct: s.total ? Math.round((s.compliant / s.total) * 1000) / 10 : 0,
      overduePct: s.total ? Math.round((s.overdue / s.total) * 1000) / 10 : 0,
      headcount: s.total,
    };
  });

  const locIds = [...new Set(filtered.map((r) => r.locationId))];
  const byLocation = locIds.map((locationId) => {
    const subset = filtered.filter((r) => r.locationId === locationId);
    const s = workerStatuses(subset);
    return {
      locationId,
      locationName: subset[0]?.locationName ?? locationId,
      compliantPct: s.total ? Math.round((s.compliant / s.total) * 1000) / 10 : 0,
      overduePct: s.total ? Math.round((s.overdue / s.total) * 1000) / 10 : 0,
      headcount: s.total,
    };
  });

  return {
    compliantPct: metric(
      "training.compliant_pct",
      compliantPct,
      { workers_fully_compliant: compliant, workers_in_scope: total },
      "actual",
      industry,
    ),
    overduePct: metric("training.overdue_pct", overduePct, {
      workers_with_overdue: overdue,
      workers_in_scope: total,
    }),
    byRole,
    byLocation,
    industry,
  };
}

function buildSafetyBlock(docs: DocRow[], workHours: number) {
  const flhas = docs.filter((d) => d.kind === "FLHA");
  const jhas = docs.filter((d) => d.kind === "JHA");
  const highRisk = docs.filter(
    (d) => (d.kind === "FLHA" || d.kind === "JHA") && d.highRisk,
  );
  const incidents = docs.filter((d) => d.kind === "INCIDENT");
  const nearMisses = docs.filter((d) => d.kind === "NEAR_MISS");
  const capas = docs.filter((d) => d.kind === "CAPA" && d.status === "Closed");
  const toolbox = docs.filter((d) => d.kind === "TOOLBOX");
  const permitStats = permitMetrics();

  const flhaJhaCount = flhas.length + jhas.length;
  const flhaJhaPer1k =
    workHours > 0
      ? Math.round((flhaJhaCount / workHours) * 1000 * 100) / 100
      : null;
  const incidentRate =
    workHours > 0
      ? Math.round((incidents.length / workHours) * 200000 * 100) / 100
      : null;
  const nearMissRate =
    workHours > 0
      ? Math.round((nearMisses.length / workHours) * 200000 * 100) / 100
      : null;
  const capaClosureDays = capas.length ? 11 : null;

  const incidentIndustry = industryCompare(
    incidentRate ?? 0,
    2.4,
    68,
    "lower_better",
  );
  const nearMissIndustry = industryCompare(
    nearMissRate ?? 0,
    9.1,
    61,
    "higher_better",
  );
  const capaIndustry = industryCompare(capaClosureDays ?? 0, 16, 74, "lower_better");

  return {
    flhaCompleted: metric("sms.flha_completed", flhas.length, {
      flha_completed: flhas.length,
    }),
    jhaCompleted: metric("sms.jha_completed", jhas.length, {
      jha_completed: jhas.length,
    }),
    highRiskFlha: metric("sms.high_risk_flha", highRisk.length, {
      high_risk_count: highRisk.length,
    }),
    flhaJhaPer1k: metric(
      "sms.flha_jha_per_1k",
      flhaJhaPer1k,
      { completed_flha_jha_count: flhaJhaCount, work_hours: workHours },
      "actual",
    ),
    incidentRate: metric(
      "sms.incident_rate",
      incidentRate,
      { recordable_incidents: incidents.length, work_hours: workHours },
      "actual",
      incidentIndustry,
    ),
    nearMissRate: metric(
      "sms.near_miss_rate",
      nearMissRate,
      { near_miss_count: nearMisses.length, work_hours: workHours },
      "actual",
      nearMissIndustry,
    ),
    capaClosureDays: metric(
      "sms.capa_closure_days",
      capaClosureDays,
      { closed_capa_count: capas.length, avg_days: capaClosureDays },
      "actual",
      capaIndustry,
    ),
    toolboxTalks: metric("sms.toolbox_talks", toolbox.length, {
      toolbox_talks: toolbox.length,
    }),
    permitsProtected: metric("sms.permits_protected", permitStats.permitProtectedWork, {
      permit_protected: permitStats.permitProtectedWork,
    }),
    permitsHighRisk: metric("sms.permits_high_risk", permitStats.highRiskOpen, {
      high_risk_permits: permitStats.highRiskOpen,
    }),
    industry: {
      incidentRate: incidentIndustry,
      nearMissRate: nearMissIndustry,
      capaClosureDays: capaIndustry,
    },
  };
}

function safetySlice(
  trainingCompliantPct: number,
  docs: DocRow[],
  workHours: number,
): SafetySlice {
  const safety = buildSafetyBlock(docs, workHours);
  return {
    workHours,
    trainingCompliantPct,
    flhaJhaPer1k: safety.flhaJhaPer1k.value,
    highRiskFlhaCount: safety.highRiskFlha.value ?? 0,
    incidentRate: safety.incidentRate.value,
    nearMissRate: safety.nearMissRate.value,
    capaClosureDays: safety.capaClosureDays.value,
  };
}

export type DashboardQuery = {
  companyId?: number;
  projectId?: number;
  locationId?: string;
  roleBand?: RoleBand;
  crewId?: string;
  jobId?: string;
};

export function getRevision() {
  const s = store();
  return {
    revision: s.revision,
    generatedAt: s.generatedAt,
    pendingInvalidation: s.pendingInvalidation,
  };
}

export function rebuildSnapshot(reason = "manual_refresh") {
  const s = store();
  s.revision += 1;
  s.generatedAt = new Date().toISOString();
  s.lastEventAt = new Date().toISOString();
  s.pendingInvalidation = false;
  void reason;
  return getCompanyDashboard({ companyId: 1 });
}

/** Simulate event-driven invalidation (training completed, doc added). */
export function emitDashboardEvent(eventName: string) {
  const s = store();
  s.pendingInvalidation = true;
  s.lastEventAt = new Date().toISOString();

  if (eventName.includes("training")) {
    const overdue = s.training.find((t) => t.status === "overdue");
    if (overdue) overdue.status = "compliant";
  }
  if (eventName.includes("flha") || eventName.includes("document")) {
    s.docs.unshift({
      id: `d-${s.docs.length + 1}`,
      kind: "FLHA",
      title: `FLHA — Live update ${s.revision + 1}`,
      status: "Completed",
      projectId: 1,
      completedAt: new Date().toISOString(),
      href: "/documents/completed",
      documentId: `doc-live-${s.revision + 1}`,
    });
  }

  emitAnalyticsEvent(eventName, {
    domain: "VERICORE",
    scopeType: "company",
    scopeId: "1",
  });

  return rebuildSnapshot(eventName);
}

export function getCompanyDashboard(
  query: DashboardQuery = {},
): VeriCoreCompanyDashboard {
  const s = store();
  const companyId = query.companyId ?? 1;
  const projectId = query.projectId ?? null;
  const filters = {
    locationId: query.locationId,
    crewId: query.crewId,
    jobId: query.jobId,
    roleBand: query.roleBand,
  };

  const docs = projectId
    ? s.docs.filter((d) => d.projectId === projectId)
    : s.docs;
  const training = buildTrainingBlock(s.training, filters);
  const safety = buildSafetyBlock(docs, s.workHours);

  return {
    generatedAt: s.generatedAt,
    revision: s.revision,
    companyId,
    projectId,
    period: {
      start: isoDaysAgo(90),
      end: new Date().toISOString(),
    },
    filtersApplied: filters,
    training,
    safety,
    contractors: s.contractors,
    projectsSummary: [
      {
        projectId: 1,
        name: "Aurora North Expansion",
        alertScore: 4,
        trainingCompliantPct: training.compliantPct.value ?? 0,
        incidentRate: safety.incidentRate.value,
        contractorCount: s.contractors.length,
      },
      {
        projectId: 2,
        name: "South Gate Tie-in",
        alertScore: 2,
        trainingCompliantPct: 91,
        incidentRate: 1.1,
        contractorCount: 2,
      },
    ],
    freshness: {
      lastEventAt: s.lastEventAt,
      lastRebuildAt: s.generatedAt,
      pendingInvalidation: s.pendingInvalidation,
    },
  };
}

export function getProjectDashboard(
  projectId: number,
  query: DashboardQuery = {},
): VeriCoreProjectDashboard {
  const s = store();
  const base = getCompanyDashboard({ ...query, projectId });
  const companyDocs = s.docs.filter(
    (d) => d.projectId === projectId && !d.contractorCompanyId,
  );
  const contractorDocs = s.docs.filter(
    (d) => d.projectId === projectId && d.contractorCompanyId,
  );
  const companySlice = safetySlice(
    base.training.compliantPct.value ?? 0,
    companyDocs,
    s.workHours * 0.65,
  );
  const contractorSlice = safetySlice(
    84,
    contractorDocs,
    s.workHours * 0.35,
  );
  const rollupHours = companySlice.workHours + contractorSlice.workHours;
  const rollup: SafetySlice = {
    workHours: rollupHours,
    trainingCompliantPct: Math.round(
      (companySlice.trainingCompliantPct * companySlice.workHours +
        contractorSlice.trainingCompliantPct * contractorSlice.workHours) /
        rollupHours,
    ),
    flhaJhaPer1k: base.safety.flhaJhaPer1k.value,
    highRiskFlhaCount:
      companySlice.highRiskFlhaCount + contractorSlice.highRiskFlhaCount,
    incidentRate: base.safety.incidentRate.value,
    nearMissRate: base.safety.nearMissRate.value,
    capaClosureDays: base.safety.capaClosureDays.value,
  };

  return {
    ...base,
    combined: {
      companyWorkers: companySlice,
      contractors: contractorSlice,
      rollup,
    },
    relatedCompanies: s.relatedByProject[projectId] ?? [],
  };
}

export function getDrill(
  metricKey: string,
  opts: {
    page?: number;
    pageSize?: number;
    locationId?: string;
    roleBand?: RoleBand;
    projectId?: number;
  } = {},
): DrillResponse {
  const s = store();
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 25;
  const f = getFormula(metricKey);
  let items: DrillItem[] = [];
  let inputs: Record<string, number | null> = {};

  if (metricKey.startsWith("training.")) {
    let rows = filterTraining(s.training, {
      locationId: opts.locationId,
      roleBand: opts.roleBand,
    });
    if (metricKey === "training.overdue_pct") {
      rows = rows.filter((r) => r.status === "overdue" || r.status === "missing");
    }
    const stats = workerStatuses(
      filterTraining(s.training, {
        locationId: opts.locationId,
        roleBand: opts.roleBand,
      }),
    );
    inputs =
      metricKey === "training.overdue_pct"
        ? {
            workers_with_overdue: stats.overdue,
            workers_in_scope: stats.total,
          }
        : {
            workers_fully_compliant: stats.compliant,
            workers_in_scope: stats.total,
          };
    items = rows.map((r) => ({
      id: r.id,
      title: `${r.workerName} — ${r.courseName}`,
      subtitle: `${r.roleBand} · ${r.locationName}`,
      status: r.status,
      dueAt: r.dueAt ?? undefined,
      href: r.href,
      meta: { workerId: r.workerId, roleBand: r.roleBand },
    }));
  } else if (metricKey.includes("flha") || metricKey.includes("jha") || metricKey === "sms.high_risk_flha") {
    let docs = s.docs.filter((d) => d.kind === "FLHA" || d.kind === "JHA");
    if (opts.projectId) docs = docs.filter((d) => d.projectId === opts.projectId);
    if (metricKey === "sms.flha_completed") docs = docs.filter((d) => d.kind === "FLHA");
    if (metricKey === "sms.jha_completed") docs = docs.filter((d) => d.kind === "JHA");
    if (metricKey === "sms.high_risk_flha") docs = docs.filter((d) => d.highRisk);
    inputs = {
      completed_flha_jha_count: docs.length,
      work_hours: s.workHours,
    };
    items = docs.map((d) => ({
      id: d.id,
      title: d.title,
      subtitle: d.highRisk ? "High-risk" : d.kind,
      status: d.status,
      href: d.href,
      documentId: d.documentId,
      documentType: d.kind,
    }));
  } else if (metricKey === "sms.incident_rate") {
    const docs = s.docs.filter((d) => d.kind === "INCIDENT");
    inputs = { recordable_incidents: docs.length, work_hours: s.workHours };
    items = docs.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      href: d.href,
      documentId: d.documentId,
      documentType: "INCIDENT",
    }));
  } else if (metricKey === "sms.near_miss_rate") {
    const docs = s.docs.filter((d) => d.kind === "NEAR_MISS");
    inputs = { near_miss_count: docs.length, work_hours: s.workHours };
    items = docs.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      href: d.href,
      documentId: d.documentId,
      documentType: "NEAR_MISS",
    }));
  } else if (metricKey === "sms.capa_closure_days") {
    const docs = s.docs.filter((d) => d.kind === "CAPA");
    inputs = { closed_capa_count: docs.length, avg_days: 11 };
    items = docs.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      href: d.href,
      documentId: d.documentId,
      documentType: "CAPA",
    }));
  } else if (metricKey === "sms.toolbox_talks") {
    const docs = s.docs.filter((d) => d.kind === "TOOLBOX");
    inputs = { toolbox_talks: docs.length };
    items = docs.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      href: d.href,
      documentId: d.documentId,
      documentType: "TOOLBOX",
      meta: { workerId: d.workerId ?? null },
    }));
  } else if (metricKey.startsWith("sms.permits")) {
    const d = drillPermits(
      metricKey.includes("high_risk") ? "pm.permits_high_risk" : "pm.permits_active",
      opts.projectId,
    );
    inputs = d.inputs;
    items = d.items.map((i) => ({
      id: i.id,
      title: i.title,
      subtitle: i.subtitle,
      status: i.status,
      dueAt: i.dueAt,
      href: i.href,
      documentId: i.documentId,
      documentType: i.documentType,
      meta: i.related as Record<string, string | number | null>,
    }));
  } else if (metricKey.startsWith("contractor.")) {
    items = s.contractors.map((c) => ({
      id: String(c.contractorCompanyId),
      title: c.name,
      subtitle: `Grade ${c.grade} · Score ${c.programScore}`,
      status: c.grade,
      href: c.href,
      meta: {
        programScore: c.programScore,
        incidentRate: c.incidentRate,
        trainingCompliantPct: c.trainingCompliantPct,
        flhaJhaCompletionPct: c.flhaJhaCompletionPct,
      },
    }));
    inputs = { contractors: s.contractors.length };
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    metricKey,
    label: f.label,
    formula: f.formula,
    formulaId: f.formulaId,
    inputs,
    filters: {
      locationId: opts.locationId,
      roleBand: opts.roleBand,
      projectId: opts.projectId != null ? String(opts.projectId) : undefined,
    },
    page,
    pageSize,
    total,
    items: items.slice(start, start + pageSize),
  };
}

export function getContractorDetail(contractorCompanyId: number) {
  const s = store();
  const card = s.contractors.find(
    (c) => c.contractorCompanyId === contractorCompanyId,
  );
  if (!card) return null;
  const docs = s.docs.filter((d) => d.contractorCompanyId === contractorCompanyId);
  return {
    ...card,
    pillars: {
      programCompleteness: 88,
      performance: 79,
      responsiveness: 84,
      trainingCompetency: card.trainingCompliantPct,
      auditInspection: 76,
    },
    documents: docs.map((d) => ({
      id: d.id,
      title: d.title,
      type: d.kind,
      href: d.href,
      documentId: d.documentId,
    })),
    formula: getFormula("contractor.program_score"),
  };
}

/** Expose worker count helper for tests */
export function _debugUniqueWorkers() {
  return uniqueWorkers(store().training).length;
}
