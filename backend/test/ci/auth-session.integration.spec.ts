import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';

describe('CI Auth Session Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tag = `ci_auth_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  const email = `${tag}@vera.test`;
  const password = 'ci_auth_password_123';

  beforeAll(async () => {
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      await prisma?.user.deleteMany({ where: { email } });
    } finally {
      await app?.close();
    }
  });

  it('register -> login -> /auth/me works and protected role routes enforce RBAC', async () => {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: tag,
        email,
        password,
        // client-supplied role must be ignored by backend hardening
        role: 'ADMIN',
      })
      .expect(201);

    const token = (reg.body as { accessToken: string }).accessToken;
    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(me.body.user).toMatchObject({
      email,
      role: 'WORKER',
    });

    await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const loginToken = (login.body as { accessToken: string }).accessToken;
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginToken}`)
      .expect(200);
  });
});
