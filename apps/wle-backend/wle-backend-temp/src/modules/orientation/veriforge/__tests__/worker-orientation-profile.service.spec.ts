import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrientationRequirementService } from '../orientation-requirement.service';
import { OrientationCompletionService } from '../orientation-completion.service';
import { WorkerOrientationProfileService } from '../worker-orientation-profile.service';

describe('WorkerOrientationProfileService', () => {
  let service: WorkerOrientationProfileService;

  const prisma = {
    worker: { findUnique: jest.fn() },
  };

  const requirements = {
    resolveForWorker: jest.fn(),
  };

  const completions = {
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerOrientationProfileService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrientationRequirementService, useValue: requirements },
        { provide: OrientationCompletionService, useValue: completions },
      ],
    }).compile();
    service = module.get(WorkerOrientationProfileService);

    prisma.worker.findUnique.mockResolvedValue({
      id: 7,
      companyId: 10,
      projectAssignments: [{ projectId: 55, role: 'electrician' }],
    });
  });

  it('returns allowed when all required are completed and not expired', async () => {
    requirements.resolveForWorker.mockResolvedValue([
      {
        id: 'r1',
        orientationId: 'o1',
        mustCompleteBefore: 'arrival',
        orientation: {
          title: 'Site',
          type: 'site',
          version: '1.0',
        },
      },
    ]);
    completions.list.mockResolvedValue([
      {
        id: 'c1',
        orientationId: 'o1',
        status: 'completed',
        completedOn: new Date('2026-01-01'),
        expiresOn: new Date('2099-01-01'),
        score: 100,
        orientation: { title: 'Site' },
      },
    ]);

    const profile = await service.getProfile(7, { companyId: 10 });
    expect(profile.gatingStatus).toBe('allowed');
    expect(profile.missingOrientations).toHaveLength(0);
  });

  it('returns blocked when arrival requirement is pending', async () => {
    requirements.resolveForWorker.mockResolvedValue([
      {
        id: 'r1',
        orientationId: 'o1',
        mustCompleteBefore: 'arrival',
        orientation: { title: 'Site', type: 'site', version: '1.0' },
      },
    ]);
    completions.list.mockResolvedValue([]);

    const profile = await service.getProfile(7);
    expect(profile.gatingStatus).toBe('blocked');
    expect(profile.missingOrientations[0]?.orientationId).toBe('o1');
  });

  it('returns blocked when required completion is expired', async () => {
    requirements.resolveForWorker.mockResolvedValue([
      {
        id: 'r1',
        orientationId: 'o1',
        mustCompleteBefore: 'arrival',
        orientation: { title: 'Site', type: 'site', version: '1.0' },
      },
    ]);
    completions.list.mockResolvedValue([
      {
        id: 'c1',
        orientationId: 'o1',
        status: 'completed',
        completedOn: new Date('2020-01-01'),
        expiresOn: new Date('2020-02-01'),
        orientation: { title: 'Site' },
      },
    ]);

    const profile = await service.getProfile(7, { companyId: 10 });
    expect(profile.gatingStatus).toBe('blocked');
    expect(profile.completedOrientations).toHaveLength(0);
  });

  it('returns warning for near-expiry when otherwise allowed', async () => {
    const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    requirements.resolveForWorker.mockResolvedValue([
      {
        id: 'r1',
        orientationId: 'o1',
        mustCompleteBefore: 'arrival',
        orientation: { title: 'Site', type: 'site', version: '1.0' },
      },
    ]);
    completions.list.mockResolvedValue([
      {
        id: 'c1',
        orientationId: 'o1',
        status: 'completed',
        completedOn: new Date(),
        expiresOn: soon,
        orientation: { title: 'Site' },
      },
    ]);

    const profile = await service.getProfile(7, { companyId: 10 });
    expect(profile.gatingStatus).toBe('warning');
  });

  it('returns warning for assignment-only gaps', async () => {
    requirements.resolveForWorker.mockResolvedValue([
      {
        id: 'r1',
        orientationId: 'o1',
        mustCompleteBefore: 'assignment',
        orientation: { title: 'Trade', type: 'trade', version: '1.0' },
      },
    ]);
    completions.list.mockResolvedValue([]);

    const profile = await service.getProfile(7, { companyId: 10 });
    expect(profile.gatingStatus).toBe('warning');
  });
});
