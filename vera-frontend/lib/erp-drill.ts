/**
 * ERP drill client helpers + shared types (mirrors backend catalog).
 */
import { API_URL } from "./api";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/sms`;

export type ErpDrillTypeId =
  | "evacuation"
  | "medical"
  | "fire"
  | "spill"
  | "utility"
  | "shelter_in_place"
  | "accountability"
  | "full_scale";

export type ErpDrillChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  order: number;
};

export type ErpDrillTypeDef = {
  id: ErpDrillTypeId;
  label: string;
  description: string;
  defaultDurationMin: number;
  checklist: ErpDrillChecklistItem[];
};

export const ERP_DRILL_TYPES: ErpDrillTypeDef[] = [
  {
    id: "evacuation",
    label: "Site evacuation",
    description: "Alarm, egress, muster, headcount, all-clear.",
    defaultDurationMin: 20,
    checklist: [
      { id: "alarm", label: "Sound evacuation alarm / radio call", required: true, order: 1 },
      { id: "egress", label: "Clear work areas via primary egress routes", required: true, order: 2 },
      { id: "muster", label: "Assemble at designated muster point", required: true, order: 3 },
      { id: "headcount", label: "Complete accountability headcount", required: true, order: 4 },
      { id: "comms", label: "Confirm radio / phone tree contact", required: true, order: 5 },
      { id: "all_clear", label: "Issue all-clear and return to work", required: true, order: 6 },
    ],
  },
  {
    id: "medical",
    label: "Medical emergency",
    description: "First aid response, EMS call script, scene control.",
    defaultDurationMin: 25,
    checklist: [
      { id: "scene_safe", label: "Make scene safe / stop work", required: true, order: 1 },
      { id: "first_aid", label: "First aid / AED response started", required: true, order: 2 },
      { id: "ems_call", label: "Call EMS with site address & access notes", required: true, order: 3 },
      { id: "spotter", label: "Assign EMS spotter at gate", required: true, order: 4 },
      { id: "notify", label: "Notify company / client emergency contacts", required: true, order: 5 },
      { id: "debrief", label: "Post-response debrief captured", required: false, order: 6 },
    ],
  },
  {
    id: "fire",
    label: "Fire / hot work",
    description: "Extinguisher deployment, evacuation, fire department notify.",
    defaultDurationMin: 20,
    checklist: [
      { id: "alarm", label: "Activate fire alarm / radio emergency", required: true, order: 1 },
      { id: "extinguish", label: "Attempt extinguishment if trained & safe", required: false, order: 2 },
      { id: "evacuate", label: "Evacuate to muster", required: true, order: 3 },
      { id: "fd_notify", label: "Notify fire department / EMS", required: true, order: 4 },
      { id: "account", label: "Complete headcount", required: true, order: 5 },
      { id: "all_clear", label: "All-clear after FD / supervisor OK", required: true, order: 6 },
    ],
  },
  {
    id: "spill",
    label: "Chemical / spill",
    description: "Isolation, spill kit, containment, environmental notify.",
    defaultDurationMin: 30,
    checklist: [
      { id: "stop_source", label: "Stop / isolate spill source if safe", required: true, order: 1 },
      { id: "evac_zone", label: "Evacuate downwind / exclusion zone", required: true, order: 2 },
      { id: "spill_kit", label: "Deploy spill kit / PPE", required: true, order: 3 },
      { id: "notify", label: "Notify environmental / utility / EMS as required", required: true, order: 4 },
      { id: "contain", label: "Contain runoff from drains / waterways", required: true, order: 5 },
      { id: "waste", label: "Segregate waste for disposal", required: false, order: 6 },
    ],
  },
  {
    id: "utility",
    label: "Utility strike",
    description: "Gas / electric / pipeline strike with utility routing.",
    defaultDurationMin: 25,
    checklist: [
      { id: "stop_work", label: "Stop excavation / equipment immediately", required: true, order: 1 },
      { id: "evacuate", label: "Evacuate to upwind muster", required: true, order: 2 },
      { id: "utility_call", label: "Call utility emergency number from ERP", required: true, order: 3 },
      { id: "no_ignition", label: "No ignition sources / no restart equipment", required: true, order: 4 },
      { id: "account", label: "Accountability complete", required: true, order: 5 },
      { id: "restrict", label: "Secure area until utility clear", required: true, order: 6 },
    ],
  },
  {
    id: "shelter_in_place",
    label: "Shelter-in-place",
    description: "Secure indoors, monitoring, all-clear.",
    defaultDurationMin: 15,
    checklist: [
      { id: "announce", label: "Announce shelter-in-place", required: true, order: 1 },
      { id: "secure", label: "Move indoors / secure doors", required: true, order: 2 },
      { id: "account_indoor", label: "Indoor accountability", required: true, order: 3 },
      { id: "monitor", label: "Monitor radio / emergency alerts", required: true, order: 4 },
      { id: "all_clear", label: "All-clear issued", required: true, order: 5 },
    ],
  },
  {
    id: "accountability",
    label: "Accountability / muster only",
    description: "Focused headcount drill from site attendance sources.",
    defaultDurationMin: 10,
    checklist: [
      { id: "announce", label: "Announce muster drill", required: true, order: 1 },
      { id: "muster", label: "Crew at muster point", required: true, order: 2 },
      { id: "roster", label: "Mark expected / accounted / missing", required: true, order: 3 },
      { id: "resolve", label: "Resolve missing persons", required: true, order: 4 },
      { id: "close", label: "Close drill & record score", required: true, order: 5 },
    ],
  },
  {
    id: "full_scale",
    label: "Full-scale scenario",
    description: "Integrated alarm → response → EMS → accountability → debrief.",
    defaultDurationMin: 45,
    checklist: [
      { id: "brief", label: "Pre-drill safety brief (TRAINING ONLY)", required: true, order: 1 },
      { id: "inject", label: "Scenario inject delivered", required: true, order: 2 },
      { id: "alarm", label: "Alarm / radio emergency acknowledged", required: true, order: 3 },
      { id: "roles", label: "ERP roles activated (coordinator / wardens)", required: true, order: 4 },
      { id: "ems", label: "EMS / utility notify per script (simulated OK)", required: true, order: 5 },
      { id: "account", label: "Full accountability complete", required: true, order: 6 },
      { id: "debrief", label: "Hot wash debrief completed", required: true, order: 7 },
      { id: "actions", label: "Improvement actions logged", required: false, order: 8 },
    ],
  },
];

export function getDrillType(id: string): ErpDrillTypeDef | undefined {
  return ERP_DRILL_TYPES.find((t) => t.id === id);
}

export type DrillChecklistState = {
  id: string;
  label: string;
  required: boolean;
  order: number;
  done: boolean;
  completedAt: string | null;
  note?: string;
};

export type DrillTimelineEvent = {
  id: string;
  at: string;
  kind:
    | "started"
    | "checklist"
    | "attendance"
    | "issue"
    | "observation"
    | "completed"
    | "note";
  label: string;
  detail?: string;
};

export type DrillAttendancePerson = {
  id: string;
  name: string;
  role: string;
  crew: string;
  status: "expected" | "accounted" | "missing" | "excused";
  markedAt: string | null;
};

export type DrillIssue = {
  id: string;
  at: string;
  severity: "info" | "observation" | "issue" | "critical";
  text: string;
  requiresAction: boolean;
};

export type DrillSessionInput = {
  drillType: ErpDrillTypeId;
  title?: string;
  musterPoint?: string;
  projectName?: string;
  erpId?: string;
  startedAt: string;
  endedAt?: string | null;
  checklist: DrillChecklistState[];
  timeline: DrillTimelineEvent[];
  attendance: DrillAttendancePerson[];
  issues: DrillIssue[];
  facilitator?: string;
};

export type ErpDrillSummaryReport = {
  documentType: "ERP_DRILL_SUMMARY";
  title: string;
  generatedAt: string;
  drillType: ErpDrillTypeId;
  drillTypeLabel: string;
  projectName: string;
  musterPoint: string;
  facilitator: string;
  erpId: string | null;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  scores: {
    overall: number;
    checklistPct: number;
    requiredChecklistPct: number;
    attendancePct: number;
    criticalIssues: number;
    openIssues: number;
  };
  checklist: Array<{
    id: string;
    label: string;
    required: boolean;
    done: boolean;
    completedAt: string | null;
    latencySec: number | null;
  }>;
  attendance: {
    expected: number;
    accounted: number;
    missing: number;
    excused: number;
    people: DrillAttendancePerson[];
  };
  timeline: DrillTimelineEvent[];
  issues: DrillIssue[];
  findings: string[];
  recommendations: string[];
  narrative: string;
};

function pct(n: number, d: number): number {
  if (d <= 0) return 100;
  return Math.round((n / d) * 100);
}

export function buildDrillSummary(
  session: DrillSessionInput,
): ErpDrillSummaryReport {
  const typeDef = getDrillType(session.drillType);
  const endedAt = session.endedAt ?? new Date().toISOString();
  const startMs = Date.parse(session.startedAt);
  const endMs = Date.parse(endedAt);
  const durationMinutes = Math.max(
    1,
    Math.round((endMs - startMs) / 60000) || 1,
  );

  const required = session.checklist.filter((c) => c.required);
  const requiredDone = required.filter((c) => c.done);
  const allDone = session.checklist.filter((c) => c.done);
  const checklistPct = pct(allDone.length, session.checklist.length);
  const requiredChecklistPct = pct(requiredDone.length, required.length);

  const expected = session.attendance.length;
  const accounted = session.attendance.filter((p) => p.status === "accounted")
    .length;
  const missing = session.attendance.filter((p) => p.status === "missing")
    .length;
  const excused = session.attendance.filter((p) => p.status === "excused")
    .length;
  const attendancePct = pct(accounted + excused, expected);

  const criticalIssues = session.issues.filter((i) => i.severity === "critical")
    .length;
  const openIssues = session.issues.filter((i) => i.requiresAction).length;

  let overall = Math.round(
    requiredChecklistPct * 0.45 + attendancePct * 0.4 + checklistPct * 0.15,
  );
  overall = Math.max(
    0,
    Math.min(100, overall - criticalIssues * 8 - missing * 5),
  );

  const findings: string[] = [];
  if (requiredChecklistPct < 100) {
    findings.push(
      `${required.length - requiredDone.length} required checklist step(s) incomplete.`,
    );
  }
  if (missing > 0) {
    findings.push(`${missing} person(s) still marked missing at close.`);
  }
  if (criticalIssues > 0) {
    findings.push(`${criticalIssues} critical issue(s) raised during the drill.`);
  }
  if (findings.length === 0) {
    findings.push("No major gaps — checklist and accountability closed cleanly.");
  }

  const recommendations: string[] = [];
  if (requiredChecklistPct < 100) {
    recommendations.push(
      "Re-run incomplete required steps in a focused mini-drill.",
    );
  }
  if (missing > 0) {
    recommendations.push(
      "Reconcile missing headcount against gate / toolbox / FLHA sign-in sources.",
    );
  }
  if (openIssues > 0) {
    recommendations.push(
      "Convert open issues into Action Management items with owners and due dates.",
    );
  }
  if (durationMinutes > (typeDef?.defaultDurationMin ?? 30) * 1.5) {
    recommendations.push(
      "Drill ran long vs target — tighten role handoffs and communication tree.",
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Schedule next drill within the ERP cadence and share this summary.",
    );
  }

  const checklist = session.checklist.map((c) => {
    let latencySec: number | null = null;
    if (c.completedAt) {
      latencySec = Math.max(
        0,
        Math.round((Date.parse(c.completedAt) - startMs) / 1000),
      );
    }
    return {
      id: c.id,
      label: c.label,
      required: c.required,
      done: c.done,
      completedAt: c.completedAt,
      latencySec,
    };
  });

  const narrative = [
    `ERP ${typeDef?.label ?? session.drillType} drill for ${session.projectName ?? "project"}`,
    `ran ${durationMinutes} minute(s) at ${session.musterPoint ?? "muster"}.`,
    `Overall score ${overall}/100`,
    `(required checklist ${requiredChecklistPct}%, attendance ${attendancePct}%).`,
    openIssues
      ? `${openIssues} observation/issue item(s) require follow-up.`
      : "No open follow-up items.",
  ].join(" ");

  return {
    documentType: "ERP_DRILL_SUMMARY",
    title:
      session.title ??
      `ERP Drill Summary — ${typeDef?.label ?? session.drillType}`,
    generatedAt: new Date().toISOString(),
    drillType: session.drillType,
    drillTypeLabel: typeDef?.label ?? session.drillType,
    projectName: session.projectName ?? "Project",
    musterPoint: session.musterPoint ?? "Primary muster",
    facilitator: session.facilitator ?? "Site supervisor",
    erpId: session.erpId ?? null,
    startedAt: session.startedAt,
    endedAt,
    durationMinutes,
    scores: {
      overall,
      checklistPct,
      requiredChecklistPct,
      attendancePct,
      criticalIssues,
      openIssues,
    },
    checklist,
    attendance: {
      expected,
      accounted,
      missing,
      excused,
      people: session.attendance,
    },
    timeline: session.timeline,
    issues: session.issues,
    findings,
    recommendations,
    narrative,
  };
}

export function seedChecklist(typeId: ErpDrillTypeId): DrillChecklistState[] {
  const def = getDrillType(typeId);
  if (!def) return [];
  return def.checklist.map((c) => ({
    id: c.id,
    label: c.label,
    required: c.required,
    order: c.order,
    done: false,
    completedAt: null,
  }));
}

export function defaultAttendanceSeed(): DrillAttendancePerson[] {
  return [
    {
      id: "crew:supervisor",
      name: "S. ****",
      role: "Supervisor",
      crew: "Crew A",
      status: "expected",
      markedAt: null,
    },
    {
      id: "crew:worker-a",
      name: "W. ****",
      role: "Worker",
      crew: "Crew A",
      status: "expected",
      markedAt: null,
    },
    {
      id: "crew:worker-b",
      name: "R. ****",
      role: "Worker",
      crew: "Crew A",
      status: "expected",
      markedAt: null,
    },
    {
      id: "crew:visitor",
      name: "V. ****",
      role: "Visitor",
      crew: "Visitors",
      status: "expected",
      markedAt: null,
    },
  ];
}

export async function startErpDrill(
  erpId: string,
  body: {
    drillType: ErpDrillTypeId;
    trackEveryone?: boolean;
    musterPoint?: string;
    title?: string;
    facilitator?: string;
    projectName?: string;
  },
) {
  return fetchJson<{ data: Record<string, unknown> }>(
    `${BASE}/erp/${erpId}/drills`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function completeErpDrill(
  drillId: string,
  body: {
    checklist: DrillChecklistState[];
    timeline: DrillTimelineEvent[];
    issues: DrillIssue[];
    attendance: DrillAttendancePerson[];
  },
) {
  return fetchJson<{ data: { summary: ErpDrillSummaryReport } }>(
    `${BASE}/erp/drills/${drillId}/complete`,
    { method: "POST", body: JSON.stringify(body) },
  );
}
