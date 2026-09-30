import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';

describe('Auth session flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tag = `auth_flow_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  const email = `${tag}@vera.test`;
  const username = `${tag}_user`;
  const password = 'AuthFlowPassword123!';

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set for auth session flow tests');
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({ where: { email } });
    } finally {
      await app?.close();
    }
  });

  it('registers worker role, authenticates, and enforces protected-route token checks', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username,
        email,
        password,
        role: 'ADMIN',
      })
      .expect(201);

    expect(registerRes.body).toMatchObject({
      accessToken: expect.any(String),
      user: {
        email,
        role: 'WORKER',
      },
    });

    const created = await prisma.user.findUnique({ where: { email } });
    expect(created?.role).toBe('WORKER');

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const accessToken = (loginRes.body as { accessToken: string }).accessToken;
    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(20);

    const maybeSetCookie = loginRes.headers['set-cookie'];
    if (maybeSetCookie) {
      const cookieRes = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', maybeSetCookie)
        .expect(401);
      expect(cookieRes.body.statusCode).toBe(401);
    }

    await request(app.getHttpServer()).get('/auth/me').expect(401);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.value')
      .expect(401);

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.user).toMatchObject({
      email,
      role: 'WORKER',
    });
  });
});
