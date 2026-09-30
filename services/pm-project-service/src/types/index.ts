export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface ProjectMetadata {
  clientName?: string;
  location?: string;
  safetyRequirements?: string[];
  requiredTraining?: string[];
  requiredPermits?: string[];
  safetyGateEnabled?: boolean;
  [key: string]: unknown;
}

export interface SafetyGateCheckInput {
  workerId?: string;
  activityType?: string;
  requiredTraining?: string[];
  completedTraining?: string[];
  hasActiveJha?: boolean;
  hasPermits?: boolean;
}

export interface SafetyGateResult {
  passed: boolean;
  reason: string;
  gates: string[];
  projectRiskLevel: string;
}

export interface ProjectDetail {
  id: string;
  companyId: string;
  name: string;
  type: string | null;
  scope: string | null;
  startDate: string | null;
  endDate: string | null;
  riskLevel: string;
  metadata: ProjectMetadata;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  workPackages: Array<{
    id: string;
    name: string;
    status: string;
    taskCount: number;
    tasks: Array<{
      id: string;
      name: string;
      status: string;
      workPackageId: string | null;
      linkedEntityType: string | null;
      linkedEntityId: string | null;
    }>;
  }>;
}
