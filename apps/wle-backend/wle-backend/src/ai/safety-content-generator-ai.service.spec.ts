import { Test } from '@nestjs/testing';
import { JhaFlhaEngineService } from '../jha-flha/jha-flha-engine.service';
import { TrainingCompetencyEngineService } from '../pm-training/training-competency-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { SafetyContentGeneratorAiService } from './safety-content-generator-ai.service';

describe('SafetyContentGeneratorAiService', () => {
  let service: SafetyContentGeneratorAiService;

  const prisma = {
    company: {
      findUnique: jest.fn().mockResolvedValue({
        name: 'Acme Construction',
        industry: 'construction',
      }),
    },
    project: {
      findUnique: jest.fn().mockResolvedValue({ name: 'Tower Renovation' }),
    },
  } as unknown as PrismaService;

  const jhaEngine = new JhaFlhaEngineService();
  const trainingEngine = {
    generate: jest.fn().mockReturnValue({
      gaps: [
        {
          course: 'Fall Protection',
          status: 'missing',
          remediation: 'Required',
          drivers: [],
          priority_tier: 'immediate',
        },
      ],
      prioritized_training_plan: {
        immediate_required_training: [
          {
            course: 'Fall Protection',
            reason: 'Height work',
            due_window: 'today',
            priority: 'high',
          },
        ],
        short_term_training: [],
        development_training: [],
      },
      field_summary: 'Fall protection required.',
    }),
  } as unknown as TrainingCompetencyEngineService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SafetyContentGeneratorAiService,
        { provide: PrismaService, useValue: prisma },
        { provide: JhaFlhaEngineService, useValue: jhaEngine },
        { provide: TrainingCompetencyEngineService, useValue: trainingEngine },
      ],
    }).compile();

    service = module.get(SafetyContentGeneratorAiService);
  });

  it('generates JHA template with hazards, controls, training, and evidence', async () => {
    const result = await service.generate({
      contentType: 'jha_template',
      task: 'Install curtain wall panels at 15m using mast climber',
      companyId: 1,
      projectId: 10,
      trade: 'glazier',
      environment: { heights: true, weather: 'Wind 25 km/h' },
    });

    expect(result.content.content_type).toBe('jha_template');
    expect(result.content.hazards.length).toBeGreaterThan(0);
    expect(result.content.controls.length).toBeGreaterThan(0);
    expect(result.content.required_training.some((t) => /fall/i.test(t))).toBe(
      true,
    );
    expect(result.content.evidence_placeholders.length).toBeGreaterThan(0);
    expect(result.content.sections.length).toBeGreaterThan(2);
    expect(result.human_readable).toContain('#');
    expect(result.human_readable).toContain('Required training');
    expect(result.source).toBe('rule_engine');
  });

  it('generates toolbox talk content', async () => {
    const result = await service.generate({
      contentType: 'toolbox_talk',
      task: 'Hot work welding near combustible storage',
      companyId: 1,
      projectId: 10,
    });

    expect(result.content.content_type).toBe('toolbox_talk');
    expect(result.content.sections.some((s) => s.id === 'key_messages')).toBe(
      true,
    );
    expect(result.human_readable.length).toBeGreaterThan(100);
  });

  it('rejects empty task', async () => {
    await expect(
      service.generate({ contentType: 'sop', task: '  ', companyId: 1 }),
    ).rejects.toThrow(/task is required/i);
  });
});
