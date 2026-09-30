import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();
const companyId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const userId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const token = jwt.sign(
  { user_id: userId, company_id: companyId, roles: ['admin'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('drift integration', () => {
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
    await prisma.driftEvent.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.driftReport.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.alertThreshold.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('detects drift and emits cail.drift.detected event', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/cail/drift/detect')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        model_id: 'risk_model_v1',
        baseline_stats: { score: { mean: 0.5, std: 0.1, count: 1000 } },
        current_stats: { score: { mean: 0.9, std: 0.1, count: 1000 } },
      });
    expect(res.status).toBe(201);
    expect(res.body.drift_detected).toBe(true);

    const report = await request(app)
      .get(`/cail/drift/reports/${res.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ company_id: companyId });
    expect(report.body.events.some((e: { event_type: string }) => e.event_type === 'cail.drift.detected')).toBe(true);
  });
});
