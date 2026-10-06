import { Test } from '@nestjs/testing';
import { IncidentSifEngineService } from '../pm-safety-events/incident-sif-engine.service';
import { PmSafetyEventsIntelligenceService } from '../pm-safety-events/pm-safety-events-intelligence.service';
import { TrainingCompetencyEngineService } from '../pm-training/training-competency-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentIntelligenceAiService } from './incident-intelligence-ai.service';

describe('IncidentIntelligenceAiService', () => {
  let service: IncidentIntelligenceAiService;

  const incidentSifEngine = new IncidentSifEngineService(
    {
      classifyType: () => ({
        eventType: 'near_miss',
        confidence: 0.8,
        explainability: [],
      }),
    } as never,
    {
      score: () => ({ severity: 'high', riskScore: 72, likelihood: 4 }),
    } as never,
    {
      suggestContributingFactors: () => [
        { label: 'Inadequate barrier', pathway: 'procedures' },
      ],
      suggestRootCauses: () => [
        { label: 'Procedure not followed', score: 4, pathway: 'procedures' },
      ],
      buildFiveWhyChain: () => ['Why 1', 'Why 2', 'Root: procedure gap'],
    } as never,
  );

  const prisma = {
    pmSafetyEvent: { count: jest.fn().mockResolvedValue(2) },
    worker: { findUnique: jest.fn().mockResolvedValue(null) },
  } as unknown as PrismaService;
  const eventsIntelligence = {
    predictFromEvent: jest
      .fn()
      .mockResolvedValue({ predictive_recurrence_likelihood: 55 }),
  } as unknown as PmSafetyEventsIntelligenceService;
  const trainingEngine = {
    buildInputFromWorker: jest.fn(),
    generate: jest.fn().mockReturnValue({ gaps: [] }),
  } as unknown as TrainingCompetencyEngineService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        IncidentIntelligenceAiService,
        { provide: PrismaService, useValue: prisma },
        { provide: IncidentSifEngineService, useValue: incidentSifEngine },
        {
          provide: PmSafetyEventsIntelligenceService,
          useValue: eventsIntelligence,
        },
        { provide: TrainingCompetencyEngineService, useValue: trainingEngine },
      ],
    }).compile();

    service = module.get(IncidentIntelligenceAiService);
  });

  it('returns incident intelligence JSON from narrative input', async () => {
    const result = await service.analyze({
      engineInput: {
        incident_type: 'near_miss',
        description_free_text:
          'Worker nearly fell from scaffold at height — fall protection not tied off.',
        location: 'Unit 3 east scaffold',
        people_involved: [{ role: 'worker' }],
        companyId: 1,
        projectId: 10,
      },
    });

    expect(result.incident_type).toBeTruthy();
    expect(['yes', 'no', 'unknown']).toContain(result.sif_potential);
    expect(result.root_causes.length).toBeGreaterThan(0);
    expect(result.recommended_actions.length).toBeGreaterThan(0);
    expect(['low', 'medium', 'high', 'critical']).toContain(
      result.recurrence_risk,
    );
    expect(result.source).toBe('rule_engine');
    expect(
      result.training_gaps.some((g) => /fall|scaffold/i.test(g.training_name)),
    ).toBe(true);
  });

  it('flags SIF potential for high-energy injury narrative', async () => {
    const result = await service.analyze({
      engineInput: {
        incident_type: 'injury',
        SIF_potential: 'yes',
        description_free_text:
          'Crane load swung into line of fire — worker struck by rigging.',
        companyId: 1,
        projectId: 10,
      },
    });

    expect(result.sif_potential).toBe('yes');
    expect(result.recurrence_risk).not.toBe('low');
    expect(result.recommended_actions.some((a) => /SIF/i.test(a))).toBe(true);
  });
});
