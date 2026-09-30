import { VeraAutonomousSafetyEngine } from "@vera/autonomous-safety";
import { VeraPredictiveSchedulingEngine } from "@vera/predictive-scheduling";
import { VeraAutonomousOperationsEngine } from "@vera/autonomous-operations";
import type { EnterpriseContextInput, EnterpriseAction, PhaseAutomationBundle } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

const vase = new VeraAutonomousSafetyEngine();
const vpse = new VeraPredictiveSchedulingEngine();
const vaoe = new VeraAutonomousOperationsEngine();

export function runSafetyPhase(ctx: EnterpriseContextInput): PhaseAutomationBundle {
  const report = vase.analyze({
    companyId: ctx.companyId,
    projectId: ctx.projectId,
    forms: ctx.safetyForms?.map((f) => ({
      id: f.id,
      kind: f.kind as "JHA",
      title: f.title,
      hazardSummary: f.hazardSummary,
    })),
    trainingGaps: ctx.nonCompliantWorkers,
    inspectionFailures: ctx.inspectionFailures,
    competencyGaps: ctx.nonCompliantWorkers,
    lockedOutEquipment: (ctx.lockedEquipment ?? 0) > 0,
  });

  const actions: EnterpriseAction[] = [
    ...report.interventions.map((i) =>
      enterpriseAction({
        module: "safety",
        phase: "VASE",
        type: `safety.${i.type}`,
        title: i.title,
        reason: i.reason,
        entityType: "project",
        entityId: ctx.projectId ?? ctx.companyId ?? "0",
        priority: priorityScore({ safety: 90, risk: report.sif.riskScore.score }),
        overrideable: true,
        rollbackable: true,
      })
    ),
    ...report.automation.alerts.map((a, idx) =>
      enterpriseAction({
        module: "safety",
        phase: "VASE",
        type: "safety.alert",
        title: a,
        reason: "Safety automation",
        entityType: "company",
        entityId: ctx.companyId ?? "0",
        priority: 70 + idx,
        overrideable: false,
        rollbackable: false,
      })
    ),
  ];

  return {
    actions,
    insights: report.automation.alerts,
    dashboard: report.dashboard as unknown as Record<string, unknown>,
  };
}

export function runSchedulingPhase(ctx: EnterpriseContextInput): PhaseAutomationBundle {
  const workers = Array.from({ length: Math.min(ctx.workerCount ?? 5, 20) }, (_, i) => ({
    id: `w${i + 1}`,
    name: `Worker ${i + 1}`,
    isCompliant: i % 3 !== 0,
    dispatchStatus: "available" as const,
    readinessScore: 70,
  }));

  const projects =
    ctx.schedulingShortages?.map((s) => ({
      id: s.projectId,
      name: `Project ${s.projectId}`,
      requiredWorkers: s.deficit + 2,
      assignedWorkers: 2,
    })) ?? [{ id: "p1", name: "Default", requiredWorkers: 3, assignedWorkers: 1 }];

  const report = vpse.analyze({
    companyId: ctx.companyId,
    workers,
    projects,
    horizonDays: 14,
  });

  const actions: EnterpriseAction[] = [
    ...report.automation.scheduleDrafts.map((s, idx) =>
      enterpriseAction({
        module: "scheduling",
        phase: "VPSE",
        type: "scheduling.draft",
        title: s,
        reason: "Predictive scheduling",
        entityType: "project",
        entityId: projects[0]?.id ?? "0",
        priority: priorityScore({ readiness: 75, operational: 60 }) + idx,
        overrideable: true,
        rollbackable: true,
      })
    ),
    ...report.staffing.workerAssignments.slice(0, 5).map((a) =>
      enterpriseAction({
        module: "scheduling",
        phase: "VPSE",
        type: "scheduling.assign_worker",
        title: `Schedule worker ${a.workerId}`,
        reason: "Staffing optimization",
        entityType: "worker",
        entityId: a.workerId,
        targetId: a.projectId,
        priority: priorityScore({ readiness: 80 }),
        overrideable: true,
        rollbackable: true,
      })
    ),
  ];

  return {
    actions,
    insights: report.automation.alerts,
    dashboard: report.dashboard as unknown as Record<string, unknown>,
  };
}

export function runOperationsPhase(ctx: EnterpriseContextInput): PhaseAutomationBundle {
  const report = vaoe.run({
    companyId: ctx.companyId,
    unionHallId: ctx.unionHallId,
    autoExecute: ctx.autoExecute !== false,
    workers: Array.from({ length: Math.min(ctx.workerCount ?? 3, 10) }, (_, i) => ({
      id: `w${i + 1}`,
      name: `Worker ${i + 1}`,
      isCompliant: i % 2 === 0,
      trainingValid: i % 2 === 0,
      dispatchStatus: "available" as const,
    })),
    projects: [{ id: "p1", name: "Site", requiredWorkers: 4, assignedWorkers: 2 }],
    equipment: [{ id: "e1", name: "Unit", inspectionPassed: ctx.inspectionFailures === 0 }],
  });

  const actions: EnterpriseAction[] = report.execution.log.map((a) =>
    enterpriseAction({
      module: "operations",
      phase: "VAOE",
      type: a.type,
      title: a.title,
      reason: a.reason,
      entityType: a.entityType,
      entityId: a.entityId,
      targetId: a.targetId,
      priority: priorityScore({ operational: 85, safety: 40 }),
      overrideable: a.overrideable,
      rollbackable: a.rollbackable,
      status: a.status === "executed" ? "executed" : "pending",
      executedAt: a.executedAt,
    })
  );

  return {
    actions,
    insights: [],
    dashboard: report.dashboard as unknown as Record<string, unknown>,
  };
}
