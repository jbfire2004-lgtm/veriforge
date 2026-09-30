import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const projectId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const workerId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const equipmentId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

const token = jwt.sign(
  { sub: 'cail-1', user_id: 'cail-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('cail prediction integration', () => {
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch {
      console.warn('DB unavailable — skipping integration tests');
    }
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    await prisma.cailPrediction.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /cail/predict stores incident likelihood', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/predict')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        prediction_type: 'incident_likelihood',
        entity_type: 'worker',
        entity_id: workerId,
        worker_id: workerId,
        project_id: projectId,
        signals: {
          worker_score: 45,
          open_capa: 2,
          sif_exposures: 1,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.prediction.predictionType).toBe('incident_likelihood');
    expect(res.body.prediction.predictionValue).toBeGreaterThan(0);
    expect(res.body.prediction.confidence).toBeGreaterThan(0);
    expect(res.body.modelKey).toBe('deterministic_rules_v1');
  });

  it('POST /cail/predict batch stores multiple types', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/predict')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        entity_type: 'equipment',
        entity_id: equipmentId,
        equipment_id: equipmentId,
        prediction_types: ['equipment_failure', 'capa_overdue'],
        signals: {
          failures_90d: 1,
          open_capa: 1,
          overdue_count: 2,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.predictions).toHaveLength(2);
  });

  it('GET /cail/predict/:entity_type/:id returns predictions', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/cail/predict/worker/${workerId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.predictions.length).toBeGreaterThan(0);
  });

  it('GET with prediction_type filter returns single prediction', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/cail/predict/worker/${workerId}`)
      .query({ company_id: companyId, prediction_type: 'incident_likelihood' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.predictions).toHaveLength(1);
    expect(res.body.predictions[0].predictionType).toBe('incident_likelihood');
  });
});
