import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const projectId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const workerId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const equipmentId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const accessPointId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const courseId = '11111111-1111-1111-1111-111111111111';

const workerToken = jwt.sign(
  { sub: 'user-1', user_id: 'user-1', company_id: companyId, roles: ['worker'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

const supervisorToken = jwt.sign(
  { sub: 'sup-1', user_id: 'sup-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('access control integration', () => {
  let deniedAttemptId: string;
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;

      await prisma.accessPoint.upsert({
        where: { id: accessPointId },
        create: {
          id: accessPointId,
          companyId,
          projectId,
          name: 'Zone A Gate',
          rules: {
            minSafetyScore: 80,
            requiredTraining: [courseId],
            blockedRoles: ['visitor'],
          },
        },
        update: {
          rules: {
            minSafetyScore: 80,
            requiredTraining: [courseId],
            blockedRoles: ['visitor'],
          },
        },
      });
    } catch {
      console.warn('DB unavailable — skipping integration tests');
    }
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    await prisma.accessOverride.deleteMany({}).catch(() => undefined);
    await prisma.accessAttempt.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.emergencyLockout.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.accessPoint.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /access/validate denies worker failing safety gates', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/access/validate')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        access_point_id: accessPointId,
        worker_id: workerId,
        worker_context: {
          role: 'electrician',
          safetyScore: 60,
          completedTraining: [],
        },
      });

    expect(res.status).toBe(403);
    expect(res.body.granted).toBe(false);
    deniedAttemptId = res.body.attemptId;
  });

  it('POST /access/override supervisor grants override', async () => {
    if (!dbAvailable || !deniedAttemptId) return;

    const res = await request(app)
      .post('/access/override')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        access_attempt_id: deniedAttemptId,
        override_type: 'supervisor',
        expiry: '2027-01-01T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.overrideType).toBe('supervisor');
  });

  it('POST /access/validate grants access with active override', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/access/validate')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        access_point_id: accessPointId,
        worker_id: workerId,
      });

    expect(res.status).toBe(200);
    expect(res.body.granted).toBe(true);
  });

  it('POST /access/validate denies equipment with lockout', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/access/validate')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        access_point_id: accessPointId,
        worker_id: workerId,
        equipment_id: equipmentId,
        worker_context: {
          role: 'electrician',
          safetyScore: 95,
          completedTraining: [courseId],
        },
        equipment_context: {
          activeLockout: true,
          status: 'locked_out',
        },
      });

    expect(res.status).toBe(403);
    expect(res.body.gates).toContain('equipment_lockout');
  });

  it('POST /access/validate denies during emergency lockout', async () => {
    if (!dbAvailable) return;

    await prisma.emergencyLockout.create({
      data: {
        companyId,
        projectId,
        reason: 'Gas leak',
        lockedBy: 'sup-1',
      },
    });

    const res = await request(app)
      .post('/access/validate')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        access_point_id: accessPointId,
        worker_id: workerId,
        worker_context: {
          role: 'electrician',
          safetyScore: 95,
          completedTraining: [courseId],
        },
      });

    expect(res.status).toBe(403);
    expect(res.body.gates).toContain('emergency_lockout');

    await prisma.emergencyLockout.updateMany({
      where: { companyId, active: true },
      data: { active: false, unlockedAt: new Date() },
    });
  });

  it('GET /access/worker/:id returns worker access history', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/access/worker/${workerId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalAttempts).toBeGreaterThan(0);
    expect(res.body.recentAttempts.length).toBeGreaterThan(0);
  });

  it('GET /access/equipment/:id returns equipment access history', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/access/equipment/${equipmentId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.equipmentId).toBe(equipmentId);
  });
});
