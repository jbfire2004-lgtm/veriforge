import type { Session } from "next-auth";
import { apiFetchJson } from "./api-client";

const BASE = "/api/v1/workers";

export type TrainingItemStatus = "valid" | "expired" | "missing";

export type WorkerTrainingRequirement = {
  code: string;
  name: string;
  status: TrainingItemStatus;
  matchedRecordId: number | null;
  expiresAt: string | null;
};

export type WorkerTrainingHydration = {
  workerId: number;
  companyId: number | null;
  records: Array<{
    id: number;
    certificationId: number;
    code: string;
    name: string;
    issuedAt: string;
    expiresAt: string | null;
    completedAt: string | null;
    status: "valid" | "expired";
    certificateNumber: string | null;
    certificateUrl: string | null;
    projectId: number | null;
    companyId: number | null;
  }>;
  competencies: Array<{
    id: number;
    equipmentTypeKey: string;
    equipmentName: string | null;
    score: number;
    passed: boolean;
    evaluationDate: string;
    expiresAt: string | null;
    status: TrainingItemStatus;
  }>;
  certifications: Array<{
    id: number;
    code: string;
    name: string;
    latestRecordId: number;
    expiresAt: string | null;
    status: "valid" | "expired";
  }>;
  expiries: Array<{
    type: "training" | "competency" | "restriction";
    key: string;
    name: string;
    expiresAt: string;
    status: "valid" | "expired";
  }>;
  restrictions: Array<{
    id: string;
    type: string;
    description: string;
    blocksHighRisk: boolean;
    blocksConfinedSpace: boolean;
    blocksHotWork: boolean;
    blocksEquipment: boolean;
    startsAt: string;
    expiresAt: string | null;
    active: boolean;
  }>;
  requirements: WorkerTrainingRequirement[];
  summary: {
    valid: number;
    expired: number;
    missing: number;
    totalRecords: number;
    hasBlockingRestrictions: boolean;
  };
  hydratedAt: string;
};

export type WorkerTrainingApiContext = {
  session?: Session | null;
};

function qs(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchWorkerTrainingFromCore(
  workerId: number,
  options?: {
    requiredTraining?: string[];
    roleType?: string;
    projectId?: number;
    session?: Session | null;
  },
) {
  return apiFetchJson<WorkerTrainingHydration>(
    `${BASE}/${workerId}/training${qs({
      requiredTraining: options?.requiredTraining?.join(","),
      roleType: options?.roleType,
      projectId: options?.projectId,
    })}`,
    { session: options?.session },
  );
}

export function trainingStatusLabel(status: TrainingItemStatus) {
  if (status === "valid") return "Valid";
  if (status === "expired") return "Expired";
  return "Missing";
}

export function allRequiredTrainingValid(requirements: WorkerTrainingRequirement[]) {
  return requirements.length === 0 || requirements.every((r) => r.status === "valid");
}
