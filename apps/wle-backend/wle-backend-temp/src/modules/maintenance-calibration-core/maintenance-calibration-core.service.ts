import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EquipmentMaintenanceType,
  LinkComplianceStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import {
  CreateCalibrationRecordDto,
  CreateCalibrationScheduleDto,
  CreateMaintenanceRecordDto,
  CreateMaintenanceScheduleDto,
} from './dto/maintenance-calibration.dto';

const DEFAULT_MAINTENANCE_INTERVAL_DAYS = 90;
const DEFAULT_CALIBRATION_INTERVAL_DAYS = 365;

@Injectable()
export class MaintenanceCalibrationCoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly compliance: EquipmentComplianceService,
  ) {}

  async dashboard(companyId?: number) {
    const eqFilter: Prisma.EquipmentWhereInput = companyId ? { companyId } : {};
    const now = new Date();
    const warn = new Date();
    warn.setDate(warn.getDate() + 14);

    const equipmentIds = companyId
      ? (
          await this.prisma.equipment.findMany({
            where: eqFilter,
            select: { id: true },
          })
        ).map((e) => e.id)
      : undefined;

    const eqIn = equipmentIds?.length
      ? { equipmentId: { in: equipmentIds } }
      : {};

    const [
      maintenanceRecordCount,
      calibrationRecordCount,
      maintenanceDue,
      calibrationDue,
      maintenanceOverdue,
      calibrationOverdue,
      recentMaintenance,
      recentCalibration,
    ] = await Promise.all([
      this.prisma.equipmentMaintenance.count({ where: eqIn }),
      this.prisma.equipmentCalibration.count({ where: eqIn }),
      this.prisma.maintenanceSchedule.count({
        where: {
          ...eqIn,
          active: true,
          nextDueAt: { lte: warn, gte: now },
        },
      }),
      this.prisma.calibrationSchedule.count({
        where: {
          ...eqIn,
          active: true,
          nextDueAt: { lte: warn, gte: now },
        },
      }),
      this.prisma.maintenanceSchedule.count({
        where: { ...eqIn, active: true, nextDueAt: { lt: now } },
      }),
      this.prisma.calibrationSchedule.count({
        where: { ...eqIn, active: true, nextDueAt: { lt: now } },
      }),
      this.prisma.equipmentMaintenance.findMany({
        where: eqIn,
        orderBy: { performedAt: 'desc' },
        take: 10,
        include: {
          equipment: { select: { id: true, name: true, companyId: true } },
        },
      }),
      this.prisma.equipmentCalibration.findMany({
        where: eqIn,
        orderBy: { calibratedAt: 'desc' },
        take: 10,
        include: {
          equipment: { select: { id: true, name: true, companyId: true } },
        },
      }),
    ]);

    return {
      maintenanceRecordCount,
      calibrationRecordCount,
      maintenanceDueWithin14Days: maintenanceDue,
      calibrationDueWithin14Days: calibrationDue,
      maintenanceOverdue,
      calibrationOverdue,
      recentMaintenance,
      recentCalibration,
    };
  }

  async listMaintenanceRecords(equipmentId?: number, companyId?: number) {
    return this.prisma.equipmentMaintenance.findMany({
      where: {
        equipmentId,
        ...(companyId ? { equipment: { companyId } } : {}),
      },
      orderBy: { performedAt: 'desc' },
      take: 200,
      include: {
        equipment: { select: { id: true, name: true, companyId: true } },
      },
    });
  }

  async createMaintenanceRecord(
    dto: CreateMaintenanceRecordDto,
    userId?: number,
  ) {
    await this.assertEquipment(dto.equipmentId);
    const performedAt = dto.performedAt
      ? new Date(dto.performedAt)
      : new Date();

    const schedule = await this.ensureMaintenanceSchedule(
      dto.equipmentId,
      dto.type ?? EquipmentMaintenanceType.PREVENTIVE,
    );

    const nextDueAt =
      dto.nextDueAt != null
        ? new Date(dto.nextDueAt)
        : this.addDays(performedAt, schedule.intervalDays);

    const record = await this.prisma.equipmentMaintenance.create({
      data: {
        equipmentId: dto.equipmentId,
        type: dto.type ?? schedule.type,
        performedAt,
        performedBy: dto.performedBy ?? userId,
        notes: dto.notes,
        nextDueAt,
        meterHours: dto.meterHours,
      },
      include: { equipment: true },
    });

    await this.prisma.maintenanceSchedule.update({
      where: { id: schedule.id },
      data: {
        lastPerformedAt: performedAt,
        nextDueAt,
        updatedAt: new Date(),
      },
    });

    if (dto.meterHours != null) {
      await this.prisma.equipment.update({
        where: { id: dto.equipmentId },
        data: { meterHours: dto.meterHours },
      });
    }

    await this.compliance.recalculate(dto.equipmentId, {
      trigger: 'MAINTENANCE',
      assessedByUserId: userId ?? dto.performedBy,
      notes: `Maintenance (${record.type})`,
    });

    return record;
  }

  async listMaintenanceSchedules(equipmentId?: number, companyId?: number) {
    return this.prisma.maintenanceSchedule.findMany({
      where: {
        equipmentId,
        active: true,
        ...(companyId ? { equipment: { companyId } } : {}),
      },
      include: { equipment: { select: { id: true, name: true } } },
      orderBy: { nextDueAt: 'asc' },
    });
  }

  async createMaintenanceSchedule(dto: CreateMaintenanceScheduleDto) {
    await this.assertEquipment(dto.equipmentId);
    const nextDueAt = this.addDays(
      new Date(),
      dto.intervalDays ?? DEFAULT_MAINTENANCE_INTERVAL_DAYS,
    );
    return this.prisma.maintenanceSchedule.create({
      data: {
        equipmentId: dto.equipmentId,
        type: dto.type ?? EquipmentMaintenanceType.PREVENTIVE,
        intervalDays: dto.intervalDays ?? DEFAULT_MAINTENANCE_INTERVAL_DAYS,
        intervalHours: dto.intervalHours,
        nextDueAt,
        notes: dto.notes,
      },
    });
  }

  async listCalibrationRecords(equipmentId?: number, companyId?: number) {
    return this.prisma.equipmentCalibration.findMany({
      where: {
        equipmentId,
        ...(companyId ? { equipment: { companyId } } : {}),
      },
      orderBy: { calibratedAt: 'desc' },
      take: 200,
      include: {
        equipment: { select: { id: true, name: true, companyId: true } },
      },
    });
  }

  async createCalibrationRecord(
    dto: CreateCalibrationRecordDto,
    userId?: number,
  ) {
    await this.assertEquipment(dto.equipmentId);
    const calibratedAt = dto.calibratedAt
      ? new Date(dto.calibratedAt)
      : new Date();
    const passed = dto.passed ?? true;

    const schedule = await this.ensureCalibrationSchedule(dto.equipmentId);

    const expiresAt =
      dto.expiresAt != null
        ? new Date(dto.expiresAt)
        : this.addDays(calibratedAt, schedule.intervalDays);

    const record = await this.prisma.equipmentCalibration.create({
      data: {
        equipmentId: dto.equipmentId,
        calibratedAt,
        calibratedBy: dto.calibratedBy ?? userId,
        certificateNumber: dto.certificateNumber,
        expiresAt: passed ? expiresAt : null,
        passed,
        notes: dto.notes,
      },
      include: { equipment: true },
    });

    await this.prisma.calibrationSchedule.update({
      where: { id: schedule.id },
      data: {
        lastCalibratedAt: calibratedAt,
        nextDueAt: passed ? expiresAt : schedule.nextDueAt,
        updatedAt: new Date(),
      },
    });

    await this.compliance.recalculate(dto.equipmentId, {
      trigger: 'CALIBRATION',
      assessedByUserId: userId ?? dto.calibratedBy,
      notes: passed ? 'Calibration passed' : 'Calibration failed',
      ...(passed ? {} : { forceStatus: LinkComplianceStatus.NEEDS_ATTENTION }),
    });

    return record;
  }

  async listCalibrationSchedules(equipmentId?: number, companyId?: number) {
    return this.prisma.calibrationSchedule.findMany({
      where: {
        equipmentId,
        active: true,
        ...(companyId ? { equipment: { companyId } } : {}),
      },
      include: { equipment: { select: { id: true, name: true } } },
      orderBy: { nextDueAt: 'asc' },
    });
  }

  async createCalibrationSchedule(dto: CreateCalibrationScheduleDto) {
    await this.assertEquipment(dto.equipmentId);
    const nextDueAt = this.addDays(
      new Date(),
      dto.intervalDays ?? DEFAULT_CALIBRATION_INTERVAL_DAYS,
    );
    return this.prisma.calibrationSchedule.create({
      data: {
        equipmentId: dto.equipmentId,
        intervalDays: dto.intervalDays ?? DEFAULT_CALIBRATION_INTERVAL_DAYS,
        nextDueAt,
        notes: dto.notes,
      },
    });
  }

  async getEquipmentSummary(equipmentId: number) {
    await this.assertEquipment(equipmentId);
    const [
      maintenanceSchedules,
      calibrationSchedules,
      maintenanceRecords,
      calibrationRecords,
    ] = await Promise.all([
      this.prisma.maintenanceSchedule.findMany({
        where: { equipmentId, active: true },
      }),
      this.prisma.calibrationSchedule.findMany({
        where: { equipmentId, active: true },
      }),
      this.prisma.equipmentMaintenance.findMany({
        where: { equipmentId },
        orderBy: { performedAt: 'desc' },
        take: 15,
      }),
      this.prisma.equipmentCalibration.findMany({
        where: { equipmentId },
        orderBy: { calibratedAt: 'desc' },
        take: 15,
      }),
    ]);

    const now = new Date();
    return {
      equipmentId,
      maintenanceSchedules,
      calibrationSchedules,
      maintenanceRecords,
      calibrationRecords,
      nextMaintenanceDue:
        maintenanceSchedules
          .map((s) => s.nextDueAt)
          .filter((d): d is Date => d != null)
          .sort((a, b) => a.getTime() - b.getTime())[0] ?? null,
      nextCalibrationDue:
        calibrationSchedules
          .map((s) => s.nextDueAt)
          .filter((d): d is Date => d != null)
          .sort((a, b) => a.getTime() - b.getTime())[0] ?? null,
      maintenanceOverdue: maintenanceSchedules.some(
        (s) => s.nextDueAt && s.nextDueAt < now,
      ),
      calibrationOverdue: calibrationSchedules.some(
        (s) => s.nextDueAt && s.nextDueAt < now,
      ),
    };
  }

  async notifyDue(companyId?: number, withinDays = 14) {
    const until = this.addDays(new Date(), withinDays);
    const now = new Date();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const maintDue = await this.prisma.maintenanceSchedule.findMany({
      where: {
        active: true,
        nextDueAt: { lte: until, gte: now },
        ...(companyId ? { equipment: { companyId } } : {}),
      },
      include: {
        equipment: { select: { id: true, name: true, companyId: true } },
      },
    });

    const calDue = await this.prisma.calibrationSchedule.findMany({
      where: {
        active: true,
        nextDueAt: { lte: until, gte: now },
        ...(companyId ? { equipment: { companyId } } : {}),
      },
      include: {
        equipment: { select: { id: true, name: true, companyId: true } },
      },
    });

    let notified = 0;
    const seen = new Set<number>();

    for (const row of [...maintDue, ...calDue]) {
      const eqId = row.equipmentId;
      if (seen.has(eqId)) continue;
      seen.add(eqId);

      const eqCompanyId = row.equipment.companyId;
      if (!eqCompanyId) continue;

      const type =
        maintDue.some((m) => m.equipmentId === eqId) &&
        calDue.some((c) => c.equipmentId === eqId)
          ? 'MAINTENANCE_AND_CALIBRATION_DUE'
          : maintDue.some((m) => m.equipmentId === eqId)
          ? 'MAINTENANCE_DUE'
          : 'CALIBRATION_DUE';

      const already = await this.prisma.notification.findFirst({
        where: {
          type,
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
        equipmentName: row.equipment.name,
        nextMaintenanceDue: maintDue.find((m) => m.equipmentId === eqId)
          ?.nextDueAt,
        nextCalibrationDue: calDue.find((c) => c.equipmentId === eqId)
          ?.nextDueAt,
      };

      await this.prisma.notification.createMany({
        data: admins.map((u) => ({
          userId: u.id,
          channel: 'IN_APP',
          type,
          payload,
          status: 'PENDING',
        })),
      });
      notified += admins.length;
    }

    return { notified, equipmentCount: seen.size };
  }

  private async ensureMaintenanceSchedule(
    equipmentId: number,
    type: EquipmentMaintenanceType,
  ) {
    const existing = await this.prisma.maintenanceSchedule.findFirst({
      where: { equipmentId, active: true, type },
    });
    if (existing) return existing;

    return this.prisma.maintenanceSchedule.create({
      data: {
        equipmentId,
        type,
        intervalDays: DEFAULT_MAINTENANCE_INTERVAL_DAYS,
        nextDueAt: this.addDays(new Date(), DEFAULT_MAINTENANCE_INTERVAL_DAYS),
      },
    });
  }

  private async ensureCalibrationSchedule(equipmentId: number) {
    const existing = await this.prisma.calibrationSchedule.findFirst({
      where: { equipmentId, active: true },
    });
    if (existing) return existing;

    return this.prisma.calibrationSchedule.create({
      data: {
        equipmentId,
        intervalDays: DEFAULT_CALIBRATION_INTERVAL_DAYS,
        nextDueAt: this.addDays(new Date(), DEFAULT_CALIBRATION_INTERVAL_DAYS),
      },
    });
  }

  private addDays(from: Date, days: number) {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    return d;
  }

  private async assertEquipment(equipmentId: number) {
    const e = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!e) throw new NotFoundException('Equipment not found');
    return e;
  }
}
