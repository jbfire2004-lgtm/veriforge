/** Unguessable public QR / verify reference (worker `w-…`, equipment `e-…`). */
export const PUBLIC_QR_TOKEN_RE = /^[we]-[a-f0-9-]{20,}$/i;

export function isPublicQrToken(ref: string): boolean {
  return PUBLIC_QR_TOKEN_RE.test(ref.trim());
}

export function workerTokenPrefix(): 'w' {
  return 'w';
}

export function equipmentTokenPrefix(): 'e' {
  return 'e';
}
