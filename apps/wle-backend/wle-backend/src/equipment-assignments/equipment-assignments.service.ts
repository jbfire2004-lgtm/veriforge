import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentAssignmentDto } from './dto/create-equipment-assignment.dto';
import { UpdateEquipmentAssignmentDto } from './dto/update-equipment-assignment.dto';

@Injectable()
export class EquipmentAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEquipmentAssignmentDto) {
    return this.prisma.equipmentAssignment.create({
      data: {
        workerId: data.workerId,
        equipmentId: data.equipmentId ?? null,
        siteId: data.siteId ?? null,
        companyId: data.companyId ?? null,
        assignedBy: data.assignedBy ?? null,
        startAt: data.startAt ?? null,
        endAt: data.endAt ?? null,
      },
      include: {
        equipment: true,
        worker: true,
        company: true,
      },
    });
  }

  findAll() {
    return this.prisma.equipmentAssignment.findMany({
      include: {
        equipment: true,
        worker: true,
        company: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  findByWorker(workerId: number) {
    return this.prisma.equipmentAssignment.findMany({
      where: { workerId },
      include: {
        equipment: true,
        worker: true,
        company: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  findByEquipment(equipmentId: number) {
    return this.prisma.equipmentAssignment.findMany({
      where: { equipmentId },
      include: {
        equipment: true,
        worker: true,
        company: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const assignment = await this.prisma.equipmentAssignment.findUnique({
      where: { id },
      include: {
        equipment: true,
        worker: true,
        company: true,
      },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async update(id: number, data: UpdateEquipmentAssignmentDto) {
    const existing = await this.prisma.equipmentAssignment.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Assignment not found');

    return this.prisma.equipmentAssignment.update({
      where: { id },
      data: {
        workerId: data.workerId ?? existing.workerId,
        equipmentId: data.equipmentId ?? existing.equipmentId,
        siteId: data.siteId ?? existing.siteId,
        companyId: data.companyId ?? existing.companyId,
        assignedBy: data.assignedBy ?? existing.assignedBy,
        startAt: data.startAt ?? existing.startAt,
        endAt: data.endAt ?? existing.endAt,
      },
      include: {
        equipment: true,
        worker: true,
        company: true,
      },
    });
  }

  async returnEquipment(id: number) {
    const existing = await this.prisma.equipmentAssignment.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Assignment not found');

    return this.prisma.equipmentAssignment.update({
      where: { id },
      data: {
        endedAt: new Date(),
        autoEnded: true,
      },
      include: {
        equipment: true,
        worker: true,
        company: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.equipmentAssignment.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Assignment not found');

    return this.prisma.equipmentAssignment.delete({
      where: { id },
    });
  }
}
