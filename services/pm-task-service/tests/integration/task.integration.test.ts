import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const workPackageId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const workerId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const equipmentId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const courseId = '11111111-1111-1111-1111-111111111111';

const token = jwt.sign(
  { sub: 'pm-1', user_id: 'pm-1', company_id: companyId, roles: ['project_manager'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('pm task integration', () => {
  let taskId: string;
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
    await prisma.taskAssignment.deleteMany({}).catch(() => undefined);
    await prisma.task.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /pm/task creates task', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/pm/task')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        work_package_id: workPackageId,
        title: 'Weld beam connection',
        task_type: 'hot_work',
        required_skills: ['welding'],
        required_equipment: [equipmentId],
        required_training: [courseId],
        required_controls: ['ventilation'],
        required_ppe: ['face_shield'],
        required_jha: ['hot_work'],
        assigned_workers: [workerId],
        assigned_equipment: [equipmentId],
      });

    expect(res.status).toBe(201);
    taskId = res.body.id;
    expect(res.body.assignments).toHaveLength(2);
  });

  it('GET /pm/task/:id returns task', async () => {
    if (!dbAvailable || !taskId) return;

    const res = await request(app)
      .get(`/pm/task/${taskId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Weld beam connection');
  });

  it('GET /pm/task/work-package/:wp_id lists tasks', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/pm/task/work-package/${workPackageId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  it('POST /pm/task/:id/requirements updates and marks ready', async () => {
    if (!dbAvailable || !taskId) return;

    const res = await request(app)
      .post(`/pm/task/${taskId}/requirements`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        status: 'ready',
        safety_context: {
          assigned_workers: [workerId],
          assigned_equipment: [equipmentId],
          worker_skills: ['welding'],
          completed_training: [courseId],
          applied_controls: ['ventilation'],
          confirmed_ppe: ['face_shield'],
          active_jha_types: ['hot_work'],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('ready');
  });

  it('POST /pm/task/:id/start begins task', async () => {
    if (!dbAvailable || !taskId) return;

    const res = await request(app)
      .post(`/pm/task/${taskId}/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        safety_context: {
          worker_skills: ['welding'],
          completed_training: [courseId],
          applied_controls: ['ventilation'],
          confirmed_ppe: ['face_shield'],
          active_jha_types: ['hot_work'],
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.started).toBe(true);
    expect(res.body.task.status).toBe('in_progress');
    expect(res.body.task.startDate).toBeTruthy();
  });

  it('POST /pm/task/:id/complete finishes task', async () => {
    if (!dbAvailable || !taskId) return;

    const res = await request(app)
      .post(`/pm/task/${taskId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({ company_id: companyId });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('completed');
    expect(res.body.task.endDate).toBeTruthy();
  });
});
