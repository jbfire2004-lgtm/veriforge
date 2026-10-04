import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class InspectionRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: number) {
    return this.prisma.inspection.findUnique({
      where: { id },
      include: { equipment: true, worker: true },
    });
  }

  listByEquipment(equipmentId: number) {
    return this.prisma.inspection.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
