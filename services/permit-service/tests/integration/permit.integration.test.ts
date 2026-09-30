import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const projectId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const userId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const workerId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const jhaId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const hazardId = '11111111-1111-1111-1111-111111111111';
const controlId = '22222222-2222-2222-2222-222222222222';
const equipmentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const workerToken = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['worker'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

const supervisorToken = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('permit integration', () => {
  let permitId: string;
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
    await prisma.permitOfflineSync.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.permitSafetyRequirement.deleteMany({}).catch(() => undefined);
    await prisma.permitApproval.deleteMany({}).catch(() => undefined);
    await prisma.workPermit.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /permit creates work permit', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/permit')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        permit_type: 'hot_work',
        title: 'Welding bay hot work',
        worker_id: workerId,
        jha_id: jhaId,
        hazard_id: hazardId,
        control_id: controlId,
        equipment_id: equipmentId,
        valid_from: new Date().toISOString(),
        valid_to: new Date(Date.now() + 86_400_000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
    expect(res.body.permitType).toBe('hot_work');
    permitId = res.body.id;
  });

  it('POST /pm/permit/:id/request-approval moves to pending', async () => {
    if (!dbAvailable || !permitId) return;

    const res = await request(app)
      .post(`/pm/permit/${permitId}/request-approval`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending_approval');
  });

  it('GET /permit/:id/safety-gate evaluates requirements', async () => {
    if (!dbAvailable || !permitId) return;

    const res = await request(app)
      .get(`/permit/${permitId}/safety-gate`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.checks).toBeInstanceOf(Array);
    expect(res.body.checks.length).toBeGreaterThan(0);
  });

  it('POST /permit/:id/approve rejected returns to draft', async () => {
    if (!dbAvailable || !permitId) return;

    await prisma.workPermit.update({
      where: { id: permitId },
      data: { status: 'pending_approval' },
    });

    const res = await request(app)
      .post(`/permit/${permitId}/approve`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        outcome: 'rejected',
        notes: 'Needs additional hazard review',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('draft');
  });

  it('GET /permit/:id returns full record', async () => {
    if (!dbAvailable || !permitId) return;

    const res = await request(app)
      .get(`/permit/${permitId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(permitId);
    expect(res.body.allowedTransitions).toBeInstanceOf(Array);
  });

  it('POST /permit/offline/sync processes batch', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/permit/offline/sync')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        device_id: 'device-permit-001',
        batch_id: 'batch-001',
        actions: [
          {
            clientSyncId: 'sync-permit-001',
            action: 'create',
            payload: {
              project_id: projectId,
              permit_type: 'general',
              title: 'Offline permit',
              worker_id: workerId,
              jha_id: jhaId,
              hazard_id: hazardId,
              control_id: controlId,
              equipment_id: equipmentId,
            },
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.synced).toBe(1);
  });
});
