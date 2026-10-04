import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DigitalSignoffService {
  constructor(private prisma: PrismaService) {}

  // CREATE SIGNOFF
  async create(data: {
    workerId?: number;
    equipmentId?: number;
    supervisorId: number;
    siteId?: number;
    checklist: any;
    workerSignature?: string;
    supervisorSignature: string;
    notes?: string;
  }) {
    return this.prisma.digitalSignoff.create({
      data: {
        workerId: data.workerId ?? null,
        equipmentId: data.equipmentId ?? null,
        supervisorId: data.supervisorId,
        siteId: data.siteId ?? null,
        checklist: data.checklist,
        workerSignature: data.workerSignature ?? null,
        supervisorSignature: data.supervisorSignature,
        notes: data.notes ?? null,
      },
      include: {
        worker: true,
        equipment: true,
        site: true,
        supervisor: true,
      },
    });
  }

  // GET SIGNOFF BY ID
  async findOne(id: number) {
    const signoff = await this.prisma.digitalSignoff.findUnique({
      where: { id },
      include: {
        worker: true,
        equipment: true,
        site: true,
        supervisor: true,
      },
    });

    if (!signoff) throw new NotFoundException('Signoff not found');
    return signoff;
  }

  // LIST ALL SIGNOFFS
  async findAll() {
    return this.prisma.digitalSignoff.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        site: true,
        supervisor: true,
      },
    });
  }

  // FILTERS
  async forWorker(workerId: number) {
    return this.prisma.digitalSignoff.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        site: true,
        supervisor: true,
      },
    });
  }

  async forEquipment(equipmentId: number) {
    return this.prisma.digitalSignoff.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        site: true,
        supervisor: true,
      },
    });
  }

  async forSupervisor(supervisorId: number) {
    return this.prisma.digitalSignoff.findMany({
      where: { supervisorId },
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        site: true,
        supervisor: true,
      },
    });
  }

  async forSite(siteId: number) {
    return this.prisma.digitalSignoff.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
      include: {
        worker: true,
        equipment: true,
        site: true,
        supervisor: true,
      },
    });
  }
}
