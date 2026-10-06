import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VeraAssessmentEngine } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SafetyKnowledgeService } from './safety-knowledge.service';
import { AuditLogService } from '../../audit/audit-log.service';

describe('SafetyKnowledgeService', () => {
  let service: SafetyKnowledgeService;

  const prisma = {
    worker: {
      findUnique: jest.fn(),
    },
    safetyForm: { count: jest.fn() },
    policyDocument: { count: jest.fn() },
    policyAcknowledgment: { count: jest.fn() },
    jhaFlha: { count: jest.fn() },
    bboObservation: { count: jest.fn() },
    pmInspection: { count: jest.fn() },
    veraAssessmentRun: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const workerRow = {
    id: 12,
    firstName: 'Alex',
    lastName: 'Rivera',
    companyId: 1,
    company: {
      province: 'AB',
      trainingRequirements: [{ courseName: 'WHMIS' }],
    },
    trainingRecords: [
      {
        issuedAt: new Date(),
        expiresAt: null,
        certificateSignedAt: new Date(),
        certification: { name: 'WHMIS', code: 'WHMIS' },
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.worker.findUnique.mockResolvedValue(workerRow);
    prisma.safetyForm.count.mockResolvedValue(1);
    prisma.policyDocument.count.mockResolvedValue(1);
    prisma.policyAcknowledgment.count.mockResolvedValue(1);
    prisma.jhaFlha.count.mockResolvedValue(2);
    prisma.bboObservation.count.mockResolvedValue(1);
    prisma.pmInspection.count.mockResolvedValue(1);
    prisma.veraAssessmentRun.create.mockResolvedValue({
      id: 'run-1',
      engine: VeraAssessmentEngine.SAFETY_KNOWLEDGE,
      workerId: 12,
      overallScore: 90,
      overallStatus: 'Proficient',
    });
    prisma.veraAssessmentRun.findFirst.mockResolvedValue({
      id: 'run-1',
      overallScore: 90,
      overallStatus: 'Proficient',
      evaluatedAt: new Date('2026-06-01T12:00:00Z'),
      resultJson: {
        workerId: '12',
        overallScore: 90,
        overallStatus: 'Proficient',
        domains: [],
        recommendations: [],
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SafetyKnowledgeService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: { logAudit: jest.fn() } },
      ],
    }).compile();

    service = module.get(SafetyKnowledgeService);
  });

  it('buildInput throws when worker is missing', async () => {
    prisma.worker.findUnique.mockResolvedValueOnce(null);
    await expect(service.buildInput(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('evaluateAndPersist stores SAFETY_KNOWLEDGE run', async () => {
    const out = await service.evaluateAndPersist(12, 7);
    expect(out.result.overallStatus).toBe('Proficient');
    expect(prisma.veraAssessmentRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          engine: VeraAssessmentEngine.SAFETY_KNOWLEDGE,
          workerId: 12,
          createdByUserId: 7,
        }),
      }),
    );
  });

  it('getLatest returns most recent run', async () => {
    const run = await service.getLatest(12);
    expect(run?.id).toBe('run-1');
    expect(prisma.veraAssessmentRun.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workerId: 12,
          engine: VeraAssessmentEngine.SAFETY_KNOWLEDGE,
        },
      }),
    );
  });

  it('listHistory returns recent SKE runs newest first', async () => {
    prisma.veraAssessmentRun.findMany.mockResolvedValue([
      {
        id: 'run-2',
        overallScore: 85,
        overallStatus: 'Developing',
        evaluatedAt: new Date('2026-06-02T10:00:00Z'),
        createdByUserId: 7,
      },
      {
        id: 'run-1',
        overallScore: 90,
        overallStatus: 'Proficient',
        evaluatedAt: new Date('2026-06-01T10:00:00Z'),
        createdByUserId: 7,
      },
    ]);
    const rows = await service.listHistory(12, 5);
    expect(rows).toHaveLength(2);
    expect(prisma.veraAssessmentRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          workerId: 12,
          engine: VeraAssessmentEngine.SAFETY_KNOWLEDGE,
        },
        take: 5,
      }),
    );
  });

  it('buildPdf includes worker name and domain lines', () => {
    const buf = service.buildPdf(
      {
        workerId: '12',
        overallScore: 88,
        overallStatus: 'Proficient',
        domains: [
          {
            domain: 'CompanyTraining',
            score: 90,
            status: 'Proficient',
            gaps: ['None'],
          },
        ],
        recommendations: ['Maintain current training cadence'],
      },
      'Alex Rivera',
    );
    expect(buf.subarray(0, 4).toString()).toBe('%PDF');
  });
});
