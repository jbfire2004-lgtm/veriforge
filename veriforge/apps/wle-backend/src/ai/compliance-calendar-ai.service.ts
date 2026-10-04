import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OrientationAccessService } from '../modules/orientation/orientation-access.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  BulkActionSuggestion,
  ComplianceCalendarAiInput,
  ComplianceCalendarAiJson,
  ComplianceCalendarAiResult,
  ComplianceNotification,
  ComplianceRiskItem,
  UpcomingExpiry,
} from './compliance-calendar-ai.types';

const EXPIRING_SOON_DAYS = 30;
const INSURANCE_PATTERN = /insurance|liability|wcb|workers.?comp|coi/i;

@Injectable()
export class ComplianceCalendarAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orientationAccess: OrientationAccessService,
  ) {}

  async analyze(
    input: ComplianceCalendarAiInput,
  ): Promise<ComplianceCalendarAiResult> {
    if (!input.companyId)
      throw new BadRequestException('companyId is required');

    const horizonDays = input.horizonDays ?? 90;
    const now = new Date();
    const horizon = new Date(now.getTime() + horizonDays * 86_400_000);
    const soon = new Date(now.getTime() + EXPIRING_SOON_DAYS * 86_400_000);

    const [
      trainingExpiries,
      permitExpiries,
      credentialExpiries,
      equipmentExpiries,
      orientationGaps,
    ] = await Promise.all([
      this.loadTrainingExpiries(input, now, horizon, soon),
      this.loadPermitExpiries(input, now, horizon, soon),
      this.loadCredentialExpiries(input, now, horizon, soon),
      this.loadEquipmentCertExpiries(input, now, horizon, soon),
      this.loadOrientationGaps(input),
    ]);

    const upcoming_expiries = [
      ...trainingExpiries,
      ...permitExpiries,
      ...credentialExpiries,
      ...equipmentExpiries,
      ...orientationGaps,
    ].sort((a, b) => a.days_until_expiry - b.days_until_expiry);

    const risk_items = this.buildRiskItems(upcoming_expiries, input);
    const notifications = this.buildNotifications(
      upcoming_expiries,
      risk_items,
      input,
    );
    const bulk_actions = this.buildBulkActions(upcoming_expiries, risk_items);

    const core: ComplianceCalendarAiJson = {
      upcoming_expiries,
      risk_items,
      notifications,
    };

    return {
      ...core,
      calendar_id: randomUUID(),
      company_id: input.companyId,
      project_id: input.projectId,
      horizon_days: horizonDays,
      bulk_actions,
      field_summary: this.buildFieldSummary(core, bulk_actions),
      source: 'rule_engine',
      model: null,
    };
  }

  private async loadTrainingExpiries(
    input: ComplianceCalendarAiInput,
    now: Date,
    horizon: Date,
    soon: Date,
  ): Promise<UpcomingExpiry[]> {
    const records = await this.prisma.trainingRecord.findMany({
      where: {
        companyId: input.companyId,
        expiresAt: { not: null, lte: horizon },
        ...(input.projectId
          ? { OR: [{ projectId: input.projectId }, { projectId: null }] }
          : {}),
      },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        certification: { select: { name: true } },
      },
      take: 200,
      orderBy: { expiresAt: 'asc' },
    });

    return records.map((r) => {
      const expires = r.expiresAt!;
      const days = Math.ceil((expires.getTime() - now.getTime()) / 86_400_000);
      return {
        entity_type: 'training' as const,
        entity_id: r.id,
        label: r.certification?.name ?? 'Training record',
        expires_at: expires.toISOString().slice(0, 10),
        days_until_expiry: days,
        status: this.expiryStatus(expires, now, soon),
        worker_id: r.worker.id,
        worker_name: `${r.worker.firstName} ${r.worker.lastName}`.trim(),
        project_id: r.projectId ?? undefined,
      };
    });
  }

  private async loadPermitExpiries(
    input: ComplianceCalendarAiInput,
    now: Date,
    horizon: Date,
    soon: Date,
  ): Promise<UpcomingExpiry[]> {
    const permits = await this.prisma.pmPermit.findMany({
      where: {
        validTo: { not: null, lte: horizon },
        status: { in: ['active', 'approved'] },
        ...(input.projectId
          ? { projectId: input.projectId }
          : { project: { companyId: input.companyId } }),
      },
      select: {
        id: true,
        title: true,
        permitType: true,
        validTo: true,
        projectId: true,
      },
      take: 100,
      orderBy: { validTo: 'asc' },
    });

    return permits.map((p) => {
      const expires = p.validTo!;
      const days = Math.ceil((expires.getTime() - now.getTime()) / 86_400_000);
      return {
        entity_type: 'permit' as const,
        entity_id: p.id,
        label: `${p.permitType.replace(/_/g, ' ')} — ${p.title}`,
        expires_at: expires.toISOString().slice(0, 10),
        days_until_expiry: days,
        status: this.expiryStatus(expires, now, soon),
        project_id: p.projectId,
      };
    });
  }

  private async loadCredentialExpiries(
    input: ComplianceCalendarAiInput,
    now: Date,
    horizon: Date,
    soon: Date,
  ): Promise<UpcomingExpiry[]> {
    const credentials = await this.prisma.credential.findMany({
      where: {
        expiresAt: { not: null, lte: horizon },
        worker: { companyId: input.companyId },
      },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        certification: { select: { name: true } },
      },
      take: 100,
      orderBy: { expiresAt: 'asc' },
    });

    return credentials.map((c) => {
      const expires = c.expiresAt!;
      const days = Math.ceil((expires.getTime() - now.getTime()) / 86_400_000);
      const label = c.certification?.name ?? c.name;
      const isInsurance = INSURANCE_PATTERN.test(label);
      return {
        entity_type: (isInsurance
          ? 'insurance'
          : 'credential') as UpcomingExpiry['entity_type'],
        entity_id: c.id,
        label,
        expires_at: expires.toISOString().slice(0, 10),
        days_until_expiry: days,
        status: this.expiryStatus(expires, now, soon),
        worker_id: c.worker.id,
        worker_name: `${c.worker.firstName} ${c.worker.lastName}`.trim(),
      };
    });
  }

  private async loadEquipmentCertExpiries(
    input: ComplianceCalendarAiInput,
    now: Date,
    horizon: Date,
    soon: Date,
  ): Promise<UpcomingExpiry[]> {
    const certs = await this.prisma.pmEquipmentCertification.findMany({
      where: {
        companyId: input.companyId,
        deletedAt: null,
        expiresAt: { not: null, lte: horizon },
      },
      include: {
        equipment: { select: { id: true, name: true, assetTag: true } },
      },
      take: 80,
      orderBy: { expiresAt: 'asc' },
    });

    return certs.map((c) => {
      const expires = c.expiresAt!;
      const days = Math.ceil((expires.getTime() - now.getTime()) / 86_400_000);
      return {
        entity_type: 'equipment_cert' as const,
        entity_id: c.id,
        label: `Equipment cert — ${
          c.equipment?.name ?? c.equipment?.assetTag ?? c.equipmentId
        }`,
        expires_at: expires.toISOString().slice(0, 10),
        days_until_expiry: days,
        status: this.expiryStatus(expires, now, soon),
      };
    });
  }

  private async loadOrientationGaps(
    input: ComplianceCalendarAiInput,
  ): Promise<UpcomingExpiry[]> {
    if (!input.projectId) return [];

    const workers = await this.prisma.worker.findMany({
      where: { companyId: input.companyId, status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true },
      take: 100,
    });

    const gaps: UpcomingExpiry[] = [];
    const now = new Date();

    for (const worker of workers) {
      const access = await this.orientationAccess.evaluateWorker(worker.id, {
        projectId: input.projectId,
        companyId: input.companyId,
      });
      if (access.allowed) continue;

      for (const pkg of access.blockingPackages) {
        gaps.push({
          entity_type: 'orientation',
          entity_id: `${worker.id}:${pkg.packageId}`,
          label: `Orientation incomplete — ${pkg.title}`,
          expires_at: now.toISOString().slice(0, 10),
          days_until_expiry: 0,
          status: 'expired',
          worker_id: worker.id,
          worker_name: `${worker.firstName} ${worker.lastName}`.trim(),
          project_id: input.projectId,
        });
      }
    }

    return gaps.slice(0, 50);
  }

  private expiryStatus(
    expires: Date,
    now: Date,
    soon: Date,
  ): UpcomingExpiry['status'] {
    if (expires < now) return 'expired';
    if (expires <= soon) return 'expiring_soon';
    return 'upcoming';
  }

  private buildRiskItems(
    expiries: UpcomingExpiry[],
    input: ComplianceCalendarAiInput,
  ): ComplianceRiskItem[] {
    const risks: ComplianceRiskItem[] = [];

    const expired = expiries.filter((e) => e.status === 'expired');
    const expiringSoon = expiries.filter((e) => e.status === 'expiring_soon');

    if (expired.length) {
      risks.push({
        risk_code: 'EXPIRED_COMPLIANCE',
        severity: 'critical',
        description: `${expired.length} compliance item(s) already expired`,
        entity_type: 'company',
        entity_id: input.companyId,
        predicted_impact:
          'Workers may be blocked from site access or high-risk work',
        suggested_bulk_action:
          'Launch bulk renewal and re-verification campaign',
      });
    }

    const trainingClusters = this.clusterByLabel(
      expiries.filter((e) => e.entity_type === 'training'),
    );
    for (const [label, items] of trainingClusters) {
      if (items.length >= 3) {
        risks.push({
          risk_code: 'TRAINING_EXPIRY_CLUSTER',
          severity: items.some((i) => i.status === 'expired')
            ? 'critical'
            : 'warning',
          description: `${items.length} workers affected by ${label} expiry window`,
          entity_type: 'training',
          predicted_impact: 'Crew competency gap on upcoming work packages',
          suggested_bulk_action: `Schedule bulk ${label} refresher`,
        });
      }
    }

    const permitRisks = expiries.filter((e) => e.entity_type === 'permit');
    if (permitRisks.some((p) => p.status === 'expired')) {
      risks.push({
        risk_code: 'PERMIT_LAPSE',
        severity: 'critical',
        description:
          'Active permit(s) past validity — hot work / confined space may be unauthorized',
        entity_type: 'permit',
        predicted_impact: 'Regulatory exposure and stop-work orders',
        suggested_bulk_action: 'Renew and re-approve permits before next shift',
      });
    }

    const orientationGaps = expiries.filter(
      (e) => e.entity_type === 'orientation',
    );
    if (orientationGaps.length >= 5) {
      risks.push({
        risk_code: 'ORIENTATION_BACKLOG',
        severity: 'warning',
        description: `${orientationGaps.length} workers with incomplete project orientation`,
        entity_type: 'orientation',
        entity_id: input.projectId,
        predicted_impact: 'Access denials and onboarding delays',
        suggested_bulk_action:
          'Run orientation blitz with supervisor-led sessions',
      });
    }

    const insurance = expiries.filter((e) => e.entity_type === 'insurance');
    if (insurance.some((i) => i.status === 'expired')) {
      risks.push({
        risk_code: 'INSURANCE_LAPSE',
        severity: 'critical',
        description: 'Insurance or WCB documentation expired',
        entity_type: 'insurance',
        predicted_impact:
          'Contractor gate and project insurance compliance failure',
        suggested_bulk_action: 'Request updated COI/WCB from affected parties',
      });
    }

    if (expiringSoon.length >= 10 && !expired.length) {
      risks.push({
        risk_code: 'COMPLIANCE_WAVE',
        severity: 'warning',
        description: `${expiringSoon.length} items expiring within ${EXPIRING_SOON_DAYS} days`,
        entity_type: 'company',
        predicted_impact:
          'Supervisor workload spike if not planned proactively',
        suggested_bulk_action: 'Distribute compliance calendar to supervisors',
      });
    }

    return risks.slice(0, 20);
  }

  private buildNotifications(
    expiries: UpcomingExpiry[],
    risks: ComplianceRiskItem[],
    input: ComplianceCalendarAiInput,
  ): ComplianceNotification[] {
    const notifications: ComplianceNotification[] = [];

    for (const exp of expiries
      .filter((e) => e.worker_id && e.status !== 'upcoming')
      .slice(0, 15)) {
      notifications.push({
        recipient_role: 'worker',
        recipient_id: exp.worker_id,
        title:
          exp.status === 'expired'
            ? `Expired: ${exp.label}`
            : `Expiring soon: ${exp.label}`,
        message: `${exp.label} ${
          exp.status === 'expired' ? 'expired' : 'expires'
        } on ${exp.expires_at}. Renew and upload verification.`,
        priority: exp.status === 'expired' ? 'high' : 'medium',
        channel: 'in_app',
        due_by: exp.expires_at,
        related_entity_type: exp.entity_type,
        related_entity_id: exp.entity_id,
      });
    }

    const supervisorItems = expiries.filter((e) => e.status !== 'upcoming');
    if (supervisorItems.length) {
      notifications.push({
        recipient_role: 'supervisor',
        title: 'Compliance calendar — team expiries',
        message: `${
          supervisorItems.length
        } training, permit, or orientation item(s) need attention in the next ${
          input.horizonDays ?? 90
        } days.`,
        priority: supervisorItems.some((e) => e.status === 'expired')
          ? 'high'
          : 'medium',
        channel: 'in_app',
      });
    }

    const criticalRisks = risks.filter((r) => r.severity === 'critical');
    if (criticalRisks.length && input.projectId) {
      notifications.push({
        recipient_role: 'project_manager',
        title: 'Project compliance risk alert',
        message: criticalRisks.map((r) => r.description).join(' '),
        priority: 'high',
        channel: 'email',
        related_entity_type: 'project',
        related_entity_id: input.projectId,
      });
    }

    for (const risk of risks
      .filter((r) => r.suggested_bulk_action)
      .slice(0, 5)) {
      notifications.push({
        recipient_role: 'supervisor',
        title: `Action suggested: ${risk.risk_code.replace(/_/g, ' ')}`,
        message: `${risk.description}. ${risk.suggested_bulk_action}.`,
        priority: risk.severity === 'critical' ? 'high' : 'medium',
        channel: 'in_app',
      });
    }

    return this.dedupeNotifications(notifications).slice(0, 30);
  }

  private buildBulkActions(
    expiries: UpcomingExpiry[],
    risks: ComplianceRiskItem[],
  ): BulkActionSuggestion[] {
    const actions: BulkActionSuggestion[] = [];

    for (const [label, items] of this.clusterByLabel(
      expiries.filter((e) => e.entity_type === 'training'),
    )) {
      if (items.length >= 2) {
        actions.push({
          action: `Bulk training renewal: ${label}`,
          scope: `${items.length} worker(s)`,
          affected_count: items.length,
          priority: items.some((i) => i.status === 'expired')
            ? 'high'
            : 'medium',
          reason: 'Grouped expiry window — schedule single provider session',
        });
      }
    }

    const unverified = expiries.filter(
      (e) => e.entity_type === 'training' && e.status === 'expired',
    );
    if (unverified.length >= 2) {
      actions.push({
        action: 'Bulk re-verification of expired training records',
        scope: `${unverified.length} record(s)`,
        affected_count: unverified.length,
        priority: 'high',
        reason: 'Restore worker readiness and site access',
      });
    }

    const orientations = expiries.filter(
      (e) => e.entity_type === 'orientation',
    );
    if (orientations.length >= 3) {
      actions.push({
        action: 'Orientation completion blitz',
        scope: `${orientations.length} worker(s)`,
        affected_count: orientations.length,
        priority: 'high',
        reason: 'Clear access-blocking orientation backlog',
      });
    }

    const permits = expiries.filter((e) => e.entity_type === 'permit');
    if (permits.length) {
      actions.push({
        action: 'Batch permit renewal and re-approval',
        scope: `${permits.length} permit(s)`,
        affected_count: permits.length,
        priority: permits.some((p) => p.status === 'expired')
          ? 'high'
          : 'medium',
        reason: 'Maintain authorized high-risk work',
      });
    }

    for (const risk of risks) {
      if (
        risk.suggested_bulk_action &&
        !actions.some((a) => a.action.includes(risk.suggested_bulk_action!))
      ) {
        actions.push({
          action: risk.suggested_bulk_action,
          scope: risk.entity_type,
          affected_count: 1,
          priority: risk.severity === 'critical' ? 'high' : 'medium',
          reason: risk.predicted_impact,
        });
      }
    }

    return actions.slice(0, 12);
  }

  private clusterByLabel(
    items: UpcomingExpiry[],
  ): Map<string, UpcomingExpiry[]> {
    const map = new Map<string, UpcomingExpiry[]>();
    for (const item of items) {
      const key = item.label.toLowerCase();
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
    }
    return map;
  }

  private dedupeNotifications(
    notifications: ComplianceNotification[],
  ): ComplianceNotification[] {
    const seen = new Set<string>();
    return notifications.filter((n) => {
      const key = `${n.recipient_role}:${n.title}:${n.recipient_id ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private buildFieldSummary(
    core: ComplianceCalendarAiJson,
    bulk: BulkActionSuggestion[],
  ): string {
    const expired = core.upcoming_expiries.filter(
      (e) => e.status === 'expired',
    ).length;
    const soon = core.upcoming_expiries.filter(
      (e) => e.status === 'expiring_soon',
    ).length;
    const critical = core.risk_items.filter(
      (r) => r.severity === 'critical',
    ).length;

    return [
      `Compliance calendar: ${core.upcoming_expiries.length} expiry item(s) tracked.`,
      `${expired} expired, ${soon} expiring within ${EXPIRING_SOON_DAYS} days.`,
      `${core.risk_items.length} risk item(s) (${critical} critical).`,
      `${core.notifications.length} notification(s) queued for workers, supervisors, and PMs.`,
      `${bulk.length} bulk action(s) suggested.`,
    ].join(' ');
  }
}
