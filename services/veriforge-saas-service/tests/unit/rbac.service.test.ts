import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prismaMock } from '../helpers/register-prisma-mock';
import { RBACService } from '../../src/services/rbac.service';
import { ForbiddenError } from '../../src/utils/errors';

describe('RBACService', () => {
  const service = new RBACService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can() returns true when permission present', () => {
    const user = {
      permissions: ['org.settings.view', 'vericore.audit.view'],
      email: 'u@test.com',
      orgId: 'org-a',
    };
    expect(service.can(user, 'org.settings.view')).toBe(true);
    expect(service.can(user, 'veripm.projects.view')).toBe(false);
  });

  it('canAny / canAll work as expected', () => {
    const user = { permissions: ['a', 'b'], email: 'u@test.com' };
    expect(service.canAny(user, ['x', 'a'])).toBe(true);
    expect(service.canAll(user, ['a', 'b'])).toBe(true);
    expect(service.canAll(user, ['a', 'c'])).toBe(false);
  });

  it('assertSameOrg blocks cross-tenant', () => {
    const user = { permissions: [], email: 'u@test.com', orgId: 'org-a' };
    expect(() => service.assertSameOrg(user, 'org-b')).toThrow(ForbiddenError);
    expect(() => service.assertSameOrg(user, 'org-a')).not.toThrow();
  });

  it('filterByEnabledModules keeps org.* and enabled module keys', async () => {
    prismaMock.organizationModule.findMany.mockResolvedValue([
      {
        module: {
          modulePermissions: [
            { permission: { key: 'vericore.audit.view' } },
            { permission: { key: 'vericore.workers.view' } },
          ],
        },
      },
    ]);

    const filtered = await service.filterByEnabledModules('org-a', [
      'org.settings.view',
      'vericore.audit.view',
      'veripm.projects.view',
    ]);

    expect(filtered).toContain('org.settings.view');
    expect(filtered).toContain('vericore.audit.view');
    expect(filtered).not.toContain('veripm.projects.view');
  });

  it('assignRole revokes previous and creates new assignment', async () => {
    prismaMock.role.findUnique.mockResolvedValue({ id: 'role-admin', code: 'admin' });
    prismaMock.userRole.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.userRole.create.mockResolvedValue({});

    await service.assignRole({
      orgId: 'org-a',
      userId: 'user-1',
      roleCode: 'admin',
      assignedBy: 'owner-1',
    });

    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});
