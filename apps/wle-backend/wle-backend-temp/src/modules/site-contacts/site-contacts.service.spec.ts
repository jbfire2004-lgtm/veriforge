import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { SiteContactsService } from './site-contacts.service';

describe('SiteContactsService (unit)', () => {
  let service: SiteContactsService;
  const prisma = {
    siteContact: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    site: { count: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg as Promise<unknown>[]);
      }
      if (typeof arg === 'function') {
        return (arg as (tx: typeof prisma) => Promise<unknown>)(
          prisma as never,
        );
      }
      return Promise.resolve(arg);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteContactsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SiteContactsService);
  });

  it('findPage returns paginated data', async () => {
    prisma.siteContact.findMany.mockResolvedValue([
      {
        id: 1,
        siteId: 1,
        fullName: 'Alex',
        email: 'a@x.com',
        phone: null,
        role: 'Supervisor',
        isPrimary: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.siteContact.count.mockResolvedValue(1);

    const out = await service.findPage({ page: 1, limit: 10, siteId: 1 });
    expect(out.total).toBe(1);
    expect(out.data[0].fullName).toBe('Alex');
  });

  it('findOne throws when missing', async () => {
    prisma.siteContact.findUnique.mockResolvedValue(null);
    await expect(service.findOne(9)).rejects.toThrow(NotFoundException);
  });
});
