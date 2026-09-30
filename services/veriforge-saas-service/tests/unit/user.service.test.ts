import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prismaMock } from '../helpers/register-prisma-mock';
import { userFixture } from '../helpers/factories';
import { ForbiddenError, ConflictError } from '../../src/utils/errors';

vi.mock('../../src/services/rbac.service', () => ({
  rbacService: {
    loadUserAccess: vi.fn().mockResolvedValue({
      role: 'owner',
      permissions: ['org.users.manage'],
      orgId: 'org-a',
    }),
    assignRole: vi.fn(),
  },
}));

vi.mock('../../src/services/audit.service', () => ({
  auditService: { log: vi.fn() },
}));

vi.mock('../../src/security/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('$argon2id$hashed'),
}));

vi.mock('../../src/security/field-encryption', () => ({
  encryptField: vi.fn((v: string) => `v1:enc:${v}`),
  resolveDisplayName: vi.fn((u: { fullName: string }) => u.fullName),
  decryptField: vi.fn((v: string) => v),
  isEncrypted: vi.fn((v: string) => typeof v === 'string' && v.startsWith('v1:')),
}));

import { UserService } from '../../src/services/user.service';
import { rbacService } from '../../src/services/rbac.service';

describe('UserService', () => {
  const service = new UserService();

  beforeEach(() => {
    vi.clearAllMocks();
    (rbacService.loadUserAccess as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: 'owner',
      permissions: ['org.users.manage'],
      orgId: 'org-a',
    });
  });

  it('findByOrgAndEmail scopes by orgId', async () => {
    const user = userFixture('org-a');
    prismaMock.user.findFirst.mockResolvedValue(user);
    await service.findByOrgAndEmail('org-a', 'Owner@Acme.test');
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { orgId: 'org-a', email: 'owner@acme.test' },
    });
  });

  it('invite blocks privilege escalation (manager cannot assign admin)', async () => {
    (rbacService.loadUserAccess as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: 'manager',
      permissions: [],
      orgId: 'org-a',
    });
    prismaMock.user.findUnique.mockResolvedValue(userFixture('org-a', { id: 'mgr-1' }));

    await expect(
      service.invite({
        orgId: 'org-a',
        email: 'new@acme.test',
        fullName: 'New User',
        role: 'admin',
        invitedByUserId: 'mgr-1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('invite creates user and assigns role', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userFixture('org-a', { id: 'owner-1' }));
    prismaMock.user.findFirst.mockResolvedValue(null);
    const created = userFixture('org-a', { id: 'new-1', email: 'new@acme.test', status: 'invited' });
    prismaMock.user.create.mockResolvedValue(created);
    // toSafeUser after create
    prismaMock.user.findUnique
      .mockResolvedValueOnce(userFixture('org-a', { id: 'owner-1' }))
      .mockResolvedValueOnce(created);

    const result = await service.invite({
      orgId: 'org-a',
      email: 'new@acme.test',
      fullName: 'New User',
      role: 'user',
      invitedByUserId: 'owner-1',
    });

    expect(result.inviteToken).toBeTruthy();
    expect(rbacService.assignRole).toHaveBeenCalledWith(
      expect.objectContaining({ roleCode: 'user', userId: 'new-1' }),
    );
  });

  it('invite rejects duplicate email in same org', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userFixture('org-a', { id: 'owner-1' }));
    prismaMock.user.findFirst.mockResolvedValue(userFixture('org-a'));

    await expect(
      service.invite({
        orgId: 'org-a',
        email: 'owner@acme.test',
        fullName: 'Dup',
        role: 'user',
        invitedByUserId: 'owner-1',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('listByOrg only queries that org', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.count.mockResolvedValue(0);
    await service.listByOrg('org-a');
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orgId: 'org-a' } }),
    );
  });
});
