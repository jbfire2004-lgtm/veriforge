import crypto from 'crypto';
import { env } from '../config/env';

const SEP = '.';

function signPayload(encoded: string): string {
  return crypto.createHmac('sha256', env.jwtAccessSecret).update(encoded).digest('base64url');
}

export function createSecureDownloadToken(input: {
  attachmentId: string;
  companyId: string;
  kind: 'file' | 'thumbnail';
  ttlSec: number;
}): { token: string; expiresAt: string } {
  const exp = Math.floor(Date.now() / 1000) + input.ttlSec;
  const payload = JSON.stringify({
    id: input.attachmentId,
    c: input.companyId,
    k: input.kind,
    exp,
  });
  const encoded = Buffer.from(payload).toString('base64url');
  const token = `${encoded}${SEP}${signPayload(encoded)}`;
  return { token, expiresAt: new Date(exp * 1000).toISOString() };
}

export function verifySecureDownloadToken(token: string): {
  attachmentId: string;
  companyId: string;
  kind: 'file' | 'thumbnail';
} {
  const [encoded, signature] = token.split(SEP);
  if (!encoded || !signature || signPayload(encoded) !== signature) {
    throw new Error('Invalid download token');
  }
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
    id: string;
    c: string;
    k: 'file' | 'thumbnail';
    exp: number;
  };
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Download token expired');
  }
  return {
    attachmentId: payload.id,
    companyId: payload.c,
    kind: payload.k,
  };
}
