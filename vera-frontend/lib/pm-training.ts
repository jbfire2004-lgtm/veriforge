import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/training`;

export type WorkerTrainingRecord = {
  id: number;
  workerId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  status: string;
  completionDate: string | null;
  expiryDate: string | null;
  certificatePath: string | null;
};

export async function listPmTrainingCourses(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/courses?companyId=${companyId}`);
}

export async function createPmTrainingCourse(body: {
  companyId: number;
  name: string;
  trainingCode?: string;
  category?: string;
  roleType?: string;
  expiryDays?: number;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmTrainingMatrix(companyId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/matrix?companyId=${companyId}`);
}

export async function upsertPmTrainingMatrix(body: {
  companyId: number;
  roleType: string;
  requiredCourses: Array<{
    trainingCode: string;
    trainingName: string;
    category?: string;
    expiresInDays?: number;
  }>;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/matrix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function assignPmTraining(body: {
  workerId: number;
  courseId: number | string;
  courseName?: string;
  companyId?: number;
  projectId?: number;
  expiresInDays?: number;
}) {
  return apiFetchJson<WorkerTrainingRecord>(`${BASE}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function completePmTraining(recordId: number) {
  return apiFetchJson<WorkerTrainingRecord>(`${BASE}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recordId }),
  });
}

export async function verifyPmTraining(body: {
  recordId: number;
  certificateUrl?: string;
  certificateNumber?: string;
}) {
  return apiFetchJson<WorkerTrainingRecord>(`${BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmWorkerTraining(workerId: number, roleType = "worker") {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/worker/${workerId}?roleType=${roleType}`,
  );
}

export async function predictPmTrainingLapse(workerId: number, roleType = "worker") {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/worker/${workerId}/predict?roleType=${roleType}`,
  );
}

export async function fetchPmTrainingAnalytics(companyId: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/analytics/company/${companyId}${q}`,
  );
}

export type TrainingCompetencyEngineInput = {
  worker_profile: {
    role?: string;
    trade?: string;
    experience_years?: number;
    certifications?: string[];
    past_incidents?: Array<{ date?: string; type?: string; summary?: string }>;
  };
  current_training_records?: Array<{
    course: string;
    date?: string;
    expiry?: string;
    provider?: string;
    status?: string;
  }>;
  required_training_matrix?: Array<{
    role?: string;
    task?: string;
    required_courses: string[];
    frequency?: string;
  }>;
  project_scope: {
    tasks?: string[];
    equipment?: string[];
    critical_risks?: string[];
  };
  client_additional_training_requirements?: string[];
};

export type TrainingCompetencyEngineOutput = {
  gaps: Array<{
    course: string;
    linked_task?: string;
    linked_risk?: string;
    status: string;
    priority_score: number;
    priority_tier: string;
    drivers: string[];
    remediation: string;
  }>;
  prioritized_training_plan: {
    immediate_required_training: Array<{
      course: string;
      reason: string;
      due_window: string;
      priority: string;
    }>;
    short_term_training: Array<{
      course: string;
      reason: string;
      due_window: string;
      priority: string;
    }>;
    development_training: Array<{
      course: string;
      reason: string;
      due_window: string;
      priority: string;
    }>;
  };
  field_summary: string;
};

export async function generateTrainingCompetencyEngine(body: TrainingCompetencyEngineInput) {
  return apiFetchJson<TrainingCompetencyEngineOutput>(`${BASE}/engine/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function generateTrainingCompetencyForWorker(
  workerId: number,
  body?: { projectId?: number; project_scope?: TrainingCompetencyEngineInput["project_scope"] },
) {
  return apiFetchJson<TrainingCompetencyEngineOutput>(`${BASE}/worker/${workerId}/engine/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

export async function syncPmTrainingOffline(payload: {
  clientSyncId: string;
  workerId: number;
  courseId: number | string;
  courseName?: string;
  completed?: boolean;
  verified?: boolean;
  certificateUrl?: string;
  certificateNumber?: string;
  completionDate?: string;
  expiryDate?: string;
}) {
  return apiFetchJson<WorkerTrainingRecord>(`${BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
