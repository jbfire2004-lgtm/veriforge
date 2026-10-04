import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PM_SAFETY_ERROR } from './pm-safety-workflow.errors';
import { PrismaService } from '../prisma/prisma.service';
import {
  EVENT_TYPES,
  PmSafetyWorkflowService,
} from './pm-safety-workflow.service';

function baseWorkflow(overrides: Partial<Record<string, unknown>> = {}) {
  const now = new Date('2026-05-01T12:00:00.000Z');
  return {
    id: 1,
    kind: 'PERMIT_TO_WORK' as const,
    title: 'Hot work',
    status: 'DRAFT' as const,
    companyId: null as number | null,
    siteId: null as number | null,
    workDescription: null as string | null,
    hazardSummary: null as string | null,
    controlMeasures: null as string | null,
    jobLocation: null as string | null,
    taskStepsJson: null as unknown,
    validFrom: null as Date | null,
    validTo: null as Date | null,
    workerUserId: null as number | null,
    workerSignedAt: null as Date | null,
    workerSignatureText: null as string | null,
    supervisorUserId: null as number | null,
    supervisorApprovedAt: null as Date | null,
    supervisorSignatureText: null as string | null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function mockTx(prisma: Record<string, unknown>) {
  return jest.fn(async (fn: (tx: typeof prisma) => Promise<unknown>) =>
    fn(prisma as never),
  ) as unknown as PrismaService['$transaction'];
}

describe('PmSafetyWorkflowService (unit)', () => {
  let service: PmSafetyWorkflowService;
  let prisma: {
    $transaction: PrismaService['$transaction'];
    pmSafetyWorkflow: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    pmSafetyWorkflowEvent: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    auditLog: {
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn() as unknown as PrismaService['$transaction'],
      pmSafetyWorkflow: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      pmSafetyWorkflowEvent: {
        create: jest.fn().mockResolvedValue({ id: 99 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction = mockTx({
      pmSafetyWorkflow: prisma.pmSafetyWorkflow,
      pmSafetyWorkflowEvent: prisma.pmSafetyWorkflowEvent,
      auditLog: prisma.auditLog,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmSafetyWorkflowService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PmSafetyWorkflowService);
  });

  describe('getDefinition', () => {
    it('returns versioned machine metadata', () => {
      const def = service.getDefinition();
      expect(def.workflow).toBe('VERA_PM_SAFETY');
      expect(def.version).toBe(1);
      expect(def.transitions.length).toBeGreaterThan(0);
      expect(def.statuses).toContain('DRAFT');
      expect(def.permissionHints.projectManagerRoles).toContain(
        'PROJECT_MANAGER',
      );
    });
  });

  describe('create', () => {
    it('persists workflow and records initial STATUS_CHANGE', async () => {
      const row = baseWorkflow();
      prisma.pmSafetyWorkflow.create.mockResolvedValue(row);

      const result = await service.create({
        title: '  Hot work  ',
        hazardSummary: ' sparks ',
      });

      expect(result.title).toBe('Hot work');
      expect(prisma.pmSafetyWorkflow.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Hot work',
            hazardSummary: 'sparks',
            kind: 'PERMIT_TO_WORK',
          }),
        }),
      );
      expect(prisma.pmSafetyWorkflowEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: EVENT_TYPES.STATUS_CHANGE,
            payload: expect.objectContaining({
              initial: true,
              status: 'DRAFT',
            }),
          }),
        }),
      );
    });

    it('throws BadRequestException when validFrom is invalid', async () => {
      await expect(
        service.create({ title: 'x', validFrom: 'not-a-date' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.pmSafetyWorkflow.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when validFrom is after validTo', async () => {
      await expect(
        service.create({
          title: 'x',
          validFrom: '2026-06-01',
          validTo: '2026-05-01',
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          message: 'validFrom must be before validTo',
        }),
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue(null);
      await expect(service.findOne(404)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns workflow with relations', async () => {
      const row = {
        ...baseWorkflow(),
        company: { id: 2, name: 'Acme' },
        site: { id: 3, name: 'Yard', code: 'Y1' },
      };
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue(row);
      await expect(service.findOne(1)).resolves.toEqual(row);
    });
  });

  describe('getState', () => {
    it('lists only transitions allowed from current status', async () => {
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue({
        ...baseWorkflow({ status: 'DRAFT' }),
        company: null,
        site: null,
      });

      const state = await service.getState(1);
      const actions = state.availableActions.map((a) => a.action);
      expect(actions).toContain('submit');
      expect(actions).toContain('cancel');
      expect(actions).not.toContain('approve');
    });
  });

  describe('transition', () => {
    const pmActor = { userId: 10, role: 'PROJECT_MANAGER' as const };
    const supActor = { userId: 20, role: 'SUPERVISOR' as const };

    it('updates status and appends STATUS_CHANGE + NOTIFICATION for SUBMITTED', async () => {
      const draft = baseWorkflow({ status: 'DRAFT' });
      const submitted = { ...draft, status: 'SUBMITTED' as const };
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue(draft);
      prisma.pmSafetyWorkflow.update.mockResolvedValue(submitted);

      const out = await service.transition(1, 'submit', pmActor, 'ready');

      expect(out.status).toBe('SUBMITTED');
      expect(prisma.pmSafetyWorkflow.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'SUBMITTED' },
      });

      const eventCalls = prisma.pmSafetyWorkflowEvent.create.mock.calls.map(
        (c) => c[0].data.eventType,
      );
      expect(eventCalls).toContain(EVENT_TYPES.STATUS_CHANGE);
      expect(eventCalls).toContain(EVENT_TYPES.NOTIFICATION);
    });

    it('throws NotFoundException when workflow missing', async () => {
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue(null);
      await expect(
        service.transition(9, 'submit', pmActor),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws canonical BadRequestException for illegal action from status', async () => {
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue(
        baseWorkflow({ status: 'DRAFT' }),
      );
      try {
        await service.transition(1, 'approve', supActor);
        fail('expected throw');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        const body = (e as BadRequestException).getResponse() as {
          code: string;
          allowedActions: string[];
        };
        expect(body.code).toBe(PM_SAFETY_ERROR.INVALID_TRANSITION);
        expect(body.allowedActions).toContain('submit');
      }
      expect(prisma.pmSafetyWorkflow.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when supervisor tries submit', async () => {
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue(
        baseWorkflow({ status: 'DRAFT' }),
      );
      await expect(
        service.transition(1, 'submit', supActor),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.pmSafetyWorkflow.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when PM tries approve', async () => {
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue(
        baseWorkflow({ status: 'UNDER_REVIEW' }),
      );
      await expect(
        service.transition(1, 'approve', pmActor),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('listEvents', () => {
    it('throws when workflow id does not exist', async () => {
      prisma.pmSafetyWorkflow.count.mockResolvedValue(0);
      await expect(service.listEvents(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns events ordered ascending by id', async () => {
      prisma.pmSafetyWorkflow.count.mockResolvedValue(1);
      prisma.pmSafetyWorkflowEvent.findMany.mockResolvedValue([
        { id: 1, eventType: 'STATUS_CHANGE' },
      ]);
      await expect(service.listEvents(1)).resolves.toHaveLength(1);
      expect(prisma.pmSafetyWorkflowEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ id: 'asc' }, { createdAt: 'asc' }],
        }),
      );
    });
  });

  describe('exportPdfBuffer', () => {
    it('records PDF_EXPORT event and returns a PDF byte prefix', async () => {
      prisma.pmSafetyWorkflow.findUnique.mockResolvedValue({
        ...baseWorkflow(),
        company: null,
        site: null,
      });

      const buf = await service.exportPdfBuffer(1);
      expect(buf.subarray(0, 5).toString('utf8')).toBe('%PDF-');
      expect(prisma.pmSafetyWorkflowEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: EVENT_TYPES.PDF_EXPORT,
          }),
        }),
      );
    });
  });
});
