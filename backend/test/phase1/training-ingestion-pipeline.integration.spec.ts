import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { OcrFieldExtractorService } from '../../src/training-ingestion/ocr-field-extractor.service';
import { createPhase1TestApp } from './phase1-test-app';
import { assertPhase1DbSchema } from './phase1-db-guard';
import { ensurePhase1JwtToken } from './phase1-auth';
import { seedPhase1Minimal } from './phase1-seed';
import {
  getTrainingIngestionRun,
  postTrainingIngestionUpload,
} from './upload-helpers';
import { phase1Agent } from './upload-helpers';

describe('Training ingestion pipeline (Phase 1.5)', () => {
  const extractor = new OcrFieldExtractorService();
  let app: INestApplication;
  let prisma: PrismaService;
  let bearer: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL required for Phase 1.5 ingestion tests');
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);
    await assertPhase1DbSchema(prisma);
    bearer = (await ensurePhase1JwtToken(app, prisma)).token;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('extracts OCR fields from certificate-like text', () => {
    const fields = extractor.extract(
      'Trainee: Phase One Worker\nWHMIS\nExpiry: 12/31/2026',
    );
    expect(fields.certificationCode).toBe('WHMIS');
    expect(fields.expiresAt).toBe('12/31/2026');
  });

  it('upload → pending verification queue', async () => {
    const seed = await seedPhase1Minimal(prisma);
    try {
      const row = {
        workerId: seed.worker.id,
        certificationId: seed.certification.id,
        issuedAt: '2025-01-15T00:00:00.000Z',
        expiresAt: '2027-01-15T00:00:00.000Z',
      };
      const fileBody = JSON.stringify({ rows: [row] });
      const upload = await postTrainingIngestionUpload(
        app,
        Buffer.from(fileBody),
        'training-row.json',
        'application/json',
        seed.company.id,
        JSON.stringify({ rows: [row] }),
        bearer,
      );
      expect(upload.status).toBeLessThan(300);
      const runId = (upload.body as { id: number }).id;
      expect(runId).toBeGreaterThan(0);

      const runRes = await getTrainingIngestionRun(app, runId, bearer);
      expect(runRes.body).toHaveProperty('status');

      const queue = await phase1Agent(app)
        .get(
          `/api/v1/training-ingestion/verification-queue?companyId=${seed.company.id}`,
        )
        .set('Authorization', `Bearer ${bearer}`)
        .expect(200);
      expect(Array.isArray(queue.body)).toBe(true);
      expect((queue.body as unknown[]).length).toBeGreaterThan(0);
    } finally {
      await seed.cleanup();
    }
  });
});
