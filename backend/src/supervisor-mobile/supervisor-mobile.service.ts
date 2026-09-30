import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupervisorMobileService {
  constructor(private prisma: PrismaService) {}

  async quickView() {
    return this.prisma.workerAssignment.findMany({
      where: { endedAt: null },
      include: {
        worker: true,
        equipment: true,
        site: true,
      },
      orderBy: { assignedAt: 'desc' },
      take: 50,
    });
  }

  async quickAssign(data: {
    workerId: number;
    siteId?: number;
    equipmentId?: number;
    companyId?: number;
    assignedBy: number;
  }) {
    return this.prisma.workerAssignment.create({
      data: {
        workerId: data.workerId,
        siteId: data.siteId ?? null,
        equipmentId: data.equipmentId ?? null,
        companyId: data.companyId ?? null,
        assignedBy: data.assignedBy,
      },
    });
  }
}
