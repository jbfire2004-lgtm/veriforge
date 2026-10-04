import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PublicTokenResolver } from './public-token.resolver';

describe('PublicTokenResolver', () => {
  let resolver: PublicTokenResolver;
  const prisma = {
    worker: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    equipment: { findFirst: jest.fn(), findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicTokenResolver,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    resolver = module.get(PublicTokenResolver);
  });

  it('resolves worker by qr token', async () => {
    const token = 'w-550e8400-e29b-41d4-a716-446655440000';
    prisma.worker.findFirst.mockResolvedValue({ id: 5, qrToken: token });
    const out = await resolver.resolveWorkerRef(token);
    expect(out.workerId).toBe(5);
    expect(out.viaToken).toBe(true);
  });

  it('denies unknown token without numeric fallback leak', async () => {
    prisma.worker.findFirst.mockResolvedValue(null);
    await expect(
      resolver.resolveWorkerRef('w-550e8400-e29b-41d4-a716-446655440099'),
    ).rejects.toThrow(NotFoundException);
  });

  it('scopes tenant lookup by token not sequential id for equipment', async () => {
    const token = 'e-550e8400-e29b-41d4-a716-446655440000';
    prisma.equipment.findFirst.mockResolvedValue({ id: 9, qrToken: token });
    const out = await resolver.resolveEquipmentRef(token);
    expect(prisma.equipment.findFirst).toHaveBeenCalledWith({
      where: { qrToken: token },
      select: { id: true, qrToken: true },
    });
    expect(out.equipmentId).toBe(9);
  });
});
