import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const courseId = '11111111-1111-1111-1111-111111111111';

const token = jwt.sign(
  { sub: 'user-1', user_id: 'user-1', company_id: companyId, roles: ['project_manager'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('pm project integration', () => {
  let projectId: string;
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
    await prisma.projectTask.deleteMany({}).catch(() => undefined);
    await prisma.workPackage.deleteMany({}).catch(() => undefined);
    await prisma.project.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /pm/project creates project with work packages', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/pm/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        name: 'Downtown Tower',
        type: 'construction',
        scope: 'Full structural retrofit',
        risk_level: 'medium',
        metadata: {
          location: 'Seattle',
          requiredTraining: [courseId],
          safetyGateEnabled: true,
        },
        work_packages: [
          {
            name: 'Phase 1 - Demolition',
            tasks: [
              { name: 'JHA review', linkedEntityType: 'jha', linkedEntityId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab' },
            ],
          },
        ],
      });

    expect(res.status).toBe(201);
    projectId = res.body.id;
    expect(res.body.workPackages).toHaveLength(1);
    expect(res.body.workPackages[0].tasks).toHaveLength(1);
  });

  it('GET /pm/project/:id returns project detail', async () => {
    if (!dbAvailable || !projectId) return;

    const res = await request(app)
      .get(`/pm/project/${projectId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Downtown Tower');
  });

  it('GET /pm/project/company/:company_id lists projects', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/pm/project/company/${companyId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
  });

  it('POST /pm/project/:id/risk updates risk level', async () => {
    if (!dbAvailable || !projectId) return;

    const res = await request(app)
      .post(`/pm/project/${projectId}/risk`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        risk_level: 'critical',
      });

    expect(res.status).toBe(200);
    expect(res.body.riskLevel).toBe('critical');
  });

  it('POST /pm/project/:id/safety-gate/check denies without JHA', async () => {
    if (!dbAvailable || !projectId) return;

    const res = await request(app)
      .post(`/pm/project/${projectId}/safety-gate/check`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        has_active_jha: false,
        has_permits: false,
        completed_training: [],
      });

    expect(res.status).toBe(403);
    expect(res.body.gates.length).toBeGreaterThan(0);
  });

  it('POST /pm/project/:id/safety-gate/check passes with requirements', async () => {
    if (!dbAvailable || !projectId) return;

    const res = await request(app)
      .post(`/pm/project/${projectId}/safety-gate/check`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        has_active_jha: true,
        has_permits: true,
        completed_training: [courseId],
      });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
  });
});
