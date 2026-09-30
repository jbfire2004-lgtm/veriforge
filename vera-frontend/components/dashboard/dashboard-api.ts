import { apiGetSafe, type ApiGetResult } from "@/lib/api";

export type DashboardOverview = {
  workers: number;
  equipment: number;
  companies: number;
  incidents: number;
  documents: number;
  safetyStations: number;
  trainingRecords: number;
  credentials: number;
};

export type TrainingExpirySummary = {
  expired: number;
  expiringSoon: number;
};

export type RecentWorkerRef = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  companyId: number | null;
};

export type RecentCertificationRef = {
  id: number;
  name: string | null;
};

export type RecentTrainingRecord = {
  id: number;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateNumber: string | null;
  worker: RecentWorkerRef | null;
  certification: RecentCertificationRef | null;
};

export type RecentCredential = {
  id: number;
  name: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  worker: RecentWorkerRef | null;
  certification: RecentCertificationRef | null;
};

export type RecentDocument = {
  id: number;
  name: string | null;
  type: string | null;
  url: string | null;
  createdAt: string | null;
  workerId: number | null;
  companyId: number | null;
  equipmentId: number | null;
};

export type RecentUploads = {
  trainingRecords: RecentTrainingRecord[];
  credentials: RecentCredential[];
  documents: RecentDocument[];
};

export async function loadDashboardOverview(): Promise<ApiGetResult<DashboardOverview>> {
  const analytics = await apiGetSafe<DashboardOverview>("/analytics/overview");
  if (analytics.ok) return analytics;

  const platform = await apiGetSafe<{
    modules: {
      reporting: {
        workers?: { summary?: { totalWorkers?: number } };
        equipment?: { summary?: { total?: number } };
      };
    };
  }>("/api/v1/core/platform/summary");

  if (!platform.ok) return analytics;

  const r = platform.data.modules?.reporting as {
    workers?: { summary?: { totalWorkers?: number } };
    equipment?: { summary?: { total?: number } };
  } | undefined;

  return {
    ok: true,
    data: {
      workers: r?.workers?.summary?.totalWorkers ?? 0,
      equipment: r?.equipment?.summary?.total ?? 0,
      companies: 0,
      incidents: 0,
      documents: 0,
      safetyStations: 0,
      trainingRecords: 0,
      credentials: 0,
    },
  };
}

export async function loadTrainingExpirySummary(): Promise<ApiGetResult<TrainingExpirySummary>> {
  return apiGetSafe<TrainingExpirySummary>("/analytics/training/expiry");
}

export async function loadRecentUploads(
  limit = 5
): Promise<ApiGetResult<RecentUploads>> {
  return apiGetSafe<RecentUploads>(`/analytics/recent?limit=${limit}`);
}
