import { Test } from '@nestjs/testing';
import { HazardControlCatalogService } from '../jha-flha/hazard-control-catalog.service';
import { JhaFlhaEngineService } from '../jha-flha/jha-flha-engine.service';
import { TrainingCompetencyEngineService } from '../pm-training/training-competency-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerProjectReadinessService } from '../workers/worker-project-readiness.service';
import { SafetyWorkflowAiService } from './safety-workflow-ai.service';

describe('SafetyWorkflowAiService', () => {
  let service: SafetyWorkflowAiService;

  const prisma = {
    pmProjectSafetyProfile: {
      findFirst: jest.fn().mockResolvedValue({ requiredPpe: ['Hard hat'] }),
    },
    worker: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ firstName: 'Alex', lastName: 'Rivera' }),
    },
  } as never;

  const jhaEngine = new JhaFlhaEngineService();
  const hazardCatalog = {
    suggestHazardsForTask: jest.fn().mockResolvedValue({
      suggestedHazards: [
        { description: 'Fall from height', category: 'Fall', score: 9 },
      ],
      missedHazards: [],
      matchedTaskProfiles: ['roof_work'],
      warnings: [],
    }),
    suggestControlsForHazards: jest.fn().mockResolvedValue({
      suggestedControls: [
        {
          description: '100% tie-off and guardrails',
          controlType: 'engineering',
          ppeRequired: false,
        },
      ],
      missedControls: [],
      warnings: [],
      crewOftenAdds: [],
    }),
  } as unknown as HazardControlCatalogService;

  const trainingEngine = {
    generate: jest.fn().mockReturnValue({
      gaps: [
        {
          course: 'Fall Protection',
          status: 'missing',
          remediation: 'Complete before roof work',
          drivers: ['height'],
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
    buildInputFromWorker: jest.fn().mockResolvedValue({
      worker_profile: { role: 'worker' },
      current_training_records: [],
      project_scope: { tasks: ['Roof repair'] },
    }),
  } as unknown as TrainingCompetencyEngineService;

  const workerReadiness = {
    evaluate: jest.fn().mockResolvedValue({
      status: 'RESTRICTED',
      blocking_items: ['Missing required training: Fall Protection'],
      non_blocking_items: [],
      fix_steps: [],
      supervisor_message: 'Complete training',
      training_summary: {
        required: 3,
        valid_verified: 1,
        expired: 0,
        missing: 1,
        unverified: 1,
        expiring_soon: 0,
      },
    }),
  } as unknown as WorkerProjectReadinessService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SafetyWorkflowAiService,
        { provide: PrismaService, useValue: prisma },
        { provide: JhaFlhaEngineService, useValue: jhaEngine },
        { provide: HazardControlCatalogService, useValue: hazardCatalog },
        { provide: TrainingCompetencyEngineService, useValue: trainingEngine },
        { provide: WorkerProjectReadinessService, useValue: workerReadiness },
      ],
    }).compile();

    service = module.get(SafetyWorkflowAiService);
  });

  it('returns structured safety workflow JSON for a height task', async () => {
    const result = await service.analyze({
      task: 'Roof membrane repair at 12m using harness',
      companyId: 1,
      projectId: 10,
      workflowType: 'FLHA',
      environment: { heights: true, weather: 'Wind 30 km/h' },
      workerIds: [42],
    });

    expect(result.task).toContain('Roof membrane');
    expect(result.predicted_hazards.length).toBeGreaterThan(0);
    expect(result.recommended_controls.length).toBeGreaterThan(0);
    expect(result.required_training.some((t) => /fall/i.test(t.course))).toBe(
      true,
    );
    expect(result.worker_readiness).toHaveLength(1);
    expect(result.worker_readiness[0].worker_id).toBe(42);
    expect(result.safety_quality_score).toBeGreaterThanOrEqual(0);
    expect(result.safety_quality_score).toBeLessThanOrEqual(100);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.source).toBe('rule_engine');
  });

  it('rejects empty task', async () => {
    await expect(
      service.analyze({ task: '  ', companyId: 1, projectId: 1 }),
    ).rejects.toThrow(/task is required/i);
  });
});
