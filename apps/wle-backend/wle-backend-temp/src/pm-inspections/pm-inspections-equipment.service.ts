import { Injectable } from '@nestjs/common';
import { EquipmentSafetyStatus, PmDeficiencySeverity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InactivationService } from '../modules/vera-core/inactivation.service';

@Injectable()
export class PmInspectionsEquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inactivation: InactivationService,
  ) {}

  async evaluateEquipmentBlock(inspectionId: string): Promise<{
    blocked: boolean;
    reason?: string;
  }> {
    const inspection = await this.prisma.pmInspection.findUnique({
      where: { id: inspectionId },
      include: {
        deficiencies: { where: { status: { not: 'closed' } } },
        equipment: true,
      },
    });
    if (!inspection?.equipmentId || !inspection.equipment) {
      return { blocked: false };
    }

    const critical = inspection.deficiencies.filter(
      (d) => d.severity === 'critical',
    );
    if (critical.length > 0) {
      return {
        blocked: true,
        reason: `${critical.length} critical open deficiency(ies)`,
      };
    }

    if (inspection.passed === false) {
      return { blocked: true, reason: 'Inspection failed' };
    }

    if (
      inspection.equipment.complianceStatus === 'NON_COMPLIANT' ||
      inspection.equipment.complianceStatus === 'LOCKED_OUT'
    ) {
      return { blocked: true, reason: 'Equipment compliance not current' };
    }

    if (
      inspection.equipment.nextInspectionAt &&
      inspection.equipment.nextInspectionAt < new Date()
    ) {
      return { blocked: true, reason: 'Required inspection overdue' };
    }

    return { blocked: false };
  }

  async applyLockoutIfNeeded(
    inspectionId: string,
    actorUserId: number,
  ): Promise<boolean> {
    const block = await this.evaluateEquipmentBlock(inspectionId);
    if (!block.blocked) return false;

    const inspection = await this.prisma.pmInspection.findUnique({
      where: { id: inspectionId },
      include: { equipment: true },
    });
    if (!inspection?.equipmentId || !inspection.equipment) return false;

    const reason = block.reason ?? 'PM inspection block';
    await this.inactivation.lockoutEquipment(inspection.equipmentId, reason);
    await this.prisma.equipment.update({
      where: { id: inspection.equipmentId },
      data: {
        safetyStatus: EquipmentSafetyStatus.UNSAFE,
        lockedOutAt: new Date(),
        lockoutReason: reason,
      },
    });
    await this.prisma.equipmentLockout.create({
      data: {
        equipmentId: inspection.equipmentId,
        companyId: inspection.equipment.companyId,
        reason,
        lockedByUserId: actorUserId,
      },
    });
    return true;
  }

  static severityRequiresLockout(severity: PmDeficiencySeverity): boolean {
    return severity === 'critical';
  }
}
