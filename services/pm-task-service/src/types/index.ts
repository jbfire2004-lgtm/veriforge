export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface TaskRequirements {
  requiredSkills?: string[];
  requiredEquipment?: string[];
  requiredTraining?: string[];
  requiredControls?: string[];
  requiredPpe?: string[];
  requiredJha?: string[];
}

export interface SafetyGateContext {
  assignedWorkers?: string[];
  assignedEquipment?: string[];
  workerSkills?: string[];
  completedTraining?: string[];
  appliedControls?: string[];
  confirmedPpe?: string[];
  activeJhaTypes?: string[];
}

export interface SafetyGateResult {
  passed: boolean;
  reason: string;
  gates: string[];
  taskId: string;
}

export interface TaskDetail {
  id: string;
  companyId: string;
  workPackageId: string;
  title: string;
  description: string | null;
  taskType: string | null;
  requiredSkills: string[];
  requiredEquipment: string[];
  requiredTraining: string[];
  requiredControls: string[];
  requiredPpe: string[];
  requiredJha: string[];
  status: string;
  startDate: string | null;
  endDate: string | null;
  version: number;
  assignments: Array<{ type: string; assigneeId: string; assignedAt: string }>;
  createdAt: string;
  updatedAt: string;
  workflow: string;
  workflowTimestamp: string;
}
