import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';

type AuthSession = {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
};

describe('CI Role Access (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const workerTag = `ci_worker_${Date.now()}_${Math.floor(
    Math.random() * 1e9,
  )}`;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL must be set for role-access integration tests',
      );
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);

    const workerEmail = `${workerTag}@vera.test`;
    const existing = await prisma.user.findUnique({
      where: { email: workerEmail },
    });
    if (!existing) {
      await prisma.user.create({
        data: {
          username: workerTag,
          email: workerEmail,
          password: await bcrypt.hash('worker_ci_pw', 10),
          role: 'WORKER',
        },
      });
    }
  });

  afterAll(async () => {
    try {
      await prisma?.user.deleteMany({
        where: {
          username: workerTag,
        },
      });
    } finally {
      await app?.close();
    }
  });

  async function login(email: string, password: string): Promise<AuthSession> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    return res.body as AuthSession;
  }

  it('admin can access admin dashboard and supervisor dashboard', async () => {
    const admin = await login(
      'admin@vera.com',
      process.env.SEED_USER_PASSWORD ?? 'hashedpassword123',
    );

    await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/supervisor/dashboard')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
  });

  it('supervisor can access supervisor dashboard but not admin dashboard', async () => {
    const supervisor = await login(
      'supervisor1@vera.com',
      process.env.SEED_USER_PASSWORD ?? 'hashedpassword123',
    );

    await request(app.getHttpServer())
      .get('/supervisor/dashboard')
      .set('Authorization', `Bearer ${supervisor.accessToken}`)
      .expect(200);

    const denied = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${supervisor.accessToken}`)
      .expect(403);

    expect(denied.body).toMatchObject({
      success: false,
      statusCode: 403,
      error: expect.objectContaining({ code: 'FORBIDDEN' }),
    });
  });

  it('worker cannot access supervisor or admin restricted routes', async () => {
    const worker = await login(`${workerTag}@vera.test`, 'worker_ci_pw');

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${worker.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/supervisor/dashboard')
      .set('Authorization', `Bearer ${worker.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${worker.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/verification/logs/recent')
      .set('Authorization', `Bearer ${worker.accessToken}`)
      .expect(403);
  });
});
