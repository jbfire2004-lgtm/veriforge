import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PmInspectionAutomationConfigService } from './pm-inspection-automation-config.service';
import { PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG } from './pm-inspections.constants';

describe('PmInspectionAutomationConfigService', () => {
  let service: PmInspectionAutomationConfigService;

  const prisma = {
    acpFeatureFlag: { findUnique: jest.fn() },
    acpTenant: { findFirst: jest.fn() },
  };

  const flag = {
    id: 'flag-1',
    key: PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG,
    defaultEnabled: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.acpFeatureFlag.findUnique.mockResolvedValue(flag);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionAutomationConfigService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PmInspectionAutomationConfigService);
  });

  it('defaults to enabled when tenant has no override', async () => {
    prisma.acpTenant.findFirst.mockResolvedValue({
      id: 'tenant-1',
      tenantFeatureFlags: [],
    });
    await expect(service.isAutoFailureMeetingEnabled(1)).resolves.toBe(true);
  });

  it('respects tenant override when feature is disabled', async () => {
    prisma.acpTenant.findFirst.mockResolvedValue({
      id: 'tenant-1',
      tenantFeatureFlags: [{ enabled: false }],
    });
    await expect(service.isAutoFailureMeetingEnabled(1)).resolves.toBe(false);
  });

  it('respects tenant override when feature is enabled', async () => {
    prisma.acpFeatureFlag.findUnique.mockResolvedValue({
      ...flag,
      defaultEnabled: false,
    });
    prisma.acpTenant.findFirst.mockResolvedValue({
      id: 'tenant-1',
      tenantFeatureFlags: [{ enabled: true }],
    });
    await expect(service.isAutoFailureMeetingEnabled(1)).resolves.toBe(true);
  });

  it('uses platform default when company has no ACP tenant', async () => {
    prisma.acpFeatureFlag.findUnique.mockResolvedValue({
      ...flag,
      defaultEnabled: false,
    });
    prisma.acpTenant.findFirst.mockResolvedValue(null);
    await expect(service.isAutoFailureMeetingEnabled(99)).resolves.toBe(false);
  });
});
