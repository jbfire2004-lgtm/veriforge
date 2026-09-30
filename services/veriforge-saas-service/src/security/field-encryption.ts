/**
 * Application-level AES-256-GCM field encryption for PII.
 * KEY = SHA-256(FIELD_ENCRYPTION_KEY).
 * Format: v1:<iv_b64>:<tag_b64>:<ciphertext_b64>
 *
 * Production/staging: encryption is mandatory (fail closed).
 * Local development without key: only when FIELD_ENCRYPTION_OPTIONAL=true.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { env } from '../config/env';

function keyBytes(): Buffer {
  if (!env.fieldEncryptionKey) {
    if (env.isProduction) {
      throw new Error('FIELD_ENCRYPTION_KEY required in production');
    }
    if (process.env.FIELD_ENCRYPTION_OPTIONAL === 'true') {
      // ephemeral dev key — not durable across restarts (tests must set real key)
      return createHash('sha256').update('veriforge-dev-ephemeral-field-key').digest();
    }
    throw new Error(
      'FIELD_ENCRYPTION_KEY required (set FIELD_ENCRYPTION_OPTIONAL=true only for disposable local envelopes)',
    );
  }
  return createHash('sha256').update(env.fieldEncryptionKey).digest();
}

export function encryptField(plaintext: string): string {
  const key = keyBytes();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${enc.toString('base64url')}`;
}

export function decryptField(value: string): string {
  if (!value.startsWith('v1:')) return value;
  const key = keyBytes();
  const [, ivB64, tagB64, dataB64] = value.split(':');
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid ciphertext');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

/** Preferred display name: encrypted field when present. */
export function resolveDisplayName(user: {
  fullName: string;
  fullNameEnc?: string | null;
}): string {
  if (user.fullNameEnc && isEncrypted(user.fullNameEnc)) {
    try {
      return decryptField(user.fullNameEnc);
    } catch {
      /* fall through */
    }
  }
  return user.fullName;
}

export function isEncrypted(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith('v1:'));
}
