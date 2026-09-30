import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopeService } from './tenant-scope.service';

describe('TenantScopeService', () => {
  let service: TenantScopeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantScopeService, { provide: PrismaService, useValue: {} }],
    }).compile();
    service = module.get(TenantScopeService);
  });

  it('allows super admin cross-tenant access', () => {
    expect(() =>
      service.assertCompanyAccess(
        { id: 1, role: UserRole.SUPER_ADMIN, companyId: 1 },
        999,
      ),
    ).not.toThrow();
  });

  it('blocks supervisor from another company', () => {
    expect(() =>
      service.assertCompanyAccess(
        { id: 2, role: UserRole.SUPERVISOR, companyId: 10 },
        20,
      ),
    ).toThrow(ForbiddenException);
  });

  it('resolves companyId from actor when not provided', () => {
    expect(
      service.resolveCompanyId(
        { id: 1, role: UserRole.WORKER, companyId: 10 },
        undefined,
      ),
    ).toBe(10);
  });

  it('effectiveCompanyId ignores mismatched query for non-admins', () => {
    expect(
      service.effectiveCompanyId(
        { id: 2, role: UserRole.SUPERVISOR, companyId: 10 },
        1,
      ),
    ).toBe(10);
  });

  it('effectiveCompanyId allows platform admins to target explicit company', () => {
    expect(
      service.effectiveCompanyId(
        { id: 1, role: UserRole.SUPER_ADMIN, companyId: 1 },
        42,
      ),
    ).toBe(42);
  });

  it('effectiveCompanyId keeps COMPANY_ADMIN on their own tenant', () => {
    expect(
      service.effectiveCompanyId(
        { id: 3, role: UserRole.COMPANY_ADMIN, companyId: 10 },
        999,
      ),
    ).toBe(10);
  });

  it('blocks COMPANY_ADMIN from another company', () => {
    expect(() =>
      service.assertCompanyAccess(
        { id: 3, role: UserRole.COMPANY_ADMIN, companyId: 10 },
        20,
      ),
    ).toThrow(ForbiddenException);
  });
});
