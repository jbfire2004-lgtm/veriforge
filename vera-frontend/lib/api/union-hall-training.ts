import { apiGet, apiPost } from "@/lib/api";

export type UnionHallTrainingReceipt = {
  receiptId: number;
  status: string;
  trainingRecordId: number;
  workerId: number;
  workerName: string;
  courseName: string;
  providerName: string | null;
  providerId: number | null;
  instructorName: string | null;
  instructorQualificationStatus: string | null;
  issuedAt: string;
  expiresAt: string | null;
  validationOutcome: string | null;
  certificateQrToken: string | null;
};

export type UnionHallProviderSummary = {
  providerId: number;
  name: string;
  code: string | null;
  approvalStatus: string;
  active: boolean;
  complianceStatus: string | null;
  complianceScore: number | null;
  complianceAssessedAt: string | null;
  gaps: unknown;
};

export type UnionHallInstructorSummary = {
  instructorId: number;
  firstName: string;
  lastName: string;
  providerId: number;
  providerName: string;
  qualificationStatus: string;
  qualificationExpiresAt: string | null;
};

export type UnionHallTrainingDashboard = {
  unionHallId: number;
  unionHallName: string;
  counts: { pending: number; accepted: number; pushed: number; rejected: number };
  providerTrainingHistory: UnionHallTrainingReceipt[];
  providers: (UnionHallProviderSummary | null)[];
  instructors: UnionHallInstructorSummary[];
};

export async function getUnionHallTrainingDashboard(hallId: number) {
  return apiGet<UnionHallTrainingDashboard>(
    `/api/v1/core/union-halls/${hallId}/training-dashboard`
  );
}

export async function acceptUnionHallTraining(
  hallId: number,
  recordId: number,
  notes?: string
) {
  return apiPost(
    `/api/v1/core/union-halls/${hallId}/training/${recordId}/accept`,
    { notes }
  );
}

export async function validateUnionHallTraining(hallId: number, recordId: number) {
  return apiPost(
    `/api/v1/core/union-halls/${hallId}/training/${recordId}/validate`,
    {}
  );
}

export async function pushUnionHallTraining(
  hallId: number,
  recordId: number,
  body: { companyId?: number; projectId?: number; equipmentId?: number }
) {
  return apiPost(
    `/api/v1/core/union-halls/${hallId}/training/${recordId}/push`,
    body
  );
}

export async function rejectUnionHallTraining(
  hallId: number,
  recordId: number,
  notes?: string
) {
  return apiPost(
    `/api/v1/core/union-halls/${hallId}/training/${recordId}/reject`,
    { notes }
  );
}

export async function linkUnionHallProvider(
  hallId: number,
  trainingProviderId: number
) {
  return apiPost(`/api/v1/core/union-halls/${hallId}/providers/link`, {
    trainingProviderId,
  });
}
