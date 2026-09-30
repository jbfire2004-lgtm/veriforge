import { describe, expect, it } from 'vitest';
import {
  assertCanAssignRole,
  assertRowOrg,
  tenantWhere,
} from '../../src/security/tenant.ts';
import { ForbiddenError } from '../../src/utils/errors.ts';
import {
  assertPasswordPolicy,
  hashPassword,
  verifyPassword,
} from '../../src/security/password.ts';
import { encryptField, decryptField } from '../../src/security/field-encryption.ts';
import { jwtService } from '../../src/security/jwt.ts';

describe('tenant isolation helpers', () => {
  it('tenantWhere always injects orgId', () => {
    const where = tenantWhere('org-a', { status: 'active' });
    expect(where).toEqual({ status: 'active', orgId: 'org-a' });
  });

  it('assertRowOrg blocks cross-tenant rows', () => {
    expect(() => assertRowOrg({ orgId: 'org-b', id: '1' }, 'org-a')).toThrow(ForbiddenError);
  });

  it('assertRowOrg allows same-tenant rows', () => {
    const row = assertRowOrg({ orgId: 'org-a', id: '1' }, 'org-a');
    expect(row.id).toBe('1');
  });

  it('prevents privilege escalation on role assign', () => {
    expect(() => assertCanAssignRole('admin', 'owner')).toThrow(ForbiddenError);
    expect(() => assertCanAssignRole('manager', 'admin')).toThrow(ForbiddenError);
    expect(() => assertCanAssignRole('owner', 'admin')).not.toThrow();
  });
});

describe('password argon2id', () => {
  it('rejects weak passwords', () => {
    expect(() => assertPasswordPolicy('short')).toThrow();
    expect(() => assertPasswordPolicy('alllowercase1!')).toThrow();
  });

  it('hashes and verifies with argon2id', async () => {
    const pw = 'Str0ng!Passw0rd';
    const hash = await hashPassword(pw);
    expect(hash.startsWith('$argon2')).toBe(true);
    expect(await verifyPassword(pw, hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('field encryption', () => {
  it('round-trips PII with AES-GCM', () => {
    const sample = 'Ada Lovelace';
    const enc = encryptField(sample);
    expect(enc.startsWith('v1:')).toBe(true);
    expect(decryptField(enc)).toBe(sample);
  });
});

describe('JWT key rotation', () => {
  it('signs and verifies access tokens with kid rotation config', () => {
    const token = jwtService.signAccess({
      sub: 'u1',
      user_id: 'u1',
      org_id: 'o1',
      email: 'a@b.co',
      role: 'owner',
      permissions: ['org.settings.view'],
    });
    const result = jwtService.verifyAccess(token);
    expect(result.valid).toBe(true);
    expect(result.payload?.org_id).toBe('o1');
  });
});

describe('tenant query contract examples', () => {
  it('documents required pattern for org-scoped finds', () => {
    const orgId = '11111111-1111-1111-1111-111111111111';
    const maliciousOrg = '22222222-2222-2222-2222-222222222222';
    const safe = tenantWhere(orgId, { id: 'sub-1' });
    expect(safe.orgId).toBe(orgId);
    expect(safe.orgId).not.toBe(maliciousOrg);
  });
});
