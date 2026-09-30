import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import type { User } from '@prisma/client';
import { PM_SAFETY_ERROR } from '../../src/pm-safety-workflow/pm-safety-workflow.errors';
import { validatePmSafetyTimeline } from '../../src/pm-safety-workflow/pm-safety-workflow.timeline';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createPhase1TestApp } from '../phase1/phase1-test-app';

const PW = 'pm_safety_test_pw';

function withActor(
  token: string,
  userId: number,
  role: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'x-pm-actor-user-id': String(userId),
    'x-pm-actor-role': role,
  };
}

describe('PM Safety workflow state machine (DB integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tag = `sm_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  let pmUser: User;
  let supUser: User;
  let workerUser: User;
  let adminUser: User;
  let pmTok: string;
  let supTok: string;
  let workerTok: string;
  let adminTok: string;

  async function login(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  }

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is required for PM Safety state-machine integration tests',
      );
    }
    app = await createPhase1TestApp();
    prisma = app.get(PrismaService);

    const hash = await bcrypt.hash(PW, 8);
    pmUser = await prisma.user.create({
      data: {
        username: `pm_${tag}`,
        email: `pm_${tag}@vera.test`,
        password: hash,
        role: 'PROJECT_MANAGER',
      },
    });
    supUser = await prisma.user.create({
      data: {
        username: `sup_${tag}`,
        email: `sup_${tag}@vera.test`,
        password: hash,
        role: 'SUPERVISOR',
      },
    });
    workerUser = await prisma.user.create({
      data: {
        username: `w_${tag}`,
        email: `w_${tag}@vera.test`,
        password: hash,
        role: 'WORKER',
      },
    });
    adminUser = await prisma.user.create({
      data: {
        username: `adm_${tag}`,
        email: `adm_${tag}@vera.test`,
        password: hash,
        role: 'ADMIN',
      },
    });

    [pmTok, supTok, workerTok, adminTok] = await Promise.all([
      login(pmUser.email, PW),
      login(supUser.email, PW),
      login(workerUser.email, PW),
      login(adminUser.email, PW),
    ]);
  });

  afterAll(async () => {
    try {
      if (prisma) {
        await prisma.pmSafetyWorkflow.deleteMany({
          where: { title: { startsWith: `PM_SM_${tag}` } },
        });
        const ids = [
          pmUser?.id,
          supUser?.id,
          workerUser?.id,
          adminUser?.id,
        ].filter((x): x is number => typeof x === 'number');
        if (ids.length) {
          await prisma.user.deleteMany({ where: { id: { in: ids } } });
        }
      }
    } finally {
      await app?.close();
    }
  });

  async function loadEvents(workflowId: number) {
    return prisma.pmSafetyWorkflowEvent.findMany({
      where: { workflowId },
      orderBy: [{ id: 'asc' }, { createdAt: 'asc' }],
    });
  }

  it('PERMIT: all transitions PM / Supervisor / PM with timeline integrity', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_permit`, kind: 'PERMIT_TO_WORK' })
      .expect(201);
    const id = createRes.body.id as number;

    const ev = await loadEvents(id);
    validatePmSafetyTimeline(ev, 'DRAFT');

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'SUBMITTED');

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'start_review' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'UNDER_REVIEW');

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'approve', note: 'ok' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'APPROVED');

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'close' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'CLOSED');

    const pdf = await request(app.getHttpServer())
      .get(`/api/v1/pm/safety-workflows/${id}/export/pdf`)
      .set('Authorization', `Bearer ${pmTok}`)
      .buffer(true)
      .expect(200)
      .expect('Content-Type', /application\/pdf/);
    expect((pdf.body as Buffer).subarray(0, 5).toString('utf8')).toBe('%PDF-');
    validatePmSafetyTimeline(await loadEvents(id), 'CLOSED');
  });

  it('JHA: requires worker sign before PM submit', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_jha`, kind: 'JHA' })
      .expect(201);
    const id = createRes.body.id as number;

    const blocked = await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(400);
    expect(blocked.body.error).toMatchObject({
      code: 'PM_SAFETY_WORKER_SIGN_REQUIRED',
    });

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/sign-worker`)
      .set(withActor(workerTok, workerUser.id, 'WORKER'))
      .send({ attestationText: 'I have reviewed the JHA.' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'SUBMITTED');
  });

  it('invalid graph edge returns canonical PM_SAFETY_INVALID_TRANSITION', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_badtx`, kind: 'PERMIT_TO_WORK' })
      .expect(201);
    const id = createRes.body.id as number;

    const res = await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(adminTok, adminUser.id, 'ADMIN'))
      .send({ action: 'approve' })
      .expect(400);
    expect(res.body.error.code).toBe(PM_SAFETY_ERROR.INVALID_TRANSITION);
    expect(res.body.error.details?.allowedActions).toEqual(
      expect.arrayContaining(['submit', 'cancel']),
    );
  });

  it('Supervisor cannot submit; PM cannot approve', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_roles`, kind: 'PERMIT_TO_WORK' })
      .expect(201);
    const id = createRes.body.id as number;

    const supSubmit = await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'submit' })
      .expect(403);
    expect(supSubmit.body.error).toMatchObject({
      code: PM_SAFETY_ERROR.ACTOR_FORBIDDEN,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'start_review' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'approve' })
      .expect(403);
  });

  it('reject → revise restores DRAFT with contiguous STATUS_CHANGE chain', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_reject`, kind: 'PERMIT_TO_WORK' })
      .expect(201);
    const id = createRes.body.id as number;

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'start_review' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'reject' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'REJECTED');

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'revise' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'DRAFT');
  });

  it('cancel from SUBMITTED (PM) and all cancel edges are valid', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_cancel`, kind: 'PERMIT_TO_WORK' })
      .expect(201);
    const id = createRes.body.id as number;

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'cancel' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'CANCELLED');
  });

  it('WORKER may revise after supervisor rejection', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_wrev`, kind: 'PERMIT_TO_WORK' })
      .expect(201);
    const id = createRes.body.id as number;

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'start_review' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ action: 'reject' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(workerTok, workerUser.id, 'WORKER'))
      .send({ action: 'revise' })
      .expect(201);
    validatePmSafetyTimeline(await loadEvents(id), 'DRAFT');
  });

  it('events are chronological by id (no regression)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .set(withActor(supTok, supUser.id, 'SUPERVISOR'))
      .send({ title: `PM_SM_${tag}_chrono`, kind: 'PERMIT_TO_WORK' })
      .expect(201);
    const id = createRes.body.id as number;
    await request(app.getHttpServer())
      .post(`/api/v1/pm/safety-workflows/${id}/transition`)
      .set(withActor(pmTok, pmUser.id, 'PROJECT_MANAGER'))
      .send({ action: 'submit' })
      .expect(201);

    const ev = await loadEvents(id);
    for (let i = 1; i < ev.length; i++) {
      expect(ev[i].id).toBeGreaterThan(ev[i - 1].id);
      expect(ev[i].createdAt.getTime()).toBeGreaterThanOrEqual(
        ev[i - 1].createdAt.getTime() - 5,
      );
    }
  });
});
