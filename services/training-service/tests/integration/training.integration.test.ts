import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../src/app';

const prisma = new PrismaClient();
const app = createApp();

const companyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const workerId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

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

describe('training integration', () => {
  let courseId: string;
  let trainingId: string;
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
    await prisma.workerTraining.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.trainingMatrix.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.trainingCourse.deleteMany({ where: { companyId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('POST /training/course creates course', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .post('/training/course')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        name: 'Fall Protection',
        category: 'safety',
        provider: 'Vera Academy',
        duration_hours: 4,
        expiry_days: 365,
      });

    expect(res.status).toBe(201);
    courseId = res.body.id;
  });

  it('POST /training/matrix upserts role matrix', async () => {
    if (!dbAvailable || !courseId) return;

    const res = await request(app)
      .post('/training/matrix')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        role: 'electrician',
        required_courses: [courseId],
      });

    expect(res.status).toBe(201);
    expect(res.body.requiredCourses).toContain(courseId);
  });

  it('POST /training/assign assigns course to worker', async () => {
    if (!dbAvailable || !courseId) return;

    const res = await request(app)
      .post('/training/assign')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        worker_id: workerId,
        course_id: courseId,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('assigned');
    trainingId = res.body.id;
  });

  it('POST /training/complete marks training complete', async () => {
    if (!dbAvailable || !trainingId) return;

    const res = await request(app)
      .post('/training/complete')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        company_id: companyId,
        training_id: trainingId,
        competency_level: 'advanced',
        certificate_data_url: 'data:application/pdf;base64,abc123',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.expiryDate).not.toBeNull();
  });

  it('POST /training/verify supervisor verification', async () => {
    if (!dbAvailable || !trainingId) return;

    const res = await request(app)
      .post('/training/verify')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        company_id: companyId,
        training_id: trainingId,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('verified');
  });

  it('GET /training/worker/:id returns worker summary', async () => {
    if (!dbAvailable) return;

    const res = await request(app)
      .get(`/training/worker/${workerId}`)
      .query({ company_id: companyId, role: 'electrician' })
      .set('Authorization', `Bearer ${workerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.records.length).toBeGreaterThan(0);
    expect(res.body.matrixCompliance.compliant).toBe(true);
    expect(res.body.competencyScore).toBeGreaterThan(0);
  });
});
