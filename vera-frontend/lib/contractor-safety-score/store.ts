/**
 * In-memory Contractor Safety Score store + compute engine (preview).
 * Spec: docs/VERIFORGE-CONTRACTOR-SAFETY-SCORE.md
 */

import { clamp, gradeFromScore, PILLAR_FORMULAS, round1 } from "./formulas";
import {
  DEFAULT_WEIGHTS,
  PILLAR_LABELS,
  type ContractorGrade,
  type ContractorSafetyScoreDto,
  type GateTriggered,
  type PillarDto,
  type PillarId,
  type ScoreEvidence,
  type ScoreHistoryPoint,
} from "./types";

type ProgramDoc = {
  id: string;
  docCode: string;
  title: string;
  status: "approved" | "submitted" | "expired" | "missing";
  documentId?: string;
  href?: string;
  expiresAt?: string;
};

type TrainingRow = {
  id: string;
  workerName: string;
  courseName: string;
  status: "compliant" | "overdue" | "missing" | "expiring_soon";
  href: string;
};

type IncidentRow = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  daysAgo: number;
  href: string;
  documentId: string;
};

type CapaRow = {
  id: string;
  title: string;
  status: "open" | "overdue" | "closed" | "verified";
  closureDays: number | null;
  critical: boolean;
  href: string;
};

type AuditRow = {
  id: string;
  title: string;
  findingSeverity: "low" | "medium" | "high" | "critical" | null;
  closedOnTime: boolean;
  href: string;
};

type MeetingRow = {
  id: string;
  title: string;
  kind: "toolbox_talk" | "safety_meeting";
  attended: boolean;
  occurredAt: string;
  href: string;
};

type PermitImpact = {
  id: string;
  permitId: string;
  riskLevel: string;
  event: string;
  delta: number;
  at: string;
};

type ContractorInputs = {
  contractorCompanyId: number;
  name: string;
  hours: number;
  programDocs: ProgramDoc[];
  training: TrainingRow[];
  incidents: IncidentRow[];
  capas: CapaRow[];
  audits: AuditRow[];
  meetings: MeetingRow[];
  permitImpacts: PermitImpact[];
};

type ScoredBundle = {
  score: ContractorSafetyScoreDto;
  evidence: ScoreEvidence[];
  history: ScoreHistoryPoint[];
};

type StoreState = {
  primeCompanyId: number;
  requiredDocCodes: string[];
  contractors: Map<number, ContractorInputs>;
  scores: Map<string, ScoredBundle>;
  revision: number;
};

const g = globalThis as unknown as { __cssStore?: StoreState };

function scoreKey(contractorCompanyId: number, projectId: number | null) {
  return `${contractorCompanyId}:${projectId ?? "prime"}`;
}

function isoDaysAgo(d: number) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

function seedContractor(
  id: number,
  name: string,
  variant: "strong" | "mid" | "weak",
): ContractorInputs {
  const baseDocs: ProgramDoc[] = [
    {
      id: `${id}-doc-hse`,
      docCode: "hse_policy",
      title: "HSE Policy",
      status: "approved",
      documentId: `pol-${id}-1`,
      href: "/documents/completed",
    },
    {
      id: `${id}-doc-orient`,
      docCode: "orientation",
      title: "Orientation packet",
      status: "approved",
      documentId: `pol-${id}-2`,
      href: "/documents/completed",
    },
    {
      id: `${id}-doc-csp`,
      docCode: "confined_space",
      title: "Confined space procedure",
      status: variant === "strong" ? "approved" : "expired",
      documentId: `pol-${id}-3`,
      href: "/documents/completed",
      expiresAt: isoDaysAgo(variant === "strong" ? -90 : 20),
    },
    {
      id: `${id}-doc-coi`,
      docCode: "insurance_coi",
      title: "Certificate of Insurance",
      status: variant === "weak" ? "missing" : "approved",
      documentId: variant === "weak" ? undefined : `pol-${id}-4`,
      href: "/documents/completed",
    },
    {
      id: `${id}-doc-wcb`,
      docCode: "wcb",
      title: "WCB clearance",
      status: "approved",
      documentId: `pol-${id}-5`,
      href: "/documents/completed",
    },
  ];

  const training: TrainingRow[] =
    variant === "strong"
      ? [
          {
            id: `${id}-tr-1`,
            workerName: "Alex Rivera",
            courseName: "Fall Protection",
            status: "compliant",
            href: "/core/workers",
          },
          {
            id: `${id}-tr-2`,
            workerName: "Blake Ng",
            courseName: "Electrical Safety",
            status: "compliant",
            href: "/core/workers",
          },
          {
            id: `${id}-tr-3`,
            workerName: "Casey Wu",
            courseName: "First Aid",
            status: "expiring_soon",
            href: "/core/workers",
          },
        ]
      : variant === "mid"
        ? [
            {
              id: `${id}-tr-1`,
              workerName: "Dana Cole",
              courseName: "Ground Disturbance",
              status: "compliant",
              href: "/core/workers",
            },
            {
              id: `${id}-tr-2`,
              workerName: "Evan Moss",
              courseName: "H2S",
              status: "overdue",
              href: "/core/workers",
            },
            {
              id: `${id}-tr-3`,
              workerName: "Fran Lee",
              courseName: "WHMIS",
              status: "compliant",
              href: "/core/workers",
            },
            {
              id: `${id}-tr-4`,
              workerName: "Gray Patel",
              courseName: "Confined Space",
              status: "missing",
              href: "/core/workers",
            },
          ]
        : [
            {
              id: `${id}-tr-1`,
              workerName: "Harper Diaz",
              courseName: "Scaffold User",
              status: "overdue",
              href: "/core/workers",
            },
            {
              id: `${id}-tr-2`,
              workerName: "Indie Shaw",
              courseName: "Fall Protection",
              status: "missing",
              href: "/core/workers",
            },
            {
              id: `${id}-tr-3`,
              workerName: "Jules Kim",
              courseName: "First Aid",
              status: "compliant",
              href: "/core/workers",
            },
          ];

  const incidents: IncidentRow[] =
    variant === "strong"
      ? [
          {
            id: `${id}-inc-1`,
            title: "First aid — minor cut",
            severity: "low",
            status: "Closed",
            daysAgo: 120,
            href: "/pm/incidents",
            documentId: `inc-${id}-1`,
          },
        ]
      : variant === "mid"
        ? [
            {
              id: `${id}-inc-1`,
              title: "Recordable — Hand laceration",
              severity: "medium",
              status: "Open",
              daysAgo: 10,
              href: "/pm/incidents",
              documentId: `inc-${id}-1`,
            },
            {
              id: `${id}-inc-2`,
              title: "Near miss — Dropped tool",
              severity: "low",
              status: "Closed",
              daysAgo: 30,
              href: "/core/safety-observations",
              documentId: `nm-${id}-1`,
            },
          ]
        : [
            {
              id: `${id}-inc-1`,
              title: "Recordable — Slip on ice",
              severity: "high",
              status: "Open",
              daysAgo: 5,
              href: "/pm/incidents",
              documentId: `inc-${id}-1`,
            },
            {
              id: `${id}-inc-2`,
              title: "Recordable — Strain",
              severity: "medium",
              status: "Closed",
              daysAgo: 45,
              href: "/pm/incidents",
              documentId: `inc-${id}-2`,
            },
            {
              id: `${id}-inc-3`,
              title: "Near miss — Unsecured load",
              severity: "medium",
              status: "Closed",
              daysAgo: 20,
              href: "/core/safety-observations",
              documentId: `nm-${id}-1`,
            },
          ];

  // Tag near misses separately in mid/weak by title; performance formula uses severity
  const capas: CapaRow[] =
    variant === "strong"
      ? [
          {
            id: `${id}-capa-1`,
            title: "CAPA — Housekeeping",
            status: "verified",
            closureDays: 6,
            critical: false,
            href: "/pm/corrective-actions",
          },
        ]
      : variant === "mid"
        ? [
            {
              id: `${id}-capa-1`,
              title: "CAPA — Guardrail repair",
              status: "closed",
              closureDays: 14,
              critical: false,
              href: "/pm/corrective-actions",
            },
            {
              id: `${id}-capa-2`,
              title: "CAPA — LOTO update",
              status: "overdue",
              closureDays: null,
              critical: false,
              href: "/pm/corrective-actions",
            },
          ]
        : [
            {
              id: `${id}-capa-1`,
              title: "CAPA — Critical finding closeout",
              status: "overdue",
              closureDays: null,
              critical: true,
              href: "/pm/corrective-actions",
            },
            {
              id: `${id}-capa-2`,
              title: "CAPA — Training gap",
              status: "closed",
              closureDays: 45,
              critical: false,
              href: "/pm/corrective-actions",
            },
          ];

  const audits: AuditRow[] =
    variant === "strong"
      ? [
          {
            id: `${id}-aud-1`,
            title: "Site inspection — electrical",
            findingSeverity: "low",
            closedOnTime: true,
            href: "/pm/inspections",
          },
          {
            id: `${id}-aud-2`,
            title: "Audit — program review",
            findingSeverity: null,
            closedOnTime: true,
            href: "/pm/inspections",
          },
        ]
      : [
          {
            id: `${id}-aud-1`,
            title: "Inspection — scaffold",
            findingSeverity: variant === "weak" ? "critical" : "high",
            closedOnTime: variant !== "weak",
            href: "/pm/inspections",
          },
          {
            id: `${id}-aud-2`,
            title: "Inspection — trench",
            findingSeverity: "medium",
            closedOnTime: false,
            href: "/pm/inspections",
          },
        ];

  const meetings: MeetingRow[] = [
    {
      id: `${id}-mtg-1`,
      title: "Toolbox — Hot work",
      kind: "toolbox_talk",
      attended: true,
      occurredAt: isoDaysAgo(2),
      href: "/core/meeting-records",
    },
    {
      id: `${id}-mtg-2`,
      title: "Weekly safety meeting",
      kind: "safety_meeting",
      attended: variant !== "weak",
      occurredAt: isoDaysAgo(7),
      href: "/core/meeting-records",
    },
    {
      id: `${id}-mtg-3`,
      title: "Toolbox — LOTO",
      kind: "toolbox_talk",
      attended: variant === "strong",
      occurredAt: isoDaysAgo(14),
      href: "/core/meeting-records",
    },
  ];

  return {
    contractorCompanyId: id,
    name,
    hours: variant === "strong" ? 18000 : variant === "mid" ? 12000 : 9000,
    programDocs: baseDocs,
    training,
    incidents,
    capas,
    audits,
    meetings,
    permitImpacts: [],
  };
}

function seed(): StoreState {
  const contractors = new Map<number, ContractorInputs>();
  contractors.set(201, seedContractor(201, "Northline Electrical", "mid"));
  contractors.set(203, seedContractor(203, "Apex Scaffolding", "strong"));
  contractors.set(202, seedContractor(202, "Summit Civil Sub", "weak"));

  const state: StoreState = {
    primeCompanyId: 1,
    requiredDocCodes: [
      "hse_policy",
      "orientation",
      "confined_space",
      "insurance_coi",
      "wcb",
    ],
    contractors,
    scores: new Map(),
    revision: 0,
  };

  for (const id of contractors.keys()) {
    recompute(state, id, null, "seed");
  }
  return state;
}

function store(): StoreState {
  if (!g.__cssStore) g.__cssStore = seed();
  return g.__cssStore;
}

function severityWeight(s: IncidentRow["severity"]) {
  return { low: 1, medium: 2, high: 4, critical: 8 }[s];
}

function recencyDecay(daysAgo: number) {
  if (daysAgo < 90) return 1;
  if (daysAgo < 180) return 0.7;
  if (daysAgo < 365) return 0.4;
  return 0.2;
}

function computePillars(
  state: StoreState,
  input: ContractorInputs,
): {
  pillars: Record<PillarId, PillarDto>;
  evidence: ScoreEvidence[];
  gates: GateTriggered[];
  dataSources: ContractorSafetyScoreDto["dataSources"];
  status: ContractorSafetyScoreDto["status"];
  cappedGrade: ContractorGrade | null;
} {
  const evidence: ScoreEvidence[] = [];
  const gates: GateTriggered[] = [];
  const weights = DEFAULT_WEIGHTS;

  // --- Program completeness ---
  const required = state.requiredDocCodes;
  const validDocs = input.programDocs.filter(
    (d) =>
      required.includes(d.docCode) &&
      (d.status === "approved" || d.status === "submitted"),
  );
  const approvedDocs = input.programDocs.filter(
    (d) => required.includes(d.docCode) && d.status === "approved",
  );
  const docScore =
    required.length > 0
      ? (approvedDocs.length / required.length) * 100
      : 0;
  const meetingAttended = input.meetings.filter((m) => m.attended).length;
  const meetingScore =
    input.meetings.length > 0
      ? (meetingAttended / input.meetings.length) * 100
      : 0;
  const programScore = round1(docScore * 0.7 + meetingScore * 0.3);

  for (const d of input.programDocs) {
    evidence.push({
      id: d.id,
      pillar: "program_completeness",
      evidenceType: d.docCode.includes("procedure")
        ? "procedure_doc"
        : "policy_doc",
      title: d.title,
      subtitle: d.status,
      status: d.status,
      documentId: d.documentId,
      href: d.href,
      weightContribution:
        d.status === "approved" ? round1((100 / required.length) * 0.7) : 0,
    });
  }
  for (const m of input.meetings) {
    evidence.push({
      id: m.id,
      pillar: "program_completeness",
      evidenceType: m.kind === "toolbox_talk" ? "toolbox_talk" : "safety_meeting",
      title: m.title,
      subtitle: m.attended ? "Attended" : "Missed",
      status: m.attended ? "attended" : "missed",
      href: m.href,
      occurredAt: m.occurredAt,
    });
  }

  // --- Performance ---
  const trueIncidents = input.incidents.filter(
    (i) => !i.title.toLowerCase().includes("near miss"),
  );
  const nearMisses = input.incidents.filter((i) =>
    i.title.toLowerCase().includes("near miss"),
  );
  const weighted =
    trueIncidents.reduce(
      (sum, i) => sum + severityWeight(i.severity) * recencyDecay(i.daysAgo),
      0,
    ) || 0;
  const rate =
    input.hours > 0 ? (weighted / input.hours) * 200000 : weighted * 10;
  const incidentScore = clamp(100 - rate * 8);
  const nearMissScore = clamp(40 + nearMisses.length * 15, 40, 100);
  const permitDelta = input.permitImpacts.reduce((s, p) => s + p.delta, 0);
  const performanceScore = round1(
    clamp(incidentScore * 0.75 + nearMissScore * 0.25 + permitDelta),
  );

  for (const i of input.incidents) {
    const isNm = i.title.toLowerCase().includes("near miss");
    evidence.push({
      id: i.id,
      pillar: "performance",
      evidenceType: isNm ? "near_miss" : "incident",
      title: i.title,
      subtitle: `${i.severity} · ${i.daysAgo}d ago`,
      status: i.status,
      documentId: i.documentId,
      href: i.href,
      occurredAt: isoDaysAgo(i.daysAgo),
      weightContribution: isNm ? 2 : -round1(severityWeight(i.severity) * 3),
    });
  }
  for (const p of input.permitImpacts) {
    evidence.push({
      id: p.id,
      pillar: "performance",
      evidenceType: "permit_performance",
      title: `Permit ${p.event.replace(/_/g, " ")} (${p.riskLevel})`,
      subtitle: `CSS Δ ${p.delta > 0 ? "+" : ""}${p.delta}`,
      status: p.event,
      href: `/field/permits`,
      documentId: p.permitId,
      occurredAt: p.at,
      weightContribution: p.delta,
    });
  }

  // --- Responsiveness ---
  const closed = input.capas.filter(
    (c) => c.status === "closed" || c.status === "verified",
  );
  const avgClosure =
    closed.length > 0
      ? closed.reduce((s, c) => s + (c.closureDays ?? 30), 0) / closed.length
      : 30;
  let closureScore = 100;
  if (avgClosure > 7) closureScore = 85;
  if (avgClosure > 14) closureScore = 60;
  if (avgClosure > 30) closureScore = 30;
  if (avgClosure > 60) closureScore = 15;
  const overdueCount = input.capas.filter((c) => c.status === "overdue").length;
  const overduePenalty = Math.min(40, overdueCount * 8);
  const verifiedPct =
    input.capas.length > 0
      ? input.capas.filter((c) => c.status === "verified").length /
        input.capas.length
      : 0;
  const verificationBonus = verifiedPct * 10;
  const responsivenessScore = round1(
    clamp(closureScore - overduePenalty + verificationBonus),
  );

  for (const c of input.capas) {
    evidence.push({
      id: c.id,
      pillar: "responsiveness",
      evidenceType: "capa",
      title: c.title,
      subtitle:
        c.closureDays != null
          ? `Closed in ${c.closureDays}d`
          : c.status,
      status: c.status,
      href: c.href,
      weightContribution: c.status === "overdue" ? -8 : c.status === "verified" ? 4 : 0,
    });
  }

  // --- Training ---
  const workers = [...new Set(input.training.map((t) => t.workerName))];
  let compliantWorkers = 0;
  for (const w of workers) {
    const rows = input.training.filter((t) => t.workerName === w);
    if (rows.every((r) => r.status === "compliant" || r.status === "expiring_soon")) {
      compliantWorkers += 1;
    }
  }
  const trainingScore = round1(
    workers.length > 0 ? (compliantWorkers / workers.length) * 100 : 0,
  );
  for (const t of input.training) {
    evidence.push({
      id: t.id,
      pillar: "training_competency",
      evidenceType: "training_record",
      title: `${t.workerName} — ${t.courseName}`,
      subtitle: t.status,
      status: t.status,
      href: t.href,
    });
  }

  // --- Audit ---
  const findings = input.audits.filter((a) => a.findingSeverity);
  const burden = findings.reduce((s, a) => {
    const w =
      a.findingSeverity === "critical"
        ? 40
        : a.findingSeverity === "high"
          ? 25
          : a.findingSeverity === "medium"
            ? 12
            : 5;
    return s + w;
  }, 0);
  const findingBurdenScore = clamp(100 - burden);
  const closeoutScore =
    input.audits.length > 0
      ? (input.audits.filter((a) => a.closedOnTime).length /
          input.audits.length) *
        100
      : 70;
  const auditScore = round1(findingBurdenScore * 0.6 + closeoutScore * 0.4);
  for (const a of input.audits) {
    evidence.push({
      id: a.id,
      pillar: "audit_inspection",
      evidenceType: "inspection",
      title: a.title,
      subtitle: a.findingSeverity
        ? `${a.findingSeverity} · ${a.closedOnTime ? "on time" : "late"}`
        : a.closedOnTime
          ? "Clean · on time"
          : "Late closeout",
      status: a.closedOnTime ? "closed_on_time" : "late",
      href: a.href,
    });
  }

  const pillars = {} as Record<PillarId, PillarDto>;
  const pillarScores: Record<PillarId, number> = {
    program_completeness: programScore,
    performance: performanceScore,
    responsiveness: responsivenessScore,
    training_competency: trainingScore,
    audit_inspection: auditScore,
  };

  for (const id of Object.keys(pillarScores) as PillarId[]) {
    const f = PILLAR_FORMULAS[id];
    const score = pillarScores[id];
    const weight = weights[id];
    pillars[id] = {
      id,
      label: PILLAR_LABELS[id],
      score,
      weight,
      weightedContribution: round1(score * weight),
      formula: f.formula,
      formulaId: f.formulaId,
      inputs:
        id === "program_completeness"
          ? {
              approved_docs: approvedDocs.length,
              required_docs: required.length,
              meeting_attendance_pct: round1(meetingScore),
            }
          : id === "performance"
            ? {
                weighted_incident_burden: round1(weighted),
                hours: input.hours,
                near_miss_count: nearMisses.length,
              }
            : id === "responsiveness"
              ? {
                  avg_closure_days: round1(avgClosure),
                  overdue_capa: overdueCount,
                  verified_pct: round1(verifiedPct * 100),
                }
              : id === "training_competency"
                ? {
                    workers_compliant: compliantWorkers,
                    workers_on_sites: workers.length,
                  }
                : {
                    finding_burden: burden,
                    on_time_closeout_pct: round1(closeoutScore),
                  },
    };
  }

  // Gates
  let cappedGrade: ContractorGrade | null = null;
  let status: ContractorSafetyScoreDto["status"] = "current";
  const missingMandatory = required.filter(
    (code) =>
      !input.programDocs.some((d) => d.docCode === code && d.status === "approved"),
  );
  if (missingMandatory.length >= 2) {
    status = "insufficient_data";
    cappedGrade = "D";
    gates.push({
      code: "missing_mandatory_policies",
      label: "Missing mandatory policy set",
      effect: "Status insufficient_data; grade capped at D / score ≤ 59",
    });
  }
  const criticalOverdue = input.capas.some(
    (c) => c.critical && c.status === "overdue",
  );
  if (criticalOverdue) {
    cappedGrade = cappedGrade === "D" ? "D" : "C";
    gates.push({
      code: "critical_capa_overdue",
      label: "Open critical CAPA overdue",
      effect: "Max grade C",
    });
  }

  const dataSources = [
    { id: "policies", label: "Policies & procedures", count: input.programDocs.length },
    { id: "training", label: "Training records", count: input.training.length },
    { id: "incidents", label: "Incidents & near misses", count: input.incidents.length },
    { id: "capa", label: "Corrective actions", count: input.capas.length },
    { id: "audits", label: "Audits & inspections", count: input.audits.length },
    { id: "meetings", label: "Toolbox / safety meetings", count: input.meetings.length },
  ];

  return { pillars, evidence, gates, dataSources, status, cappedGrade };
}

function recompute(
  state: StoreState,
  contractorCompanyId: number,
  projectId: number | null,
  triggerEvent: string,
) {
  const input = state.contractors.get(contractorCompanyId);
  if (!input) return null;

  const { pillars, evidence, gates, dataSources, status, cappedGrade } =
    computePillars(state, input);

  let overall = round1(
    (Object.keys(pillars) as PillarId[]).reduce(
      (s, id) => s + pillars[id].score * pillars[id].weight,
      0,
    ),
  );

  if (status === "insufficient_data") {
    overall = Math.min(overall, 59);
  }

  let grade = gradeFromScore(overall);
  if (cappedGrade) {
    const order: ContractorGrade[] = ["A", "B", "C", "D"];
    if (order.indexOf(grade) < order.indexOf(cappedGrade)) {
      grade = cappedGrade;
    }
  }

  state.revision += 1;
  const key = scoreKey(contractorCompanyId, projectId);
  const prev = state.scores.get(key);
  const history: ScoreHistoryPoint[] = [
    ...(prev?.history ?? []),
    {
      id: `hist-${state.revision}`,
      overallScore: overall,
      grade,
      pillars: {
        program_completeness: pillars.program_completeness.score,
        performance: pillars.performance.score,
        responsiveness: pillars.responsiveness.score,
        training_competency: pillars.training_competency.score,
        audit_inspection: pillars.audit_inspection.score,
      },
      scoredAt: new Date().toISOString(),
      triggerEvent,
    },
  ].slice(-24);

  const score: ContractorSafetyScoreDto = {
    id: `css-${contractorCompanyId}-${projectId ?? "prime"}`,
    primeCompanyId: state.primeCompanyId,
    contractorCompanyId,
    contractorName: input.name,
    projectId,
    scope: projectId ? "project_overlay" : "prime_contractor",
    overallScore: overall,
    grade,
    status,
    pillars,
    scoredAt: new Date().toISOString(),
    period: { start: isoDaysAgo(365), end: new Date().toISOString() },
    dataSources,
    gatesTriggered: gates,
    revision: state.revision,
    href: `/core/contractor-scores?contractorCompanyId=${contractorCompanyId}`,
  };

  const bundle: ScoredBundle = { score, evidence, history };
  state.scores.set(key, bundle);
  return bundle;
}

export function listScores(opts?: { projectId?: number; minScore?: number; grade?: string }) {
  const s = store();
  const items = [...s.scores.values()]
    .map((b) => b.score)
    .filter((sc) => {
      if (opts?.projectId != null && sc.projectId !== opts.projectId && sc.projectId != null) {
        return false;
      }
      if (opts?.minScore != null && sc.overallScore < opts.minScore) return false;
      if (opts?.grade && sc.grade !== opts.grade) return false;
      return sc.projectId == null; // list prime-level by default
    })
    .sort((a, b) => b.overallScore - a.overallScore);
  return { items, revision: s.revision };
}

export function getScore(contractorCompanyId: number, projectId: number | null = null) {
  const s = store();
  const key = scoreKey(contractorCompanyId, projectId);
  let bundle = s.scores.get(key);
  if (!bundle && projectId == null) {
    bundle = recompute(s, contractorCompanyId, null, "lazy") ?? undefined;
  }
  return bundle?.score ?? null;
}

export function getEvidence(
  contractorCompanyId: number,
  pillar?: PillarId,
  projectId: number | null = null,
) {
  const s = store();
  const bundle = s.scores.get(scoreKey(contractorCompanyId, projectId));
  if (!bundle) return { items: [] as ScoreEvidence[], total: 0 };
  const items = pillar
    ? bundle.evidence.filter((e) => e.pillar === pillar)
    : bundle.evidence;
  return { items, total: items.length };
}

export function getHistory(contractorCompanyId: number, projectId: number | null = null) {
  const s = store();
  const bundle = s.scores.get(scoreKey(contractorCompanyId, projectId));
  return { items: bundle?.history ?? [] };
}

export function getPillarDetail(
  contractorCompanyId: number,
  pillarId: PillarId,
  projectId: number | null = null,
) {
  const score = getScore(contractorCompanyId, projectId);
  if (!score) return null;
  const pillar = score.pillars[pillarId];
  if (!pillar) return null;
  const { items } = getEvidence(contractorCompanyId, pillarId, projectId);
  return { pillar, evidence: items, score };
}

export function recalculate(
  contractorCompanyId: number,
  projectId: number | null = null,
  triggerEvent = "manual_recalculate",
) {
  const s = store();
  return recompute(s, contractorCompanyId, projectId, triggerEvent)?.score ?? null;
}

export function recalculateAll(triggerEvent = "batch_recalculate") {
  const s = store();
  const items = [];
  for (const id of s.contractors.keys()) {
    const sc = recompute(s, id, null, triggerEvent)?.score;
    if (sc) items.push(sc);
  }
  return { items, revision: s.revision };
}

/** Smart behavior: mutate inputs then recompute. */
export function emitScoreEvent(
  contractorCompanyId: number,
  eventName: string,
) {
  const s = store();
  const input = s.contractors.get(contractorCompanyId);
  if (!input) return null;

  if (eventName.includes("training")) {
    const overdue = input.training.find((t) => t.status === "overdue");
    if (overdue) overdue.status = "compliant";
  }
  if (eventName.includes("incident")) {
    input.incidents.unshift({
      id: `${contractorCompanyId}-inc-${input.incidents.length + 1}`,
      title: "Near miss — Live event",
      severity: "low",
      status: "Closed",
      daysAgo: 0,
      href: "/core/safety-observations",
      documentId: `nm-live-${s.revision + 1}`,
    });
  }
  if (eventName.includes("policy") || eventName.includes("document")) {
    const expired = input.programDocs.find((d) => d.status === "expired");
    if (expired) expired.status = "approved";
  }
  if (eventName.includes("capa")) {
    const overdue = input.capas.find((c) => c.status === "overdue");
    if (overdue) {
      overdue.status = "closed";
      overdue.closureDays = 10;
    }
  }
  if (eventName.includes("toolbox") || eventName.includes("meeting")) {
    input.meetings.unshift({
      id: `${contractorCompanyId}-mtg-${input.meetings.length + 1}`,
      title: "Toolbox — Live update",
      kind: "toolbox_talk",
      attended: true,
      occurredAt: new Date().toISOString(),
      href: "/core/meeting-records",
    });
  }

  return recompute(s, contractorCompanyId, null, eventName)?.score ?? null;
}

/**
 * Apply risk-weighted permit performance delta to contractor CSS.
 */
export function applyPermitCssImpact(args: {
  contractorCompanyId: number;
  permitId: string;
  riskLevel: string;
  event: string;
  delta: number;
}) {
  const s = store();
  const input = s.contractors.get(args.contractorCompanyId);
  if (!input) return null;
  input.permitImpacts.unshift({
    id: `permit-impact-${s.revision + 1}`,
    permitId: args.permitId,
    riskLevel: args.riskLevel,
    event: args.event,
    delta: args.delta,
    at: new Date().toISOString(),
  });
  return recompute(
    s,
    args.contractorCompanyId,
    null,
    `permit.${args.event}`,
  )?.score ?? null;
}

export function getRubric() {
  return {
    primeCompanyId: store().primeCompanyId,
    name: "default",
    version: 1,
    weights: DEFAULT_WEIGHTS,
    requiredDocs: store().requiredDocCodes.map((code) => ({
      code,
      label: code.replace(/_/g, " "),
      mandatory: true,
    })),
    lookbackDays: 365,
  };
}
