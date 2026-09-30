import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const projectId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const workerId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const inspectorId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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

describe('equipment safety integration', () => {
  let equipmentId: string;
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
    await prisma.equipmentLockout.deleteMany({ where: { equipment: { companyId } } }).catch(() => undefined);
    await prisma.equipmentAuthorization.deleteMany({ where: { equipment: { companyId } } }).catch(() => undefined);
    await prisma.equipmentCertification.deleteMany({ where: { equipment: { companyId } } }).catch(() => undefined);
    await prisma.equipmentInspection.deleteMany({ where: { equipment: { companyId } } }).catch(() => undefined);
    await prisma.equipment.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /equipment registers equipment', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/equipment')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        type: 'aerial_lift',
        model: 'Genie Z-45',
        serial_number: `SN-${Date.now()}`,
      });

    expect(res.status).toBe(201);
    equipmentId = res.body.id;
    expect(res.body.status).toBe('active');
  });

  it('POST /equipment/:id/inspection records inspection', async () => {
    if (!dbAvailable || !equipmentId) return;

    const res = await request(app)
      .post(`/equipment/${equipmentId}/inspection`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        inspector_id: inspectorId,
        status: 'pass',
        notes: 'All checks passed',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pass');
    expect(res.body.nextInspectionDue).toBeTruthy();
  });

  it('POST /equipment/:id/certification adds certification', async () => {
    if (!dbAvailable || !equipmentId) return;

    const res = await request(app)
      .post(`/equipment/${equipmentId}/certification`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        certification_type: 'annual_inspection',
        issued_by: 'OSHA Certified',
        issue_date: '2026-01-01T00:00:00.000Z',
        expiry_date: '2027-01-01T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.certificationType).toBe('annual_inspection');
  });

  it('POST /equipment/:id/authorize authorizes operator', async () => {
    if (!dbAvailable || !equipmentId) return;

    const res = await request(app)
      .post(`/equipment/${equipmentId}/authorize`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        expiry_date: '2027-06-01T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.workerId).toBe(workerId);
    expect(res.body.status).toBe('active');
  });

  it('POST /equipment/:id/lockout locks equipment', async () => {
    if (!dbAvailable || !equipmentId) return;

    const res = await request(app)
      .post(`/equipment/${equipmentId}/lockout`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        reason: 'Hydraulic leak detected',
      });

    expect(res.status).toBe(201);
    expect(res.body.active).toBe(true);
  });

  it('GET /equipment/:id/score reflects lockout penalty', async () => {
    if (!dbAvailable || !equipmentId) return;

    const res = await request(app)
      .get(`/equipment/${equipmentId}/score`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.activeLockout).toBe(true);
    expect(res.body.factors.lockoutPenalty).toBeGreaterThan(0);
    expect(res.body.activeAuthorizations).toBe(1);
  });

  it('POST /equipment/:id/unlock restores equipment', async () => {
    if (!dbAvailable || !equipmentId) return;

    const res = await request(app)
      .post(`/equipment/${equipmentId}/unlock`)
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(['active', 'maintenance']).toContain(res.body.status);
  });
});
