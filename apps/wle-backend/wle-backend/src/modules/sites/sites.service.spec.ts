import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { SitesService } from './sites.service';

describe('SitesService', () => {
  let service: SitesService;
  const prisma = {
    site: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((ops: Promise<unknown>[]) =>
      Promise.all(ops),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [SitesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SitesService);
  });

  it('returns paginated list', async () => {
    prisma.site.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Main',
        code: 'M01',
        region: 'North',
        active: true,
        createdAt: new Date(),
      },
    ]);
    prisma.site.count.mockResolvedValue(1);

    const out = await service.findPage({ page: 1, limit: 20 });
    expect(out.total).toBe(1);
    expect(out.data[0].name).toBe('Main');
  });

  it('throws NotFound when site missing', async () => {
    prisma.site.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });
});
