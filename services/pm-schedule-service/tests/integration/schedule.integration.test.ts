import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const projectId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const taskId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const workerId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const equipmentId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const worker2Id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const token = jwt.sign(
  { sub: 'pm-1', user_id: 'pm-1', company_id: companyId, roles: ['project_manager'] },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: '1h' },
);

describe('pm schedule integration', () => {
  let scheduleId: string;
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
    await prisma.projectSchedule.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /pm/schedule creates entry', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/pm/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        task_id: taskId,
        worker_id: workerId,
        equipment_id: equipmentId,
        start_time: '2026-06-10T08:00:00.000Z',
        end_time: '2026-06-10T16:00:00.000Z',
        run_safety_gate: false,
      });

    expect(res.status).toBe(201);
    scheduleId = res.body.entry.id;
    expect(res.body.entry.status).toBe('scheduled');
  });

  it('GET /pm/schedule/project/:project_id returns gantt', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/pm/schedule/project/${projectId}`)
      .query({ company_id: companyId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.entries.length).toBeGreaterThan(0);
    expect(res.body.workerLanes[workerId]).toBeDefined();
  });

  it('POST /pm/schedule/conflicts detects worker overlap', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/pm/schedule/conflicts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        slots: [
          {
            worker_id: worker2Id,
            start_time: '2026-06-10T10:00:00.000Z',
            end_time: '2026-06-10T18:00:00.000Z',
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.conflicts.length).toBeGreaterThan(0);
  });

  it('POST /pm/schedule/:id/update reschedules entry', async () => {
    if (!dbAvailable || !scheduleId) return;

    const res = await request(app)
      .post(`/pm/schedule/${scheduleId}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        end_time: '2026-06-10T17:00:00.000Z',
        run_safety_gate: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.updated).toBe(true);
    expect(res.body.entry.endTime).toContain('17:00');
  });

  it('POST /pm/schedule creates conflicting entry with conflict status', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/pm/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: companyId,
        project_id: projectId,
        worker_id: workerId,
        start_time: '2026-06-10T09:00:00.000Z',
        end_time: '2026-06-10T11:00:00.000Z',
        run_safety_gate: false,
        block_on_safety_failure: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.entry.status).toBe('conflict');
    expect(res.body.conflicts.length).toBeGreaterThan(0);
  });
});
