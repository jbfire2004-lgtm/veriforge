/** Canonical Vera wallet / verify URL builders (backend). */

import { resolvePublicBaseUrl } from '../config/public-base-url';

export function publicBaseUrl(): string {
  return resolvePublicBaseUrl();
}

/** Public worker verify URL — prefer unguessable qr token. */
export function workerVerifyUrlByToken(
  qrToken: string,
  base = publicBaseUrl(),
): string {
  return `${base}/verify/t/${encodeURIComponent(qrToken)}`;
}

/** @deprecated Legacy numeric URL — use {@link workerVerifyUrlByToken}. */
export function workerVerifyUrl(
  workerId: number,
  base = publicBaseUrl(),
): string {
  return `${base}/verify/${workerId}`;
}

/** Authenticated staff worker wallet path (relative). */
export function workerStaffWalletPath(workerId: number): string {
  return `/wallet/${workerId}`;
}

/** Public equipment verify URL — token-based. */
export function equipmentVerifyUrlByToken(
  qrToken: string,
  base = publicBaseUrl(),
): string {
  return `${base}/verify/t/${encodeURIComponent(qrToken)}`;
}

/** @deprecated Legacy numeric query URL. */
export function equipmentVerifyUrl(
  equipmentId: number,
  base = publicBaseUrl(),
): string {
  return `${base}/verify/equipment?id=${equipmentId}`;
}

/** Authenticated staff equipment wallet path (relative). */
export function equipmentStaffWalletPath(equipmentId: number): string {
  return `/equipment/${equipmentId}/wallet`;
}

/** JSON QR payload for worker kiosk print. */
export function workerQrJsonPayload(qrToken: string, workerId: number) {
  return { type: 'worker', token: qrToken, id: workerId };
}

export function equipmentQrJsonPayload(qrToken: string, equipmentId: number) {
  return { type: 'equipment', token: qrToken, id: equipmentId };
}

/** Legacy scan alias — prefer token URLs for new prints. */
export function workerScanAliasUrl(
  workerId: number,
  base = publicBaseUrl(),
): string {
  return `${base}/scan/worker/${workerId}`;
}

export function equipmentScanAliasUrl(
  equipmentId: number,
  base = publicBaseUrl(),
): string {
  return `${base}/scan/equipment/${equipmentId}`;
}
