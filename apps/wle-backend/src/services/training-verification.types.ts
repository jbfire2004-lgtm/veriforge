import type { TrainingRecordOverallStatus } from '../verification/types/training-record-verification.types';

export type ProviderIngestPayload = {
  workerId?: number;
  workerEmail?: string;
  workerPhone?: string;
  equipmentId?: number;
  companyId?: number;
  projectId?: number;
  certificationId: number;
  providerId?: number;
  trainingProviderId?: number;
  courseId?: number;
  instructorId?: number;
  expiresAt?: string;
  issuedAt?: string;
  certificateNumber?: string;
  ingestionRunId?: number;
  jurisdictionCode?: string;
};

export type VerifyRecordOptions = {
  expectedWorkerId?: number;
  expectedCompanyId?: number;
  expectedTrainingType?: string;
  expectedCertificateNumber?: string;
  expectedProvider?: string;
  jurisdictionCode?: string;
  actorId?: number;
  finalize?: boolean;
};

export type VerifiedTrainingPropagation = {
  wallet: { synced: boolean; workerId: number | null; error?: string };
  company: { refreshed: boolean; companyId: number | null; error?: string };
  project: { projectId: number | null; companyId: number | null };
  unionHall: { receiptsEnsured: boolean; error?: string };
  credentialNft: {
    scheduled: boolean;
    mintStatus: string | null;
    nftTokenId: string | null;
    error?: string;
  };
  notifications: { supervisorsNotified: boolean };
};

export type VerifiedTrainingRecord = {
  engineRunId: number;
  trainingRecordId: number;
  overallStatus: TrainingRecordOverallStatus;
  authenticityStatus: TrainingRecordOverallStatus;
  regulatoryStatus: string | null;
  standardsOutcome: string | null;
  jurisdictionCode: string | null;
  verifiedAt: string;
  completedAt: string | null;
  checks: Record<string, unknown>;
  propagation: VerifiedTrainingPropagation;
  worker: {
    id: number;
    firstName: string;
    lastName: string;
    companyId: number | null;
  };
  certification: {
    id: number;
    name: string;
    code: string | null;
  };
};
