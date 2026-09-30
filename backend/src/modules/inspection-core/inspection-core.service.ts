import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EquipmentSafetyStatus,
  InspectionKind,
  InspectionType,
  LinkComplianceStatus,
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InactivationService } from '../vera-core/inactivation.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { CreateChecklistDto, UpdateChecklistDto } from './dto/checklist.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { EquipmentBridgeService } from '../../safety-intelligence/equipment-bridge/equipment-bridge.service';

const inspectionInclude = {
  equipment: {
    select: { id: true, name: true, companyId: true, catalogTypeKey: true },
  },
  worker: { select: { id: true, firstName: true, lastName: true } },
  supervisor: { select: { id: true, email: true, username: true } },
  checklistTemplate: true,
} satisfies Prisma.InspectionInclude;

const DEFAULT_INTERVAL_DAYS: Partial<Record<InspectionType, number>> = {
  PRE_USE: 1,
  SCHEDULED: 7,
  PME: 30,
  CRANE_LIFT: 30,
  LIFTING_GEAR: 90,
  VEHICLE: 1,
  TOOL: 90,
  HYDRAULIC_PNEUMATIC: 30,
};

type InspectionRow = Prisma.InspectionGetPayload<{
  include: typeof inspectionInclude;
}>;

/** API alias: `inspectorId` / `inspector` mirror `supervisorId` / `supervisor`. */
function toInspectionResponse(row: InspectionRow) {
  const { supervisor, supervisorId, ...rest } = row;
  return {
    ...rest,
    inspectorId: supervisorId,
    inspector: supervisor,
    supervisorId,
    supervisor,
  };
}

@Injectable()
export class InspectionCoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inactivation: InactivationService,
    private readonly compliance: EquipmentComplianceService,
    private readonly equipmentCailBridge: EquipmentBridgeService,
  ) {}

  async dashboard(companyId?: number) {
    const equipmentWhere: Prisma.EquipmentWhereInput = companyId
      ? { companyId }
      : {};

    const [total, passed, failed, lockedOut, dueSoon, recent] =
      await Promise.all([
        this.prisma.inspection.count({
          where: companyId ? { equipment: { companyId } } : undefined,
        }),
        this.prisma.inspection.count({
          where: {
            passed: true,
            ...(companyId ? { equipment: { companyId } } : {}),
          },
        }),
        this.prisma.inspection.count({
          where: {
            passed: false,
            ...(companyId ? { equipment: { companyId } } : {}),
          },
        }),
        this.prisma.equipment.count({
          where: {
            ...equipmentWhere,
            lockedOutAt: { not: null },
          },
        }),
        this.prisma.inspection.count({
          where: {
            passed: true,
            nextInspectionDate: {
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              gte: new Date(),
            },
            ...(companyId ? { equipment: { companyId } } : {}),
          },
        }),
        this.prisma.inspection.findMany({
          where: companyId ? { equipment: { companyId } } : undefined,
          orderBy: { createdAt: 'desc' },
          take: 25,
          include: inspectionInclude,
        }),
      ]);

    return {
      totalInspections: total,
      passed,
      failed,
      lockedOutEquipment: lockedOut,
      dueWithin7Days: dueSoon,
      recent: recent.map(toInspectionResponse),
    };
  }

  async listChecklists(filters?: {
    inspectionType?: InspectionType;
    category?: string;
    activeOnly?: boolean;
  }) {
    return this.prisma.inspectionChecklist.findMany({
      where: {
        inspectionType: filters?.inspectionType,
        category: filters?.category as never,
        active: filters?.activeOnly === false ? undefined : true,
      },
      orderBy: [{ inspectionType: 'asc' }, { name: 'asc' }],
    });
  }

  async getChecklist(id: number) {
    const row = await this.prisma.inspectionChecklist.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException('Checklist not found');
    return row;
  }

  async createChecklist(dto: CreateChecklistDto) {
    return this.prisma.inspectionChecklist.create({
      data: {
        name: dto.name,
        category: dto.category,
        inspectionType: dto.inspectionType,
        items: dto.items as unknown as Prisma.InputJsonValue,
        intervalDays: dto.intervalDays,
        intervalHours: dto.intervalHours,
        active: dto.active ?? true,
      },
    });
  }

  async updateChecklist(id: number, dto: UpdateChecklistDto) {
    await this.getChecklist(id);
    return this.prisma.inspectionChecklist.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        inspectionType: dto.inspectionType,
        items: dto.items as unknown as Prisma.InputJsonValue | undefined,
        intervalDays: dto.intervalDays,
        intervalHours: dto.intervalHours,
        active: dto.active,
      },
    });
  }

  async submitInspection(dto: CreateInspectionDto, inspectorUserId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: dto.equipmentId },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const checklistTemplate = dto.checklistId
      ? await this.getChecklist(dto.checklistId)
      : null;

    const inspectionType =
      dto.inspectionType ??
      checklistTemplate?.inspectionType ??
      InspectionType.PRE_USE;

    const kind =
      dto.kind ??
      (inspectionType === InspectionType.PRE_USE
        ? InspectionKind.PRE_USE
        : InspectionKind.FORMAL);

    const nextInspectionDate = dto.passed
      ? this.computeNextInspectionDate(
          equipment.meterHours,
          dto.meterReading,
          inspectionType,
          checklistTemplate,
        )
      : null;

    const inspection = await this.prisma.inspection.create({
      data: {
        equipmentId: dto.equipmentId,
        workerId: dto.workerId,
        siteId: dto.siteId,
        supervisorId: inspectorUserId,
        checklistId: dto.checklistId,
        kind,
        inspectionType,
        checklist: dto.checklist as Prisma.InputJsonValue,
        passed: dto.passed,
        status: dto.passed ? 'PASSED' : 'FAILED',
        notes: dto.notes,
        correctiveActions: dto.correctiveActions,
        photos: dto.photos as Prisma.InputJsonValue | undefined,
        completedAt: new Date(),
        signature: dto.signature,
        meterReading: dto.meterReading,
        nextInspectionDate,
        lockoutTriggered: false,
      },
      include: inspectionInclude,
    });

    let lockoutTriggered = false;

    if (!dto.passed) {
      lockoutTriggered = true;
      const lockReason = dto.correctiveActions ?? 'Failed inspection';
      await this.inactivation.lockoutEquipment(dto.equipmentId, lockReason);
      await this.prisma.equipmentLockout.create({
        data: {
          equipmentId: dto.equipmentId,
          companyId: equipment.companyId,
          reason: lockReason,
          lockedByUserId: inspectorUserId,
        },
      });
      if (equipment.companyId) {
        await this.inactivation.deactivateEquipmentAtCompany(
          dto.equipmentId,
          equipment.companyId,
          'INSPECTION_FAILED',
        );
        await this.compliance.recalculate(dto.equipmentId, {
          trigger: 'INSPECTION',
          assessedByUserId: inspectorUserId,
          notes: dto.correctiveActions ?? 'Inspection failed',
          inspectionId: inspection.id,
          forceStatus: LinkComplianceStatus.LOCKED_OUT,
        });
      }
      await this.prisma.inspection.update({
        where: { id: inspection.id },
        data: { lockoutTriggered: true },
      });
      try {
        await this.equipmentCailBridge.emitFromInspection(
          inspection.id,
          inspectorUserId,
        );
      } catch {
        // CAIL emit is best-effort when project cannot be resolved
      }

      await this.notifyInspectionFailed(
        equipment.companyId,
        inspection,
        dto.correctiveActions,
      );
    } else {
      if (equipment.safetyStatus === EquipmentSafetyStatus.UNSAFE) {
        await this.prisma.equipment.update({
          where: { id: dto.equipmentId },
          data: {
            safetyStatus: EquipmentSafetyStatus.OK,
            lockedOutAt: null,
            lockoutReason: null,
          },
        });
      }
      if (equipment.companyId) {
        await this.compliance.recalculate(dto.equipmentId, {
          trigger: 'INSPECTION',
          assessedByUserId: inspectorUserId,
          notes: `Inspection passed (${inspectionType})`,
          inspectionId: inspection.id,
        });
      }
      await this.prisma.equipment.update({
        where: { id: dto.equipmentId },
        data: { safetyStatus: EquipmentSafetyStatus.OK },
      });
    }

    if (dto.meterReading != null) {
      await this.prisma.equipment.update({
        where: { id: dto.equipmentId },
        data: { meterHours: dto.meterReading },
      });
    }

    if (dto.workerId) {
      await this.syncWorkerWallet(
        dto.workerId,
        dto.equipmentId,
        dto.passed,
        inspectionType,
      );
    }

    return {
      ...toInspectionResponse(inspection),
      lockoutTriggered,
    };
  }

  async unlockEquipment(equipmentId: number, userId: number, notes?: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    if (!equipment.lockedOutAt) {
      throw new BadRequestException('Equipment is not locked out');
    }

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        safetyStatus: EquipmentSafetyStatus.OK,
        lockedOutAt: null,
        lockoutReason: null,
      },
    });

    await this.prisma.equipmentLockout.updateMany({
      where: { equipmentId, unlockedAt: null },
      data: { unlockedAt: new Date(), unlockedByUserId: userId },
    });

    if (equipment.companyId) {
      await this.compliance.recalculate(equipmentId, {
        trigger: 'UNLOCK',
        assessedByUserId: userId,
        notes: notes ?? 'Manual unlock after corrective action',
      });
    }

    return { equipmentId, unlocked: true };
  }

  async listForEquipment(equipmentId: number) {
    const rows = await this.prisma.inspection.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      include: inspectionInclude,
    });
    return rows.map(toInspectionResponse);
  }

  async getInspection(id: number) {
    const row = await this.prisma.inspection.findUnique({
      where: { id },
      include: inspectionInclude,
    });
    if (!row) throw new NotFoundException('Inspection not found');
    return toInspectionResponse(row);
  }

  async listDue(companyId?: number, withinDays = 7) {
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    const rows = await this.prisma.inspection.findMany({
      where: {
        passed: true,
        nextInspectionDate: { lte: until, gte: new Date() },
        ...(companyId ? { equipment: { companyId } } : {}),
      },
      orderBy: { nextInspectionDate: 'asc' },
      include: inspectionInclude,
    });
    return rows.map(toInspectionResponse);
  }

  /**
   * Creates IN_APP notifications for inspections due within `withinDays`.
   * Skips equipment already notified today (idempotent for cron).
   */
  async notifyDueInspections(companyId?: number, withinDays = 7) {
    const due = await this.listDue(companyId, withinDays);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let created = 0;
    const seenEquipment = new Set<number>();

    for (const row of due) {
      const eqId = row.equipmentId;
      if (eqId == null || seenEquipment.has(eqId)) continue;
      seenEquipment.add(eqId);

      const eqCompanyId = row.equipment?.companyId;
      if (!eqCompanyId) continue;

      const already = await this.prisma.notification.findFirst({
        where: {
          type: 'INSPECTION_DUE',
          createdAt: { gte: startOfDay },
          payload: { path: ['equipmentId'], equals: eqId },
        },
      });
      if (already) continue;

      const admins = await this.prisma.user.findMany({
        where: {
          companyId: eqCompanyId,
          role: { in: ['COMPANY_ADMIN', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'] },
        },
        select: { id: true },
        take: 20,
      });

      const payload = {
        equipmentId: eqId,
        equipmentName: row.equipment?.name,
        inspectionType: row.inspectionType,
        nextInspectionDate: row.nextInspectionDate?.toISOString(),
      };

      const dedupeKey = `INSPECTION_DUE:${eqId}:${startOfDay
        .toISOString()
        .slice(0, 10)}`;
      await this.prisma.notification.createMany({
        data: admins.map((u) => ({
          userId: u.id,
          channel: NotificationChannel.IN_APP,
          type: 'INSPECTION_DUE',
          title: `Inspection due: ${row.equipment?.name ?? 'Equipment'}`,
          body: `${row.inspectionType} inspection due ${
            row.nextInspectionDate
              ? new Date(row.nextInspectionDate).toLocaleDateString()
              : 'soon'
          }`,
          payload,
          status: NotificationStatus.PENDING,
          dedupeKey: `${dedupeKey}:u${u.id}`,
        })),
      });
      created += admins.length;
    }

    return { notified: created, equipmentCount: seenEquipment.size };
  }

  private computeNextInspectionDate(
    currentMeterHours: number,
    meterReading: number | undefined,
    inspectionType: InspectionType,
    checklist: {
      intervalDays: number | null;
      intervalHours: number | null;
    } | null,
  ): Date {
    const hoursInterval = checklist?.intervalHours;
    if (hoursInterval && meterReading != null) {
      const hoursUntilNext = hoursInterval;
      const hoursPerDay = 8;
      const daysEstimate = Math.ceil(hoursUntilNext / hoursPerDay);
      const d = new Date();
      d.setDate(d.getDate() + daysEstimate);
      return d;
    }

    const days =
      checklist?.intervalDays ?? DEFAULT_INTERVAL_DAYS[inspectionType] ?? 7;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  private async syncWorkerWallet(
    workerId: number,
    equipmentId: number,
    passed: boolean,
    inspectionType: InspectionType,
  ) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) return;

    const companyLink = await this.prisma.companyLink.findFirst({
      where: { workerId, active: true },
    });
    const catalogKey = equipment.catalogTypeKey ?? equipment.name;
    const note = passed
      ? `${inspectionType} inspection passed`
      : `${inspectionType} inspection failed`;

    const existing = await this.prisma.workerWalletItem.findFirst({
      where: { workerId, equipmentId },
    });

    if (existing) {
      await this.prisma.workerWalletItem.update({
        where: { id: existing.id },
        data: {
          status: passed ? 'ACTIVE' : 'FAILED',
          notes: note,
          updatedAt: new Date(),
        },
      });
    } else if (passed) {
      await this.prisma.workerWalletItem.create({
        data: {
          workerId,
          catalogTypeKey: catalogKey,
          equipmentId,
          companyId: companyLink?.companyId,
          status: 'ACTIVE',
          notes: note,
        },
      });
    }
  }

  private async notifyInspectionFailed(
    companyId: number | null,
    inspection: { id: number; equipmentId: number | null },
    reason?: string,
  ) {
    if (!companyId) return;

    const admins = await this.prisma.user.findMany({
      where: {
        companyId,
        role: { in: ['COMPANY_ADMIN', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'] },
      },
      select: { id: true },
      take: 20,
    });

    const payload = {
      inspectionId: inspection.id,
      equipmentId: inspection.equipmentId,
      reason: reason ?? 'Inspection failed',
    };

    await this.prisma.notification.createMany({
      data: admins.map((u) => ({
        userId: u.id,
        channel: 'IN_APP',
        type: 'INSPECTION_FAILED',
        payload,
        status: 'PENDING',
      })),
    });
  }
}
