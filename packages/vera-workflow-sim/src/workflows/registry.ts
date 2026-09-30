import type { LifecycleCategory, WorkflowDefinition } from "../types";
import { companyLifecycle } from "./lifecycles/company";
import { competencyLifecycle } from "./lifecycles/competency";
import { complianceLifecycle } from "./lifecycles/compliance";
import { dashboardLifecycle } from "./lifecycles/dashboard";
import { equipmentLifecycle } from "./lifecycles/equipment";
import { inspectionLifecycle } from "./lifecycles/inspection";
import { offlineSyncLifecycle } from "./lifecycles/offline-sync";
import { projectLifecycle } from "./lifecycles/project";
import { trainingLifecycle } from "./lifecycles/training";
import { trainingProviderLifecycle } from "./lifecycles/training-provider";
import { unionHallLifecycle } from "./lifecycles/union-hall";
import { workerLifecycle } from "./lifecycles/worker";

export const ALL_WORKFLOWS: WorkflowDefinition[] = [
  workerLifecycle,
  equipmentLifecycle,
  trainingLifecycle,
  trainingProviderLifecycle,
  unionHallLifecycle,
  companyLifecycle,
  projectLifecycle,
  complianceLifecycle,
  inspectionLifecycle,
  competencyLifecycle,
  offlineSyncLifecycle,
  dashboardLifecycle,
];

export const WORKFLOW_BY_ID: Record<string, WorkflowDefinition> = Object.fromEntries(
  ALL_WORKFLOWS.map((w) => [w.id, w])
);

export function getWorkflow(id: string): WorkflowDefinition | undefined {
  return WORKFLOW_BY_ID[id];
}

export function workflowsByCategory(category: LifecycleCategory): WorkflowDefinition[] {
  return ALL_WORKFLOWS.filter((w) => w.category === category);
}
