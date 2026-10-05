import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { SiteContactsModule } from './site-contacts.module';

/**
 * HTTP integration: controller + pipe + service with Prisma stubbed.
 * No real database required.
 */
describe('SiteContactsController (integration)', () => {
  let app: INestApplication;

  const prismaMock = {
    site: { count: jest.fn().mockResolvedValue(1) },
    siteContact: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn(),
    },
    $transaction: jest.fn((arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg as Promise<unknown>[]);
      }
      if (typeof arg === 'function') {
        return (arg as (t: typeof prismaMock) => Promise<unknown>)(prismaMock);
      }
      return Promise.resolve(arg);
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SiteContactsModule],
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
    prismaMock.siteContact.findMany.mockResolvedValue([]);
    prismaMock.siteContact.count.mockResolvedValue(0);
    prismaMock.siteContact.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation((arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg as Promise<unknown>[]);
      }
      if (typeof arg === 'function') {
        return (arg as (t: typeof prismaMock) => Promise<unknown>)(prismaMock);
      }
      return Promise.resolve(arg);
    });
  });

  it('GET /api/v1/site-contacts returns 200 with envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/site-contacts')
      .expect(200);

    expect(res.body).toMatchObject({
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });

  it('POST /api/v1/site-contacts validates body (400 when invalid)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/site-contacts')
      .send({})
      .expect(400);
  });

  it('POST /api/v1/site-contacts creates when valid', async () => {
    prismaMock.siteContact.create.mockResolvedValue({
      id: 5,
      siteId: 1,
      fullName: 'Jamie Smith',
      email: 'j@example.com',
      phone: null,
      role: 'Site lead',
      isPrimary: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/site-contacts')
      .send({
        siteId: 1,
        fullName: 'Jamie Smith',
        email: 'j@example.com',
        role: 'Site lead',
        isPrimary: false,
      })
      .expect(201);

    expect(res.body.fullName).toBe('Jamie Smith');
  });
});
