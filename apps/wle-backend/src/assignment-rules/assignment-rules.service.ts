import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentRulesService {
  constructor(private prisma: PrismaService) {}

  async setEquipmentRequirement(equipmentId: number, certId: number) {
    return this.prisma.equipmentTrainingRequirement.create({
      data: { equipmentId, certificationId: certId },
    });
  }

  async removeEquipmentRequirement(id: number) {
    return this.prisma.equipmentTrainingRequirement.delete({ where: { id } });
  }

  async listEquipmentRequirements(equipmentId: number) {
    return this.prisma.equipmentTrainingRequirement.findMany({
      where: { equipmentId },
      include: { certification: true },
    });
  }

  async banWorkerFromSite(workerId: number, siteId: number) {
    return this.prisma.workerSiteAccess.upsert({
      where: { workerId_siteId: { workerId, siteId } },
      update: { status: 'BANNED' },
      create: { workerId, siteId, status: 'BANNED' },
    });
  }

  async unbanWorkerFromSite(workerId: number, siteId: number) {
    return this.prisma.workerSiteAccess.update({
      where: { workerId_siteId: { workerId, siteId } },
      data: { status: 'ALLOWED' },
    });
  }
}
