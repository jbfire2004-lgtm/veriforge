import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AuditLogService } from '../../../../audit/audit-log.service';
import { TenantScopeService } from '../../../../security/tenant-scope.service';
import { OrientationDefinitionService } from '../orientation-definition.service';
import { OrientationRequirementService } from '../orientation-requirement.service';
import { OrientationCompletionService } from '../orientation-completion.service';
import { OrientationDeliveryService } from '../orientation-delivery.service';
import { WorkerOrientationProfileService } from '../worker-orientation-profile.service';
import { OrientationAiGenerateService } from '../orientation-ai-generate.service';
import {
  assertOrientationUploadFile,
  normalizeAndValidateBlocks,
  ORIENTATION_UPLOAD_MAX_BYTES,
} from '../orientation-validation';
import { replayOrConflict } from '../../../../common/prisma-errors';

/**
 * Aggressive error-path matrix for VeriForge orientation services.
 * Each case documents the error triggered and expected handling.
 */
describe('VeriForge orientation error paths', () => {
  describe('invalid / malformed / oversized inputs', () => {
    it('rejects empty title', async () => {
      const { service } = await buildDefinitionService();
      await expect(
        service.create({
          companyId: 1,
          title: '',
          type: 'company',
          createdByUserId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects whitespace-only title', async () => {
      const { service } = await buildDefinitionService();
      await expect(
        service.create({
          companyId: 1,
          title: '   \t',
          type: 'company',
          createdByUserId: 1,
        }),
      ).rejects.toThrow(/title is required/);
    });

    it('rejects contentBlocks object (not array)', () => {
      expect(() => normalizeAndValidateBlocks({ type: 'text' })).toThrow(
        /must be an array/,
      );
    });

    it('rejects contentBlocks string payload', () => {
      expect(() => normalizeAndValidateBlocks('[{}]' as never)).toThrow(
        /must be an array/,
      );
    });

    it('rejects oversized contentBlocks (>200)', () => {
      const blocks = Array.from({ length: 201 }, (_, i) => ({
        type: 'text',
        order: i,
      }));
      expect(() => normalizeAndValidateBlocks(blocks)).toThrow(/maximum of 200/);
    });

    it('rejects null entries inside contentBlocks', () => {
      expect(() => normalizeAndValidateBlocks([null])).toThrow(/must be an object/);
    });

    it('rejects array entries inside contentBlocks', () => {
      expect(() => normalizeAndValidateBlocks([['x']])).toThrow(/must be an object/);
    });

    it('rejects unknown block type', () => {
      expect(() =>
        normalizeAndValidateBlocks([{ type: 'html', order: 0 }]),
      ).toThrow(/type must be one of/);
    });

    it('rejects quiz missing prompt', () => {
      expect(() =>
        normalizeAndValidateBlocks([
          {
            type: 'quiz',
            quiz: { prompt: '  ', choices: ['a', 'b'], answerIndex: 0 },
          },
        ]),
      ).toThrow(/prompt is required/);
    });

    it('rejects quiz with one choice', () => {
      expect(() =>
        normalizeAndValidateBlocks([
          {
            type: 'quiz',
            quiz: { prompt: 'Q?', choices: ['only'], answerIndex: 0 },
          },
        ]),
      ).toThrow(/at least 2/);
    });

    it('rejects quiz answerIndex NaN', () => {
      expect(() =>
        normalizeAndValidateBlocks([
          {
            type: 'quiz',
            quiz: {
              prompt: 'Q?',
              choices: ['a', 'b'],
              answerIndex: 'nope' as never,
            },
          },
        ]),
      ).toThrow(/answerIndex/);
    });

    it('rejects empty upload file', () => {
      expect(() =>
        assertOrientationUploadFile({
          mimetype: 'application/pdf',
          size: 0,
          originalname: 'x.pdf',
        }),
      ).toThrow(/empty/);
    });

    it('rejects oversized upload', () => {
      expect(() =>
        assertOrientationUploadFile({
          mimetype: 'application/pdf',
          size: ORIENTATION_UPLOAD_MAX_BYTES + 1,
          originalname: 'big.pdf',
        }),
      ).toThrow(/maximum size/);
    });

    it('rejects executable mime', () => {
      expect(() =>
        assertOrientationUploadFile({
          mimetype: 'application/x-msdownload',
          size: 100,
          originalname: 'x.exe',
        }),
      ).toThrow(/unsupported file type/);
    });

    it('rejects missing mime', () => {
      expect(() =>
        assertOrientationUploadFile({
          size: 100,
          originalname: 'x.bin',
        }),
      ).toThrow(/unsupported file type/);
    });
  });

  describe('missing required fields', () => {
    it('completion list without workerId and orientationId', async () => {
      const { service } = await buildCompletionService();
      await expect(service.list({})).rejects.toThrow(
        /workerId or orientationId is required/,
      );
    });

    it('completion create with unknown orientation', async () => {
      const { service, prisma } = await buildCompletionService();
      prisma.orientationDefinition.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          workerId: 1,
          orientationId: 'missing',
          companyId: 1,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('completion create with unknown worker', async () => {
      const { service, prisma } = await buildCompletionService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        expiryRules: {},
      });
      prisma.worker.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          workerId: 999,
          orientationId: 'o1',
          companyId: 1,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('requirement create with missing orientation', async () => {
      const { service, prisma } = await buildRequirementService();
      prisma.orientationDefinition.findUnique.mockResolvedValue(null);
      await expect(
        service.create(
          {
            orientationId: 'gone',
            companyId: 1,
            mustCompleteBefore: 'arrival',
          },
          { id: 1 },
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('delivery assign with missing worker', async () => {
      const { service, prisma } = await buildDeliveryService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        isPublished: true,
        title: 'T',
        version: '1.0',
      });
      prisma.worker.findUnique.mockResolvedValue(null);
      await expect(
        service.assign({
          workerId: 9,
          orientationId: 'o1',
          companyId: 1,
          assignedById: 1,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('profile with unknown worker', async () => {
      const { service, prisma } = await buildProfileService();
      prisma.worker.findUnique.mockResolvedValue(null);
      await expect(service.getProfile(404)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('unauthorized / cross-tenant', () => {
    it('definition get forbidden across companies', async () => {
      const { service, prisma } = await buildDefinitionService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'def-1',
        companyId: 10,
        requirements: [],
      });
      await expect(service.get('def-1', { companyId: 99 })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('TenantScopeService denies cross-company for COMPANY_ADMIN', () => {
      const tenant = new TenantScopeService({} as never);
      expect(() =>
        tenant.assertCompanyAccess(
          { id: 1, role: 'COMPANY_ADMIN', companyId: 10 } as never,
          99,
        ),
      ).toThrow(/Cross-tenant/);
    });

    it('TenantScopeService denies actor with no companyId', () => {
      const tenant = new TenantScopeService({} as never);
      expect(() =>
        tenant.effectiveCompanyId(
          { id: 1, role: 'COMPANY_ADMIN', companyId: null } as never,
          10,
        ),
      ).toThrow(/not linked to a company/);
    });

    it('requirement rejects orientation from other company', async () => {
      const { service, prisma } = await buildRequirementService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 50,
        isPublished: true,
      });
      await expect(
        service.create(
          {
            orientationId: 'o1',
            companyId: 10,
            mustCompleteBefore: 'arrival',
          },
          { id: 1 },
        ),
      ).rejects.toThrow(/does not belong/);
    });

    it('completion rejects orientation from other company', async () => {
      const { service, prisma } = await buildCompletionService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 50,
        expiryRules: {},
      });
      await expect(
        service.create({
          workerId: 1,
          orientationId: 'o1',
          companyId: 10,
        }),
      ).rejects.toThrow(/does not belong/);
    });

    it('delivery rejects unpublished (assign gate)', async () => {
      const { service, prisma } = await buildDeliveryService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        isPublished: false,
        title: 'Draft',
        version: '1.0',
      });
      await expect(
        service.assign({
          workerId: 1,
          orientationId: 'o1',
          companyId: 1,
          assignedById: 1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('database write failures', () => {
    it('definition create surfaces prisma errors (no swallow)', async () => {
      const { service, prisma } = await buildDefinitionService();
      prisma.orientationDefinition.create.mockRejectedValue(
        new Error('ECONNREFUSED postgres'),
      );
      await expect(
        service.create({
          companyId: 1,
          title: 'X',
          type: 'company',
          createdByUserId: 1,
        }),
      ).rejects.toThrow(/ECONNREFUSED/);
    });

    it('definition create surfaces FK failure', async () => {
      const { service, prisma } = await buildDefinitionService();
      const err = new Prisma.PrismaClientKnownRequestError('FK', {
        code: 'P2003',
        clientVersion: '5.15.0',
      });
      prisma.orientationDefinition.create.mockRejectedValue(err);
      await expect(
        service.create({
          companyId: 1,
          title: 'X',
          type: 'company',
          createdByUserId: 1,
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });

    it('completion unique race replays via clientSyncId', async () => {
      const { service, prisma } = await buildCompletionService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        expiryRules: { durationDays: 30 },
      });
      prisma.worker.findUnique.mockResolvedValue({ id: 7 });
      prisma.orientationCompletion.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'existing',
          clientSyncId: 'sync-race',
          status: 'completed',
        });

      const uniqueErr = new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: '5.15.0',
        meta: { target: ['client_sync_id'] },
      });
      prisma.orientationCompletion.create.mockRejectedValue(uniqueErr);

      const row = await service.create({
        workerId: 7,
        orientationId: 'o1',
        companyId: 1,
        clientSyncId: 'sync-race',
        score: 90,
      });
      expect(row.id).toBe('existing');
    });

    it('completion unique without clientSyncId becomes ConflictException', async () => {
      const uniqueErr = new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: '5.15.0',
      });
      await expect(
        replayOrConflict(uniqueErr, async () => null),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('non-unique prisma error is rethrown by replayOrConflict', async () => {
      await expect(
        replayOrConflict(new Error('disk full'), async () => null),
      ).rejects.toThrow(/disk full/);
    });

    it('audit failure after create propagates (no compensating delete)', async () => {
      const { service, prisma, auditLog } = await buildDefinitionService();
      prisma.orientationDefinition.create.mockResolvedValue({
        id: 'def-1',
        companyId: 1,
        type: 'company',
        contentMode: 'native',
      });
      auditLog.logAudit.mockRejectedValue(new Error('audit store down'));
      await expect(
        service.create({
          companyId: 1,
          title: 'X',
          type: 'company',
          createdByUserId: 1,
        }),
      ).rejects.toThrow(/audit store down/);
    });
  });

  describe('external / AI failure & empty inputs', () => {
    it('AI generateFromText with empty text still returns blocks (no hard fail)', async () => {
      const ai = new OrientationAiGenerateService();
      const result = await ai.generateFromText({
        companyId: 1,
        text: '',
      });
      expect(result.contentBlocks.length).toBeGreaterThan(0);
      expect(result.metadata.stub).toBe(true);
    });

    it('AI generateFromText does not throw on huge input (truncates body)', async () => {
      const ai = new OrientationAiGenerateService();
      const huge = 'x'.repeat(50_000);
      const result = await ai.generateFromText({
        companyId: 1,
        text: huge,
      });
      expect(result.contentBlocks[0]!.body!.length).toBeLessThanOrEqual(4000);
    });
  });

  describe('concurrency / race conditions', () => {
    it('idempotent pre-check returns same completion for duplicate clientSyncId', async () => {
      const { service, prisma } = await buildCompletionService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        expiryRules: {},
      });
      prisma.worker.findUnique.mockResolvedValue({ id: 7 });
      prisma.orientationCompletion.findUnique.mockResolvedValue({
        id: 'c-existing',
        clientSyncId: 'same',
      });

      const a = await service.create({
        workerId: 7,
        orientationId: 'o1',
        companyId: 1,
        clientSyncId: 'same',
      });
      const b = await service.create({
        workerId: 7,
        orientationId: 'o1',
        companyId: 1,
        clientSyncId: 'same',
      });
      expect(a.id).toBe('c-existing');
      expect(b.id).toBe('c-existing');
      expect(prisma.orientationCompletion.create).not.toHaveBeenCalled();
    });

    it('parallel create without clientSyncId has no dedupe guard (documented gap)', async () => {
      const { service, prisma } = await buildCompletionService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        expiryRules: {},
      });
      prisma.worker.findUnique.mockResolvedValue({ id: 7 });
      prisma.orientationCompletion.findUnique.mockResolvedValue(null);
      prisma.orientationCompletion.create
        .mockResolvedValueOnce({ id: 'c1', status: 'completed' })
        .mockResolvedValueOnce({ id: 'c2', status: 'completed' });

      const [r1, r2] = await Promise.all([
        service.create({
          workerId: 7,
          orientationId: 'o1',
          companyId: 1,
          score: 100,
        }),
        service.create({
          workerId: 7,
          orientationId: 'o1',
          companyId: 1,
          score: 100,
        }),
      ]);
      // Gap: both succeed with different ids — no unique on (worker, orientation, status)
      expect(r1.id).not.toBe(r2.id);
      expect(prisma.orientationCompletion.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('out-of-order / invalid state transitions', () => {
    it('cannot require unpublished orientation', async () => {
      const { service, prisma } = await buildRequirementService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        isPublished: false,
      });
      await expect(
        service.create(
          {
            orientationId: 'o1',
            companyId: 1,
            mustCompleteBefore: 'arrival',
          },
          { id: 1 },
        ),
      ).rejects.toThrow(/Only published/);
    });

    it('cannot deliver unpublished orientation', async () => {
      const { service, prisma } = await buildDeliveryService();
      prisma.orientationDefinition.findUnique.mockResolvedValue({
        id: 'o1',
        companyId: 1,
        isPublished: false,
        title: 'D',
        version: '1.0',
      });
      await expect(
        service.assign({
          workerId: 1,
          orientationId: 'o1',
          companyId: 1,
          assignedById: 1,
        }),
      ).rejects.toThrow(/Only published/);
    });

    it('profile without company context returns warning gating (soft fail)', async () => {
      const { service, prisma } = await buildProfileService();
      prisma.worker.findUnique.mockResolvedValue({
        id: 7,
        companyId: null,
        projectAssignments: [],
      });
      const profile = await service.getProfile(7);
      expect(profile.gatingStatus).toBe('warning');
      expect(profile.reason).toMatch(/no company/);
    });
  });
});

/* ─── test module builders ─────────────────────────────────────────────── */

async function buildDefinitionService() {
  const prisma = {
    orientationDefinition: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OrientationDefinitionService,
      { provide: PrismaService, useValue: prisma },
      { provide: AuditLogService, useValue: auditLog },
    ],
  }).compile();
  return {
    service: module.get(OrientationDefinitionService),
    prisma,
    auditLog,
  };
}

async function buildRequirementService() {
  const prisma = {
    orientationDefinition: { findUnique: jest.fn() },
    orientationRequirement: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    worker: { findUnique: jest.fn() },
  };
  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OrientationRequirementService,
      { provide: PrismaService, useValue: prisma },
      { provide: AuditLogService, useValue: auditLog },
    ],
  }).compile();
  return {
    service: module.get(OrientationRequirementService),
    prisma,
  };
}

async function buildCompletionService() {
  const prisma = {
    orientationDefinition: { findUnique: jest.fn() },
    worker: { findUnique: jest.fn() },
    orientationCompletion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OrientationCompletionService,
      { provide: PrismaService, useValue: prisma },
      { provide: AuditLogService, useValue: auditLog },
    ],
  }).compile();
  return {
    service: module.get(OrientationCompletionService),
    prisma,
  };
}

async function buildDeliveryService() {
  const prisma = {
    orientationDefinition: { findUnique: jest.fn() },
    worker: { findUnique: jest.fn() },
    orientationDeliveryLink: { upsert: jest.fn() },
  };
  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OrientationDeliveryService,
      { provide: PrismaService, useValue: prisma },
      { provide: AuditLogService, useValue: auditLog },
    ],
  }).compile();
  return {
    service: module.get(OrientationDeliveryService),
    prisma,
  };
}

async function buildProfileService() {
  const prisma = { worker: { findUnique: jest.fn() } };
  const requirements = { resolveForWorker: jest.fn().mockResolvedValue([]) };
  const completions = { list: jest.fn().mockResolvedValue([]) };
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      WorkerOrientationProfileService,
      { provide: PrismaService, useValue: prisma },
      { provide: OrientationRequirementService, useValue: requirements },
      { provide: OrientationCompletionService, useValue: completions },
    ],
  }).compile();
  return {
    service: module.get(WorkerOrientationProfileService),
    prisma,
  };
}
