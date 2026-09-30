/**
 * In-memory VERIPM ↔ FieldOS permits store (dashboard/preview).
 */

import type {
  FieldOsActivity,
  PermitStatusCounts,
  VeripmFieldOsPermit,
  VeripmPermitRiskLevel,
  VeripmPermitStatus,
} from "./types";
import { emitAnalyticsEvent } from "@/lib/dashboard-analytics/events";
import { applyPermitCssImpact } from "@/lib/contractor-safety-score/store";
import { computePermitCssDelta } from "./css-impact";

type Store = {
  revision: number;
  permits: VeripmFieldOsPermit[];
};

const g = globalThis as unknown as { __veripmFieldOsPermits?: Store };

function store(): Store {
  if (!g.__veripmFieldOsPermits) {
    g.__veripmFieldOsPermits = { revision: 1, permits: seed() };
  }
  return g.__veripmFieldOsPermits;
}

function now() {
  return new Date().toISOString();
}

function riskFor(type: string): VeripmPermitRiskLevel {
  if (
    [
      "confined_space",
      "hot_work",
      "loto",
      "excavation",
      "fall_protection",
      "live_line",
      "crane_lift",
    ].includes(type)
  ) {
    return "high";
  }
  return "medium";
}

function seed(): VeripmFieldOsPermit[] {
  const t = now();
  return [
    {
      permit_id: "vp-1",
      company_id: 1,
      project_id: 1,
      job_id: "job-line4",
      asset_id: "eq-1",
      contractor_id: 201,
      pm_permit_id: "pm-permit-1",
      fieldos_task_id: "fos-permit-demo-1",
      permit_type: "confined_space",
      risk_level: "high",
      status: "active",
      required_signatures: ["issuer", "acceptor", "supervisor"],
      required_documents: ["flha_or_jha"],
      required_ppe: ["harness", "gas_monitor"],
      start_time: new Date(Date.now() - 2 * 3600000).toISOString(),
      end_time: null,
      created_by_user_id: 1,
      fieldos_metadata: {
        activity: {
          signatures: [
            { role: "issuer", name: "Avery Chen", signedAt: t },
            { role: "acceptor", name: "Jordan Lee", signedAt: t },
          ],
          photos: [
            {
              id: "ph-1",
              url: "/pm/documents",
              caption: "Atmospheric test board",
            },
          ],
          notes: ["O2 20.9% — cleared"],
          hazard_controls_applied: ["continuous_gas_monitoring", "standby_attendant"],
          lastWebhookAt: t,
        } satisfies FieldOsActivity,
      },
      safety_links: {
        flhaJhaId: "flha-42",
        flhaJhaType: "FLHA",
        linked: true,
        reason: "high_risk_permit",
      },
      work_order_ids: ["wo-excavator-pm"],
      created_at: t,
      updated_at: t,
      live_fieldos_status: "active",
      title: "Confined space — Line 4 vessel",
    },
    {
      permit_id: "vp-2",
      company_id: 1,
      project_id: 1,
      job_id: "job-hotwork",
      asset_id: "eq-2",
      contractor_id: 202,
      pm_permit_id: "pm-permit-2",
      fieldos_task_id: "fos-permit-demo-2",
      permit_type: "hot_work",
      risk_level: "high",
      status: "awaiting_signatures",
      required_signatures: ["issuer", "acceptor", "fire_watch"],
      required_documents: ["flha_or_jha"],
      required_ppe: ["face_shield", "fire_blanket"],
      start_time: null,
      end_time: null,
      created_by_user_id: 1,
      fieldos_metadata: {
        activity: {
          signatures: [{ role: "issuer", name: "Sam Ortiz", signedAt: t }],
          photos: [],
          notes: ["Awaiting fire watch sign-off"],
          hazard_controls_applied: ["spark_containment"],
        } satisfies FieldOsActivity,
      },
      safety_links: {
        flhaJhaId: "pending-flha-hotwork",
        createRequested: true,
        linked: false,
      },
      work_order_ids: [],
      created_at: t,
      updated_at: t,
      live_fieldos_status: "awaiting_signatures",
      title: "Hot work — Crane bay weld",
    },
    {
      permit_id: "vp-3",
      company_id: 1,
      project_id: 2,
      job_id: null,
      asset_id: null,
      contractor_id: null,
      pm_permit_id: "pm-permit-3",
      fieldos_task_id: "fos-permit-demo-3",
      permit_type: "excavation",
      risk_level: "high",
      status: "closed",
      required_signatures: ["issuer", "acceptor", "supervisor"],
      required_documents: ["flha_or_jha"],
      required_ppe: ["hard_hat", "hi_vis"],
      start_time: new Date(Date.now() - 86400000).toISOString(),
      end_time: new Date(Date.now() - 3600000).toISOString(),
      created_by_user_id: 1,
      fieldos_metadata: {
        activity: {
          signatures: [
            { role: "issuer", name: "Quinn Hayes", signedAt: t },
            { role: "acceptor", name: "Riley Park", signedAt: t },
            { role: "supervisor", name: "Avery Chen", signedAt: t },
          ],
          photos: [{ id: "ph-2", url: "/pm/documents", caption: "Shoring installed" }],
          notes: ["Closed after backfill"],
          hazard_controls_applied: ["shoring", "spotter"],
          completed_at: new Date(Date.now() - 3600000).toISOString(),
        } satisfies FieldOsActivity,
      },
      safety_links: {
        flhaJhaId: "jha-77",
        linked: true,
        closedWorkOrders: ["wo-trench-1"],
        incidentsDuringPermit: [],
      },
      work_order_ids: ["wo-trench-1"],
      created_at: t,
      updated_at: t,
      live_fieldos_status: "closed",
      title: "Excavation — South Gate trench",
    },
  ];
}

export function getPermitRevision() {
  const s = store();
  return { revision: s.revision, generatedAt: now() };
}

export function countByStatus(projectId?: number): PermitStatusCounts {
  const rows = store().permits.filter((p) =>
    projectId ? p.project_id === projectId : true,
  );
  const out: PermitStatusCounts = {};
  for (const p of rows) out[p.status] = (out[p.status] ?? 0) + 1;
  return out;
}

export function listPermits(opts?: {
  projectId?: number;
  companyId?: number;
  contractorId?: number;
  status?: VeripmPermitStatus;
}) {
  let rows = [...store().permits];
  if (opts?.projectId) rows = rows.filter((p) => p.project_id === opts.projectId);
  if (opts?.companyId) rows = rows.filter((p) => p.company_id === opts.companyId);
  if (opts?.contractorId)
    rows = rows.filter((p) => p.contractor_id === opts.contractorId);
  if (opts?.status) rows = rows.filter((p) => p.status === opts.status);
  return {
    permits: rows,
    total: rows.length,
    countsByStatus: countByStatus(opts?.projectId),
    dashboardRevision: store().revision,
  };
}

export function getPermit(permitId: string) {
  const row = store().permits.find((p) => p.permit_id === permitId);
  if (!row) return null;
  const activity = (row.fieldos_metadata.activity as FieldOsActivity | undefined) ?? {
    signatures: [],
    photos: [],
    notes: [],
    hazard_controls_applied: [],
  };
  return {
    ...row,
    fieldosTask: row.fieldos_task_id
      ? {
          task_id: row.fieldos_task_id,
          status: row.live_fieldos_status ?? row.status,
          ...activity,
        }
      : null,
    drill: {
      formula: "count(veripm_permits by status) + FieldOS live task status",
      formulaId: "pm.permits.fieldos.v1",
      sourceQuery:
        "SELECT veripm_permits LEFT JOIN fieldos_tasks ON fieldos_task_id",
    },
  };
}

export function createPermit(input: {
  projectId: number;
  companyId?: number;
  permitType: string;
  title?: string;
  jobId?: string;
  assetId?: string;
  contractorId?: number;
  workOrderIds?: string[];
}): VeripmFieldOsPermit {
  const s = store();
  const risk = riskFor(input.permitType);
  const id = `vp-${s.permits.length + 1}`;
  const taskId = `fos-permit-${id}`;
  const t = now();
  const row: VeripmFieldOsPermit = {
    permit_id: id,
    company_id: input.companyId ?? 1,
    project_id: input.projectId,
    job_id: input.jobId ?? null,
    asset_id: input.assetId ?? null,
    contractor_id: input.contractorId ?? null,
    pm_permit_id: `pm-${id}`,
    fieldos_task_id: taskId,
    permit_type: input.permitType,
    risk_level: risk,
    status: "open",
    required_signatures:
      risk === "high" || risk === "critical"
        ? ["issuer", "acceptor", "supervisor"]
        : ["issuer", "acceptor"],
    required_documents: risk === "high" ? ["flha_or_jha"] : [],
    required_ppe: [],
    start_time: t,
    end_time: null,
    created_by_user_id: 1,
    fieldos_metadata: {
      activity: {
        signatures: [],
        photos: [],
        notes: ["Created from VERIPM — FieldOS task opened"],
        hazard_controls_applied: [],
      } satisfies FieldOsActivity,
      lastPushAt: t,
    },
    safety_links:
      risk === "high" || risk === "critical"
        ? {
            flhaJhaId: `pending-flha-${id}`,
            flhaJhaType: "FLHA",
            createRequested: true,
            linked: false,
            reason: "high_risk_permit",
          }
        : {},
    work_order_ids: input.workOrderIds ?? [],
    created_at: t,
    updated_at: t,
    live_fieldos_status: "open",
    title: input.title ?? `${input.permitType.replace(/_/g, " ")} permit`,
  };
  s.permits.unshift(row);
  s.revision += 1;
  emitAnalyticsEvent("permit.fieldos.created", {
    domain: "VERIPM",
    scopeType: "project",
    scopeId: String(input.projectId),
  });
  return row;
}

export function applyWebhook(body: {
  task_id: string;
  external_permit_id?: string;
  status: string;
  signatures?: FieldOsActivity["signatures"];
  photos?: FieldOsActivity["photos"];
  notes?: string[];
  hazard_controls_applied?: string[];
  completed_at?: string | null;
}) {
  const s = store();
  const row = s.permits.find(
    (p) =>
      p.fieldos_task_id === body.task_id ||
      p.permit_id === body.external_permit_id,
  );
  if (!row) return null;

  const mapped = mapStatus(body.status);
  const prev = (row.fieldos_metadata.activity as FieldOsActivity | undefined) ?? {
    signatures: [],
    photos: [],
    notes: [],
    hazard_controls_applied: [],
  };
  const activity: FieldOsActivity = {
    signatures: body.signatures ?? prev.signatures,
    photos: body.photos ?? prev.photos,
    notes: body.notes ?? prev.notes,
    hazard_controls_applied:
      body.hazard_controls_applied ?? prev.hazard_controls_applied,
    completed_at: body.completed_at ?? prev.completed_at,
    lastWebhookAt: now(),
  };

  row.status = mapped;
  row.live_fieldos_status = body.status;
  row.updated_at = now();
  row.fieldos_metadata = { ...row.fieldos_metadata, activity };

  if (mapped === "closed") {
    row.end_time = body.completed_at ?? now();
    const incidents = Array.isArray(
      (row.safety_links as { incidentsDuringPermit?: unknown[] }).incidentsDuringPermit,
    )
      ? ((row.safety_links as { incidentsDuringPermit: unknown[] }).incidentsDuringPermit
          .length)
      : 0;
    const cssDelta = computePermitCssDelta({
      riskLevel: row.risk_level,
      event: incidents > 0 ? "closed_with_incident" : "closed_clean",
    });
    row.safety_links = {
      ...row.safety_links,
      closedWorkOrders: row.work_order_ids,
      closedAt: row.end_time,
      cssDelta,
    };
    if (row.contractor_id) {
      applyPermitCssImpact({
        contractorCompanyId: row.contractor_id,
        permitId: row.permit_id,
        riskLevel: row.risk_level,
        event: incidents > 0 ? "closed_with_incident" : "closed_clean",
        delta: cssDelta,
      });
    }
  }

  s.revision += 1;
  emitAnalyticsEvent(`permit.fieldos.${mapped}`, {
    domain: "VERIPM",
    scopeType: "project",
    scopeId: String(row.project_id),
  });
  return row;
}

function mapStatus(status: string): VeripmPermitStatus {
  const s = status.toLowerCase().replace(/[\s-]/g, "_");
  const allowed: VeripmPermitStatus[] = [
    "draft",
    "queued",
    "open",
    "in_progress",
    "awaiting_signatures",
    "active",
    "closed",
    "cancelled",
    "sync_error",
  ];
  if (allowed.includes(s as VeripmPermitStatus)) return s as VeripmPermitStatus;
  if (s === "complete" || s === "completed") return "closed";
  return "in_progress";
}

export function permitMetrics(projectId?: number) {
  const counts = countByStatus(projectId);
  const rows = store().permits.filter((p) =>
    projectId ? p.project_id === projectId : true,
  );
  return {
    byStatus: counts,
    highRiskOpen: rows.filter(
      (p) =>
        (p.risk_level === "high" || p.risk_level === "critical") &&
        !["closed", "cancelled"].includes(p.status),
    ).length,
    fieldOsLinked: rows.filter((p) => p.fieldos_task_id).length,
    permitProtectedWork: rows.filter((p) =>
      ["active", "open", "in_progress", "awaiting_signatures"].includes(p.status),
    ).length,
    dashboardRevision: store().revision,
  };
}

export function projectPermitLoad(projectId: number) {
  const rows = listPermits({ projectId }).permits;
  const byRisk: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let incidentLinked = 0;
  let contractorCompliant = 0;
  let contractorTotal = 0;
  const contractors = new Set<number>();

  for (const p of rows) {
    byRisk[p.risk_level] = (byRisk[p.risk_level] ?? 0) + 1;
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    const incidents = (p.safety_links as { incidentsDuringPermit?: unknown[] })
      ?.incidentsDuringPermit;
    if (Array.isArray(incidents)) incidentLinked += incidents.length;
    if (p.contractor_id) contractors.add(p.contractor_id);
  }

  for (const cid of contractors) {
    contractorTotal += 1;
    const cRows = rows.filter((p) => p.contractor_id === cid);
    const bad = cRows.some(
      (p) =>
        p.status === "sync_error" ||
        (Array.isArray(
          (p.safety_links as { incidentsDuringPermit?: unknown[] })
            ?.incidentsDuringPermit,
        ) &&
          ((p.safety_links as { incidentsDuringPermit: unknown[] })
            .incidentsDuringPermit.length > 0)),
    );
    if (!bad) contractorCompliant += 1;
  }

  const open = rows.filter((p) =>
    ["active", "open", "in_progress", "awaiting_signatures", "queued"].includes(
      p.status,
    ),
  ).length;
  const highRiskOpen = rows.filter(
    (p) =>
      (p.risk_level === "high" || p.risk_level === "critical") &&
      !["closed", "cancelled"].includes(p.status),
  ).length;

  const pmBlocked = highRiskOpen > 0 && open > 0;
  return {
    projectId,
    total: rows.length,
    open,
    highRiskOpen,
    byRisk,
    byStatus,
    permitRelatedIncidents: incidentLinked,
    contractorCompliancePct:
      contractorTotal > 0
        ? Math.round((contractorCompliant / contractorTotal) * 1000) / 10
        : null,
    contractorCount: contractorTotal,
    pmReadiness: {
      ready: !pmBlocked,
      blockers: pmBlocked
        ? [`${highRiskOpen} high-risk permit(s) still open`]
        : [],
      score: Math.max(0, 100 - highRiskOpen * 12 - incidentLinked * 8),
    },
  };
}

export function drillPermits(metricKey: string, projectId?: number) {
  const rows = listPermits({ projectId }).permits;
  let filtered = rows;
  if (metricKey.includes("high_risk")) {
    filtered = rows.filter(
      (p) => p.risk_level === "high" || p.risk_level === "critical",
    );
  } else if (metricKey.includes("active") || metricKey.includes("open")) {
    filtered = rows.filter((p) =>
      ["active", "open", "in_progress", "awaiting_signatures"].includes(p.status),
    );
  } else if (metricKey.includes("closed")) {
    filtered = rows.filter((p) => p.status === "closed");
  }
  return {
    metricKey,
    label: "Permits (FieldOS-linked)",
    formula: "count(veripm_permits matching filters)",
    formulaId: "pm.permits.fieldos.v1",
    sourceQuery: "SELECT * FROM veripm_permits WHERE …",
    inputs: { total: filtered.length },
    filters: { projectId: projectId != null ? String(projectId) : undefined },
    page: 1,
    pageSize: 50,
    total: filtered.length,
    items: filtered.map((p) => ({
      id: p.permit_id,
      title: p.title ?? `${p.permit_type} · ${p.status}`,
      subtitle: `FieldOS ${p.live_fieldos_status ?? "—"} · ${p.risk_level}`,
      status: p.status,
      dueAt: p.end_time ?? undefined,
      href: `/pm/permits/${p.pm_permit_id ?? p.permit_id}?fieldos=1`,
      documentId: p.permit_id,
      documentType: "PERMIT",
      related: {
        assetId: p.asset_id,
        contractorId: p.contractor_id,
        projectId: p.project_id,
        fieldosTaskId: p.fieldos_task_id,
      },
    })),
  };
}
