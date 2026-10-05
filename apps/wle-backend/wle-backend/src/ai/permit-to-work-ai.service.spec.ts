import { Test } from '@nestjs/testing';
import { PERMIT_TYPE_SEEDS } from '../../prisma/data/permit-types';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerProjectReadinessService } from '../workers/worker-project-readiness.service';
import { PermitAiService } from './permit-ai.service';
import { PermitToWorkAiService } from './permit-to-work-ai.service';

describe('PermitToWorkAiService', () => {
  let service: PermitToWorkAiService;

  const hotWorkSeed = PERMIT_TYPE_SEEDS.find(
    (p) => p.permitType === 'hot_work',
  )!;

  const permitAi = {
    suggest: jest.fn().mockResolvedValue({
      fieldValues: {
        combustibles_cleared: false,
        fire_watch: '',
        extinguisher_ready: false,
        work_location: 'Tank farm',
      },
      controls: [
        {
          key: 'ctrl.admin.fire_watch',
          label: 'Fire watch',
          selected: true,
          confidence: 0.9,
          source: 'permit_template',
        },
      ],
      training: {
        valid: false,
        requirements: [
          {
            code: 'Hot Work Safety',
            name: 'Hot Work Safety',
            status: 'missing',
          },
        ],
        message: 'Training gap',
      },
      equipment: { valid: true, items: [], message: 'ok' },
      weather: { proceed: true, warnings: [], summary: 'ok' },
      incidents: { recentCount: 0, warnings: [], proceed: true },
      overridableBlocks: [
        {
          id: 'training',
          label: 'Training',
          blocked: true,
          canOverride: true,
          message: 'Training gap',
        },
      ],
    }),
  } as unknown as PermitAiService;

  const prisma = {
    worker: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 5, firstName: 'Sam', lastName: 'Lee' }),
    },
    pmPermit: { findMany: jest.fn().mockResolvedValue([]) },
    pmProjectSafetyProfile: { findFirst: jest.fn().mockResolvedValue(null) },
  } as unknown as PrismaService;

  const workerReadiness = {
    evaluate: jest.fn().mockResolvedValue({
      status: 'RESTRICTED',
      blocking_items: ['Missing required training: Hot Work Safety'],
    }),
  } as unknown as WorkerProjectReadinessService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PermitToWorkAiService,
        { provide: PermitAiService, useValue: permitAi },
        { provide: PrismaService, useValue: prisma },
        { provide: WorkerProjectReadinessService, useValue: workerReadiness },
      ],
    }).compile();

    service = module.get(PermitToWorkAiService);
  });

  it('returns structured permit-to-work JSON with conflicts for hot work near flammables', async () => {
    const result = await service.evaluate({
      companyId: 1,
      projectId: 10,
      permitType: hotWorkSeed.permitType,
      jobScope: 'Welding repair near diesel tank and flammable vapor area',
      workerId: 5,
      locationNote: 'Tank farm pad 3',
    });

    expect(result.permit_type).toBe(hotWorkSeed.name);
    expect(result.required_documents.length).toBeGreaterThan(0);
    expect(
      result.conflicts_detected.some(
        (c) => c.code === 'HOT_WORK_NEAR_FLAMMABLES',
      ),
    ).toBe(true);
    expect(result.recommended_controls.length).toBeGreaterThan(0);
    expect(['REJECTED', 'CONDITIONAL']).toContain(result.final_permit_status);
    expect(result.high_risk_flags.length).toBeGreaterThan(0);
    expect(result.source).toBe('rule_engine');
  });

  it('flags confined space without attendant as critical', async () => {
    (permitAi.suggest as jest.Mock).mockResolvedValueOnce({
      fieldValues: { atmospheric_tests: '', isolation_verified: true },
      controls: [],
      training: { valid: true, requirements: [], message: 'ok' },
      equipment: { valid: true, items: [], message: 'ok' },
      weather: { proceed: true, warnings: [], summary: 'ok' },
      incidents: { recentCount: 0, warnings: [], proceed: true },
      overridableBlocks: [],
    });
    (workerReadiness.evaluate as jest.Mock).mockResolvedValueOnce({
      status: 'READY',
      blocking_items: [],
    });

    const result = await service.evaluate({
      companyId: 1,
      projectId: 10,
      permitType: 'confined_space',
      jobScope: 'Vessel interior coating',
      workerId: 5,
      attendantAssigned: false,
    });

    expect(
      result.conflicts_detected.some((c) => c.code === 'CS_NO_ATTENDANT'),
    ).toBe(true);
    expect(result.final_permit_status).toBe('REJECTED');
  });
});
