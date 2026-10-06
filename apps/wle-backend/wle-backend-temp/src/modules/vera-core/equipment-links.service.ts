import { Injectable, NotFoundException } from '@nestjs/common';
import { LinkComplianceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InactivationService } from './inactivation.service';
import { randomBytes } from 'crypto';
import { CompetencyService } from '../competency/competency.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';

@Injectable()
export class EquipmentLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inactivation: InactivationService,
    private readonly competency: CompetencyService,
    private readonly compliance: EquipmentComplianceService,
  ) {}

  async listByCompany(companyId: number, activeOnly = true) {
    return this.prisma.equipmentLink.findMany({
      where: { companyId, ...(activeOnly ? { active: true } : {}) },
      include: {
        equipment: true,
        assignedWorkers: { include: { worker: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async linkEquipment(
    equipmentId: number,
    companyId: number,
    opts?: { deactivateOtherCompanies?: boolean },
  ) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    if (equipment.lockedOutAt) {
      throw new NotFoundException('Equipment is locked out');
    }

    if (opts?.deactivateOtherCompanies !== false) {
      const otherLinks = await this.prisma.equipmentLink.findMany({
        where: { equipmentId, active: true, companyId: { not: companyId } },
      });
      for (const link of otherLinks) {
        await this.inactivation.deactivateEquipmentAtCompany(
          equipmentId,
          link.companyId,
          'NEW_COMPANY_LINK',
        );
      }
    }

    const existing = await this.prisma.equipmentLink.findFirst({
      where: { equipmentId, companyId, active: true },
    });
    if (existing) {
      return this.prisma.equipmentLink.findUniqueOrThrow({
        where: { id: existing.id },
        include: { equipment: true, company: true },
      });
    }

    const link = await this.prisma.equipmentLink.create({
      data: {
        equipmentId,
        companyId,
        active: true,
        complianceStatus: LinkComplianceStatus.COMPLIANT,
      },
      include: { equipment: true, company: true },
    });

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { companyId },
    });

    if (!equipment.qrToken) {
      await this.prisma.equipment.update({
        where: { id: equipmentId },
        data: { qrToken: `e-${randomBytes(8).toString('hex')}` },
      });
    }

    await this.compliance.recalculate(equipmentId, {
      trigger: 'MANUAL',
      notes: 'Linked to company',
    });

    return link;
  }

  async linkByQrToken(qrToken: string, companyId: number) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { qrToken },
    });
    if (!equipment) throw new NotFoundException('Equipment not found for QR');
    return this.linkEquipment(equipment.id, companyId);
  }

  async endAssignment(equipmentId: number, companyId: number) {
    return this.inactivation.deactivateEquipmentAtCompany(
      equipmentId,
      companyId,
      'END_ASSIGNMENT',
    );
  }

  async assignWorkerToEquipmentLink(equipmentLinkId: number, workerId: number) {
    const link = await this.prisma.equipmentLink.findUnique({
      where: { id: equipmentLinkId },
    });
    if (!link?.active) throw new NotFoundException('Equipment link not active');

    const companyLink = await this.prisma.companyLink.findFirst({
      where: {
        workerId,
        companyId: link.companyId,
        active: true,
      },
    });
    if (!companyLink) {
      throw new NotFoundException('Worker must be active at company');
    }

    await this.competency.assertEligible(workerId, link.equipmentId);

    return this.prisma.equipmentLinkWorker.upsert({
      where: {
        equipmentLinkId_workerId: { equipmentLinkId, workerId },
      },
      create: { equipmentLinkId, workerId },
      update: {},
      include: { worker: true },
    });
  }
}
