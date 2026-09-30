import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';

describe('CI Error Contract Consistency (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const workerTag = `ci_err_worker_${Date.now()}_${Math.floor(
    Math.random() * 1e9,
  )}`;

  beforeAll(async () => {
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);
    await prisma.user.create({
      data: {
        username: workerTag,
        email: `${workerTag}@vera.test`,
        password: await bcrypt.hash('worker_ci_pw', 10),
        role: 'WORKER',
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma?.user.deleteMany({ where: { username: workerTag } });
    } finally {
      await app?.close();
    }
  });

  function expectCanonicalErrorShape(body: unknown, statusCode: number) {
    expect(body).toMatchObject({
      success: false,
      statusCode,
      error: expect.objectContaining({
        code: expect.any(String),
        message: expect.any(String),
      }),
      timestamp: expect.any(String),
    });
  }

  it('returns canonical 401 when auth token is missing', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .expect(401);
    expectCanonicalErrorShape(res.body, 401);
  });

  it('returns canonical 403 for forbidden role access', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `${workerTag}@vera.test`,
        password: 'worker_ci_pw',
      })
      .expect(200);
    const token = (login.body as { accessToken: string }).accessToken;

    const denied = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expectCanonicalErrorShape(denied.body, 403);
    expect(denied.body.error.code).toBe('FORBIDDEN');
  });

  it('returns canonical 404 for unknown route', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/not-a-real-resource')
      .expect(404);
    expectCanonicalErrorShape(res.body, 404);
  });
});
