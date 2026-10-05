import { Test } from '@nestjs/testing';
import { PmPredictiveSafetyAnalyticsService } from '../pm-predictive-safety-analytics/pm-predictive-safety-analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { PredictiveSafetyAnalyticsAiService } from './predictive-safety-analytics-ai.service';

describe('PredictiveSafetyAnalyticsAiService', () => {
  let service: PredictiveSafetyAnalyticsAiService;

  const analytics = {
    getBundle: jest.fn().mockResolvedValue({
      generatedAt: new Date().toISOString(),
      companyId: 1,
      projectId: 10,
      modelKey: 'test',
      modelVersion: 1,
      summary: {
        overallRiskIndex: 72,
        overallRiskLevel: 'high',
        highRiskWorkers: 2,
        highRiskContractors: 0,
        highRiskTasks: 1,
        highRiskLocations: 0,
        openAlerts: 0,
      },
      highRiskWorkers: [
        {
          entityType: 'worker',
          entityId: '5',
          label: 'Sam Lee',
          riskScore: 78,
          riskLevel: 'high',
          probability: 0.78,
          factors: ['training_gaps', 'incidents_90d'],
        },
      ],
      highRiskContractors: [],
      highRiskTasks: [
        {
          entityType: 'task',
          entityId: 'jha-1',
          label: 'Roof work',
          riskScore: 81,
          riskLevel: 'high',
          probability: 0.81,
          factors: ['sif_potential', 'unsigned_crew'],
        },
      ],
      highRiskLocations: [],
      weeklyForecast: {
        weekStart: '2026-06-09',
        weekEnd: '2026-06-15',
        overallRiskIndex: 72,
        overallRiskLevel: 'high',
        trend: 'worsening',
        days: [
          {
            date: '2026-06-09',
            dayOfWeek: 'Mon',
            riskIndex: 72,
            riskLevel: 'high',
            drivers: ['training'],
          },
        ],
      },
      preventiveActions: [
        {
          id: 'pa-1',
          priority: 'high',
          category: 'training',
          title: 'Safety coaching for Sam Lee',
          description: 'Address training gaps',
          evidence: ['training_gaps'],
          confidence: 0.78,
        },
      ],
      dataQuality: { recordsIngested: 10, modules: ['jha'], windowDays: 90 },
    }),
  } as unknown as PmPredictiveSafetyAnalyticsService;

  const prisma = {
    trainingRecord: { findMany: jest.fn().mockResolvedValue([]) },
    jhaFlhaHazard: {
      findMany: jest.fn().mockResolvedValue([
        { description: 'Fall from height', category: 'Fall' },
        { description: 'Fall from height', category: 'Fall' },
        { description: 'Fall from height', category: 'Fall' },
        { description: 'Fall from height', category: 'Fall' },
      ]),
    },
    jhaFlha: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'j1',
          taskDescription: 'Scaffold work',
          qualityScore: 42,
          sifPotential: true,
        },
      ]),
    },
    pmCorrectiveAction: { count: jest.fn().mockResolvedValue(3) },
    jhaFlhaControl: { count: jest.fn().mockResolvedValue(6) },
    pmSafetyEvent: {
      groupBy: jest
        .fn()
        .mockResolvedValue([{ eventType: 'near_miss', _count: 4 }]),
    },
    pmAccessAttempt: { count: jest.fn().mockResolvedValue(5) },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PredictiveSafetyAnalyticsAiService,
        { provide: PrismaService, useValue: prisma },
        { provide: PmPredictiveSafetyAnalyticsService, useValue: analytics },
      ],
    }).compile();

    service = module.get(PredictiveSafetyAnalyticsAiService);
  });

  it('returns structured predictive safety analytics JSON', async () => {
    const result = await service.analyze({ companyId: 1, projectId: 10 });

    expect(result.risk_forecast.length).toBeGreaterThan(0);
    expect(result.risk_forecast.some((r) => r.entity_type === 'worker')).toBe(
      true,
    );
    expect(result.risk_forecast.some((r) => r.entity_type === 'project')).toBe(
      true,
    );
    expect(result.leading_indicators.length).toBeGreaterThan(0);
    expect(
      result.leading_indicators.some(
        (i) => i.indicator_type === 'repeated_hazard',
      ),
    ).toBe(true);
    expect(result.recommended_interventions.length).toBeGreaterThan(0);
    expect(result.source).toBe('rule_engine');
    expect(result.field_summary).toContain('Predictive analysis');
  });

  it('rejects missing companyId', async () => {
    await expect(service.analyze({ companyId: 0 })).rejects.toThrow(
      /companyId/i,
    );
  });
});
