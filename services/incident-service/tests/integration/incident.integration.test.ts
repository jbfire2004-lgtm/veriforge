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

describe('incident integration', () => {
  let incidentId: string;
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
    await prisma.incidentOfflineSync.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.incidentCorrectiveActionLink.deleteMany({}).catch(() => undefined);
    await prisma.incidentInvestigation.deleteMany({}).catch(() => undefined);
    await prisma.incidentWitness.deleteMany({}).catch(() => undefined);
    await prisma.incident.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /incident reports incident', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/incident')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        incident_type: 'near_miss',
        title: 'Slip on wet deck',
        severity: 'medium',
        worker_id: workerId,
        occurred_at: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('reported');
    expect(res.body.incidentNumber).toMatch(/^INC-/);
    incidentId = res.body.id;
  });

  it('GET /incident lists incidents', async () => {
    if (!dbAvailable || !incidentId) return;

    const res = await request(app)
      .get('/incident')
      .set('Authorization', `Bearer ${workerToken}`)
      .query({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('POST /incident/:id/witnesses adds witness', async () => {
    if (!dbAvailable || !incidentId) return;

    const res = await request(app)
      .post(`/incident/${incidentId}/witnesses`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        name: 'Jane Witness',
        statement: 'Saw worker slip near ladder',
      });

    expect(res.status).toBe(201);
    expect(res.body.witnesses.length).toBe(1);
  });

  it('POST /incident/:id/investigate records investigation', async () => {
    if (!dbAvailable || !incidentId) return;

    const res = await request(app)
      .post(`/incident/${incidentId}/investigate`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        findings: 'Wet surface without signage',
        root_cause: 'Missing housekeeping procedure',
        method: 'five_why',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('investigated');
    expect(res.body.investigations.length).toBe(1);
  });

  it('POST /incident/:id/link-corrective-actions links CAPA id', async () => {
    if (!dbAvailable || !incidentId) return;

    const capaId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const res = await request(app)
      .post(`/incident/${incidentId}/link-corrective-actions`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        corrective_action_ids: [capaId],
      });

    expect(res.status).toBe(200);
    expect(res.body.correctiveActionLinks.length).toBe(1);
  });

  it('POST /incident/:id/close closes incident', async () => {
    if (!dbAvailable || !incidentId) return;

    const res = await request(app)
      .post(`/incident/${incidentId}/close`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        close_notes: 'Signage installed and surface dried',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });

  it('GET /incident/:id returns full record', async () => {
    if (!dbAvailable || !incidentId) return;

    const res = await request(app)
      .get(`/incident/${incidentId}`)
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.witnesses.length).toBe(1);
    expect(res.body.investigations.length).toBe(1);
  });

  it('POST /incident/offline/sync processes batch', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/incident/offline/sync')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        device_id: 'device-inc-001',
        batch_id: 'batch-001',
        actions: [
          {
            clientSyncId: 'sync-inc-001',
            action: 'report',
            payload: {
              project_id: projectId,
              incident_type: 'hazard_observation',
              title: 'Offline incident',
              severity: 'low',
            },
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.synced).toBe(1);
  });
});
