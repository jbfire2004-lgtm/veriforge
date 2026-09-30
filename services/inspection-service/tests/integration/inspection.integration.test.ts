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
const equipmentId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

const workerToken = jwt.sign(
  { sub: userId, user_id: userId, company_id: companyId, roles: ['worker'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('inspection integration', () => {
  let inspectionId: string;
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
    await prisma.inspectionOfflineSync.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.inspectionFinding.deleteMany({}).catch(() => undefined);
    await prisma.inspection.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /inspection creates inspection', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/inspection')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        checklist_type: 'equipment',
        title: 'Daily equipment walkthrough',
        equipment_id: equipmentId,
        checklist_items: [
          { key: 'guards', label: 'Machine guards', weight: 1 },
          { key: 'brakes', label: 'Brake test', weight: 2, critical: true },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
    inspectionId = res.body.id;
  });

  it('GET /inspection lists by project', async () => {
    if (!dbAvailable || !inspectionId) return;

    const res = await request(app)
      .get('/inspection')
      .query({ company_id: companyId, project_id: projectId })
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('POST /inspection/:id/findings submits findings', async () => {
    if (!dbAvailable || !inspectionId) return;

    const res = await request(app)
      .post(`/inspection/${inspectionId}/findings`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        auto_create_capa: false,
        findings: [
          { item_key: 'guards', finding_type: 'pass' },
          { item_key: 'brakes', finding_type: 'pass' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('submitted');
    expect(res.body.score).toBe(100);
  });

  it('POST /inspection/:id/safety-gate evaluates gates', async () => {
    if (!dbAvailable || !inspectionId) return;

    const res = await request(app)
      .post(`/inspection/${inspectionId}/safety-gate`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
  });

  it('POST /inspection/:id/complete completes inspection', async () => {
    if (!dbAvailable || !inspectionId) return;

    const res = await request(app)
      .post(`/inspection/${inspectionId}/complete`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('passed');
  });

  it('GET /inspection/:id returns full record', async () => {
    if (!dbAvailable || !inspectionId) return;

    const res = await request(app)
      .get(`/inspection/${inspectionId}`)
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.findings.length).toBe(2);
  });

  it('POST /inspection/offline/sync processes batch', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/inspection/offline/sync')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        device_id: 'device-insp-001',
        batch_id: 'batch-001',
        actions: [
          {
            clientSyncId: 'sync-insp-001',
            action: 'create',
            payload: {
              project_id: projectId,
              checklist_type: 'general',
              title: 'Offline inspection',
              checklist_items: [{ key: 'walkway', label: 'Clear walkway' }],
            },
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.synced).toBe(1);
  });
});
