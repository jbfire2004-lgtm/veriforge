import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { InvestigationsService } from './investigations.service';

describe('InvestigationsService', () => {
  let service: InvestigationsService;
  const prisma = {
    incident: {
      findUnique: jest.fn(),
    },
    investigation: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestigationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(InvestigationsService);
  });

  describe('startInvestigation', () => {
    it('throws when incident does not exist', async () => {
      prisma.incident.findUnique.mockResolvedValue(null);
      await expect(service.startInvestigation(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('creates investigation for incident', async () => {
      prisma.incident.findUnique.mockResolvedValue({ id: 5 });
      prisma.investigation.create.mockResolvedValue({ id: 9, incidentId: 5 });

      const inv = await service.startInvestigation(5);
      expect(prisma.investigation.create).toHaveBeenCalledWith({
        data: { incidentId: 5 },
      });
      expect(inv.id).toBe(9);
    });
  });

  describe('assignInvestigator', () => {
    it('updates investigator id', async () => {
      prisma.investigation.update.mockResolvedValue({
        id: 1,
        investigatorId: 3,
      });

      const inv = await service.assignInvestigator(1, 3);
      expect(prisma.investigation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { investigatorId: 3 },
      });
      expect(inv.investigatorId).toBe(3);
    });
  });
});
