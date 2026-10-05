import { BadRequestException } from '@nestjs/common';
import { SmsWorkflowService } from './sms-workflow.service';

describe('SmsWorkflowService', () => {
  const jhaFlha = {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    updateDraft: jest.fn(),
    submit: jest.fn(),
  };
  const inspections = {
    list: jest.fn(),
    get: jest.fn(),
    createFromTemplate: jest.fn(),
    saveAnswers: jest.fn(),
    submit: jest.fn(),
  };
  const capa = {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    updateDraft: jest.fn(),
    submitForVerification: jest.fn(),
  };
  const investigation = {
    getOrCreate: jest.fn(),
    update: jest.fn(),
  };
  const prisma = {
    pmInspectionTemplate: { findUnique: jest.fn() },
    pmInspection: { update: jest.fn() },
    pmSafetyEvent: { findFirst: jest.fn() },
    pmSafetyEventInvestigation: { findMany: jest.fn() },
  };

  const service = new SmsWorkflowService(
    jhaFlha as never,
    inspections as never,
    capa as never,
    investigation as never,
    prisma as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('rejects unknown entity slugs', () => {
    expect(() => service.parseEntity('capa')).toThrow(BadRequestException);
  });

  it('creates FLHA drafts with required taskDescription', async () => {
    jhaFlha.create.mockResolvedValue({ id: 'flha-1' });
    await service.create(
      'flha',
      { companyId: 1, projectId: 2, taskDescription: 'Test task' },
      9,
    );
    expect(jhaFlha.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'FLHA', taskDescription: 'Test task' }),
    );
  });

  it('requires taskDescription for FLHA create', async () => {
    await expect(
      service.create('flha', { companyId: 1, projectId: 2 }),
    ).rejects.toThrow(BadRequestException);
  });
});
