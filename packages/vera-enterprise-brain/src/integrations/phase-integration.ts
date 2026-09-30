import { VeraCommandCenterEngine } from "@vera/command-center";
import { VeraEnterpriseAutomationEngine } from "@vera/enterprise-automation";
import type { BrainContextInput } from "../types";
import type { CommandContextInput } from "@vera/command-center";
import type { EnterpriseContextInput } from "@vera/enterprise-automation";

const vcc = new VeraCommandCenterEngine();
const veao = new VeraEnterpriseAutomationEngine();

export function toCommandContext(ctx: BrainContextInput): CommandContextInput {
  return {
    companyId: ctx.companyId,
    unionHallId: ctx.unionHallId,
    projectId: ctx.projectId,
    offline: ctx.offline,
    eventName: ctx.eventName,
    sifPrecursors: ctx.sifPrecursors,
    trainingExpiries: ctx.expiringTraining,
    competencyGaps: ctx.nonCompliantWorkers,
    inspectionFailures: ctx.inspectionFailures,
    fatigueIndicators: Math.min(10, ctx.nonCompliantWorkers ?? 0),
  };
}

export function toEnterpriseContext(ctx: BrainContextInput): EnterpriseContextInput {
  return {
    companyId: ctx.companyId,
    unionHallId: ctx.unionHallId,
    projectId: ctx.projectId,
    offline: ctx.offline,
    autoExecute: !ctx.offline,
    nonCompliantWorkers: ctx.nonCompliantWorkers,
    expiringTraining: ctx.expiringTraining,
    inspectionFailures: ctx.inspectionFailures,
    schedulingShortages: ctx.schedulingShortages,
  };
}

export function ingestAllPhases(ctx: BrainContextInput) {
  const command = vcc.refresh(toCommandContext(ctx));
  const enterprise = veao.orchestrate(toEnterpriseContext(ctx));
  return { command, enterprise };
}
