import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const projectId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const worker1 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const worker2 = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const worker3 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

const supervisorToken = jwt.sign(
  { sub: 'sup-1', user_id: 'sup-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

const workerToken = jwt.sign(
  { sub: 'w-1', user_id: 'w-1', company_id: companyId, roles: ['worker'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('emergency response integration', () => {
  let emergencyId: string;
  let sessionId: string;
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
    await prisma.emergencyNotification.deleteMany({}).catch(() => undefined);
    await prisma.musterAttendance.deleteMany({}).catch(() => undefined);
    await prisma.musterSession.deleteMany({}).catch(() => undefined);
    await prisma.emergencyEvent.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.emergencyPlan.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.emergencyEquipment.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /emergency/plan creates plan', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/emergency/plan')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        plan_type: 'evacuation',
        title: 'Site Evacuation Plan',
        content: { assembly_points: ['North Lot', 'South Lot'] },
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Site Evacuation Plan');
  });

  it('POST /emergency/equipment registers equipment', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/emergency/equipment')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        equipment_type: 'aed',
        location: 'Tool crib',
        status: 'available',
      });

    expect(res.status).toBe(201);
    expect(res.body.equipmentType).toBe('aed');
  });

  it('POST /emergency/declare creates emergency', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/emergency/declare')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        type: 'fire',
        severity: 'critical',
        description: 'Smoke in warehouse',
        activate_lockout: false,
      });

    expect(res.status).toBe(201);
    emergencyId = res.body.id;
    expect(res.body.status).toBe('active');
  });

  it('POST /emergency/:id/muster/start starts muster session', async () => {
    if (!dbAvailable || !emergencyId) return;

    const res = await request(app)
      .post(`/emergency/${emergencyId}/muster/start`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        muster_point: 'North Parking Lot',
        expected_roster: [worker1, worker2, worker3],
      });

    expect(res.status).toBe(201);
    sessionId = res.body.sessionId;
  });

  it('POST /emergency/:id/muster/checkin records check-ins', async () => {
    if (!dbAvailable || !emergencyId) return;

    for (const workerId of [worker1, worker3]) {
      const res = await request(app)
        .post(`/emergency/${emergencyId}/muster/checkin`)
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          company_id: companyId,
          worker_id: workerId,
          session_id: sessionId,
        });

      expect(res.status).toBe(201);
    }
  });

  it('GET /emergency/:id/status shows missing worker', async () => {
    if (!dbAvailable || !emergencyId) return;

    const res = await request(app)
      .get(`/emergency/${emergencyId}/status`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${supervisorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.muster.checkedIn).toBe(2);
    expect(res.body.muster.missingWorkers).toContain(worker2);
    expect(res.body.muster.attendanceRate).toBe(67);
  });

  it('POST /emergency/:id/all_clear sets all clear', async () => {
    if (!dbAvailable || !emergencyId) return;

    const res = await request(app)
      .post(`/emergency/${emergencyId}/all_clear`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('all_clear');
  });

  it('POST /emergency/:id/close closes emergency', async () => {
    if (!dbAvailable || !emergencyId) return;

    const res = await request(app)
      .post(`/emergency/${emergencyId}/close`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('closed');
  });
});
