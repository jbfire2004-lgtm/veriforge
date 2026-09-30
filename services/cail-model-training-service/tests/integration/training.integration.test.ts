import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();
const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const userId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const token = jwt.sign({ user_id: userId, company_id: companyId, roles: ['admin'] }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '1h' });

describe('training integration', () => {
  let dbAvailable = false;
  let jobId: string;

  beforeAll(async () => {
    try { await prisma.$connect(); await prisma.$queryRaw`SELECT 1`; dbAvailable = true; } catch { console.warn('DB unavailable'); }
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    await prisma.ingestionEventLog.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.modelArtifact.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.datasetReference.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.trainingJob.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('creates training job', async () => {
    if (!dbAvailable) return;
    const res = await request(app).post('/cail/train').set('Authorization', `Bearer ${token}`).send({
      company_id: companyId,
      name: 'Test job',
      model_type: 'classifier',
      datasets: [{ datasetId: 'ds-1', sourceType: 'ingestion' }],
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('queued');
    jobId = res.body.id;
  });

  it('accepts ingestion event stub', async () => {
    if (!dbAvailable) return;
    const res = await request(app).post('/cail/train/events').set('Authorization', `Bearer ${token}`).send({
      company_id: companyId,
      event_type: 'cail.ingest.completed',
      payload: { dataset_id: 'ds-2', model_type: 'regressor' },
    });
    expect(res.status).toBe(202);
    expect(res.body.accepted).toBe(true);
  });
});
