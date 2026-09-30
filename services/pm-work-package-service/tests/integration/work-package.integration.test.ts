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
const courseId = '11111111-1111-1111-1111-111111111111';

const token = jwt.sign(
  { sub: 'pm-1', user_id: 'pm-1', company_id: companyId, roles: ['project_manager'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('pm work package integration', () => {
  let workPackageId: string;
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
    await prisma.workPackage.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /pm/work-package creates work package', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/pm/work-package')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        title: 'Steel Erection - Level 3',
        description: 'Erect structural steel on level 3',
        required_workers: [worker1, worker2],
        required_training: [courseId],
        required_jha: ['hot_work'],
        status: 'draft',
      });

    expect(res.status).toBe(201);
    workPackageId = res.body.id;
    expect(res.body.version).toBe(1);
  });

  it('GET /pm/work-package/:id returns detail', async () => {
    if (!dbAvailable || !workPackageId) return;

    const res = await request(app)
      .get(`/pm/work-package/${workPackageId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Steel Erection - Level 3');
    expect(res.body.requiredWorkers).toContain(worker1);
  });

  it('GET /pm/work-package/project/:project_id lists packages', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/pm/work-package/project/${projectId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.workPackages.length).toBeGreaterThan(0);
  });

  it('POST /pm/work-package/:id/requirements denies activation without safety context', async () => {
    if (!dbAvailable || !workPackageId) return;

    const res = await request(app)
      .post(`/pm/work-package/${workPackageId}/requirements`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        status: 'active',
        required_equipment: ['crane-1'],
        required_inspections: ['daily_walk'],
        required_permits: ['hot_work_permit'],
        safety_context: {
          assigned_workers: [worker1],
          completed_training: [],
        },
      });

    expect(res.status).toBe(403);
    expect(res.body.updated).toBe(false);
  });

  it('POST /pm/work-package/:id/requirements activates when gates pass', async () => {
    if (!dbAvailable || !workPackageId) return;

    const res = await request(app)
      .post(`/pm/work-package/${workPackageId}/requirements`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        status: 'active',
        required_workers: [worker1, worker2],
        required_training: [courseId],
        required_jha: ['hot_work'],
        required_equipment: ['crane-1'],
        required_inspections: ['daily_walk'],
        required_permits: ['hot_work_permit'],
        safety_context: {
          assigned_workers: [worker1, worker2],
          completed_training: [courseId],
          active_jha_types: ['hot_work'],
          available_equipment: ['crane-1'],
          completed_inspections: ['daily_walk'],
          active_permits: ['hot_work_permit'],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.updated).toBe(true);
    expect(res.body.workPackage.status).toBe('active');
    expect(res.body.workPackage.version).toBe(2);
  });
});
