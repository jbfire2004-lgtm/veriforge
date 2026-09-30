import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from './phase1-test-app';
import { assertPhase1DbSchema } from './phase1-db-guard';
import { ensurePhase1JwtToken } from './phase1-auth';
import { seedPhase1Minimal } from './phase1-seed';
import {
  getCoreUploadConfig,
  getCoreVerificationTraining,
  getTrainingIngestionRun,
  postCoreUploadComplete,
  postCoreUploadMultipart,
  postCoreUploadPresign,
  postCoreVerificationComplete,
  postTrainingIngestionUpload,
} from './upload-helpers';

describe('Phase 1 Golden Path (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let phase1Bearer: string;
  let phase1ActorUserId: number;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL must be set to run Phase 1 integration tests',
      );
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);
    await assertPhase1DbSchema(prisma);
    const auth = await ensurePhase1JwtToken(app, prisma);
    phase1Bearer = auth.token;
    phase1ActorUserId = auth.userId;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/v1/core/uploads/config matches API contract', async () => {
    const res = await getCoreUploadConfig(app, phase1Bearer);
    const body = res.body as {
      mode: string;
      maxBytes: number;
      allowedMimeTypes: string[];
    };
    expect(body).toHaveProperty('mode');
    expect(body).toHaveProperty('maxBytes');
    expect(Array.isArray(body.allowedMimeTypes)).toBe(true);
    expect(body.allowedMimeTypes.length).toBeGreaterThan(0);
  });

  it('full path: multipart upload → ingestion JSON → verification GET → complete (attestation + audits)', async () => {
    const seed = await seedPhase1Minimal(prisma);
    try {
      // --- Core multipart upload (local mode expected in dev) ---
      const uploadCfg = (await getCoreUploadConfig(app, phase1Bearer)).body as {
        mode: string;
      };
      if (uploadCfg.mode === 'direct') {
        // Multipart rejected in direct mode
        await postCoreUploadMultipart(
          app,
          Buffer.from('hello'),
          'note.txt',
          'text/plain',
          undefined,
          phase1Bearer,
        ).expect(400);
      } else {
        const allowed = (await getCoreUploadConfig(app, phase1Bearer)).body
          .allowedMimeTypes as string[];
        const mime = allowed.includes('application/json')
          ? 'application/json'
          : allowed[0];
        const up = await postCoreUploadMultipart(
          app,
          Buffer.from(JSON.stringify({ ping: true })),
          'phase1-meta.json',
          mime,
          'phase1-test',
          phase1Bearer,
        );
        if (mime === 'application/json') {
          expect([200, 201]).toContain(up.status);
          expect(up.body).toHaveProperty('id');
          expect(up.body).toHaveProperty('storage');
          expect(up.body).toHaveProperty('status');
        }
      }

      // --- Ingestion ---
      const row = {
        workerId: seed.worker.id,
        certificationId: seed.certification.id,
        issuedAt: '2025-06-01T00:00:00.000Z',
        expiresAt: '2027-06-01T00:00:00.000Z',
      };
      const ingestRes = await postTrainingIngestionUpload(
        app,
        Buffer.from(JSON.stringify(row), 'utf8'),
        'training.json',
        'application/json',
        seed.company.id,
        undefined,
        phase1Bearer,
      ).expect(201);

      const run = ingestRes.body as { id: number; status: string };
      expect(run.status).toBe('COMPLETED');

      const runDetail = await getTrainingIngestionRun(
        app,
        run.id,
        phase1Bearer,
      ).expect(200);
      expect(runDetail.body.id).toBe(run.id);
      expect(runDetail.body.company).toBeDefined();

      const summary = runDetail.body.resultSummary as
        | { recordIds?: number[] }
        | undefined;
      const recordIds = summary?.recordIds ?? [];
      expect(recordIds.length).toBeGreaterThan(0);
      const trainingRecordId = recordIds[0];

      const trRow = await prisma.trainingRecord.findUnique({
        where: { id: trainingRecordId },
        select: { ingestionRunId: true },
      });
      expect(trRow?.ingestionRunId).toBe(run.id);

      // --- Verification fetch ---
      const verRes = await getCoreVerificationTraining(
        app,
        trainingRecordId,
      ).expect(200);
      const ver = verRes.body as {
        trainingRecordId: number;
        overallStatus: string;
        checks: Record<string, unknown>;
      };
      expect(ver.trainingRecordId).toBe(trainingRecordId);
      expect(ver.overallStatus).toBeDefined();
      expect(ver.checks).toBeDefined();

      const auditsAfterVerify = await prisma.auditLog.findMany({
        where: {
          action: 'verification.run',
          entityId: trainingRecordId,
        },
        orderBy: { id: 'desc' },
        take: 1,
      });
      expect(auditsAfterVerify.length).toBe(1);

      // --- Complete ---
      const completeRes = await postCoreVerificationComplete(
        app,
        trainingRecordId,
        phase1Bearer,
      ).expect(201);
      expect(completeRes.body).toEqual({ ok: true });

      const attestations = await prisma.trainingAttestation.findMany({
        where: { trainingRecordId },
      });
      expect(attestations.length).toBeGreaterThanOrEqual(1);
      expect(attestations[0].attestedByWorkerId).toBe(seed.worker.id);

      const completedAudits = await prisma.auditLog.findMany({
        where: {
          OR: [
            { action: 'training_verification.completed' },
            { action: 'verification.event' },
          ],
          entityId: trainingRecordId,
        },
      });
      expect(
        completedAudits.some(
          (a) => a.action === 'training_verification.completed',
        ),
      ).toBe(true);
      expect(
        completedAudits.some((a) => a.action === 'verification.event'),
      ).toBe(true);
      const primaryComplete = completedAudits.find(
        (a) => a.action === 'training_verification.completed',
      );
      expect(primaryComplete?.userId).toBe(phase1ActorUserId);
    } finally {
      await seed.cleanup();
    }
  });

  it('presign + complete contract: local mode returns 400; direct mode requires S3 (skipped if not direct)', async () => {
    const cfg = (await getCoreUploadConfig(app, phase1Bearer)).body as {
      mode: string;
    };
    if (cfg.mode !== 'direct') {
      const res = await postCoreUploadPresign(
        app,
        {
          filename: 'x.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
        },
        phase1Bearer,
      );
      expect(res.status).toBe(400);
      const err =
        typeof res.body.error === 'string'
          ? res.body.error
          : JSON.stringify(res.body.error);
      expect(err.toLowerCase()).toMatch(/direct/);
      return;
    }
    if (!process.env.RUN_PHASE1_S3_TESTS) {
      console.warn(
        'Skipping S3 presign/complete: set RUN_PHASE1_S3_TESTS=1 and AWS env',
      );
      return;
    }
    const presign = await postCoreUploadPresign(
      app,
      {
        filename: 'phase1-direct.bin',
        mimeType: 'application/pdf',
        sizeBytes: 10,
      },
      phase1Bearer,
    );
    expect([200, 201, 503]).toContain(presign.status);
    if (presign.status >= 400) return;
    const { id } = presign.body as { id: number };
    const done = await postCoreUploadComplete(app, id, phase1Bearer).expect(
      200,
    );
    expect(done.body).toHaveProperty('id', id);
  });
});
