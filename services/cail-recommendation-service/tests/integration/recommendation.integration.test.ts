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

const token = jwt.sign(
  { sub: 'cail-1', user_id: 'cail-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('cail recommendation integration', () => {
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
    await prisma.cailRecommendation.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /cail/recommend generates and stores recommendations', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        entity_type: 'project',
        entity_id: projectId,
        project_id: projectId,
        context: {
          overdue_capa: 2,
          critical_hazards: 1,
          schedule_conflicts: 1,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.recommendations[0].recommendationText).toBeTruthy();
    expect(res.body.recommendations[0].evidence.requiredActions.length).toBeGreaterThan(0);
  });

  it('POST /cail/recommend with single type filters output', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        recommendation_type: 'training',
        entity_type: 'worker',
        entity_id: workerId,
        worker_id: workerId,
        context: { training_expired: 1 },
      });

    expect(res.status).toBe(201);
    expect(res.body.recommendations.every((r: { recommendationType: string }) => r.recommendationType === 'training')).toBe(true);
  });

  it('GET /cail/recommend/:entity_type/:id returns recommendations', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/cail/recommend/project/${projectId}`)
      .query({ company_id: companyId, latest_per_type: 'true' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recommendations.length).toBeGreaterThan(0);
  });
});
