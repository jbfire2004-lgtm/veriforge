import type {
  ProjectComplianceAlertType,
  ProjectComplianceRuleType,
} from '@prisma/client';

export const EXPIRING_SOON_DAYS = 30;

export type RuleMetadata = {
  roles?: string[];
  trades?: string[];
};

export type ComplianceCredentialStatus =
  | 'valid'
  | 'missing'
  | 'expired'
  | 'expiring_soon';

export type ComplianceRuleGap = {
  ruleId: number;
  ruleType: ProjectComplianceRuleType;
  certificationId: number;
  certificationCode: string | null;
  certificationName: string;
  status: ComplianceCredentialStatus;
  credentialId: number | null;
  expiresAt: string | null;
  reason: string;
};

export type WorkerComplianceEvaluation = {
  workerId: number;
  workerName: string;
  role: string | null;
  trade: string | null;
  isCompliant: boolean;
  gaps: ComplianceRuleGap[];
  expiringSoon: ComplianceRuleGap[];
};

export type ProjectComplianceReport = {
  projectId: number;
  projectName: string;
  companyId: number;
  client: string | null;
  compliancePercentage: number;
  totalWorkers: number;
  compliantWorkers: WorkerComplianceEvaluation[];
  nonCompliantWorkers: WorkerComplianceEvaluation[];
  missingOrExpiring: ComplianceRuleGap[];
  evaluatedAt: string;
};

export type WorkerProjectComplianceDetail = WorkerComplianceEvaluation & {
  projectId: number;
  projectName: string;
  required: Array<{
    ruleId: number;
    ruleType: ProjectComplianceRuleType;
    certificationId: number;
    certificationCode: string | null;
    certificationName: string;
    status: ComplianceCredentialStatus;
    credentialId: number | null;
    expiresAt: string | null;
  }>;
  actual: Array<{
    credentialId: number;
    certificationId: number;
    certificationCode: string | null;
    certificationName: string;
    expiresAt: string | null;
    status: ComplianceCredentialStatus;
    lastVerificationStatus: string | null;
  }>;
};

export type ComplianceAlertRow = {
  id: number;
  projectId: number;
  workerId: number;
  workerName: string;
  ruleId: number | null;
  credentialId: number | null;
  type: ProjectComplianceAlertType;
  certificationName: string | null;
  createdAt: string;
  resolvedAt: string | null;
};
