import { VeraAutonomousSafetyEngine } from "@vera/autonomous-safety";
import { VeraPredictiveSchedulingEngine } from "@vera/predictive-scheduling";
import { VeraEnterpriseAutomationEngine } from "@vera/enterprise-automation";
import type { CommandContextInput } from "../types";

const vase = new VeraAutonomousSafetyEngine();
const vpse = new VeraPredictiveSchedulingEngine();
const veao = new VeraEnterpriseAutomationEngine();

export function ingestRealtimePhases(ctx: CommandContextInput) {
  const safety = vase.analyze({
    companyId: ctx.companyId,
    projectId: ctx.projectId,
    forms: ctx.safetyForms?.map((f) => ({
      id: f.id,
      kind: f.kind as "JHA",
      title: f.title,
      hazardSummary: f.hazardSummary,
    })),
    trainingGaps: ctx.trainingExpiries,
    inspectionFailures: ctx.inspectionFailures,
    competencyGaps: ctx.competencyGaps,
  });

  const scheduling = vpse.analyze({
    companyId: ctx.companyId,
    workers: (ctx.entities ?? [])
      .filter((e) => e.type === "worker")
      .map((e) => ({
        id: e.id,
        name: e.name,
        isCompliant: e.complianceOk,
        readinessScore: e.readinessScore,
        dispatchStatus: "available" as const,
      })),
    projects: (ctx.entities ?? [])
      .filter((e) => e.type === "project")
      .map((e) => ({
        id: e.id,
        name: e.name,
        requiredWorkers: 3,
        assignedWorkers: 2,
      })),
  });

  const enterprise = veao.orchestrate({
    companyId: ctx.companyId,
    unionHallId: ctx.unionHallId,
    nonCompliantWorkers: ctx.competencyGaps,
    expiringTraining: ctx.trainingExpiries,
    inspectionFailures: ctx.inspectionFailures,
    safetyForms: ctx.safetyForms,
    autoExecute: !ctx.offline,
  });

  return { safety, scheduling, enterprise };
}
