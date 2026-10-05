import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';

describe('Vera Hub Homepage API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tag = `hub_ci_${Date.now()}`;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL required for hub integration tests');
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);

    const email = `${tag}@vera.test`;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          username: tag,
          email,
          password: await bcrypt.hash('hub_ci_pw', 10),
          role: 'WORKER',
        },
      });
    }
  });

  afterAll(async () => {
    await prisma?.user.deleteMany({ where: { username: tag } });
    await app?.close();
  });

  it('returns homepage payload for authenticated worker', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `${tag}@vera.test`, password: 'hub_ci_pw' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/api/v1/hub/homepage')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(res.body).toMatchObject({
      hubRole: 'WORKER',
      sections: expect.any(Array),
      feed: { items: expect.any(Array), nextCursor: null },
      quickActions: expect.any(Array),
      weather: expect.objectContaining({ region: expect.any(String) }),
    });
  });
});
