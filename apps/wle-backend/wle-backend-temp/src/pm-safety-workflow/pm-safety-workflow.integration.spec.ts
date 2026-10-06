import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyWorkflowModule } from './pm-safety-workflow.module';

/**
 * Module: PmSafetyWorkflow (VERA PM)
 * Files under test: controller + service + global ValidationPipe
 * DB: Prisma fully mocked — no DATABASE_URL required.
 */
describe('PmSafetyWorkflowModule (integration / API)', () => {
  let app: INestApplication;

  const wfRow = {
    id: 1,
    kind: 'PERMIT_TO_WORK' as const,
    title: 'Integration permit',
    status: 'DRAFT' as const,
    companyId: null as number | null,
    siteId: null as number | null,
    workDescription: null as string | null,
    hazardSummary: null as string | null,
    controlMeasures: null as string | null,
    jobLocation: null as string | null,
    taskStepsJson: null as unknown,
    validFrom: null as Date | null,
    validTo: null as Date | null,
    workerUserId: null as number | null,
    workerSignedAt: null as Date | null,
    workerSignatureText: null as string | null,
    supervisorUserId: null as number | null,
    supervisorApprovedAt: null as Date | null,
    supervisorSignatureText: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    $transaction: jest.fn(),
    pmSafetyWorkflow: {
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve({
            ...wfRow,
            ...data,
            id: 1,
            status: 'DRAFT',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      findUnique: jest.fn().mockImplementation(() =>
        Promise.resolve({
          ...wfRow,
          company: null,
          site: null,
        }),
      ),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest
        .fn()
        .mockImplementation(({ data }: { data: { status?: string } }) =>
          Promise.resolve({
            ...wfRow,
            ...data,
          }),
        ),
      count: jest.fn().mockResolvedValue(1),
    },
    pmSafetyWorkflowEvent: {
      create: jest.fn().mockResolvedValue({ id: 100 }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  prismaMock.$transaction.mockImplementation(
    async (fn: (tx: typeof prismaMock) => Promise<unknown>) =>
      fn(prismaMock as never),
  );

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PmSafetyWorkflowModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      async (fn: (tx: typeof prismaMock) => Promise<unknown>) =>
        fn(prismaMock as never),
    );
    prismaMock.pmSafetyWorkflow.findUnique.mockImplementation(() =>
      Promise.resolve({
        ...wfRow,
        company: null,
        site: null,
      }),
    );
    prismaMock.pmSafetyWorkflow.count.mockResolvedValue(1);
    prismaMock.pmSafetyWorkflowEvent.findMany.mockResolvedValue([]);
  });

  it('GET /api/v1/pm/safety-workflows/definition returns 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pm/safety-workflows/definition')
      .expect(200);

    expect(res.body).toMatchObject({
      workflow: 'VERA_PM_SAFETY',
      version: 1,
    });
  });

  it('POST /api/v1/pm/safety-workflows rejects empty body (validation)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .send({})
      .expect(400);
  });

  it('POST /api/v1/pm/safety-workflows creates with title', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows')
      .send({ title: 'API permit' })
      .expect(201);

    expect(res.body.title).toBe('API permit');
    expect(prismaMock.pmSafetyWorkflow.create).toHaveBeenCalled();
  });

  it('GET /api/v1/pm/safety-workflows/:id/state returns available actions', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pm/safety-workflows/1/state')
      .expect(200);

    expect(res.body.workflow.status).toBe('DRAFT');
    expect(Array.isArray(res.body.availableActions)).toBe(true);
    expect(res.body.availableActions.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/pm/safety-workflows/:id/transition rejects invalid action (validation)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows/1/transition')
      .set('x-pm-actor-user-id', '1')
      .set('x-pm-actor-role', 'PROJECT_MANAGER')
      .send({ action: 'invalid_action' })
      .expect(400);
  });

  it('POST /api/v1/pm/safety-workflows/:id/transition returns 400 from service on illegal transition', async () => {
    prismaMock.pmSafetyWorkflow.findUnique.mockResolvedValue({
      ...wfRow,
      status: 'CLOSED',
    });

    await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows/1/transition')
      .set('x-pm-actor-user-id', '1')
      .set('x-pm-actor-role', 'PROJECT_MANAGER')
      .send({ action: 'submit' })
      .expect(400);
  });

  it('POST /api/v1/pm/safety-workflows/:id/transition returns 401 without actor headers', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/pm/safety-workflows/1/transition')
      .send({ action: 'submit' })
      .expect(401);
  });

  it('GET /api/v1/pm/safety-workflows/:id/export/pdf returns application/pdf', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pm/safety-workflows/1/export/pdf')
      .buffer(true)
      .expect(200)
      .expect('Content-Type', /application\/pdf/);

    const body = res.body as Buffer;
    expect(Buffer.isBuffer(body)).toBe(true);
    expect(body.subarray(0, 5).toString('utf8')).toBe('%PDF-');
  });
});
