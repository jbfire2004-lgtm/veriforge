import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const workerId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const hazardId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const capaId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const token = jwt.sign(
  { sub: 'user-1', user_id: 'user-1', company_id: companyId, roles: ['supervisor'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('worker-safety integration', () => {
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
    await prisma.workerAccessLog.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerCorrectiveAssignment.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerIncident.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerHazardExposure.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerRestriction.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerAuthorization.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerCompetency.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerTraining.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.workerProfile.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /worker/profile creates profile', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/worker/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        role: 'electrician',
        trade: 'electrical',
        competency_code: 'LOTO',
        competency_level: 'advanced',
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('electrician');
  });

  it('POST /worker/training adds record', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/worker/training')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        course_id: 'ARC_FLASH',
        completion_date: '2026-01-15T00:00:00.000Z',
        expiry_date: '2027-01-15T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.courseId).toBe('ARC_FLASH');
  });

  it('POST /worker/authorization adds equipment auth', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/worker/authorization')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        equipment_type: 'aerial_lift',
        authorization_type: 'operator',
        issue_date: '2026-01-01T00:00:00.000Z',
        expiry_date: '2027-01-01T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
  });

  it('POST /worker/restriction adds medical restriction', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/worker/restriction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        restriction_type: 'height',
        description: 'No work above 6 feet',
      });

    expect(res.status).toBe(201);
    expect(res.body.profile.medicalRestrictions.length).toBeGreaterThan(0);
  });

  it('POST /worker/exposure records hazard exposure', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/worker/exposure')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        hazard_id: hazardId,
        severity: 3,
        likelihood: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.riskScore).toBe(9);
  });

  it('POST /worker/corrective assigns CAPA', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/worker/corrective')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        corrective_action_id: capaId,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('assigned');
  });

  it('GET /worker/:id/score returns safety score', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/worker/${workerId}/score`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.score).toBeGreaterThan(0);
    expect(res.body.components).toBeDefined();
    expect(res.body.riskLevel).toBeDefined();
  });
});
