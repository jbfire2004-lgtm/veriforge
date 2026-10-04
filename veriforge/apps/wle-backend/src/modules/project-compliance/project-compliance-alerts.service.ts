import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectComplianceAlertType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectComplianceService } from './project-compliance.service';
import type { ComplianceAlertRow } from './project-compliance.types';

@Injectable()
export class ProjectComplianceAlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly compliance: ProjectComplianceService,
  ) {}

  async listAlerts(
    projectId: number,
    options?: { includeResolved?: boolean },
  ): Promise<ComplianceAlertRow[]> {
    const rows = await this.prisma.projectComplianceAlert.findMany({
      where: {
        projectId,
        ...(options?.includeResolved ? {} : { resolvedAt: null }),
      },
      include: {
        worker: { select: { firstName: true, lastName: true } },
        rule: {
          include: {
            certification: { select: { name: true } },
          },
        },
      },
      orderBy: [{ resolvedAt: 'asc' }, { createdAt: 'desc' }],
    });

    return rows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      workerId: r.workerId,
      workerName: `${r.worker.firstName} ${r.worker.lastName}`.trim(),
      ruleId: r.ruleId,
      credentialId: r.credentialId,
      type: r.type,
      certificationName: r.rule?.certification.name ?? null,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
    }));
  }

  async resolveAlert(projectId: number, alertId: number) {
    const alert = await this.prisma.projectComplianceAlert.findFirst({
      where: { id: alertId, projectId },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.resolvedAt) return alert;

    return this.prisma.projectComplianceAlert.update({
      where: { id: alertId },
      data: { resolvedAt: new Date() },
    });
  }

  async onWorkerAssigned(projectId: number, workerId: number): Promise<void> {
    await this.syncAlertsForWorker(projectId, workerId);
  }

  async onWorkerCredentialChange(workerId: number): Promise<void> {
    const assignments = await this.prisma.projectAssignment.findMany({
      where: {
        workerId,
        status: 'ACTIVE',
        endedAt: null,
      },
      select: { projectId: true },
    });
    for (const a of assignments) {
      await this.syncAlertsForWorker(a.projectId, workerId);
    }
  }

  async syncAlertsForProject(projectId: number): Promise<void> {
    const report = await this.compliance.evaluateProject(projectId);
    const workerIds = [
      ...report.compliantWorkers.map((w) => w.workerId),
      ...report.nonCompliantWorkers.map((w) => w.workerId),
    ];
    for (const workerId of workerIds) {
      await this.syncAlertsForWorker(projectId, workerId, report);
    }
    await this.resolveStaleAlerts(projectId, report);
  }

  private async syncAlertsForWorker(
    projectId: number,
    workerId: number,
    cachedReport?: Awaited<
      ReturnType<ProjectComplianceService['evaluateProject']>
    >,
  ): Promise<void> {
    const report =
      cachedReport ?? (await this.compliance.evaluateProject(projectId));
    const worker =
      report.nonCompliantWorkers.find((w) => w.workerId === workerId) ??
      report.compliantWorkers.find((w) => w.workerId === workerId);
    if (!worker) return;

    const openAlerts = await this.prisma.projectComplianceAlert.findMany({
      where: { projectId, workerId, resolvedAt: null },
    });
    const openKeys = new Set(
      openAlerts.map((a) => this.alertKey(a.ruleId, a.type, a.credentialId)),
    );

    const desired: Array<{
      ruleId: number | null;
      credentialId: number | null;
      type: ProjectComplianceAlertType;
    }> = [];

    for (const gap of worker.gaps) {
      desired.push({
        ruleId: gap.ruleId,
        credentialId: gap.credentialId,
        type: this.gapToAlertType(gap.status),
      });
    }
    for (const gap of worker.expiringSoon) {
      desired.push({
        ruleId: gap.ruleId,
        credentialId: gap.credentialId,
        type: ProjectComplianceAlertType.EXPIRING_SOON,
      });
    }

    for (const item of desired) {
      const key = this.alertKey(item.ruleId, item.type, item.credentialId);
      if (openKeys.has(key)) continue;
      await this.prisma.projectComplianceAlert.create({
        data: {
          projectId,
          workerId,
          ruleId: item.ruleId,
          credentialId: item.credentialId,
          type: item.type,
        },
      });
      openKeys.add(key);
    }
  }

  private async resolveStaleAlerts(
    projectId: number,
    report: Awaited<ReturnType<ProjectComplianceService['evaluateProject']>>,
  ): Promise<void> {
    const activeKeys = new Set<string>();
    for (const w of [
      ...report.compliantWorkers,
      ...report.nonCompliantWorkers,
    ]) {
      for (const gap of [...w.gaps, ...w.expiringSoon]) {
        activeKeys.add(
          this.alertKey(
            gap.ruleId,
            gap.status === 'expiring_soon'
              ? ProjectComplianceAlertType.EXPIRING_SOON
              : this.gapToAlertType(gap.status),
            gap.credentialId,
          ),
        );
      }
    }

    const open = await this.prisma.projectComplianceAlert.findMany({
      where: { projectId, resolvedAt: null },
    });

    const toResolve = open.filter(
      (a) => !activeKeys.has(this.alertKey(a.ruleId, a.type, a.credentialId)),
    );

    if (!toResolve.length) return;
    await this.prisma.projectComplianceAlert.updateMany({
      where: { id: { in: toResolve.map((a) => a.id) } },
      data: { resolvedAt: new Date() },
    });
  }

  private gapToAlertType(
    status: 'missing' | 'expired' | 'expiring_soon' | 'valid',
  ): ProjectComplianceAlertType {
    if (status === 'expired') return ProjectComplianceAlertType.EXPIRED;
    if (status === 'expiring_soon')
      return ProjectComplianceAlertType.EXPIRING_SOON;
    return ProjectComplianceAlertType.MISSING;
  }

  private alertKey(
    ruleId: number | null,
    type: ProjectComplianceAlertType,
    credentialId: number | null,
  ): string {
    return `${ruleId ?? 'none'}:${type}:${credentialId ?? 'none'}`;
  }
}
