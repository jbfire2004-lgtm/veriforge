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
const assigneeId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const hazardId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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

describe('corrective-action integration', () => {
  let capaId: string;
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
    await prisma.correctiveActionOfflineSync.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.correctiveActionModuleLink.deleteMany({}).catch(() => undefined);
    await prisma.correctiveActionAttachment.deleteMany({}).catch(() => undefined);
    await prisma.correctiveActionVerification.deleteMany({}).catch(() => undefined);
    await prisma.correctiveActionEscalation.deleteMany({}).catch(() => undefined);
    await prisma.correctiveActionAssignment.deleteMany({}).catch(() => undefined);
    await prisma.correctiveAction.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /corrective-action creates CAPA', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/corrective-action')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        source_type: 'jha',
        source_id: 'jha-001',
        action_type: 'permanent',
        title: 'Install guardrails',
        severity: 'high',
        hazard_id: hazardId,
        module_links: [{ moduleType: 'jha', linkedId: hazardId }],
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('open');
    expect(res.body.priority).toBe('high');
    capaId = res.body.id;
  });

  it('POST /corrective-action/assign assigns worker', async () => {
    if (!dbAvailable || !capaId) return;

    const res = await request(app)
      .post('/corrective-action/assign')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        corrective_action_id: capaId,
        assignee_id: assigneeId,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('assigned');
    expect(res.body.assignments.length).toBe(1);
  });

  it('POST /corrective-action/escalate escalates CAPA', async () => {
    if (!dbAvailable || !capaId) return;

    const res = await request(app)
      .post('/corrective-action/escalate')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        corrective_action_id: capaId,
        level: 2,
        reason: 'Overdue review',
      });

    expect(res.status).toBe(200);
    expect(res.body.escalationLevel).toBe(2);
  });

  it('POST /corrective-action/verify verifies CAPA', async () => {
    if (!dbAvailable || !capaId) return;

    const res = await request(app)
      .post('/corrective-action/verify')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        corrective_action_id: capaId,
        notes: 'Guardrails installed and inspected',
        outcome: 'approved',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('verified');
  });

  it('GET /corrective-action/:id returns full record', async () => {
    if (!dbAvailable || !capaId) return;

    const res = await request(app)
      .get(`/corrective-action/${capaId}`)
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.moduleLinks.length).toBeGreaterThan(0);
    expect(res.body.verifications.length).toBe(1);
  });

  it('POST /corrective-action/offline/sync processes batch', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/corrective-action/offline/sync')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        device_id: 'device-capa-001',
        batch_id: 'batch-001',
        actions: [
          {
            clientSyncId: 'sync-capa-001',
            action: 'create',
            payload: {
              project_id: projectId,
              source_type: 'inspection',
              source_id: 'insp-001',
              title: 'Offline CAPA',
              severity: 'medium',
            },
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.synced).toBe(1);
  });
});
