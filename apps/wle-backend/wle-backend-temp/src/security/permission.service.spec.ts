import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionService } from './permission.service';
import { TenantScopeService } from './tenant-scope.service';
import { Permission } from './security.types';

describe('PermissionService', () => {
  let service: PermissionService;

  const prisma = {
    worker: { findUnique: jest.fn() },
    pmInspection: { findFirst: jest.fn() },
  };

  const supervisor: SecurityActorFixture = {
    id: 1,
    role: UserRole.SUPERVISOR,
    companyId: 10,
  };

  const workerActor: SecurityActorFixture = {
    id: 2,
    role: UserRole.WORKER,
    companyId: 10,
  };

  const otherCompanySupervisor: SecurityActorFixture = {
    id: 3,
    role: UserRole.SUPERVISOR,
    companyId: 99,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        TenantScopeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(PermissionService);
  });

  it('grants supervisor company readiness permission', () => {
    expect(
      service.hasPermission(supervisor, Permission.COMPANY_READINESS_VIEW),
    ).toBe(true);
    expect(
      service.hasPermission(workerActor, Permission.COMPANY_READINESS_VIEW),
    ).toBe(false);
  });

  it('restricts template management to supervisor roles', () => {
    expect(service.hasPermission(supervisor, Permission.TEMPLATE_MANAGE)).toBe(
      true,
    );
    expect(service.hasPermission(workerActor, Permission.TEMPLATE_MANAGE)).toBe(
      false,
    );
  });

  it('allows supervisor to view worker in same tenant', async () => {
    prisma.worker.findUnique.mockResolvedValue({ companyId: 10 });
    await expect(
      service.assertCanViewWorker(supervisor, 5),
    ).resolves.toBeUndefined();
  });

  it('denies cross-tenant worker view', async () => {
    prisma.worker.findUnique.mockResolvedValue({ companyId: 10 });
    await expect(
      service.assertCanViewWorker(otherCompanySupervisor, 5),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows inspection view within tenant', async () => {
    prisma.pmInspection.findFirst.mockResolvedValue({ companyId: 10 });
    await expect(
      service.assertCanViewInspection(supervisor, 'insp-1'),
    ).resolves.toBeUndefined();
  });

  it('denies cross-tenant inspection edit', async () => {
    prisma.pmInspection.findFirst.mockResolvedValue({ companyId: 10 });
    await expect(
      service.assertCanEditInspection(otherCompanySupervisor, 'insp-1'),
    ).rejects.toThrow(ForbiddenException);
  });
});

type SecurityActorFixture = {
  id: number;
  role: UserRole;
  companyId: number;
};
