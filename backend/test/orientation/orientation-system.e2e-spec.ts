import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createPhase1TestApp } from '../phase1/phase1-test-app';
import { ensurePhase1JwtToken } from '../phase1/phase1-auth';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * E2E: Admin creates orientation + requirement →
 * Worker completes → wallet card issued.
 *
 * Soft-skips when DB/app bootstrap is unavailable (local CI without DATABASE_URL).
 */
describe('VeriForge Orientation E2E (admin → worker → wallet)', () => {
  let app: INestApplication | undefined;
  let prisma: PrismaService | undefined;
  let token: string | undefined;
  let companyId: number | undefined;
  let workerId: number | undefined;
  let orientationId: string | undefined;

  beforeAll(async () => {
    try {
      app = await createPhase1TestApp();
      prisma = app.get(PrismaService);
      const auth = await ensurePhase1JwtToken(app, prisma);
      token = auth.token;
      const company = await prisma.company.findFirst({ orderBy: { id: 'asc' } });
      companyId = company?.id;
      if (companyId) {
        const worker = await prisma.worker.create({
          data: {
            firstName: 'E2E',
            lastName: `Orient_${Date.now()}`,
            companyId,
            status: 'ACTIVE',
          },
        });
        workerId = worker.id;
      }
    } catch {
      app = undefined;
    }
  }, 120_000);

  afterAll(async () => {
    try {
      if (prisma && workerId) {
        await prisma.orientationDeliveryLink
          .deleteMany({ where: { workerId } })
          .catch(() => undefined);
        await prisma.orientationCompletion
          .deleteMany({ where: { workerId } })
          .catch(() => undefined);
        if (orientationId) {
          await prisma.orientationRequirement
            .deleteMany({ where: { orientationId } })
            .catch(() => undefined);
          await prisma.orientationDefinition
            .delete({ where: { id: orientationId } })
            .catch(() => undefined);
        }
        await prisma.worker
          .delete({ where: { id: workerId } })
          .catch(() => undefined);
      }
    } finally {
      await app?.close();
    }
  });

  it('admin creates → worker completes → wallet card', async () => {
    if (!app || !token || !companyId || !workerId) return;

    // 1. Admin creates published native orientation
    const def = await request(app.getHttpServer())
      .post('/api/v1/orientation-definitions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyId,
        title: 'E2E Site Orientation',
        type: 'site',
        contentMode: 'native',
        contentBlocks: [
          {
            id: 'intro',
            type: 'text',
            title: 'Welcome',
            body: 'Review site rules.',
            order: 0,
          },
          {
            id: 'quiz-1',
            type: 'quiz',
            title: 'Check',
            order: 1,
            quiz: {
              prompt: 'Hard hats required?',
              choices: ['Yes', 'No'],
              answerIndex: 0,
            },
          },
        ],
        isPublished: true,
        expiryRules: { durationDays: 365 },
      })
      .expect(201);

    orientationId = (def.body as { id: string }).id;
    expect((def.body as { version: string }).version).toBe('1.0');

    // 2. Admin creates arrival requirement (company scope)
    await request(app.getHttpServer())
      .post('/api/v1/orientation-requirements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orientationId,
        companyId,
        mustCompleteBefore: 'arrival',
        isActive: true,
      })
      .expect(201);

    // 3. Worker profile shows blocked / missing before completion
    const before = await request(app.getHttpServer())
      .get(`/api/v1/workers/${workerId}/orientation-profile`)
      .query({ companyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(before.body.gatingStatus).toBe('blocked');
    expect(
      (before.body.missingOrientations as Array<{ orientationId: string }>).some(
        (m) => m.orientationId === orientationId,
      ),
    ).toBe(true);

    // 4. Worker records completion
    const completion = await request(app.getHttpServer())
      .post('/api/v1/orientation-completions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        workerId,
        orientationId,
        companyId,
        score: 100,
        clientSyncId: `e2e-orient-${Date.now()}`,
      })
      .expect(201);

    expect(completion.body).toMatchObject({
      status: 'completed',
      workerId,
      orientationId,
    });
    expect(completion.body.expiresOn).toBeTruthy();

    // 5. Profile becomes allowed (or warning only for near-expiry)
    const after = await request(app.getHttpServer())
      .get(`/api/v1/workers/${workerId}/orientation-profile`)
      .query({ companyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(['allowed', 'warning']).toContain(after.body.gatingStatus);
    expect(after.body.missingOrientations).toHaveLength(0);

    // 6. Assign wallet delivery card
    const delivery = await request(app.getHttpServer())
      .post('/api/v1/delivery/orientation/assign')
      .set('Authorization', `Bearer ${token}`)
      .send({ workerId, orientationId, companyId })
      .expect(201);

    expect(delivery.body).toMatchObject({
      deepLink: expect.stringContaining(orientationId!),
      walletCard: expect.objectContaining({
        cardType: 'orientation',
        orientationId,
        title: 'E2E Site Orientation',
      }),
    });

    const links = await request(app.getHttpServer())
      .get('/api/v1/delivery/orientation/links')
      .query({ workerId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(
      (links.body.walletCards as unknown[]).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
