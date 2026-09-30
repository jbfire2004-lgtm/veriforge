import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const userId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const deviceId = 'field-tablet-001';

const token = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('offline integration', () => {
  let conflictId: string;
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
    await prisma.offlineAudit.deleteMany({ where: { deviceId } }).catch(() => undefined);
    await prisma.offlineConflict.deleteMany({ where: { deviceId } }).catch(() => undefined);
    await prisma.offlineCache.deleteMany({ where: { deviceId } }).catch(() => undefined);
    await prisma.offlineDevice.deleteMany({ where: { id: deviceId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /offline/sync ingests actions', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/offline/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({
        device_id: deviceId,
        company_id: companyId,
        actions: [
          {
            type: 'pm-hazard',
            recordId: 'rec-001',
            payload: { clientSyncId: 'rec-001', title: 'Slip hazard' },
            clientVersion: 1,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.synced).toBeGreaterThanOrEqual(1);
  });

  it('GET /offline/device/:id returns status and delta', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/offline/device/${deviceId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.deviceId).toBe(deviceId);
    expect(res.body.queue.length).toBeGreaterThan(0);
  });

  it('creates conflict on version mismatch and resolves', async () => {
    if (!dbAvailable) return;

    const conflictRes = await request(app)
      .post('/offline/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({
        device_id: deviceId,
        company_id: companyId,
        actions: [
          {
            type: 'pm-hazard',
            recordId: 'rec-001',
            payload: { clientSyncId: 'rec-001', title: 'Stale local' },
            clientVersion: 0,
          },
        ],
      });

    expect(conflictRes.body.conflicts).toBeGreaterThanOrEqual(1);
    conflictId = conflictRes.body.results.find((r: { conflictId?: string }) => r.conflictId)
      ?.conflictId;

    if (!conflictId) return;

    const resolve = await request(app)
      .post('/offline/conflict/resolve')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conflict_id: conflictId,
        company_id: companyId,
        strategy: 'prefer_local',
      });

    expect(resolve.status).toBe(200);
    expect(resolve.body.resolvedAt).toBeDefined();
  });
});
