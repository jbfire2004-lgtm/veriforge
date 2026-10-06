import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class CompanyRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: number) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  listWorkers(companyId: number) {
    return this.prisma.worker.findMany({
      where: { companyId },
      orderBy: { lastName: 'asc' },
    });
  }

  listEquipmentLinks(companyId: number) {
    return this.prisma.equipmentLink.findMany({
      where: { companyId, active: true },
      include: { equipment: true },
    });
  }
}
