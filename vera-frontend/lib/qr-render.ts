import QRCode from "qrcode";
import { API_URL } from "./api";
import { errorFromApiResponse } from "./core";

export type WorkerQrPayload = {
  type: string;
  workerId: number;
  content: string;
};

export type EquipmentQrPayload = {
  type: string;
  equipmentId: number;
  content: string;
  json: { type: string; id: number };
};

const qrOpts = {
  width: 400,
  margin: 2,
  color: { dark: "#000000", light: "#FFFFFF" },
} as const;

export async function fetchWorkerQrPayload(
  workerId: string | number
): Promise<WorkerQrPayload> {
  const res = await fetch(`${API_URL}/qr/worker/${workerId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw errorFromApiResponse(res.status, t);
  }
  return res.json() as Promise<WorkerQrPayload>;
}

export async function workerQrToPngDataUrl(
  workerId: string | number
): Promise<{ payload: WorkerQrPayload; pngDataUrl: string }> {
  const payload = await fetchWorkerQrPayload(workerId);
  const pngDataUrl = await QRCode.toDataURL(payload.content, qrOpts);
  return { payload, pngDataUrl };
}

export async function fetchEquipmentQrPayload(
  equipmentId: string | number
): Promise<EquipmentQrPayload> {
  const res = await fetch(`${API_URL}/qr/equipment/${equipmentId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw errorFromApiResponse(res.status, t);
  }
  return res.json() as Promise<EquipmentQrPayload>;
}

export async function equipmentQrToPngDataUrl(
  equipmentId: string | number
): Promise<{ payload: EquipmentQrPayload; pngDataUrl: string }> {
  const payload = await fetchEquipmentQrPayload(equipmentId);
  const pngDataUrl = await QRCode.toDataURL(payload.content, qrOpts);
  return { payload, pngDataUrl };
}
