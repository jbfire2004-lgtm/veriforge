import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

describe('Auth registration hardening (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tag = `auth_hard_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set for auth integration tests');
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: `${tag}@vera.test` } },
      });
      await prisma.user.deleteMany({
        where: { username: { contains: tag } },
      });
    } finally {
      await app?.close();
    }
  });

  it('public registration always creates WORKER', async () => {
    const email = `${tag}_worker_default@vera.test`;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: `${tag}_worker_default`,
        email,
        password: 'workerpassword123',
      })
      .expect(201);

    expect(res.body.user.role).toBe('WORKER');
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.role).toBe('WORKER');
  });

  it('public registration ignores client-supplied role payload', async () => {
    const email = `${tag}_ignored_role@vera.test`;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: `${tag}_ignored_role`,
        email,
        password: 'workerpassword123',
        role: 'ADMIN',
      })
      .expect(201);

    expect(res.body.user.role).toBe('WORKER');
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.role).toBe('WORKER');
  });

  it('admin-only route creates elevated roles', async () => {
    const workerLogin = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: `${tag}_not_admin`,
        email: `${tag}_not_admin@vera.test`,
        password: 'workerpassword123',
      })
      .expect(201);
    const workerToken = (workerLogin.body as { accessToken: string })
      .accessToken;

    await request(app.getHttpServer())
      .post('/auth/admin/users')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        username: `${tag}_forbidden`,
        email: `${tag}_forbidden@vera.test`,
        password: 'superpassword123',
        role: 'SUPERVISOR',
      })
      .expect(403);

    const adminEmail = `${tag}_admin@vera.test`;
    const adminPassword = 'adminpassword123';
    await prisma.user.create({
      data: {
        username: `${tag}_admin`,
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: 'ADMIN',
      },
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword })
      .expect(200);
    const token = (login.body as { accessToken: string }).accessToken;

    const elevatedEmail = `${tag}_supervisor@vera.test`;
    const createRes = await request(app.getHttpServer())
      .post('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: `${tag}_supervisor`,
        email: elevatedEmail,
        password: 'superpassword123',
        role: 'SUPERVISOR',
      })
      .expect(201);

    expect(createRes.body).toMatchObject({
      email: elevatedEmail,
      role: 'SUPERVISOR',
    });

    const created = await prisma.user.findUnique({
      where: { email: elevatedEmail },
    });
    expect(created?.role).toBe('SUPERVISOR');
  });
});
