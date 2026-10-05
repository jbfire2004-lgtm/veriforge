import { BadRequestException } from '@nestjs/common';

export function finitePositiveInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isInteger(v) && v > 0) return v;
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) {
    const n = parseInt(v.trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function trySegment(path: string, marker: string): number | null {
  const i = path.indexOf(marker);
  if (i < 0) return null;
  const rest = path.slice(i + marker.length).split(/[/?#]/)[0];
  return finitePositiveInt(rest);
}

export function parseWorkerPathId(qr: string): number | null {
  const trimmed = qr.trim();

  const fromPath = (path: string): number | null => {
    if (path.includes('/verify/equipment')) return null;
    if (path.includes('/verify/t/') || path.includes('/verify/token/'))
      return null;
    return (
      trySegment(path, '/worker/') ??
      trySegment(path, '/public/worker/') ??
      trySegment(path, '/verify/') ??
      trySegment(path, '/wallet/') ??
      trySegment(path, '/scan/worker/')
    );
  };

  try {
    if (trimmed.includes('://')) {
      const url = new URL(trimmed);
      return fromPath(url.pathname);
    }
  } catch {
    return null;
  }

  return fromPath(trimmed);
}

/** Accepts `{ "type":"worker","token":"w-…" }` or legacy `{ "type":"worker","id":1 }`. */
export function parseTypedJsonQr(qr: string): {
  kind: 'worker' | 'equipment';
  id: number;
  token?: string;
} | null {
  const t = qr.trim();
  if (!t.startsWith('{')) return null;
  let data: unknown;
  try {
    data = JSON.parse(t);
  } catch {
    throw new BadRequestException('Malformed JSON QR payload');
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !('type' in data) ||
    typeof (data as { type?: unknown }).type !== 'string'
  ) {
    throw new BadRequestException('Unsupported JSON QR payload shape');
  }

  const { type } = data as { type: string };
  if (type !== 'worker' && type !== 'equipment') {
    throw new BadRequestException('Unsupported JSON QR type');
  }

  const tokenRaw = (data as { token?: unknown }).token;
  const token =
    typeof tokenRaw === 'string' && tokenRaw.trim().length >= 20
      ? tokenRaw.trim()
      : undefined;

  const id = finitePositiveInt((data as { id?: unknown }).id);
  if (id === null && !token) {
    throw new BadRequestException(`Invalid "${type}" token or id in JSON QR`);
  }
  return { kind: type, id: id ?? 0, token };
}

/** Training provider certificate token from app or API URL. */
export function parseCertificateToken(qr: string): string | null {
  const t = qr.trim();
  const markers = [
    '/verify/certificate/',
    '/certificates/validate/',
    '/training-providers/certificates/validate/',
  ];
  for (const m of markers) {
    const i = t.indexOf(m);
    if (i >= 0) {
      const rest = t
        .slice(i + m.length)
        .split(/[/?#]/)[0]
        ?.trim();
      if (rest && /^cert_[a-f0-9]+$/i.test(rest)) return rest;
      if (rest && rest.length >= 8) return rest;
    }
  }
  if (/^cert_[a-f0-9]+$/i.test(t)) return t;
  return null;
}

export function parseEquipmentPathId(qr: string): number | null {
  const trimmed = qr.trim();

  try {
    if (trimmed.includes('://') || trimmed.startsWith('/')) {
      const href = trimmed.includes('://')
        ? trimmed
        : `https://vera.placeholder${
            trimmed.startsWith('/') ? '' : '/'
          }${trimmed}`;
      const url = new URL(href);
      if (url.pathname.includes('/verify/equipment')) {
        return finitePositiveInt(url.searchParams.get('id'));
      }
      return (
        trySegment(url.pathname, '/scan/equipment/') ??
        trySegment(url.pathname, '/equipment/') // /equipment/5/wallet
      );
    }
  } catch {
    return null;
  }

  return trySegment(trimmed, '/scan/equipment/');
}

export function parseCombinedUrlIds(qr: string): {
  workerId: number;
  equipmentId: number;
} | null {
  const t = qr.trim();
  try {
    const href = t.includes('://')
      ? t
      : `https://vera.placeholder${t.startsWith('/') ? '' : '/'}${t}`;
    const url = new URL(href);
    const w = finitePositiveInt(url.searchParams.get('worker'));
    const e = finitePositiveInt(url.searchParams.get('equipment'));
    if (w !== null && e !== null) return { workerId: w, equipmentId: e };
    return null;
  } catch {
    return null;
  }
}
