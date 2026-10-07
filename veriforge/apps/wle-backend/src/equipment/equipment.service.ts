import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { AdoptionEventService } from '../modules/adoption-analytics/adoption-event.service';
import { ADOPTION_EVENT_TYPES } from '../modules/adoption-analytics/adoption-analytics.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    private prisma: PrismaService,
    @Optional() private readonly adoption?: AdoptionEventService,
  ) {}

  // CREATE EQUIPMENT
  async create(dto: CreateEquipmentDto) {
    const created = await this.prisma.equipment.create({
      data: {
        name: dto.name,
        serialNumber: dto.serialNumber ?? null,
        safetyStatus: dto.safetyStatus ?? undefined,
        companyId: dto.companyId ?? null,
        photoUrl: dto.photoUrl ?? null,
      },
    });
    if (dto.companyId && this.adoption) {
      this.adoption.track({
        companyId: dto.companyId,
        event: ADOPTION_EVENT_TYPES.EQUIPMENT_CREATED,
        metadata: { equipmentId: created.id },
      });
    }
    return created;
  }

  // LIST ALL EQUIPMENT
  async findAll() {
    return this.prisma.equipment.findMany({
      include: {
        company: true,
        incidents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCompany(companyId: number) {
    return this.prisma.equipment.findMany({
      where: { companyId },
      include: { company: true, incidents: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // GET ONE EQUIPMENT
  async findOne(id: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        company: true,
        incidents: true,
        equipmentAssignments: {
          include: {
            worker: true,
          },
        },
      },
    });

    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  // FULL PROFILE FOR EQUIPMENT PROFILE PAGE
  async getProfile(id: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        company: true,
        incidents: true,
        equipmentAssignments: {
          include: {
            worker: true,
            company: true,
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  // UPDATE EQUIPMENT
  async update(id: number, dto: UpdateEquipmentDto) {
    const existing = await this.prisma.equipment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Equipment not found');

    return this.prisma.equipment.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        serialNumber: dto.serialNumber ?? existing.serialNumber,
        safetyStatus: dto.safetyStatus ?? existing.safetyStatus,
        companyId: dto.companyId ?? existing.companyId,
        photoUrl: dto.photoUrl ?? existing.photoUrl,
      },
    });
  }

  // DELETE EQUIPMENT
  async remove(id: number) {
    const existing = await this.prisma.equipment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Equipment not found');

    await this.prisma.equipment.delete({ where: { id } });
    return { status: 'ok', deletedId: id };
  }
}
