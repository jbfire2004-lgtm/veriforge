import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentsService } from './incidents.service';

describe('IncidentsService', () => {
  let service: IncidentsService;
  const prisma = {
    incident: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    incidentComment: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(IncidentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates an incident with explicit title and defaults', async () => {
      prisma.incident.create.mockResolvedValue({ id: 1, title: 'Spill' });

      const row = await service.create({ title: 'Spill' });
      expect(prisma.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Spill',
          description: null,
          severity: 'LOW',
        }),
      });
      expect(row.id).toBe(1);
    });

    it('derives title from category when title omitted', async () => {
      prisma.incident.create.mockResolvedValue({ id: 2 });

      await service.create({
        category: 'NEAR_MISS',
        description: 'Forklift almost hit pipe',
      });

      expect(prisma.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: expect.stringContaining('NEAR MISS'),
          category: 'NEAR_MISS',
        }),
      });
    });
  });

  describe('findOne', () => {
    it('throws when missing', async () => {
      prisma.incident.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('returns incident with relations', async () => {
      prisma.incident.findUnique.mockResolvedValue({
        id: 1,
        title: 'T',
        investigations: [],
      });

      const row = await service.findOne(1);
      expect(row.id).toBe(1);
      expect(prisma.incident.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });

  describe('changeStatus', () => {
    it('updates status', async () => {
      prisma.incident.findUnique.mockResolvedValue({ id: 1, status: 'OPEN' });
      prisma.incident.update.mockResolvedValue({
        id: 1,
        status: 'IN_REVIEW',
      });

      const row = await service.changeStatus(1, 'IN_REVIEW');
      expect(prisma.incident.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'IN_REVIEW' },
      });
      expect(row.status).toBe('IN_REVIEW');
    });
  });

  describe('list', () => {
    it('filters by query params', async () => {
      prisma.incident.findMany.mockResolvedValue([]);

      await service.list({ status: 'OPEN', companyId: 3 });

      expect(prisma.incident.findMany).toHaveBeenCalledWith({
        where: {
          status: 'OPEN',
          severity: undefined,
          companyId: 3,
          siteId: undefined,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('addComment', () => {
    it('creates a comment when incident exists', async () => {
      prisma.incident.findUnique.mockResolvedValue({ id: 1 });
      prisma.incidentComment.create.mockResolvedValue({ id: 2 });

      await service.addComment({
        incidentId: 1,
        message: 'Note',
        userId: 5,
      });

      expect(prisma.incidentComment.create).toHaveBeenCalledWith({
        data: {
          incidentId: 1,
          userId: 5,
          message: 'Note',
        },
      });
    });
  });

  describe('remove', () => {
    it('deletes existing incident', async () => {
      prisma.incident.findUnique.mockResolvedValue({ id: 1 });
      prisma.incident.delete.mockResolvedValue({});

      const out = await service.remove(1);
      expect(prisma.incident.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(out).toEqual({ status: 'ok', deletedId: 1 });
    });
  });
});
