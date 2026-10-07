import { Injectable, Logger, Optional } from '@nestjs/common';
import { AssignmentStatus, PpeStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';
import { MaintenanceCalibrationCoreService } from '../maintenance-calibration-core/maintenance-calibration-core.service';
import { ToolsPpeCoreService } from '../tools-ppe-core/tools-ppe-core.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import {
  expiryApproachingEvent,
  expiryPassedEvent,
} from '../vera-event-bus/publishers/vera-event-publishers';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import type { ExpiryRunMetrics } from './notification-scheduler.types';

export type { ExpiryRunMetrics } from './notification-scheduler.types';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly inspections: InspectionCoreService,
    private readonly maintenanceCalibration: MaintenanceCalibrationCoreService,
    private readonly toolsPpe: ToolsPpeCoreService,
    @Optional() private readonly eventBus?: EventBusService,
    @Optional()
    private readonly equipmentCompliance?: EquipmentComplianceService,
  ) {}

  async runAll(companyId?: number) {
    const results = {
      inspections: await this.runInspections(companyId),
      training: await this.runTrainingExpiry(companyId),
      competency: await this.runCompetencyExpiry(companyId),
      equipmentCerts: await this.runEquipmentCertExpiry(companyId),
      fitTests: await this.runFitTestExpiry(companyId),
      ppe: await this.runPpeExpiry(companyId),
      maintenance: await this.runMaintenance(companyId),
      calibration: await this.runCalibration(companyId),
      workerAssignments: await this.runWorkerAssignments(companyId),
      equipmentAssignments: await this.runEquipmentAssignments(companyId),
    };
    this.logger.log(
      `Notification scheduler completed: ${JSON.stringify(results)}`,
    );
    return results;
  }

  async runInspections(companyId?: number) {
    return this.inspections.notifyDueInspections(companyId, 7);
  }

  async runMaintenance(companyId?: number) {
    const res = await this.maintenanceCalibration.notifyDue(companyId, 14);
    return res;
  }

  async runCalibration(companyId?: number) {
    return this.maintenanceCalibration.notifyDue(companyId, 14);
  }

  async runTrainingExpiry(
    companyId?: number,
    withinDays = 30,
  ): Promise<ExpiryRunMetrics> {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    const startOfDay = this.startOfDay();

    const records = await this.prisma.trainingRecord.findMany({
      where: {
        expiresAt: { not: null, lte: until },
        ...(companyId ? { companyId } : {}),
      },
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyId: true,
          },
        },
        certification: { select: { name: true } },
      },
      take: 500,
    });

    const metrics: ExpiryRunMetrics = {
      scanned: records.length,
      processed: 0,
      notified: 0,
      skipped: 0,
      readinessRecalc: 0,
      errors: 0,
    };
    const seen = new Set<string>();

    for (const rec of records) {
      const company = rec.companyId ?? rec.worker.companyId;
      if (!company) continue;

      const expired = rec.expiresAt! < now;
      const type = expired
        ? NOTIFICATION_TYPES.TRAINING_EXPIRED
        : NOTIFICATION_TYPES.TRAINING_EXPIRING;
      const key = `${type}:tr${rec.id}:${startOfDay
        .toISOString()
        .slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      metrics.processed++;

      try {
        const courseName = rec.certification?.name ?? 'Training';
        const title = expired
          ? `Training expired: ${courseName}`
          : `Training expiring: ${courseName}`;
        const body = `${rec.worker.firstName} ${rec.worker.lastName}`;

        const res = await this.notifications.notifyCompanySupervisors(company, {
          type,
          title,
          body,
          dedupeKey: key,
          payload: {
            trainingRecordId: rec.id,
            workerId: rec.worker.id,
            expiresAt: rec.expiresAt?.toISOString(),
          },
          companyId: company,
        });
        metrics.notified += res.created;
        metrics.skipped += res.skipped;

        const workerUser = await this.prisma.user.findFirst({
          where: { worker: { id: rec.worker.id } },
          select: { id: true },
        });
        if (workerUser) {
          const workerRes = await this.notifications.notifyUsers({
            userIds: [workerUser.id],
            type,
            title: expired
              ? 'Your training has expired'
              : 'Your training is expiring soon',
            body: courseName,
            dedupeKey: `${key}:w${rec.worker.id}`,
            payload: { trainingRecordId: rec.id, workerId: rec.worker.id },
          });
          metrics.notified += workerRes.created;
          metrics.skipped += workerRes.skipped;
        }

        if (this.emitTrainingReadinessRecalc(rec.id, company, rec.worker.id)) {
          metrics.readinessRecalc++;
        }

        const expiryPayload = {
          trainingRecordId: rec.id,
          workerId: rec.worker.id,
          companyId: company,
          expiresAt: rec.expiresAt!.toISOString(),
          courseName,
        };
        if (expired) {
          this.eventBus?.emit(expiryPassedEvent(expiryPayload));
        } else {
          this.eventBus?.emit(expiryApproachingEvent(expiryPayload));
        }
      } catch (err) {
        metrics.errors++;
        this.logger.warn(
          `Training expiry notification failed for record ${rec.id}: ${
            err instanceof Error ? err.message : err
          }`,
        );
      }
    }

    this.logger.log(`Training expiry scan: ${JSON.stringify(metrics)}`);
    return metrics;
  }

  async runEquipmentCertExpiry(
    companyId?: number,
    withinDays = 30,
  ): Promise<ExpiryRunMetrics> {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    const startOfDay = this.startOfDay();

    const certs = await this.prisma.pmEquipmentCertification.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
        expiresAt: { not: null, lte: until },
        status: 'approved',
      },
      include: {
        equipment: { select: { id: true, name: true, companyId: true } },
      },
      take: 300,
    });

    const metrics: ExpiryRunMetrics = {
      scanned: certs.length,
      processed: 0,
      notified: 0,
      skipped: 0,
      readinessRecalc: 0,
      errors: 0,
    };
    const seen = new Set<string>();
    const equipmentRecalc = new Set<number>();

    for (const cert of certs) {
      if (!cert.equipment.companyId) continue;
      const expired = cert.expiresAt! < now;
      const type = expired
        ? NOTIFICATION_TYPES.EQUIPMENT_CERT_EXPIRED
        : NOTIFICATION_TYPES.EQUIPMENT_CERT_EXPIRING;
      const key = `${type}:ec${cert.id}:${startOfDay
        .toISOString()
        .slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      metrics.processed++;

      try {
        const res = await this.notifications.notifyCompanySupervisors(
          cert.equipment.companyId,
          {
            type,
            title: expired
              ? `Equipment certification expired: ${cert.equipment.name}`
              : `Equipment certification expiring: ${cert.equipment.name}`,
            body: cert.certificationType ?? 'Certification',
            dedupeKey: key,
            payload: {
              certificationId: cert.id,
              equipmentId: cert.equipment.id,
              expiresAt: cert.expiresAt?.toISOString(),
            },
            companyId: cert.equipment.companyId,
          },
        );
        metrics.notified += res.created;
        metrics.skipped += res.skipped;

        if (!equipmentRecalc.has(cert.equipment.id)) {
          if (
            await this.recalcEquipmentReadiness(
              cert.equipment.id,
              cert.equipment.companyId,
            )
          ) {
            equipmentRecalc.add(cert.equipment.id);
            metrics.readinessRecalc++;
          }
        }
      } catch (err) {
        metrics.errors++;
        this.logger.warn(
          `Equipment cert expiry notification failed for cert ${cert.id}: ${
            err instanceof Error ? err.message : err
          }`,
        );
      }
    }

    this.logger.log(`Equipment cert expiry scan: ${JSON.stringify(metrics)}`);
    return metrics;
  }

  async runFitTestExpiry(companyId?: number, withinDays = 30) {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    const startOfDay = this.startOfDay();

    const tests = await this.prisma.fitTestRun.findMany({
      where: {
        result: 'PASS',
        expiresAt: { not: null, lte: until },
        ...(companyId ? { tenantId: companyId } : {}),
      },
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyId: true,
          },
        },
      },
      take: 300,
    });

    let notified = 0;
    for (const test of tests) {
      const cid = test.tenantId ?? test.worker.companyId;
      if (!cid) continue;
      const expired = test.expiresAt! < now;
      const type = expired
        ? NOTIFICATION_TYPES.FIT_TEST_EXPIRED
        : NOTIFICATION_TYPES.FIT_TEST_EXPIRING;
      const key = `${type}:ft${test.id}:${startOfDay
        .toISOString()
        .slice(0, 10)}`;
      const res = await this.notifications.notifyCompanySupervisors(cid, {
        type,
        title: expired
          ? `Fit test expired: ${test.worker.firstName} ${test.worker.lastName}`
          : `Fit test due soon: ${test.worker.firstName} ${test.worker.lastName}`,
        body: test.testType ?? 'Respirator fit test',
        dedupeKey: key,
        payload: {
          fitTestId: test.id,
          workerId: test.workerId,
          expiresAt: test.expiresAt?.toISOString(),
        },
        companyId: cid,
      });
      notified += res.created;
    }

    return { notified, tests: tests.length };
  }

  async runCompetencyExpiry(companyId?: number, withinDays = 30) {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    const startOfDay = this.startOfDay();

    const evaluations = await this.prisma.competencyEvaluation.findMany({
      where: {
        passed: true,
        expiresAt: { not: null, lte: until },
        ...(companyId
          ? {
              equipment: {
                OR: [
                  { companyId },
                  { equipmentLinks: { some: { companyId, active: true } } },
                ],
              },
            }
          : {}),
      },
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyId: true,
          },
        },
        equipment: { select: { id: true, name: true, companyId: true } },
      },
      take: 500,
    });

    let notified = 0;
    const seen = new Set<string>();

    for (const ev of evaluations) {
      const company = ev.equipment.companyId ?? ev.worker.companyId;
      if (!company) continue;

      const expired = ev.expiresAt! < now;
      const type = expired
        ? NOTIFICATION_TYPES.COMPETENCY_EXPIRED
        : NOTIFICATION_TYPES.COMPETENCY_EXPIRING;
      const key = `${type}:${ev.id}:${startOfDay.toISOString().slice(0, 10)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const title = expired
        ? `Competency expired: ${ev.equipment.name}`
        : `Competency expiring: ${ev.equipment.name}`;
      const body = `${ev.worker.firstName} ${ev.worker.lastName} — ${ev.equipment.name}`;

      const res = await this.notifications.notifyCompanySupervisors(company, {
        type,
        title,
        body,
        dedupeKey: key,
        payload: {
          evaluationId: ev.id,
          workerId: ev.worker.id,
          equipmentId: ev.equipment.id,
          expiresAt: ev.expiresAt?.toISOString(),
        },
        companyId: company,
      });
      notified += res.created;
    }

    return { notified, evaluations: evaluations.length };
  }

  async runPpeExpiry(companyId?: number, withinDays = 14) {
    await this.toolsPpe.processPpeExpiry(companyId);

    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    const startOfDay = this.startOfDay();

    const ppeItems = await this.prisma.pPE.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        status: PpeStatus.ACTIVE,
        expiresAt: { not: null, lte: until },
      },
      include: { company: { select: { id: true, name: true } } },
      take: 300,
    });

    let notified = 0;
    for (const ppe of ppeItems) {
      if (!ppe.companyId) continue;
      const expired = ppe.expiresAt! < now;
      const type = expired
        ? NOTIFICATION_TYPES.PPE_EXPIRED
        : NOTIFICATION_TYPES.PPE_EXPIRING;
      const key = `${type}:ppe${ppe.id}:${startOfDay
        .toISOString()
        .slice(0, 10)}`;

      const res = await this.notifications.notifyCompanySupervisors(
        ppe.companyId,
        {
          type,
          title: expired
            ? `PPE expired: ${ppe.name}`
            : `PPE expiring: ${ppe.name}`,
          body: `${ppe.name} (${ppe.ppeType}) — ${
            ppe.company?.name ?? 'Company'
          }`,
          dedupeKey: key,
          payload: {
            ppeId: ppe.id,
            expiresAt: ppe.expiresAt?.toISOString(),
          },
          companyId: ppe.companyId,
        },
      );
      notified += res.created;

      const assignments = await this.prisma.pPEAssignment.findMany({
        where: { ppeId: ppe.id, status: 'ACTIVE' },
        select: { workerId: true },
      });
      for (const a of assignments) {
        const workerUser = await this.prisma.user.findFirst({
          where: { worker: { id: a.workerId } },
          select: { id: true },
        });
        if (!workerUser) continue;
        await this.notifications.notifyUsers({
          userIds: [workerUser.id],
          type,
          title: expired ? `Your PPE has expired` : `Your PPE is expiring soon`,
          body: ppe.name,
          dedupeKey: `${key}:w${a.workerId}`,
          payload: { ppeId: ppe.id },
        });
      }
    }

    return { notified, ppeCount: ppeItems.length };
  }

  async runWorkerAssignments(companyId?: number) {
    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dayKey = this.startOfDay().toISOString().slice(0, 10);
    let notified = 0;

    const starting = await this.prisma.workerAssignment.findMany({
      where: {
        startAt: { gte: now, lte: in1h },
        autoStarted: false,
        endedAt: null,
        ...(companyId ? { companyId } : {}),
      },
      include: { worker: true },
    });

    for (const a of starting) {
      const user = await this.prisma.user.findFirst({
        where: { worker: { id: a.workerId } },
        select: { id: true },
      });
      if (!user) continue;
      const res = await this.notifications.notifyUsers({
        userIds: [user.id],
        type: NOTIFICATION_TYPES.WORKER_ASSIGNMENT_STARTING,
        title: 'Assignment starting soon',
        body: `Scheduled assignment begins at ${a.startAt.toLocaleString()}`,
        dedupeKey: `assign-start:${a.id}:${dayKey}`,
        payload: { assignmentId: a.id, workerId: a.workerId },
      });
      notified += res.created;
    }

    const ending = await this.prisma.workerAssignment.findMany({
      where: {
        endAt: { gte: now, lte: in24h },
        endedAt: null,
        ...(companyId ? { companyId } : {}),
      },
      include: { worker: true },
    });

    for (const a of ending) {
      const user = await this.prisma.user.findFirst({
        where: { worker: { id: a.workerId } },
        select: { id: true },
      });
      if (!user) continue;
      const res = await this.notifications.notifyUsers({
        userIds: [user.id],
        type: NOTIFICATION_TYPES.WORKER_ASSIGNMENT_ENDING,
        title: 'Assignment ending soon',
        body: `Assignment ends at ${a.endAt?.toLocaleString()}`,
        dedupeKey: `assign-end:${a.id}:${dayKey}`,
        payload: { assignmentId: a.id },
      });
      notified += res.created;
    }

    const newProjectWorkers = await this.prisma.projectAssignment.findMany({
      where: {
        status: AssignmentStatus.ACTIVE,
        assignedAt: { gte: since24h },
        ...(companyId ? { companyId } : {}),
      },
      include: {
        worker: true,
        project: true,
      },
    });

    const byCompany = new Map<number, typeof newProjectWorkers>();
    for (const row of newProjectWorkers) {
      const list = byCompany.get(row.companyId) ?? [];
      list.push(row);
      byCompany.set(row.companyId, list);
    }

    for (const [cid, rows] of byCompany) {
      const res = await this.notifications.notifyCompanySupervisors(cid, {
        type: NOTIFICATION_TYPES.PROJECT_WORKER_ASSIGNED,
        title: `${rows.length} new project assignment(s)`,
        body: rows
          .map(
            (r) =>
              `${r.worker.firstName} ${r.worker.lastName} → ${r.project.name}`,
          )
          .join('; '),
        dedupeKey: `proj-assign:${cid}:${dayKey}`,
        payload: { count: rows.length },
        companyId: cid,
      });
      notified += res.created;
    }

    return { notified, starting: starting.length, ending: ending.length };
  }

  async runEquipmentAssignments(companyId?: number) {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dayKey = this.startOfDay().toISOString().slice(0, 10);
    let notified = 0;

    const equipProjects = await this.prisma.equipmentProjectAssignment.findMany(
      {
        where: {
          status: AssignmentStatus.ACTIVE,
          assignedAt: { gte: since24h },
          ...(companyId ? { companyId } : {}),
        },
        include: { equipment: true, project: true },
      },
    );

    const byCompany = new Map<number, typeof equipProjects>();
    for (const row of equipProjects) {
      const list = byCompany.get(row.companyId) ?? [];
      list.push(row);
      byCompany.set(row.companyId, list);
    }

    for (const [cid, rows] of byCompany) {
      const res = await this.notifications.notifyCompanySupervisors(cid, {
        type: NOTIFICATION_TYPES.EQUIPMENT_PROJECT_ASSIGNED,
        title: `${rows.length} equipment project assignment(s)`,
        body: rows
          .map((r) => `${r.equipment.name} → ${r.project.name}`)
          .slice(0, 5)
          .join('; '),
        dedupeKey: `eq-proj:${cid}:${dayKey}`,
        payload: { count: rows.length },
        companyId: cid,
      });
      notified += res.created;
    }

    const operatorLinks = await this.prisma.equipmentLinkWorker.findMany({
      where: {
        assignedAt: { gte: since24h },
        ...(companyId ? { equipmentLink: { companyId, active: true } } : {}),
      },
      include: {
        worker: true,
        equipmentLink: { include: { equipment: true, company: true } },
      },
    });

    for (const link of operatorLinks) {
      const cid = link.equipmentLink.companyId;
      const res = await this.notifications.notifyCompanySupervisors(cid, {
        type: NOTIFICATION_TYPES.EQUIPMENT_OPERATOR_ASSIGNED,
        title: 'Equipment operator assigned',
        body: `${link.worker.firstName} ${link.worker.lastName} → ${link.equipmentLink.equipment.name}`,
        dedupeKey: `eq-op:${link.equipmentLinkId}:${link.workerId}:${dayKey}`,
        payload: {
          equipmentId: link.equipmentLink.equipmentId,
          workerId: link.workerId,
        },
        companyId: cid,
      });
      notified += res.created;
    }

    return {
      notified,
      equipmentProjects: equipProjects.length,
      operators: operatorLinks.length,
    };
  }

  private startOfDay() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Worker readiness is computed on read; emit event so feed/hub widgets refresh. */
  private emitTrainingReadinessRecalc(
    trainingRecordId: number,
    companyId: number,
    workerId: number,
  ): boolean {
    if (!this.eventBus) return false;
    this.eventBus.emit({
      name: DomainEvent.COMPLIANCE_RECALC,
      occurredAt: new Date().toISOString(),
      companyId,
      entityType: 'training',
      entityId: trainingRecordId,
      data: { workerId, source: 'training_expiry_scan' },
    });
    return true;
  }

  private async recalcEquipmentReadiness(
    equipmentId: number,
    companyId: number,
  ): Promise<boolean> {
    if (!this.equipmentCompliance) return false;
    await this.equipmentCompliance.recalculate(equipmentId, {
      trigger: 'SCHEDULED',
      notes: 'Daily equipment certification expiry scan',
    });
    this.eventBus?.emit({
      name: DomainEvent.COMPLIANCE_RECALC,
      occurredAt: new Date().toISOString(),
      companyId,
      entityType: 'equipment',
      entityId: equipmentId,
      data: { source: 'equipment_cert_expiry_scan' },
    });
    return true;
  }
}
