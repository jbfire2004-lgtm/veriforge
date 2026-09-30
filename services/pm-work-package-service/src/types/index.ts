export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface WorkPackageRequirements {
  requiredEquipment?: string[];
  requiredWorkers?: string[];
  requiredTraining?: string[];
  requiredJha?: string[];
  requiredInspections?: string[];
  requiredPermits?: string[];
}

export interface SafetyGateContext {
  assignedWorkers?: string[];
  availableEquipment?: string[];
  completedTraining?: string[];
  activeJhaTypes?: string[];
  completedInspections?: string[];
  activePermits?: string[];
}

export interface SafetyGateResult {
  passed: boolean;
  reason: string;
  gates: string[];
  workPackageId: string;
  version: number;
}

export interface WorkPackageDetail {
  id: string;
  companyId: string;
  projectId: string;
  title: string;
  description: string | null;
  requiredEquipment: string[];
  requiredWorkers: string[];
  requiredTraining: string[];
  requiredJha: string[];
  requiredInspections: string[];
  requiredPermits: string[];
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
