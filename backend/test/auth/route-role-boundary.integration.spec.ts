import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';

describe('Route role boundaries (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tag = `rbac_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL must be set for route role integration tests',
      );
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);

    const hash = await bcrypt.hash('rbac_test_pw', 10);
    await prisma.user.createMany({
      data: [
        {
          username: `${tag}_admin`,
          email: `${tag}_admin@vera.test`,
          password: hash,
          role: 'ADMIN',
        },
        {
          username: `${tag}_supervisor`,
          email: `${tag}_supervisor@vera.test`,
          password: hash,
          role: 'SUPERVISOR',
        },
        {
          username: `${tag}_worker`,
          email: `${tag}_worker@vera.test`,
          password: hash,
          role: 'WORKER',
        },
      ],
    });
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { startsWith: tag } },
      });
    } finally {
      await app?.close();
    }
  });

  async function login(email: string) {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'rbac_test_pw' })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  }

  it('anonymous requests to protected routes return 401', async () => {
    await request(app.getHttpServer()).get('/workers').expect(401);
    await request(app.getHttpServer()).get('/supervisor/dashboard').expect(401);
    await request(app.getHttpServer()).get('/admin/dashboard').expect(401);
    await request(app.getHttpServer()).get('/api/v1/sites').expect(401);
  });

  it('worker cannot access supervisor/admin routes', async () => {
    const workerToken = await login(`${tag}_worker@vera.test`);
    await request(app.getHttpServer())
      .get('/supervisor/dashboard')
      .set('Authorization', `Bearer ${workerToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${workerToken}`)
      .expect(403);
  });

  it('supervisor cannot access admin routes', async () => {
    const supervisorToken = await login(`${tag}_supervisor@vera.test`);
    await request(app.getHttpServer())
      .get('/supervisor/dashboard')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .expect(403);
  });
});
