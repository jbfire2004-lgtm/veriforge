import { API_URL, apiFetchJson } from "./api-fetch";

const BASE = `${API_URL}/api/v1/worker-wallet`;

export type WorkerWalletDownloadInfo = {
  title: string;
  description: string;
  webWalletUrl: string;
  pwaUrl: string;
  iosUrl: string | null;
  androidUrl: string | null;
  qrFormat: string;
};

export async function fetchWorkerWalletDownload() {
  return apiFetchJson<WorkerWalletDownloadInfo>(`${BASE}/download`, {
    requireAuth: false,
  });
}

export async function fetchMyWorkerWallet() {
  return apiFetchJson<{
    workerId: number | null;
    download: WorkerWalletDownloadInfo;
    qr?: { content: string; walletUrl: string };
    profile?: unknown;
  }>(`${BASE}/me`);
}

export async function fetchWorkerQr(workerId: number) {
  return apiFetchJson<{
    type: string;
    workerId: number;
    content: string;
    walletUrl: string;
    worker: { id: number; name: string };
  }>(`${BASE}/qr/${workerId}`);
}

export async function syncWorkerProfile(workerId: number) {
  return apiFetchJson(`${BASE}/sync/${workerId}`, { method: "POST" });
}
