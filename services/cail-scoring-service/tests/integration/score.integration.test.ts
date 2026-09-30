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

describe('cail scoring integration', () => {
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
    await prisma.cailScore.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /cail/score computes and stores worker safety score', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/score')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        score_type: 'worker_safety',
        entity_type: 'worker',
        entity_id: workerId,
        project_id: projectId,
        worker_id: workerId,
        signals: {
          profile_score: 85,
          overdue_capa: 1,
          denials_30d: 0,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.score.scoreType).toBe('worker_safety');
    expect(res.body.score.scoreValue).toBeGreaterThan(0);
    expect(res.body.score.contributingFactors.components.length).toBeGreaterThan(0);
  });

  it('POST /cail/score batch computes multiple score types', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/score')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        entity_type: 'project',
        entity_id: projectId,
        project_id: projectId,
        score_types: ['project_safety', 'emergency_readiness'],
        signals: {
          overdue_capa: 2,
          critical_hazards: 1,
          open_incidents: 0,
          closure_rate: 80,
          plan_completeness: 90,
          drill_recency_days: 120,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.scores).toHaveLength(2);
  });

  it('GET /cail/score/:entity_type/:id returns latest scores', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/cail/score/worker/${workerId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.scores.length).toBeGreaterThan(0);
    expect(res.body.entityType).toBe('worker');
  });

  it('GET /cail/score with score_type filter returns single score', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/cail/score/worker/${workerId}`)
      .query({ company_id: companyId, score_type: 'worker_safety' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.scores).toHaveLength(1);
    expect(res.body.scores[0].scoreType).toBe('worker_safety');
  });
});
