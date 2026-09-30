import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from './phase1-test-app';
import { assertPhase1DbSchema } from './phase1-db-guard';
import { ensurePhase1JwtToken } from './phase1-auth';
import { seedPhase1Minimal } from './phase1-seed';
import {
  getCoreUploadConfig,
  postCoreUploadMultipart,
  postTrainingIngestionUpload,
  getTrainingIngestionRun,
} from './upload-helpers';

describe('Phase 1 edge cases (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let phase1Bearer: string;

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
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('training ingestion: unsupported MIME returns 400', async () => {
    const seed = await seedPhase1Minimal(prisma);
    try {
      const res = await postTrainingIngestionUpload(
        app,
        Buffer.from('x'),
        'bad.exe',
        'application/x-msdownload',
        seed.company.id,
        undefined,
        phase1Bearer,
      );
      expect(res.status).toBe(400);
      const err =
        typeof res.body.error === 'string'
          ? res.body.error
          : JSON.stringify(res.body.error);
      expect(err.toLowerCase()).toMatch(/unsupported|type/);
    } finally {
      await seed.cleanup();
    }
  });

  it('training ingestion: missing company returns 404', async () => {
    const fakeCompanyId = 9_999_999;
    const res = await postTrainingIngestionUpload(
      app,
      Buffer.from(
        JSON.stringify({
          workerId: 1,
          certificationId: 1,
          issuedAt: '2025-01-01T00:00:00.000Z',
          expiresAt: '2027-01-01T00:00:00.000Z',
        }),
      ),
      'x.json',
      'application/json',
      fakeCompanyId,
      undefined,
      phase1Bearer,
    );
    expect(res.status).toBe(404);
  });

  it('training ingestion: partial row failures — one valid row, one bad worker', async () => {
    const seed = await seedPhase1Minimal(prisma);
    try {
      const rows = [
        {
          workerId: seed.worker.id,
          certificationId: seed.certification.id,
          issuedAt: '2025-02-01T00:00:00.000Z',
          expiresAt: '2027-02-01T00:00:00.000Z',
        },
        {
          workerId: 9_999_999,
          certificationId: seed.certification.id,
          issuedAt: '2025-02-01T00:00:00.000Z',
          expiresAt: '2027-02-01T00:00:00.000Z',
        },
      ];
      const res = await postTrainingIngestionUpload(
        app,
        Buffer.from(JSON.stringify({ rows }), 'utf8'),
        'partial.json',
        'application/json',
        seed.company.id,
        undefined,
        phase1Bearer,
      ).expect(201);

      const runId = (res.body as { id: number }).id;
      const detail = await getTrainingIngestionRun(
        app,
        runId,
        phase1Bearer,
      ).expect(200);
      const body = detail.body as {
        status: string;
        resultSummary?: { created?: number; errors?: unknown[] };
        validationErrors?: unknown;
      };
      expect(body.status).toBe('COMPLETED');
      const summary = body.resultSummary as
        | { created?: number; errors?: { length?: number } }
        | undefined;
      expect(summary?.created).toBe(1);
      expect(
        Array.isArray(summary?.errors) ? summary.errors.length : 0,
      ).toBeGreaterThan(0);
    } finally {
      await seed.cleanup();
    }
  });

  it('training ingestion: duplicate upload creates another run and another record (no server dedup)', async () => {
    const seed = await seedPhase1Minimal(prisma);
    try {
      const row = {
        workerId: seed.worker.id,
        certificationId: seed.certification.id,
        issuedAt: '2025-03-01T00:00:00.000Z',
        expiresAt: '2027-03-01T00:00:00.000Z',
      };
      const buf = Buffer.from(JSON.stringify(row), 'utf8');
      const r1 = await postTrainingIngestionUpload(
        app,
        buf,
        'dup.json',
        'application/json',
        seed.company.id,
        undefined,
        phase1Bearer,
      ).expect(201);
      const r2 = await postTrainingIngestionUpload(
        app,
        buf,
        'dup.json',
        'application/json',
        seed.company.id,
        undefined,
        phase1Bearer,
      ).expect(201);
      expect((r1.body as { id: number }).id).not.toBe(
        (r2.body as { id: number }).id,
      );
      const count = await prisma.trainingRecord.count({
        where: { workerId: seed.worker.id },
      });
      expect(count).toBe(2);
    } finally {
      await seed.cleanup();
    }
  });

  it('core upload: disallowed MIME rejected (when not in direct mode)', async () => {
    const cfg = (await getCoreUploadConfig(app, phase1Bearer)).body as {
      mode: string;
    };
    if (cfg.mode === 'direct') {
      return;
    }
    const res = await postCoreUploadMultipart(
      app,
      Buffer.from('%PDF'),
      'x.pdf',
      'application/octet-stream',
      undefined,
      phase1Bearer,
    );
    expect(res.status).toBe(400);
    const err =
      typeof res.body.error === 'string'
        ? res.body.error
        : JSON.stringify(res.body.error);
    expect(err.toLowerCase()).toMatch(/not allowed|type/);
  });
});
