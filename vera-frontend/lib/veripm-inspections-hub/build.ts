/**
 * Build Inspections hub (deterministic, never empty).
 */

import type {
  FindingRow,
  InspectionAccessPlane,
  InspectionFocusArea,
  InspectionsHubDashboard,
  OpenInspectionRow,
  TrendPoint,
} from "./types";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function series(
  seed: string,
  months: number,
  base: number,
  drift: number,
  noise: number,
): TrendPoint[] {
  const out: TrendPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const n = (hash(`${seed}:${period}`) % 1000) / 1000;
    const t = months - i;
    const value = Math.max(
      0,
      Math.min(100, base + drift * (t / months) + (n - 0.5) * noise),
    );
    out.push({ period, value: Math.round(value * 10) / 10 });
  }
  return out;
}

function scopeLabel(plane: InspectionAccessPlane): string {
  if (plane === "company") return "Company scope";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

function q(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

export function buildInspectionsHub(input: {
  plane?: InspectionAccessPlane;
  role?: string | null;
  projectId?: number;
  companyId?: number;
  focus?: string | null;
}): InspectionsHubDashboard {
  const plane =
    input.plane ?? (resolveVeriPmPlane(input.role) as InspectionAccessPlane);
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const seed = `insp:${plane}:${companyId}:${projectId}`;
  const h = hash(seed);
  const scale = plane === "company" ? 3.5 : plane === "subcontractor" ? 0.6 : 1;
  const qs = q(projectId, companyId);

  const focusAreas: InspectionFocusArea[] = [
    {
      id: "focus-access",
      title: "Temporary access & overnight installs",
      reason: "Linked from incident AI + incomplete morning tags",
      source: "incident",
      priority: 1,
      relatedIncidents: 3 + (h % 3),
      href: `/pm/inspections/new?${qs}&focus=temporary-access`,
    },
    {
      id: "focus-guard",
      title: "Conveyor guarding & interlocks",
      reason: "Corrective Actions still open on guard restoration",
      source: "action",
      priority: 2,
      relatedIncidents: 2,
      href: `/pm/inspections/new?${qs}&focus=conveyor-guarding`,
    },
    {
      id: "focus-lift",
      title: "Lift exclusion zones",
      reason: "Safety meeting topic scheduled — verify field controls",
      source: "meeting",
      priority: 3,
      relatedIncidents: 2 + (h % 2),
      href: `/pm/inspections/new?${qs}&focus=exclusion-zones`,
    },
    {
      id: "focus-jha",
      title: "JHA control verification — fall protection",
      reason: "High JHA risk rank · FLHA Gravity energy frequency elevated",
      source: "jha",
      priority: 4,
      relatedIncidents: 1,
      href: `/pm/inspections/new?${qs}&focus=fall-protection`,
    },
    {
      id: "focus-ppe",
      title: "PPE compliance — cutting bays",
      reason: "Industry peer spike + local observations",
      source: "industry",
      priority: 5,
      relatedIncidents: 1,
      href: `/pm/inspections/new?${qs}&focus=ppe-cutting`,
    },
    {
      id: "focus-loto",
      title: "LOTO verification spot audits",
      reason: "AI risk forecast elevated for energy isolation gaps",
      source: "ai",
      priority: 6,
      relatedIncidents: 2,
      href: `/pm/inspections/new?${qs}&focus=loto`,
    },
  ];

  if (input.focus) {
    const idx = focusAreas.findIndex(
      (f) =>
        f.href.includes(encodeURIComponent(input.focus!)) ||
        f.href.includes(input.focus!),
    );
    if (idx > 0) {
      const [moved] = focusAreas.splice(idx, 1);
      focusAreas.unshift(moved!);
    }
  }

  const assignees = ["A. Reyes", "J. Okonkwo", "M. Chen", "S. Patel"];
  const openQueue: OpenInspectionRow[] = Array.from(
    { length: Math.max(4, Math.round(5 * Math.min(scale, 2))) },
    (_, i) => {
      const id = `insp-${hash(`${seed}:q:${i}`) % 8000 + 1000}`;
      const focus = focusAreas[i % focusAreas.length]!;
      const due = new Date();
      due.setDate(due.getDate() + (i % 2 === 0 ? -1 : 2 + i));
      const statuses: OpenInspectionRow["status"][] = [
        "overdue",
        "in_progress",
        "scheduled",
        "scheduled",
      ];
      return {
        id,
        title: focus.title,
        status: statuses[i % statuses.length]!,
        focusArea: focus.title,
        dueDate: due.toISOString().slice(0, 10),
        assignee: assignees[i % assignees.length]!,
        findingsOpen: i % 3,
        href: `/pm/inspections/${id}?${qs}`,
      };
    },
  );

  const findingTitles = [
    "Incomplete scaffold tag",
    "Missing exclusion cones",
    "LOTO checklist unsigned",
    "Face shield not worn",
    "Housekeeping — trip hazard",
    "Guard interlock bypassed",
  ];

  function finding(i: number, recurring: boolean): FindingRow {
    const title = findingTitles[i % findingTitles.length]!;
    const sev: FindingRow["severity"][] = [
      "moderate",
      "elevated",
      "critical",
      "low",
    ];
    return {
      id: `find-${i}`,
      title,
      count: recurring ? 3 + (h % 4) : 1 + (i % 3),
      severity: sev[i % sev.length]!,
      recurring,
      linkedActionHref: `/pm/action-management?${qs}&tab=suggestions`,
      linkedMeetingHref: `/pm/safety-meetings/new?${qs}&topic=${encodeURIComponent(title)}`,
      linkedJhaHref: `/pm/jha-flha?${qs}`,
    };
  }

  const qualityOverall = Math.min(98, 74 + (h % 20));

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    plane,
    scopeLabel: scopeLabel(plane),
    projectId,
    companyId,
    periodLabel: "Current period vs prior",
    kpis: {
      completionRate: Math.min(98, 78 + (h % 16)),
      findingsOpen: Math.round((14 + (h % 12)) * scale),
      focusAuditsDue: focusAreas.length,
      leadingCoverage: Math.min(100, 70 + (h % 22)),
      bboCount: Math.round((8 + (h % 10)) * scale),
      qualityScore: qualityOverall,
      deltas: {
        completionRate: 3.2,
        findingsOpen: -2,
        leadingCoverage: 4.1,
        bboCount: 1,
      },
    },
    completionTrend: series(`${seed}:comp`, 12, 75, 12, 8),
    findingsTrend: series(`${seed}:find`, 12, 18 * scale, -4, 5),
    bboTrend: series(`${seed}:bbo`, 12, 6 * scale, 1.5, 2),
    focusAuditTrend: series(`${seed}:focus`, 12, 4 * scale, 0.8, 1.5),
    focusAreas,
    openQueue,
    topFindingsThisWeek: [0, 1, 2, 3].map((i) => finding(i, false)),
    recurringFindings: [1, 2, 5].map((i) => finding(i, true)),
    quality: {
      overall: qualityOverall,
      coverage: Math.min(100, 70 + (h % 22)),
      evidenceCompleteness: Math.min(100, 68 + (h % 25)),
      narrative:
        "Inspection quality reflects coverage of AI focus areas, photo evidence completeness, and timely Action Management linkage for findings.",
    },
    links: {
      incidents: `/pm/incidents?${qs}`,
      actions: `/pm/action-management?${qs}`,
      meetings: `/pm/safety-meetings?${qs}`,
      training: `/pm/training?${qs}`,
      jhaFlha: `/pm/jha-flha?${qs}`,
      focusAudits: `/pm/inspections/focus-audits?${qs}`,
      bbo: `/pm/safety-intelligence/bbo?${qs}`,
      bboNew: `/pm/safety-intelligence/bbo/new?${qs}`,
      smartSite: `/pm/inspections/smart-site?${qs}`,
      equipment: `/pm/inspections/new?group=equipment&${qs}`,
      equipmentSafety: `/pm/equipment-safety?${qs}`,
      ppe: `/pm/inspections/ppe-preuse/new?${qs}`,
      ppeSpotCheck: `/pm/inspections/new?group=ppe&${qs}`,
      safetyDevices: `/pm/inspections/new?group=safety_devices&${qs}`,
      newInspection: `/pm/inspections/new?${qs}`,
    },
    rules: { neverEmpty: true, planeIsolated: true },
  };
}
