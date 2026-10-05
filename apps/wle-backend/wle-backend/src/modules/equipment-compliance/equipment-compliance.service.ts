import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EquipmentLockoutStatus,
  LinkComplianceStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type ComplianceTrigger =
  | 'INSPECTION'
  | 'COMPETENCY'
  | 'TRAINING'
  | 'LOCKOUT'
  | 'UNLOCK'
  | 'MAINTENANCE'
  | 'CALIBRATION'
  | 'MANUAL'
  | 'SCHEDULED';

export type RecalculateOptions = {
  trigger: ComplianceTrigger;
  assessedByUserId?: number;
  notes?: string;
  inspectionId?: number;
  /** Skip rule engine and persist this status (e.g. explicit lockout). */
  forceStatus?: LinkComplianceStatus;
};

@Injectable()
export class EquipmentComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculate(equipmentId: number, opts: RecalculateOptions) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        trainingRequirements: { include: { certification: true } },
        competencyRequirements: true,
        equipmentLinks: {
          where: { active: true },
          include: {
            assignedWorkers: {
              include: {
                worker: {
                  include: {
                    trainingRecords: true,
                    competencyEvaluations: {
                      where: { equipmentId },
                      orderBy: { evaluationDate: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
        inspections: {
          where: { completedAt: { not: null } },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
        calibrations: { orderBy: { calibratedAt: 'desc' }, take: 1 },
        maintenanceRecords: { orderBy: { performedAt: 'desc' }, take: 1 },
        maintenanceSchedules: { where: { active: true } },
        calibrationSchedules: { where: { active: true } },
      },
    });

    if (!equipment) throw new NotFoundException('Equipment not found');

    const trainingRequired = equipment.trainingRequirements.length > 0;
    const competencyRequired =
      equipment.competencyRequirements != null ||
      (equipment.typeId != null &&
        (await this.prisma.equipmentTypeCompetencyRequirement.findUnique({
          where: { equipmentTypeId: equipment.typeId },
        })) != null);

    const lastInspection = equipment.inspections[0];
    const lastInspectionAt = lastInspection?.completedAt ?? null;
    const nextInspectionAt =
      lastInspection?.nextInspectionDate ??
      (
        await this.prisma.inspection.findFirst({
          where: {
            equipmentId,
            passed: true,
            nextInspectionDate: { not: null },
          },
          orderBy: { nextInspectionDate: 'asc' },
          select: { nextInspectionDate: true },
        })
      )?.nextInspectionDate ??
      null;

    const lockoutStatus: EquipmentLockoutStatus = equipment.lockedOutAt
      ? EquipmentLockoutStatus.LOCKED_OUT
      : EquipmentLockoutStatus.CLEAR;

    const status =
      opts.forceStatus ??
      this.computeStatus({
        equipment,
        trainingCertIds: equipment.trainingRequirements.map(
          (r) => r.certificationId,
        ),
        lockoutStatus,
        nextInspectionAt,
        trainingRequired,
        competencyRequired,
      });

    const now = new Date();

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        complianceStatus: status,
        lastInspectionAt,
        nextInspectionAt,
        lockoutStatus,
        competencyRequired,
        trainingRequired,
        complianceUpdatedAt: now,
      },
    });

    const companyId =
      equipment.companyId ?? equipment.equipmentLinks[0]?.companyId ?? null;

    if (companyId) {
      await this.prisma.equipmentLink.updateMany({
        where: { equipmentId, companyId, active: true },
        data: { complianceStatus: status },
      });

      await this.prisma.equipmentComplianceStatus.create({
        data: {
          equipmentId,
          companyId,
          status,
          assessedByUserId: opts.assessedByUserId ?? null,
          notes: opts.notes ?? `${opts.trigger}: ${status}`,
          inspectionId: opts.inspectionId ?? null,
        },
      });
    }

    return {
      equipmentId,
      complianceStatus: status,
      lockoutStatus,
      lastInspectionAt,
      nextInspectionAt,
      competencyRequired,
      trainingRequired,
      complianceUpdatedAt: now,
      trigger: opts.trigger,
    };
  }

  async recalculateForCertification(certificationId: number) {
    const equipmentIds =
      await this.prisma.equipmentTrainingRequirement.findMany({
        where: { certificationId },
        select: { equipmentId: true },
      });
    const ids = [...new Set(equipmentIds.map((r) => r.equipmentId))];
    for (const id of ids) {
      await this.recalculate(id, {
        trigger: 'TRAINING',
        notes: 'Training record ingested',
      });
    }
    return { recalculated: ids.length };
  }

  async dashboard(companyId?: number) {
    const where: Prisma.EquipmentWhereInput = companyId
      ? {
          OR: [
            { companyId },
            { equipmentLinks: { some: { companyId, active: true } } },
          ],
        }
      : {};

    const [
      total,
      compliant,
      needsAttention,
      nonCompliant,
      lockedOut,
      overdueInspection,
      recent,
    ] = await Promise.all([
      this.prisma.equipment.count({ where }),
      this.prisma.equipment.count({
        where: { ...where, complianceStatus: LinkComplianceStatus.COMPLIANT },
      }),
      this.prisma.equipment.count({
        where: {
          ...where,
          complianceStatus: LinkComplianceStatus.NEEDS_ATTENTION,
        },
      }),
      this.prisma.equipment.count({
        where: {
          ...where,
          complianceStatus: LinkComplianceStatus.NON_COMPLIANT,
        },
      }),
      this.prisma.equipment.count({
        where: { ...where, complianceStatus: LinkComplianceStatus.LOCKED_OUT },
      }),
      this.prisma.equipment.count({
        where: {
          ...where,
          nextInspectionAt: { lt: new Date() },
          lockoutStatus: EquipmentLockoutStatus.CLEAR,
        },
      }),
      this.prisma.equipment.findMany({
        where: {
          ...where,
          complianceStatus: {
            in: [
              LinkComplianceStatus.NON_COMPLIANT,
              LinkComplianceStatus.NEEDS_ATTENTION,
              LinkComplianceStatus.LOCKED_OUT,
            ],
          },
        },
        orderBy: { complianceUpdatedAt: 'desc' },
        take: 25,
        select: {
          id: true,
          name: true,
          complianceStatus: true,
          lockoutStatus: true,
          lastInspectionAt: true,
          nextInspectionAt: true,
          competencyRequired: true,
          trainingRequired: true,
          safetyStatus: true,
          company: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      total,
      compliant,
      needsAttention,
      nonCompliant,
      lockedOut,
      overdueInspection,
      recent,
    };
  }

  private computeStatus(ctx: {
    equipment: {
      safetyStatus: string;
      lockedOutAt: Date | null;
      calibrations: {
        passed: boolean;
        expiresAt: Date | null;
      }[];
      maintenanceRecords: { nextDueAt: Date | null }[];
      maintenanceSchedules: { nextDueAt: Date | null }[];
      calibrationSchedules: { nextDueAt: Date | null }[];
      equipmentLinks: {
        assignedWorkers: {
          worker: {
            trainingRecords: {
              certificationId: number;
              expiresAt: Date | null;
            }[];
            competencyEvaluations: {
              passed: boolean;
              expiresAt: Date | null;
            }[];
          };
        }[];
      }[];
    };
    trainingCertIds: number[];
    lockoutStatus: EquipmentLockoutStatus;
    nextInspectionAt: Date | null;
    trainingRequired: boolean;
    competencyRequired: boolean;
  }): LinkComplianceStatus {
    const {
      equipment,
      trainingCertIds,
      lockoutStatus,
      nextInspectionAt,
      trainingRequired,
      competencyRequired,
    } = ctx;

    if (
      lockoutStatus === EquipmentLockoutStatus.LOCKED_OUT ||
      equipment.safetyStatus === 'UNSAFE'
    ) {
      return LinkComplianceStatus.LOCKED_OUT;
    }

    const now = new Date();

    if (nextInspectionAt && nextInspectionAt < now) {
      return LinkComplianceStatus.NON_COMPLIANT;
    }

    if (equipment.safetyStatus === 'NEEDS_INSPECTION') {
      return LinkComplianceStatus.NEEDS_ATTENTION;
    }

    const latestCal = equipment.calibrations[0];
    if (latestCal) {
      if (!latestCal.passed) return LinkComplianceStatus.NEEDS_ATTENTION;
      if (latestCal.expiresAt && latestCal.expiresAt < now) {
        return LinkComplianceStatus.NEEDS_ATTENTION;
      }
    }

    const latestMaint = equipment.maintenanceRecords[0];
    if (latestMaint?.nextDueAt && latestMaint.nextDueAt < now) {
      return LinkComplianceStatus.NEEDS_ATTENTION;
    }

    const maintScheduleDue = equipment.maintenanceSchedules?.some(
      (s) => s.nextDueAt && s.nextDueAt < now,
    );
    if (maintScheduleDue) return LinkComplianceStatus.NEEDS_ATTENTION;

    const calScheduleDue = equipment.calibrationSchedules?.some(
      (s) => s.nextDueAt && s.nextDueAt < now,
    );
    if (calScheduleDue) return LinkComplianceStatus.NEEDS_ATTENTION;

    const activeLink = equipment.equipmentLinks[0];
    const operators = activeLink?.assignedWorkers ?? [];

    if (
      trainingRequired &&
      operators.length > 0 &&
      trainingCertIds.length > 0
    ) {
      const allTrained = operators.every((aw) => {
        const records = aw.worker.trainingRecords;
        return trainingCertIds.every((certId) =>
          records.some(
            (tr) =>
              tr.certificationId === certId &&
              (!tr.expiresAt || tr.expiresAt > now),
          ),
        );
      });
      if (!allTrained) return LinkComplianceStatus.NON_COMPLIANT;
    }

    if (competencyRequired && operators.length > 0) {
      const allCompetent = operators.every((aw) => {
        const ev = aw.worker.competencyEvaluations[0];
        return ev?.passed && (!ev.expiresAt || ev.expiresAt > now);
      });
      if (!allCompetent) return LinkComplianceStatus.NEEDS_ATTENTION;
    }

    return LinkComplianceStatus.COMPLIANT;
  }
}
