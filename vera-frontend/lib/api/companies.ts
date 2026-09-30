import { apiGet } from "@/lib/api";

export type CompanyComplianceSummary = {
  companyId: number;
  companyName: string;
  status: "COMPLIANT" | "NON_COMPLIANT" | string;
  expiredTrainingCount: number;
  expiringTrainingCount?: number;
  expiredCredentialsCount: number;
  workerIncidentsCount: number;
  equipmentIncidentsCount: number;
};

export type TrainingComplianceBucket =
  | "verified"
  | "pending"
  | "rejected"
  | "expiring";

export type WorkerComplianceFlag =
  | "NON_COMPLIANT"
  | "EXPIRING_TRAINING"
  | "INVALID_TRAINING";

export type TrainingComplianceRow = {
  trainingRecordId: number;
  workerId: number;
  workerName: string;
  courseName: string;
  providerName: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  validationOutcome: string | null;
  projectId: number | null;
  projectName: string | null;
};

export type FlaggedWorkerRow = {
  workerId: number;
  firstName: string;
  lastName: string;
  flags: WorkerComplianceFlag[];
};

export type CompanyTrainingComplianceDashboard = {
  companyId: number;
  companyName: string;
  updatedAt: string;
  status: "COMPLIANT" | "NON_COMPLIANT";
  counts: {
    verified: number;
    pending: number;
    rejected: number;
    expiring: number;
  };
  records: Record<TrainingComplianceBucket, TrainingComplianceRow[]>;
  flaggedWorkers: FlaggedWorkerRow[];
  projects: {
    projectId: number;
    projectName: string;
    counts: CompanyTrainingComplianceDashboard["counts"];
    flaggedWorkerCount: number;
  }[];
};

export async function getCompanyCompliance(companyId: number) {
  return apiGet<CompanyComplianceSummary>(`/companies/${companyId}/compliance`);
}

export async function getCompanyTrainingCompliance(companyId: number) {
  return apiGet<CompanyTrainingComplianceDashboard>(
    `/companies/${companyId}/training-compliance`
  );
}

export async function getProjectTrainingCompliance(
  companyId: number,
  projectId: number
) {
  return apiGet<{
    projectId: number;
    projectName: string;
    companyId: number;
    updatedAt: string;
    counts: CompanyTrainingComplianceDashboard["counts"];
    records: CompanyTrainingComplianceDashboard["records"];
    flaggedWorkers: CompanyTrainingComplianceDashboard["flaggedWorkers"];
  }>(`/companies/${companyId}/projects/${projectId}/training-compliance`);
}

export async function getCompany(companyId: number) {
  return apiGet(`/companies/${companyId}`);
}
