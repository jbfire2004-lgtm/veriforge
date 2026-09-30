import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const predictionId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const token = jwt.sign(
  { sub: 'cail-1', user_id: 'cail-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('cail explainability integration', () => {
  let explainabilityId: string;
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
    await prisma.cailExplainability.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /cail/explain creates prediction explanation', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/explain')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        target_type: 'prediction',
        prediction_id: predictionId,
        prediction_type: 'incident_likelihood',
        probability: 0.38,
        factors: ['low_worker_safety_score', 'multiple_open_capa'],
        confidence: 0.86,
        evidence: ['worker_profile', 'capa_module'],
      });

    expect(res.status).toBe(201);
    explainabilityId = res.body.explainability.id;
    expect(res.body.explainability.predictionId).toBe(predictionId);
    expect(res.body.explainability.contributingData.confidence).toBe(0.86);
    expect(res.body.explainability.explanationText).toContain('Confidence');
  });

  it('POST /cail/explain creates score explanation', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/explain')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        target_type: 'score',
        score_type: 'project_safety',
        score_value: 55,
        components: [{ key: 'overdue_capa', weight: 0.3, value: 3, deduction: 24 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.explainability.contributingData.targetType).toBe('score');
  });

  it('GET /cail/explain/:prediction_id returns stored explanation', async () => {
    if (!dbAvailable || !predictionId) return;

    const res = await request(app)
      .get(`/cail/explain/${predictionId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.explainability.predictionId).toBe(predictionId);
  });

  it('GET by explainability id fallback', async () => {
    if (!dbAvailable || !explainabilityId) return;

    const res = await request(app)
      .get(`/cail/explain/${explainabilityId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.explainability.id).toBe(explainabilityId);
  });
});
