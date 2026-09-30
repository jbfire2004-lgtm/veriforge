import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VeraAssessmentEngine } from '@prisma/client';
import { CoreReadinessService } from './core-readiness.service';
import { PrismaService } from '../../prisma/prisma.service';
import { VerificationService } from '../../verification/verification.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { TrainingAssessmentRunnerService } from '../assessment-engines/training-assessment-runner.service';
import { AssessmentEnginesService } from '../assessment-engines/assessment-engines.service';
import { SafetyKnowledgeService } from '../safety-knowledge/safety-knowledge.service';
import { FitTestService } from '../fit-test/fit-test.service';
import { AcpAccessService } from '../../acp/acp-access.service';

describe('CoreReadinessService', () => {
  let service: CoreReadinessService;

  const prisma = {
    worker: { findUnique: jest.fn() },
    trainingRecord: { findMany: jest.fn() },
    fitTestRun: { findFirst: jest.fn() },
    competencyEvaluation: { findMany: jest.fn() },
    companyLink: { findMany: jest.fn() },
    veraAssessmentRun: { findMany: jest.fn() },
    pmPredictiveSafetyForecast: { findFirst: jest.fn() },
  };

  const verification = {
    evaluateWorkerCompliance: jest.fn(),
  };

  const trainingAssessment = {
    getLatest: jest.fn(),
  };

  const safetyKnowledge = {
    getLatest: jest.fn(),
  };

  const widgets = {
    getBundle: jest.fn(),
  };

  const reporting = {
    overview: jest.fn(),
    equipmentCompliance: jest.fn(),
  };

  const assessmentEngines = {
    getLatestByEngine: jest.fn(),
  };

  const fitTests = {
    companySummary: jest.fn(),
  };

  const acpAccess = {
    check: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.worker.findUnique.mockResolvedValue({
      id: 12,
      firstName: 'Alex',
      lastName: 'Rivera',
      companyId: 1,
    });
    prisma.trainingRecord.findMany.mockResolvedValue([]);
    prisma.fitTestRun.findFirst.mockResolvedValue(null);
    prisma.competencyEvaluation.findMany.mockResolvedValue([]);
    verification.evaluateWorkerCompliance.mockResolvedValue({
      isCompliant: true,
      issues: [],
    });
    trainingAssessment.getLatest.mockResolvedValue(null);
    safetyKnowledge.getLatest.mockResolvedValue({
      id: 'sk-run-1',
      overallScore: 88,
      overallStatus: 'Proficient',
      evaluatedAt: new Date('2026-06-01T12:00:00Z'),
      resultJson: {},
    });

    widgets.getBundle.mockResolvedValue({
      workerCompliance: {
        totalWorkers: 10,
        compliant: 8,
        nonCompliant: 2,
        expiringSoon: 1,
        complianceRate: 80,
        topIssues: [],
      },
      equipmentCompliance: {
        total: 5,
        compliant: 4,
        nonCompliant: 1,
        lockedOut: 0,
        overdueInspection: 0,
        complianceRate: 80,
      },
      trainingExpiry: {
        expired: 0,
        expiring30: 1,
        expiring60: 0,
        expiring90: 0,
        highRisk: 0,
        gaps: 0,
      },
      projectReadiness: null,
    });

    reporting.overview.mockResolvedValue({
      workers: { summary: { totalWorkers: 10, complianceRate: 80 } },
      equipment: { summary: { total: 5 } },
    });

    reporting.equipmentCompliance.mockResolvedValue({
      summary: {
        total: 5,
        compliant: 4,
        nonCompliant: 1,
        lockedOut: 0,
        overdueInspection: 0,
        complianceRate: 80,
      },
      recent: [],
    });

    prisma.companyLink.findMany.mockResolvedValue([
      { workerId: 12 },
      { workerId: 13 },
    ]);
    prisma.veraAssessmentRun.findMany.mockResolvedValue([
      {
        workerId: 12,
        overallScore: 90,
        overallStatus: 'PASS',
        evaluatedAt: new Date('2026-06-01T10:00:00Z'),
      },
      {
        workerId: 13,
        overallScore: 70,
        overallStatus: 'Developing',
        evaluatedAt: new Date('2026-06-01T09:00:00Z'),
      },
    ]);

    assessmentEngines.getLatestByEngine.mockImplementation((_engine, scope) => {
      if (scope.companyId !== 1) return null;
      if (_engine === VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE) {
        return {
          overallScore: 77,
          overallStatus: 'ConditionallyAccepted',
          evaluatedAt: new Date('2026-06-01T08:00:00Z'),
        };
      }
      return {
        overallScore: 62,
        overallStatus: 'NotAcceptable',
        evaluatedAt: new Date('2026-06-01T07:00:00Z'),
      };
    });

    fitTests.companySummary.mockResolvedValue({
      totalWorkers: 2,
      current: 1,
      expired: 0,
      expiring30: 0,
      missing: 1,
      failed: 0,
      complianceRate: 50,
    });

    acpAccess.check.mockResolvedValue({ allowed: true });
    prisma.pmPredictiveSafetyForecast.findFirst.mockResolvedValue({
      riskIndex: 42,
      riskLevel: 'medium',
      weekStart: new Date('2026-06-01T00:00:00Z'),
      forecastJson: { highRiskWorkers: 1, highRiskTasks: 0 },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreReadinessService,
        { provide: PrismaService, useValue: prisma },
        { provide: VerificationService, useValue: verification },
        { provide: DashboardWidgetsService, useValue: widgets },
        { provide: ReportingCoreService, useValue: reporting },
        {
          provide: TrainingAssessmentRunnerService,
          useValue: trainingAssessment,
        },
        { provide: AssessmentEnginesService, useValue: assessmentEngines },
        { provide: SafetyKnowledgeService, useValue: safetyKnowledge },
        { provide: FitTestService, useValue: fitTests },
        { provide: AcpAccessService, useValue: acpAccess },
      ],
    }).compile();

    service = module.get(CoreReadinessService);
  });

  it('summary includes engine dimensions with visual states when company selected', async () => {
    const out = await service.summary(1, 99);

    expect(out.dimensions?.map((d) => d.key)).toEqual(
      expect.arrayContaining([
        'workers',
        'equipment',
        'training_expiry',
        'tae',
        'ske',
        'fit_test',
        'spce',
        'sga',
        'worker_competency',
        'equipment_competency',
        'predictive_safety',
      ]),
    );

    const tae = out.dimensions?.find((d) => d.key === 'tae');
    expect(tae?.metrics.evaluated).toBe(2);
    expect(tae?.state).toBeDefined();

    expect(out.companyAssessments?.spce?.state).toBe('AT_RISK');
    expect(out.fitTests?.state).toBe('AT_RISK');
    expect(out.predictiveSafety?.tierAllowed).toBe(true);
    expect(out.workerAssessments?.trainingAssessment?.averageScore).toBe(80);
  });

  it('summary omits predictive block when tier not allowed', async () => {
    acpAccess.check.mockResolvedValueOnce({ allowed: false });
    const out = await service.summary(1, 99);
    expect(out.predictiveSafety?.tierAllowed).toBe(false);
    expect(out.dimensions?.some((d) => d.key === 'predictive_safety')).toBe(
      false,
    );
  });

  it('workerScore includes safetyKnowledge summary when SKE run exists', async () => {
    const out = await service.workerScore(12);
    expect(out.safetyKnowledge).toEqual(
      expect.objectContaining({
        overallScore: 88,
        overallStatus: 'Proficient',
        state: 'OK',
      }),
    );
    expect(out.dimensions?.some((d) => d.key === 'ske')).toBe(true);
  });

  it('workerScore includes fitTest summary from latest run', async () => {
    prisma.fitTestRun.findFirst.mockResolvedValueOnce({
      result: 'PASS',
      performedAt: new Date('2026-06-01T00:00:00.000Z'),
      expiresAt: new Date('2027-06-01T00:00:00.000Z'),
    });

    const out = await service.workerScore(12);
    expect(out.fitTest).toEqual(
      expect.objectContaining({
        pass: true,
        statusLabel: 'PASS',
        state: 'OK',
      }),
    );
  });

  it('workerScore omits fitTest when no run exists', async () => {
    prisma.fitTestRun.findFirst.mockResolvedValueOnce(null);
    const out = await service.workerScore(12);
    expect(out.fitTest).toBeNull();
  });

  it('workerScore throws when worker is missing', async () => {
    prisma.worker.findUnique.mockResolvedValueOnce(null);
    await expect(service.workerScore(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
