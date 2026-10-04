import { Test, TestingModule } from '@nestjs/testing';
import { VeraAssessmentEngine } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AssessmentEnginesService } from './assessment-engines.service';
import { TrainingAssessmentRunnerService } from './training-assessment-runner.service';

describe('AssessmentEnginesService.listHistoryByEngine', () => {
  let service: AssessmentEnginesService;

  const prisma = {
    veraAssessmentRun: { findMany: jest.fn(), findFirst: jest.fn() },
    company: { findUnique: jest.fn() },
    companyLink: { findMany: jest.fn() },
    projectAssignment: { findMany: jest.fn() },
    jhaFlha: { count: jest.fn() },
    pmInspection: { count: jest.fn() },
    pmSafetyEvent: { count: jest.fn() },
    pmCorrectiveAction: { count: jest.fn() },
    worker: { count: jest.fn() },
    trainingRecord: { findMany: jest.fn() },
    policyDocument: { count: jest.fn() },
    policyAcknowledgment: { count: jest.fn() },
    safetyForm: { count: jest.fn() },
    bboObservation: { count: jest.fn() },
    trainingRequirement: { findMany: jest.fn() },
    veraAssessmentRunCreate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.veraAssessmentRun.findMany.mockResolvedValue([
      {
        id: 'run-2',
        overallScore: 82,
        overallStatus: 'ConditionallyAccepted',
        evaluatedAt: new Date('2026-06-02T10:00:00Z'),
      },
      {
        id: 'run-1',
        overallScore: 75,
        overallStatus: 'ConditionallyAccepted',
        evaluatedAt: new Date('2026-06-01T10:00:00Z'),
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentEnginesService,
        { provide: PrismaService, useValue: prisma },
        { provide: TrainingAssessmentRunnerService, useValue: {} },
        { provide: AuditLogService, useValue: { logAudit: jest.fn() } },
      ],
    }).compile();

    service = module.get(AssessmentEnginesService);
  });

  it('returns SPCE history oldest-first for trend charts', async () => {
    const rows = await service.listHistoryByEngine(
      VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
      { companyId: 1 },
      6,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]?.overallScore).toBe(75);
    expect(rows[1]?.overallScore).toBe(82);
    expect(prisma.veraAssessmentRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          engine: VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
          companyId: 1,
        },
      }),
    );
  });
});
