import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const projectId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const token = jwt.sign(
  { sub: 'user-1', user_id: 'user-1', company_id: companyId, roles: ['project_manager'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('project-safety integration', () => {
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
    await prisma.projectSafetyProfileVersion.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.projectZoneRule.deleteMany({}).catch(() => undefined);
    await prisma.projectZone.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.projectEmergencyRequirement.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.projectTrainingRequirement.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.projectEquipmentRule.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.projectControlLibrary.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.projectHazardLibrary.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.projectSafetyProfile.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /project/safety/profile creates profile', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/project/safety/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        risk_level: 'high',
        required_jha_types: ['flha', 'jha'],
        publish: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('published');
  });

  it('POST /project/safety/hazards adds hazard', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/project/safety/hazards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        title: 'Excavation collapse',
        severity: 4,
        likelihood: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.sifPotential).toBeDefined();
  });

  it('POST /project/safety/controls adds control', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/project/safety/controls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        title: 'Shoring system',
        control_strength: 4,
      });

    expect(res.status).toBe(201);
  });

  it('POST /project/safety/zones creates zone with rules', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/project/safety/zones')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        name: 'Excavation Area A',
        type: 'restricted',
        required_ppe: ['hard_hat'],
        required_jha: ['excavation_jha'],
      });

    expect(res.status).toBe(201);
    expect(res.body.rules).not.toBeNull();
  });

  it('POST /project/safety/equipment upserts rule', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/project/safety/equipment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        rule_key: 'excavator',
        required_inspections: ['daily'],
      });

    expect(res.status).toBe(201);
  });

  it('POST /project/safety/training upserts requirement', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/project/safety/training')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        role: 'operator',
        required_courses: [{ code: 'EXCAV', name: 'Excavation Safety' }],
      });

    expect(res.status).toBe(201);
  });

  it('POST /project/safety/emergency creates plan requirement', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/project/safety/emergency')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        plan_type: 'trench_rescue',
        title: 'Trench rescue procedure',
      });

    expect(res.status).toBe(201);
  });

  it('GET /project/safety/:project_id/score returns score', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/project/safety/${projectId}/score`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.score).toBeGreaterThan(0);
    expect(res.body.components).toBeDefined();
  });
});
