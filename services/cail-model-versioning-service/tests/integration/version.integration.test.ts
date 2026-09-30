import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();
const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const userId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const token = jwt.sign(
  { user_id: userId, company_id: companyId, roles: ['admin'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('versioning integration', () => {
  let dbAvailable = false;
  let versionId: string;

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
    await prisma.modelPromotionHistory.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.modelVersion.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('registers model version', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/cail/version')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        model_id: 'risk_model_v1',
        version: '1.0.0',
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
    versionId = res.body.id;
  });

  it('promotes draft to staging', async () => {
    if (!dbAvailable || !versionId) return;
    const res = await request(app)
      .post('/cail/version/promote')
      .set('Authorization', `Bearer ${token}`)
      .send({ company_id: companyId, version_id: versionId });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('staging');
  });
});
