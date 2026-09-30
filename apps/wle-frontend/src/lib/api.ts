import axios from "axios";
import { ExpiryRules, PresenceLog, PresenceScanResult, SupervisorRequest, Worker } from "../types";

const api = axios.create({
  baseURL: "/api",
});

export const workerApi = {
  getWorkers: (params?: { lifecycleState?: string; companyId?: string }) =>
    api.get<Worker[]>("/workers", { params }),
  getWorkerById: (id: string) => api.get<Worker>(`/workers/${id}`),
  createWorker: (payload: {
    firstName: string;
    lastName: string;
    companyId: string;
    orientationStatus?: string;
    orientationDate?: string | null;
    lifecycleState?: string;
  }) => api.post<Worker>("/workers", payload),
  updateWorker: (id: string, payload: Partial<Worker>) =>
    api.put<Worker>(`/workers/${id}`, payload),
  deleteWorker: (id: string) => api.delete(`/workers/${id}`),
  registerHeartbeat: (workerId: string) => api.post<Worker>(`/workers/${workerId}/heartbeat`),
};

export const rulesApi = {
  getRules: () => api.get<ExpiryRules>("/rules"),
  updateRules: (payload: Partial<ExpiryRules>) =>
    api.post<{ success: boolean; rules: ExpiryRules }>("/rules", payload),
};

export const heartbeatApi = {
  getByWorker: (workerId: string) =>
    api.get<{ id: string; lastHeartbeat: string | null; heartbeats: Array<{ id: string; createdAt: string }> }>(
      `/heartbeat/${workerId}`,
    ),
  registerByBody: (workerId: string) => api.post("/heartbeat", { workerId }),
};

export const presenceApi = {
  scanPresence: (workerId: string, code: string) =>
    api.post<PresenceScanResult>("/presence/scan", { workerId, code }),
  getWorkerPresence: (workerId: string) => api.get<PresenceLog[]>(`/presence/worker/${workerId}`),
  getPresenceAtPoint: (presencePointId: string) =>
    api.get<
      Array<{
        id: string;
        workerId: string;
        presencePointId: string;
        scannedAt: string;
        worker: Worker;
      }>
    >(`/presence/point/${presencePointId}`),
};

export const supervisorApi = {
  getSupervisorRequests: (supervisorId: string) =>
    api.get<SupervisorRequest[]>("/supervisor/requests", { params: { supervisorId } }),
  respondToRequest: (id: string, status: "confirmed_on_site" | "not_on_site") =>
    api.post<{ success: boolean; request: SupervisorRequest }>(`/supervisor/requests/${id}/respond`, { status }),
};

export const importExportApi = {
  importWorkers: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ success: boolean; importedCount: number; receivedRows: number }>(
      "/workers/import",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
  exportWorkers: () =>
    api.get<Blob>("/workers/export", {
      responseType: "blob",
    }),
};

export const orientationApi = {
  completeOrientation: (workerId: string, date: string) =>
    api.post<{ success: boolean; worker: Worker }>("/orientation/complete", {
      workerId,
      date,
    }),
  expireOrientation: (workerId: string) =>
    api.post<{ success: boolean; worker: Worker }>(`/orientation/expire/${workerId}`),
};
