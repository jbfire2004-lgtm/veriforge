import { NotFoundException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';

import { AuditLogService } from '../../audit/audit-log.service';

import { FitTestService } from './fit-test.service';

describe('FitTestService', () => {
  let service: FitTestService;

  const prisma = {
    fitTestRun: {
      findMany: jest.fn(),

      findFirst: jest.fn(),

      create: jest.fn(),
    },

    worker: { findUnique: jest.fn() },

    companyLink: { findMany: jest.fn() },
  };

  const auditLog = { logAudit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FitTestService,

        { provide: PrismaService, useValue: prisma },

        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(FitTestService);
  });

  it('evaluate returns one-year expiry for PASS', () => {
    const out = service.evaluate({
      result: 'PASS',

      performedAt: '2026-06-01T00:00:00.000Z',
    });

    expect(out.evaluation.pass).toBe(true);

    expect(out.validityYears).toBe(1);

    expect(out.evaluation.expiresAt).toContain('2027');
  });

  it('runs a fit test with computed expiry and audit log', async () => {
    prisma.worker.findUnique.mockResolvedValue({
      id: 1,

      companyId: 10,

      firstName: 'Jane',

      lastName: 'Doe',
    });

    prisma.fitTestRun.create.mockResolvedValue({
      id: 5,

      workerId: 1,

      tenantId: 10,

      testType: 'N95',

      testMethod: 'Qualitative',

      result: 'PASS',

      performedAt: new Date('2026-06-01T00:00:00.000Z'),

      expiresAt: new Date('2027-06-01T00:00:00.000Z'),

      notes: null,

      evidenceFilesJson: null,

      createdById: 99,
    });

    const out = await service.run(1, {
      result: 'PASS',

      testType: 'N95',

      testMethod: 'Qualitative',

      performedAt: new Date('2026-06-01T00:00:00.000Z'),

      createdById: 99,
    });

    expect(out.run.result).toBe('PASS');

    expect(out.evaluation.pass).toBe(true);

    expect(prisma.fitTestRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workerId: 1,

          tenantId: 10,

          testType: 'N95',

          result: 'PASS',
        }),
      }),
    );

    expect(auditLog.logAudit).toHaveBeenCalled();
  });

  it('lists worker fit test history newest first', async () => {
    prisma.fitTestRun.findMany.mockResolvedValue([
      {
        id: 2,

        workerId: 1,

        tenantId: 10,

        testType: 'N95',

        testMethod: 'Qualitative',

        result: 'PASS',

        performedAt: new Date('2026-06-02T00:00:00.000Z'),

        expiresAt: new Date('2027-06-02T00:00:00.000Z'),

        notes: null,

        evidenceFilesJson: null,

        createdById: null,
      },
    ]);

    const rows = await service.listHistory(1);

    expect(rows).toHaveLength(1);

    expect(rows[0].testType).toBe('N95');

    expect(prisma.fitTestRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { workerId: 1 },

        orderBy: { performedAt: 'desc' },
      }),
    );
  });

  it('exportPdf throws when no fit test exists', async () => {
    prisma.fitTestRun.findFirst.mockResolvedValue(null);

    await expect(service.exportPdf(1)).rejects.toThrow(NotFoundException);
  });

  it('summarizes company fit test compliance', async () => {
    prisma.companyLink.findMany.mockResolvedValue([
      { workerId: 1 },

      { workerId: 2 },
    ]);

    prisma.fitTestRun.findMany.mockResolvedValue([
      {
        workerId: 1,

        result: 'PASS',

        performedAt: new Date(),

        expiresAt: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
      },
    ]);

    const summary = await service.companySummary(10);

    expect(summary.totalWorkers).toBe(2);

    expect(summary.current).toBe(1);

    expect(summary.missing).toBe(1);

    expect(summary.complianceRate).toBe(50);
  });
});
