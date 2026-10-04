import { BadRequestException } from '@nestjs/common';
import { FallClearanceService, sumUserLines } from './fall-clearance.service';
import { StandardsLibraryService } from './standards-library.service';
import type { FallArrestEquipment } from './equipment-catalog.service';

const EQUIPMENT_ID = 'a1000000-0000-4000-8000-000000000001';

const seedSystem = {
  id: EQUIPMENT_ID,
  type: 'system',
  manufacturer: 'Generic',
  model: '6 ft shock-absorbing lanyard system',
  standardRefs: ['CSA Z259.16-15'],
  clearanceParams: {
    maxFreeFallM: 1.8,
    decelerationDistanceM: 1.07,
    harnessStretchM: 0.3,
    lifelinePayoutM: 0,
    anchorDeflectionM: 0.15,
    safetyMarginM: 0.9,
  },
  rawManualData: null,
  status: 'APPROVED',
  createdAt: new Date(),
  updatedAt: new Date(),
} as FallArrestEquipment;

describe('FallClearanceService (worksheet model)', () => {
  const standards = new StandardsLibraryService();

  function serviceWith() {
    const catalog = {
      get: jest.fn(async (id: string) => {
        if (id !== EQUIPMENT_ID) throw new Error('not found');
        return seedSystem;
      }),
    };
    let seq = 0;
    const prisma = {
      fallClearanceWorksheet: {
        create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
          seq += 1;
          return {
            id: `w1000000-0000-4000-8000-${String(seq).padStart(12, '0')}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          };
        }),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(async () => []),
      },
      fallClearanceAuditLog: {
        create: jest.fn(async () => ({ id: 'audit-1' })),
      },
    };
    return {
      service: new FallClearanceService(catalog as any, standards, prisma as any),
      prisma,
      catalog,
    };
  }

  it('rejects save without acknowledgment', async () => {
    const { service } = serviceWith();
    await expect(
      service.saveWorksheet({
        acknowledged: false,
        acknowledgedBy: 'Tester',
        referenceParams: seedSystem.clearanceParams,
        userParams: seedSystem.clearanceParams,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects save without acknowledgedBy', async () => {
    const { service } = serviceWith();
    await expect(
      service.saveWorksheet({
        acknowledged: true,
        referenceParams: seedSystem.clearanceParams,
        userParams: seedSystem.clearanceParams,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('saves user-owned worksheet without PASS/FAIL verdict', async () => {
    const { service, prisma } = serviceWith();
    const result = await service.saveWorksheet({
      acknowledged: true,
      acknowledgedBy: 'Competent Person',
      companyId: 1,
      projectId: 1,
      industry: 'construction',
      equipmentId: EQUIPMENT_ID,
      referenceParams: seedSystem.clearanceParams,
      userParams: {
        maxFreeFallM: 1.8,
        decelerationDistanceM: 1.07,
        harnessStretchM: 0.3,
        lifelinePayoutM: 0,
        anchorDeflectionM: 0.15,
        safetyMarginM: 0.9,
      },
      userRequiredM: 4.5,
      userAvailableM: 6.0,
      userNotes: 'Verified against manufacturer IFU',
    });

    expect(result.status).toBe('SAVED');
    expect(result.userLineSubtotalM).toBe(4.22);
    expect(result.userRequiredM).toBe(4.5);
    expect(result.userAvailableM).toBe(6.0);
    expect(result.disclaimer).toMatch(/Not a design calculation/i);
    expect((result as { status?: string }).status).not.toMatch(
      /PASS|WARNING|FAIL/,
    );
    expect(prisma.fallClearanceWorksheet.create).toHaveBeenCalled();
    expect(prisma.fallClearanceAuditLog.create).toHaveBeenCalled();
  });

  it('sumUserLines is arithmetic only (no safety verdict)', () => {
    expect(sumUserLines(seedSystem.clearanceParams)).toBe(4.22);
  });
});
