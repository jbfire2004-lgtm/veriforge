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
const hazardLibId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const controlLibId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

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

describe('jha integration', () => {
  let jhaId: string;
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
    await prisma.jhaOfflineSync.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.jhaVersion.deleteMany({}).catch(() => undefined);
    await prisma.jhaSignature.deleteMany({}).catch(() => undefined);
    await prisma.jhaControl.deleteMany({}).catch(() => undefined);
    await prisma.jhaHazard.deleteMany({}).catch(() => undefined);
    await prisma.jha.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /jha creates JHA', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/jha')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        title: 'Overhead work JHA',
        description: 'Electrical panel maintenance at height',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
    jhaId = res.body.id;
  });

  it('POST /jha/:id/hazards adds hazards with SIF scoring', async () => {
    if (!dbAvailable || !jhaId) return;

    const res = await request(app)
      .post(`/jha/${jhaId}/hazards`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        hazards: [{ hazard_id: hazardLibId, severity: 4, likelihood: 3 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.hazards.length).toBe(1);
    expect(res.body.score).toBeDefined();
    expect(res.body.version).toBe(2);
  });

  it('POST /jha/:id/controls maps controls', async () => {
    if (!dbAvailable || !jhaId) return;

    const res = await request(app)
      .post(`/jha/${jhaId}/controls`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        controls: [{ control_id: controlLibId, control_strength: 4 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.controls.length).toBe(1);
  });

  it('GET /jha/:id/score returns SIF/HECA score', async () => {
    if (!dbAvailable || !jhaId) return;

    const res = await request(app)
      .get(`/jha/${jhaId}/score`)
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.sifScore).toBeDefined();
    expect(res.body.hecaCategory).toBeDefined();
  });

  it('POST /jha/:id/sign records worker signature', async () => {
    if (!dbAvailable || !jhaId) return;

    const res = await request(app)
      .post(`/jha/${jhaId}/sign`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        signature_blob: 'data:image/png;base64,iVBORw0KGgo=',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending_approval');
    expect(res.body.signatures.length).toBe(1);
  });

  it('POST /jha/:id/approve supervisor approval', async () => {
    if (!dbAvailable || !jhaId) return;

    const res = await request(app)
      .post(`/jha/${jhaId}/approve`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({ company_id: companyId, approved: true });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
    expect(res.body.approvedBy).toBe(userId);
  });

  it('POST /jha/offline/sync processes offline batch', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/jha/offline/sync')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        device_id: 'device-test-001',
        batch_id: 'batch-001',
        actions: [
          {
            clientSyncId: 'sync-create-001',
            action: 'create_jha',
            payload: {
              project_id: projectId,
              title: 'Offline JHA',
              description: 'Created offline',
            },
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.synced).toBe(1);
    expect(res.body.results[0].ok).toBe(true);
  });
});
