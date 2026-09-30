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
  { sub: 'rt-1', user_id: 'rt-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('cail realtime integration', () => {
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
    await prisma.cailInferenceLog.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /cail/realtime/predict returns prediction with latency', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/realtime/predict')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        worker_id: workerId,
        signals: { profile_score: 45, overdue_capa: 1, sif_exposures: 1 },
      });

    expect(res.status).toBe(200);
    expect(res.body.prediction.predictionType).toBe('incident_likelihood');
    expect(res.body.latencyMs).toBeGreaterThanOrEqual(0);
    expect(res.body.modelKey).toBe('deterministic_rules_v1');
  });

  it('POST /cail/realtime/score returns worker score', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/realtime/score')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        score_type: 'worker_safety',
        signals: { profile_score: 70, overdue_capa: 2 },
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBeLessThan(70);
  });

  it('POST /cail/realtime/gate blocks unsafe worker for site access', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/cail/realtime/gate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        worker_id: workerId,
        use_case: 'site_access',
        signals: {
          profile_score: 35,
          overdue_capa: 1,
          worker_critical_capa: 1,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.gate.allowed).toBe(false);
    expect(res.body.gate.blocks.workerAccess).toBe(true);
    expect(res.body.latencyMs).toBeDefined();

    const logs = await prisma.cailInferenceLog.count({ where: { companyId, engineLayer: 'realtime_gate' } });
    expect(logs).toBeGreaterThan(0);
  });
});
