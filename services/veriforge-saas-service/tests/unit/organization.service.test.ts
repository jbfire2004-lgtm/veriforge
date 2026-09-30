import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prismaMock } from '../helpers/register-prisma-mock';
import { orgFixture } from '../helpers/factories';
import { OrganizationService } from '../../src/services/organization.service';
import { BadRequestError, NotFoundError } from '../../src/utils/errors';

describe('OrganizationService', () => {
  const service = new OrganizationService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getById returns mapped org', async () => {
    const org = orgFixture({ id: 'org-1', name: 'Acme' });
    prismaMock.organization.findUnique.mockResolvedValue(org);
    const result = await service.getById('org-1');
    expect(result.id).toBe('org-1');
    expect(result.name).toBe('Acme');
  });

  it('getById throws when missing', async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('update rejects short names', async () => {
    await expect(service.update('org-1', { name: 'A' })).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('update persists allowed fields', async () => {
    const org = orgFixture({ id: 'org-1', name: 'Acme Updated' });
    prismaMock.organization.update.mockResolvedValue(org);
    const result = await service.update('org-1', {
      name: 'Acme Updated',
      billingEmail: 'billing@acme.test',
    });
    expect(result.name).toBe('Acme Updated');
    expect(prismaMock.organization.update).toHaveBeenCalled();
  });

  it('uniqueSlug generates slugified unique value', async () => {
    prismaMock.organization.findUnique
      .mockResolvedValueOnce({ id: 'taken' })
      .mockResolvedValueOnce(null);
    const slug = await service.uniqueSlug('Acme Safety Co');
    expect(slug).toMatch(/acme/);
    expect(slug).toMatch(/-1$/);
  });
});
