import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  VeripmPermitRiskLevel,
  VeripmPermitSyncStatus,
} from '@prisma/client';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  FieldOsPermitClient,
  type FieldOsPermitTaskPayload,
} from './fieldos-permit-client.service';
import {
  VeripmPermitActivityService,
  VeripmPermitEventPipeline,
  computePermitCssDelta,
} from './veripm-permit-activity.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';

const HIGH_RISK_TYPES = new Set([
  'confined_space',
  'hot_work',
  'loto',
  'excavation',
  'fall_protection',
  'live_line',
  'crane_lift',
  'open_hole',
]);

/** Canonical VERIPM → FieldOS Permit Task field map */
export const FIELDOS_PERMIT_FIELD_MAP = {
  permit_id: 'external_permit_id',
  company_id: 'company_id',
  project_id: 'project_id',
  job_id: 'job_id',
  asset_id: 'asset_id',
  contractor_id: 'contractor_id',
  permit_type: 'permit_type',
  risk_level: 'risk_level',
  required_signatures: 'required_signatures',
  required_documents: 'required_documents',
  required_ppe: 'required_ppe',
  start_time: 'start_time',
  end_time: 'end_time',
  title: 'title',
} as const;

export type CreateVeripmPermitInput = {
  companyId?: number;
  projectId: number;
  jobId?: string;
  assetId?: string;
  contractorId?: number;
  pmPermitId?: string;
  permitType: string;
  title?: string;
  riskLevel?: VeripmPermitRiskLevel;
  requiredSignatures?: string[];
  requiredDocuments?: string[];
  requiredPpe?: string[];
  startTime?: string;
  endTime?: string;
  workOrderIds?: string[];
  createdByUserId?: number;
  pushToFieldOs?: boolean;
};

export type FieldOsWebhookPayload = {
  task_id: string;
  external_permit_id?: string;
  status: string;
  signatures?: Array<{ role: string; name?: string; signedAt?: string }>;
  photos?: Array<{ id: string; url: string; caption?: string }>;
  notes?: string[];
  hazard_controls_applied?: string[];
  completed_at?: string | null;
};

function mapFieldOsStatus(status: string): VeripmPermitSyncStatus {
  const s = status.toLowerCase().replace(/[\s-]/g, '_');
  const allowed = Object.values(VeripmPermitSyncStatus);
  if ((allowed as string[]).includes(s)) return s as VeripmPermitSyncStatus;
  if (s === 'complete' || s === 'completed' || s === 'done') return 'closed';
  if (s === 'pending_signatures') return 'awaiting_signatures';
  if (s === 'error' || s === 'failed') return 'sync_error';
  return 'in_progress';
}

function riskForType(
  permitType: string,
  override?: VeripmPermitRiskLevel,
): VeripmPermitRiskLevel {
  if (override) return override;
  if (HIGH_RISK_TYPES.has(permitType)) return 'high';
  return 'medium';
}

@Injectable()
export class VeripmFieldosPermitsService {
  private readonly logger = new Logger(VeripmFieldosPermitsService.name);
  /** In-memory dashboard invalidation token when analytics bus is unavailable. */
  private dashboardRevision = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fieldOs: FieldOsPermitClient,
    private readonly activity: VeripmPermitActivityService,
    private readonly pipeline: VeripmPermitEventPipeline,
  ) {}

  getDashboardRevision() {
    return {
      revision: this.dashboardRevision,
      generatedAt: new Date().toISOString(),
    };
  }

  private bumpDashboard(reason: string) {
    this.dashboardRevision += 1;
    this.logger.log(
      `Dashboard recalculation triggered (${reason}) rev=${this.dashboardRevision}`,
    );
  }

  async list(filters: {
    companyId?: number;
    projectId?: number;
    contractorId?: number;
    status?: VeripmPermitSyncStatus;
  }) {
    const rows = await this.prisma.veripmPermit.findMany({
      where: {
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.contractorId ? { contractorId: filters.contractorId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
    return {
      permits: rows.map((r) => this.mapRow(r)),
      total: rows.length,
      countsByStatus: this.countByStatus(rows.map((r) => r.status)),
      dashboardRevision: this.dashboardRevision,
    };
  }

  async get(permitId: string) {
    const row = await this.prisma.veripmPermit.findUnique({
      where: { permitId },
    });
    if (!row) throw new NotFoundException('VERIPM permit not found');
    const task = row.fieldosTaskId
      ? this.fieldOs.getTask(row.fieldosTaskId)
      : null;
    const activities = await this.activity.listForPermit(permitId);
    return {
      ...this.mapRow(row),
      fieldosTask: task,
      activities: activities.map((a) => ({
        activity_id: a.activityId,
        kind: a.kind,
        source: a.source,
        summary: a.summary,
        status_from: a.statusFrom,
        status_to: a.statusTo,
        photo_url: a.photoUrl,
        signature_role: a.signatureRole,
        signature_name: a.signatureName,
        css_delta: a.cssDelta,
        occurred_at: a.occurredAt.toISOString(),
        payload: a.payloadJson,
      })),
      drill: {
        formula:
          'count(veripm_permits by status) + FieldOS live task status overlay',
        formulaId: 'pm.permits.fieldos.v1',
        sourceQuery:
          'SELECT veripm_permits LEFT JOIN veripm_permit_activity ON permit_id',
        fieldOsMapping: FIELDOS_PERMIT_FIELD_MAP,
      },
    };
  }

  async create(
    input: CreateVeripmPermitInput,
    options?: { skipFieldOs?: boolean },
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
      select: { id: true, companyId: true, name: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const companyId = input.companyId ?? project.companyId;
    const riskLevel = riskForType(input.permitType, input.riskLevel);
    const requiredSignatures =
      input.requiredSignatures ??
      (riskLevel === 'high' || riskLevel === 'critical'
        ? ['issuer', 'acceptor', 'supervisor']
        : ['issuer', 'acceptor']);
    const requiredDocuments =
      input.requiredDocuments ??
      (HIGH_RISK_TYPES.has(input.permitType) ? ['flha_or_jha'] : []);
    const requiredPpe = input.requiredPpe ?? [];

    let safetyLinks: Record<string, unknown> = {};
    if (HIGH_RISK_TYPES.has(input.permitType) || riskLevel === 'critical') {
      safetyLinks = await this.linkOrCreateSafetyForms({
        companyId,
        projectId: input.projectId,
        permitType: input.permitType,
        assetId: input.assetId,
        jobId: input.jobId,
        contractorId: input.contractorId,
        title: input.title,
      });
    }

    const permitId = randomUUID();
    const row = await this.prisma.veripmPermit.create({
      data: {
        permitId,
        companyId,
        projectId: input.projectId,
        jobId: input.jobId,
        assetId: input.assetId,
        contractorId: input.contractorId,
        pmPermitId: input.pmPermitId,
        permitType: input.permitType,
        riskLevel,
        status: 'queued',
        requiredSignatures: requiredSignatures as Prisma.InputJsonValue,
        requiredDocuments: requiredDocuments as Prisma.InputJsonValue,
        requiredPpe: requiredPpe as Prisma.InputJsonValue,
        startTime: input.startTime ? new Date(input.startTime) : undefined,
        endTime: input.endTime ? new Date(input.endTime) : undefined,
        createdByUserId: input.createdByUserId,
        safetyLinksJson: safetyLinks as Prisma.InputJsonValue,
        workOrderIdsJson: (input.workOrderIds ??
          []) as Prisma.InputJsonValue,
      },
    });

    await this.activity.record({
      permitId: row.permitId,
      kind: 'created',
      source: 'veripm',
      statusTo: 'queued',
      actorUserId: input.createdByUserId,
      summary: `Permit created (${input.permitType}, risk=${riskLevel})`,
      payload: { title: input.title, safetyLinks },
    });

    if (Object.keys(safetyLinks).length > 0) {
      await this.activity.record({
        permitId: row.permitId,
        kind: 'safety_linked',
        source: 'vericore',
        summary: 'FLHA/JHA safety link evaluated for high-risk permit',
        payload: safetyLinks,
      });
      this.pipeline.emitPermitEvent(DomainEvent.PERMIT_SAFETY_LINKED, {
        permitId: row.permitId,
        companyId,
        projectId: input.projectId,
        contractorId: input.contractorId,
        data: safetyLinks,
      });
    }

    this.pipeline.emitPermitEvent(DomainEvent.PERMIT_CREATED, {
      permitId: row.permitId,
      companyId,
      projectId: input.projectId,
      contractorId: input.contractorId,
      data: { permitType: input.permitType, riskLevel },
    });

    if (options?.skipFieldOs || input.pushToFieldOs === false) {
      return this.mapRow(row);
    }

    return this.pushToFieldOs(row.permitId, input.title);
  }

  /**
   * Called from PmPermitsService.createPermit — best-effort FieldOS bridge.
   */
  async onPmPermitCreated(args: {
    pmPermitId: string;
    projectId: number;
    permitType: string;
    title: string;
    taskId?: string | null;
    validFrom?: Date | null;
    validTo?: Date | null;
    requiredJhaId?: string | null;
    actorId?: number;
  }) {
    try {
      const existing = await this.prisma.veripmPermit.findUnique({
        where: { pmPermitId: args.pmPermitId },
      });
      if (existing) return this.mapRow(existing);

      return await this.create({
        projectId: args.projectId,
        pmPermitId: args.pmPermitId,
        permitType: args.permitType,
        title: args.title,
        jobId: args.taskId ?? undefined,
        startTime: args.validFrom?.toISOString(),
        endTime: args.validTo?.toISOString(),
        createdByUserId: args.actorId,
        requiredDocuments: args.requiredJhaId
          ? ['flha_or_jha']
          : undefined,
        pushToFieldOs: true,
      });
    } catch (err) {
      this.logger.warn(
        `VERIPM↔FieldOS bridge skipped: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return null;
    }
  }

  async pushToFieldOs(permitId: string, title?: string) {
    const row = await this.prisma.veripmPermit.findUnique({
      where: { permitId },
    });
    if (!row) throw new NotFoundException('VERIPM permit not found');

    const payload: FieldOsPermitTaskPayload = {
      external_permit_id: row.permitId,
      company_id: row.companyId,
      project_id: row.projectId,
      job_id: row.jobId,
      asset_id: row.assetId,
      contractor_id: row.contractorId,
      permit_type: row.permitType,
      risk_level: row.riskLevel,
      required_signatures: (row.requiredSignatures as string[]) ?? [],
      required_documents: (row.requiredDocuments as string[]) ?? [],
      required_ppe: (row.requiredPpe as string[]) ?? [],
      start_time: row.startTime?.toISOString() ?? null,
      end_time: row.endTime?.toISOString() ?? null,
      title,
    };

    try {
      const task = await this.fieldOs.createPermitTask(payload);
      const updated = await this.prisma.veripmPermit.update({
        where: { permitId },
        data: {
          fieldosTaskId: task.task_id,
          status: mapFieldOsStatus(task.status),
          fieldosMetadataJson: {
            lastPushAt: new Date().toISOString(),
            task,
          } as Prisma.InputJsonValue,
        },
      });
      await this.activity.record({
        permitId,
        kind: 'fieldos_pushed',
        source: 'fieldos',
        statusFrom: row.status,
        statusTo: mapFieldOsStatus(task.status),
        fieldosTaskId: task.task_id,
        summary: `FieldOS permit task created (${task.task_id})`,
        payload: { mapping: FIELDOS_PERMIT_FIELD_MAP, task },
      });
      this.pipeline.emitPermitEvent(DomainEvent.PERMIT_FIELDOS_PUSHED, {
        permitId,
        companyId: row.companyId,
        projectId: row.projectId,
        contractorId: row.contractorId,
        data: { fieldosTaskId: task.task_id },
      });
      this.bumpDashboard('fieldos_task_created');
      return this.mapRow(updated);
    } catch (err) {
      const updated = await this.prisma.veripmPermit.update({
        where: { permitId },
        data: {
          status: 'sync_error',
          fieldosMetadataJson: {
            lastError:
              err instanceof Error ? err.message : 'FieldOS push failed',
            at: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
      const cssDelta = computePermitCssDelta({
        riskLevel: row.riskLevel,
        event: 'sync_error',
      });
      await this.activity.record({
        permitId,
        kind: 'status_changed',
        source: 'fieldos',
        statusFrom: row.status,
        statusTo: 'sync_error',
        summary: 'FieldOS push failed',
        cssDelta,
        payload: {
          error: err instanceof Error ? err.message : String(err),
        },
      });
      if (row.contractorId) {
        this.pipeline.emitPermitEvent(DomainEvent.PERMIT_CSS_IMPACT, {
          permitId,
          companyId: row.companyId,
          projectId: row.projectId,
          contractorId: row.contractorId,
          data: { cssDelta, reason: 'sync_error' },
        });
      }
      throw new BadRequestException({
        message: 'Failed to create FieldOS permit task',
        permit: this.mapRow(updated),
      });
    }
  }

  async handleWebhook(body: FieldOsWebhookPayload, signature?: string) {
    this.assertWebhookSignature(body, signature);

    if (!body.task_id) {
      throw new BadRequestException('task_id required');
    }

    const row = await this.prisma.veripmPermit.findFirst({
      where: {
        OR: [
          { fieldosTaskId: body.task_id },
          ...(body.external_permit_id
            ? [{ permitId: body.external_permit_id }]
            : []),
        ],
      },
    });
    if (!row) {
      throw new NotFoundException('No VERIPM permit for FieldOS task');
    }

    const status = mapFieldOsStatus(body.status);
    const prevMeta =
      (row.fieldosMetadataJson as Record<string, unknown>) ?? {};
    const activity = {
      ...(prevMeta.activity as Record<string, unknown> | undefined),
      signatures: body.signatures ?? [],
      photos: body.photos ?? [],
      notes: body.notes ?? [],
      hazard_controls_applied: body.hazard_controls_applied ?? [],
      completed_at: body.completed_at ?? null,
      lastWebhookAt: new Date().toISOString(),
    };

    this.fieldOs.applyWebhookUpdate(body.task_id, {
      status: body.status,
      signatures: body.signatures,
      photos: body.photos,
      notes: body.notes,
      hazard_controls_applied: body.hazard_controls_applied,
      completed_at: body.completed_at,
    });

    let safetyLinks =
      (row.safetyLinksJson as Record<string, unknown>) ?? {};
    if (status === 'closed') {
      safetyLinks = await this.onPermitClosed(row, safetyLinks, activity);
    }

    // Link incidents that occurred during the permit window
    safetyLinks = await this.linkIncidentsInWindow(row, safetyLinks);

    const incidentCount = Array.isArray(safetyLinks.incidentsDuringPermit)
      ? (safetyLinks.incidentsDuringPermit as unknown[]).length
      : 0;

    let cssDelta: number | null = null;
    if (status === 'closed') {
      cssDelta = computePermitCssDelta({
        riskLevel: row.riskLevel,
        event: incidentCount > 0 ? 'closed_with_incident' : 'closed_clean',
      });
    } else if ((body.signatures?.length ?? 0) >= 2) {
      cssDelta = computePermitCssDelta({
        riskLevel: row.riskLevel,
        event: 'signatures_complete',
      });
    } else if ((body.hazard_controls_applied?.length ?? 0) > 0) {
      cssDelta = computePermitCssDelta({
        riskLevel: row.riskLevel,
        event: 'hazard_controls_logged',
      });
    }

    const updated = await this.prisma.veripmPermit.update({
      where: { permitId: row.permitId },
      data: {
        status,
        endTime:
          status === 'closed' && body.completed_at
            ? new Date(body.completed_at)
            : row.endTime,
        fieldosMetadataJson: {
          ...prevMeta,
          activity,
          lastStatusFromFieldOs: body.status,
          lastCssDelta: cssDelta,
        } as Prisma.InputJsonValue,
        safetyLinksJson: safetyLinks as Prisma.InputJsonValue,
      },
    });

    await this.activity.record({
      permitId: row.permitId,
      kind: status === 'closed' ? 'closed' : 'fieldos_webhook',
      source: 'fieldos',
      statusFrom: row.status,
      statusTo: status,
      fieldosTaskId: body.task_id,
      summary: `FieldOS webhook status=${body.status}`,
      cssDelta: cssDelta ?? undefined,
      payload: {
        signatures: body.signatures,
        photos: body.photos,
        notes: body.notes,
        hazard_controls_applied: body.hazard_controls_applied,
        completed_at: body.completed_at,
      },
    });

    for (const sig of body.signatures ?? []) {
      await this.activity.record({
        permitId: row.permitId,
        kind: 'signature',
        source: 'fieldos',
        fieldosTaskId: body.task_id,
        summary: `Signature: ${sig.role}`,
        signatureRole: sig.role,
        signatureName: sig.name,
        payload: sig as unknown as Record<string, unknown>,
      });
    }
    for (const photo of body.photos ?? []) {
      await this.activity.record({
        permitId: row.permitId,
        kind: 'photo',
        source: 'fieldos',
        fieldosTaskId: body.task_id,
        summary: photo.caption ?? 'Field photo',
        photoUrl: photo.url,
        payload: photo as unknown as Record<string, unknown>,
      });
    }

    // Mirror status onto PmPermit when linked
    if (row.pmPermitId && status === 'closed') {
      await this.prisma.pmPermit
        .update({
          where: { id: row.pmPermitId },
          data: { status: 'closed' },
        })
        .catch(() => undefined);
    }
    if (row.pmPermitId && status === 'active') {
      await this.prisma.pmPermit
        .update({
          where: { id: row.pmPermitId },
          data: { status: 'active' },
        })
        .catch(() => undefined);
    }

    this.pipeline.emitPermitEvent(DomainEvent.PERMIT_FIELDOS_UPDATED, {
      permitId: row.permitId,
      companyId: row.companyId,
      projectId: row.projectId,
      contractorId: row.contractorId,
      data: { status, fieldosTaskId: body.task_id },
    });

    if (status === 'closed') {
      this.pipeline.emitPermitEvent(DomainEvent.PERMIT_CLOSED, {
        permitId: row.permitId,
        companyId: row.companyId,
        projectId: row.projectId,
        contractorId: row.contractorId,
        data: { cssDelta, incidentCount },
      });
    }

    if (cssDelta != null && row.contractorId) {
      this.pipeline.emitPermitEvent(DomainEvent.PERMIT_CSS_IMPACT, {
        permitId: row.permitId,
        companyId: row.companyId,
        projectId: row.projectId,
        contractorId: row.contractorId,
        data: { cssDelta, status, riskLevel: row.riskLevel },
      });
    }

    this.bumpDashboard(`fieldos_webhook:${status}`);
    return {
      ...this.mapRow(updated),
      css_delta: cssDelta,
    };
  }

  async metrics(companyId?: number, projectId?: number) {
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(projectId ? { projectId } : {}),
    };
    const rows = await this.prisma.veripmPermit.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });
    const highRisk = await this.prisma.veripmPermit.count({
      where: {
        ...where,
        riskLevel: { in: ['high', 'critical'] },
        status: { notIn: ['closed', 'cancelled'] },
      },
    });
    const withFieldOs = await this.prisma.veripmPermit.count({
      where: { ...where, fieldosTaskId: { not: null } },
    });
    return {
      byStatus: Object.fromEntries(
        rows.map((r) => [r.status, r._count._all]),
      ),
      highRiskOpen: highRisk,
      fieldOsLinked: withFieldOs,
      dashboardRevision: this.dashboardRevision,
    };
  }

  listFieldOsTasks(projectId?: number, companyId?: number) {
    return {
      tasks: this.fieldOs.listTasks({ projectId, companyId }),
    };
  }

  private async onPermitClosed(
    row: {
      permitId: string;
      projectId: number;
      workOrderIdsJson: unknown;
      pmPermitId: string | null;
      jobId: string | null;
    },
    safetyLinks: Record<string, unknown>,
    activity: Record<string, unknown>,
  ) {
    const workOrderIds = [
      ...new Set([
        ...((row.workOrderIdsJson as string[]) ?? []),
        ...(row.jobId ? [row.jobId] : []),
      ]),
    ];

    const closedWorkOrders: string[] = [];
    for (const woId of workOrderIds) {
      const updated = await this.prisma.pmPmTask
        .updateMany({
          where: { id: woId, projectId: row.projectId },
          data: { status: 'completed' },
        })
        .catch(() => ({ count: 0 }));
      if (updated.count > 0) closedWorkOrders.push(woId);
    }

    return {
      ...safetyLinks,
      closedWorkOrders,
      closedAt: new Date().toISOString(),
      fieldOsActivity: activity,
    };
  }

  private async linkIncidentsInWindow(
    row: {
      permitId: string;
      companyId: number;
      projectId: number;
      contractorId: number | null;
      startTime: Date | null;
      endTime: Date | null;
    },
    safetyLinks: Record<string, unknown>,
  ) {
    const start = row.startTime ?? new Date(Date.now() - 7 * 86400000);
    const end = row.endTime ?? new Date();
    try {
      const incidents = await this.prisma.incident.findMany({
        where: {
          companyId: row.companyId,
          createdAt: { gte: start, lte: end },
        },
        take: 25,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      });
      return {
        ...safetyLinks,
        incidentsDuringPermit: incidents.map((i) => ({
          id: i.id,
          title: i.title,
          at: i.createdAt.toISOString(),
          contractorId: row.contractorId,
          permitId: row.permitId,
        })),
      };
    } catch {
      return safetyLinks;
    }
  }

  private async linkOrCreateSafetyForms(args: {
    companyId: number;
    projectId: number;
    permitType: string;
    assetId?: string;
    jobId?: string;
    contractorId?: number;
    title?: string;
  }) {
    // Prefer existing open JHA/FLHA on the project
    try {
      const existing = await this.prisma.jhaFlha.findFirst({
        where: {
          projectId: args.projectId,
          status: { in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] },
        },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, kind: true, status: true },
      });
      if (existing) {
        return {
          flhaJhaId: existing.id,
          flhaJhaType: existing.kind,
          flhaJhaStatus: existing.status,
          linked: true,
          reason: 'high_risk_permit',
          permitType: args.permitType,
          assetId: args.assetId,
          jobId: args.jobId,
          contractorId: args.contractorId,
        };
      }
    } catch {
      /* fall through to stub link */
    }

    return {
      flhaJhaId: `pending-flha-${randomUUID()}`,
      flhaJhaType: 'FLHA',
      flhaJhaStatus: 'required',
      linked: false,
      createRequested: true,
      reason: 'high_risk_permit',
      title:
        args.title ??
        `FLHA/JHA required for ${args.permitType.replace(/_/g, ' ')}`,
      permitType: args.permitType,
      assetId: args.assetId,
      jobId: args.jobId,
      contractorId: args.contractorId,
    };
  }

  private assertWebhookSignature(
    body: FieldOsWebhookPayload,
    signature?: string,
  ) {
    const secret = process.env.FIELDOS_WEBHOOK_SECRET;
    if (!secret) return;
    if (!signature) {
      throw new BadRequestException('Missing x-vera-signature');
    }
    const raw = JSON.stringify(body);
    const expected = createHmac('sha256', secret).update(raw).digest('hex');
    const a = Uint8Array.from(Buffer.from(signature));
    const b = Uint8Array.from(Buffer.from(expected));
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  private countByStatus(statuses: VeripmPermitSyncStatus[]) {
    const out: Record<string, number> = {};
    for (const s of statuses) out[s] = (out[s] ?? 0) + 1;
    return out;
  }

  private mapRow(row: {
    permitId: string;
    companyId: number;
    projectId: number;
    jobId: string | null;
    assetId: string | null;
    contractorId: number | null;
    pmPermitId: string | null;
    fieldosTaskId: string | null;
    permitType: string;
    riskLevel: VeripmPermitRiskLevel;
    status: VeripmPermitSyncStatus;
    requiredSignatures: unknown;
    requiredDocuments: unknown;
    requiredPpe: unknown;
    startTime: Date | null;
    endTime: Date | null;
    createdByUserId: number | null;
    fieldosMetadataJson: unknown;
    safetyLinksJson: unknown;
    workOrderIdsJson: unknown;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      permit_id: row.permitId,
      company_id: row.companyId,
      project_id: row.projectId,
      job_id: row.jobId,
      asset_id: row.assetId,
      contractor_id: row.contractorId,
      pm_permit_id: row.pmPermitId,
      fieldos_task_id: row.fieldosTaskId,
      permit_type: row.permitType,
      risk_level: row.riskLevel,
      status: row.status,
      required_signatures: (row.requiredSignatures as string[]) ?? [],
      required_documents: (row.requiredDocuments as string[]) ?? [],
      required_ppe: (row.requiredPpe as string[]) ?? [],
      start_time: row.startTime?.toISOString() ?? null,
      end_time: row.endTime?.toISOString() ?? null,
      created_by_user_id: row.createdByUserId,
      fieldos_metadata: row.fieldosMetadataJson ?? {},
      safety_links: row.safetyLinksJson ?? {},
      work_order_ids: (row.workOrderIdsJson as string[]) ?? [],
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      live_fieldos_status: row.fieldosTaskId
        ? this.fieldOs.getTask(row.fieldosTaskId)?.status ?? null
        : null,
    };
  }
}
