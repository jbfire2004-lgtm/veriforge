import { apiFetchJson } from "./api-client";

export type WorkerProjectReadinessStatus = "READY" | "RESTRICTED" | "NOT QUALIFIED";

export type WorkerProjectReadinessJson = {
  status: WorkerProjectReadinessStatus;
  blocking_items: string[];
  non_blocking_items: string[];
  fix_steps: string[];
  supervisor_message: string;
};

export type WorkerProjectReadinessResult = WorkerProjectReadinessJson & {
  readiness_id: string;
  worker_id: number;
  project_id: number;
  evaluated_at: string;
  contractor_prequalification: {
    required: boolean;
    status: "approved" | "conditional" | "rejected" | "not_applicable";
    company_name?: string;
  };
  orientation: {
    current: boolean;
    blocking_packages: string[];
  };
  training_summary: {
    required: number;
    valid_verified: number;
    expired: number;
    missing: number;
    unverified: number;
    expiring_soon: number;
  };
};

export async function fetchWorkerProjectReadiness(workerId: number, projectId: number) {
  return apiFetchJson<WorkerProjectReadinessResult>(
    `/api/v1/workers/${workerId}/project-readiness?projectId=${projectId}`,
  );
}

export async function evaluateWorkerProjectReadiness(workerId: number, projectId: number) {
  return apiFetchJson<WorkerProjectReadinessResult>(`/api/ai/worker/project-readiness`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workerId, projectId }),
  });
}
