import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { PmPermitStatus, PmPermitType, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WorkerTrainingHydrationService } from '../workers/worker-training-hydration.service';
import { PERMIT_TYPE_SEEDS } from '../../prisma/data/permit-types';
import { VeripmFieldosPermitsService } from './veripm-fieldos-permits.service';

export type PermitWorkflowJson = {
  jobScope?: string;
  workerId?: number;
  fieldValues?: Record<string, unknown>;
  hazards?: string[];
  controls?: string[];
  trainingValidated?: string[];
  aiGenerated?: boolean;
  aiSuggestionSummary?: string;
  supervisorOverrides?: Array<{
    field: string;
    reason: string;
    overriddenAt: string;
    overriddenBy?: string;
  }>;
  signoffs?: Array<{
    role: string;
    name: string;
    signedAt: string;
    signatureData?: string;
  }>;
};

@Injectable()
export class PmPermitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingHydration: WorkerTrainingHydrationService,
    @Optional()
    @Inject(forwardRef(() => VeripmFieldosPermitsService))
    private readonly fieldOsBridge?: VeripmFieldosPermitsService,
  ) {}

  private mapPermit(row: {
    id: string;
    projectId: number;
    workPackageId: string | null;
    taskId: string | null;
    permitType: PmPermitType;
    title: string;
    status: PmPermitStatus;
    version: number;
    requiredTraining: unknown;
    requiredControls: unknown;
    requiredJhaId: string | null;
    workflowJson?: unknown;
    validFrom: Date | null;
    validTo: Date | null;
    approvedById: number | null;
    approvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...row,
      requiredTraining: (row.requiredTraining as string[]) ?? [],
      requiredControls: (row.requiredControls as string[]) ?? [],
      workflow: (row.workflowJson ?? {}) as PermitWorkflowJson,
    };
  }

  async listTypes() {
    const catalog = await this.prisma.systemCatalogEntry.findMany({
      where: { catalogType: 'permit_type', active: true },
      orderBy: { name: 'asc' },
    });

    if (catalog.length > 0) {
      return {
        types: catalog.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          ...(c.payload as Record<string, unknown>),
        })),
        total: catalog.length,
      };
    }

    return {
      types: PERMIT_TYPE_SEEDS.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        permitType: p.permitType,
        requiredFields: p.requiredFields,
        workflowSteps: p.workflowSteps,
        defaultControlKeys: p.defaultControlKeys,
        defaultHazardKeys: p.defaultHazardKeys,
        requiredTraining: p.requiredTraining,
      })),
      total: PERMIT_TYPE_SEEDS.length,
    };
  }

  async listPermits(
    projectId: number,
    filters?: { status?: PmPermitStatus | PmPermitStatus[] },
  ) {
    const statuses = filters?.status
      ? Array.isArray(filters.status)
        ? filters.status
        : [filters.status]
      : undefined;

    const rows = await this.prisma.pmPermit.findMany({
      where: {
        projectId,
        ...(statuses ? { status: { in: statuses } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    return {
      permits: rows.map((r) => this.mapPermit(r)),
      total: rows.length,
    };
  }

  async listActive(projectId: number) {
    const now = new Date();
    const rows = await this.prisma.pmPermit.findMany({
      where: {
        projectId,
        status: 'active',
        OR: [{ validTo: null }, { validTo: { gte: now } }],
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { permits: rows.map((r) => this.mapPermit(r)), total: rows.length };
  }

  async listPending(projectId: number) {
    return this.listPermits(projectId, {
      status: ['draft', 'pending_approval', 'approved'],
    });
  }

  async listExpired(projectId: number) {
    const now = new Date();
    const rows = await this.prisma.pmPermit.findMany({
      where: {
        projectId,
        OR: [
          { status: 'expired' },
          { status: 'active', validTo: { lt: now } },
          {
            status: { in: ['approved', 'pending_approval'] },
            validTo: { lt: now },
          },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { permits: rows.map((r) => this.mapPermit(r)), total: rows.length };
  }

  async listHistory(projectId: number) {
    return this.listPermits(projectId, {
      status: ['closed', 'expired', 'rejected'],
    });
  }

  async getPermit(id: string) {
    const row = await this.prisma.pmPermit.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' } } },
    });
    if (!row) throw new NotFoundException('Permit not found');
    return this.mapPermit(row);
  }

  async createPermit(
    projectId: number,
    body: {
      permitType: PmPermitType;
      title: string;
      workPackageId?: string;
      taskId?: string;
      requiredTraining?: string[];
      requiredControls?: string[];
      requiredJhaId?: string;
      validFrom?: string;
      validTo?: string;
      workflow?: PermitWorkflowJson;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const seed = PERMIT_TYPE_SEEDS.find(
      (p) => p.permitType === body.permitType,
    );
    const permit = await this.prisma.pmPermit.create({
      data: {
        id: randomUUID(),
        projectId,
        workPackageId: body.workPackageId,
        taskId: body.taskId,
        permitType: body.permitType,
        title: body.title,
        requiredTraining: (body.requiredTraining ??
          seed?.requiredTraining ??
          []) as Prisma.InputJsonValue,
        requiredControls: (body.requiredControls ??
          seed?.defaultControlKeys ??
          []) as Prisma.InputJsonValue,
        requiredJhaId: body.requiredJhaId,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validTo: body.validTo ? new Date(body.validTo) : undefined,
        clientSyncId: body.clientSyncId,
        workflowJson: (body.workflow ?? {
          hazards: seed?.defaultHazardKeys ?? [],
          controls: seed?.defaultControlKeys ?? [],
          trainingValidated: [],
          signoffs: [],
        }) as Prisma.InputJsonValue,
      } as Prisma.PmPermitUncheckedCreateInput,
    });

    await this.prisma.pmPmAuditLog
      .create({
        data: {
          id: randomUUID(),
          projectId,
          entityType: 'permit',
          entityId: permit.id,
          eventType: 'created',
          actorId,
        },
      })
      .catch(() => undefined);

    // VERIPM → FieldOS: create permit task + store fieldos_task_id
    void this.fieldOsBridge
      ?.onPmPermitCreated({
        pmPermitId: permit.id,
        projectId,
        permitType: body.permitType,
        title: body.title,
        taskId: body.taskId,
        validFrom: permit.validFrom,
        validTo: permit.validTo,
        requiredJhaId: body.requiredJhaId,
        actorId,
      })
      .catch(() => undefined);

    return this.mapPermit(permit);
  }

  async updatePermit(
    id: string,
    body: {
      title?: string;
      validFrom?: string;
      validTo?: string;
      requiredTraining?: string[];
      requiredControls?: string[];
      workflow?: PermitWorkflowJson;
    },
  ) {
    const permit = await this.prisma.pmPermit.findUnique({ where: { id } });
    if (!permit) throw new NotFoundException('Permit not found');
    if (!['draft', 'pending_approval'].includes(permit.status)) {
      throw new BadRequestException(
        'Permit cannot be edited in current status',
      );
    }

    const existingWorkflow = ((permit as { workflowJson?: unknown })
      .workflowJson ?? {}) as PermitWorkflowJson;
    const updated = await this.prisma.pmPermit.update({
      where: { id },
      data: {
        title: body.title,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validTo: body.validTo ? new Date(body.validTo) : undefined,
        requiredTraining: body.requiredTraining as
          | Prisma.InputJsonValue
          | undefined,
        requiredControls: body.requiredControls as
          | Prisma.InputJsonValue
          | undefined,
        workflowJson: body.workflow
          ? ({ ...existingWorkflow, ...body.workflow } as Prisma.InputJsonValue)
          : undefined,
      } as Prisma.PmPermitUncheckedUpdateInput,
    });
    return this.mapPermit(updated);
  }

  private hasSupervisorOverride(workflow: PermitWorkflowJson, field: string) {
    return (workflow.supervisorOverrides ?? []).some(
      (o) => o.field === field && Boolean(o.reason?.trim()),
    );
  }

  private async validatePermitTraining(permit: {
    requiredTraining: unknown;
    workflowJson?: unknown;
  }) {
    const workflow = (permit.workflowJson ?? {}) as PermitWorkflowJson;
    const workerId = workflow.workerId;
    if (!workerId) {
      throw new BadRequestException(
        'Assign a worker before submitting permit training validation',
      );
    }

    const required = (permit.requiredTraining as string[]) ?? [];
    if (required.length === 0) return { valid: true, requirements: [] };

    const result = await this.trainingHydration.validateRequiredTraining(
      workerId,
      required,
    );

    if (result.hasBlockingRestrictions) {
      throw new BadRequestException(
        `Worker has active medical restrictions: ${result.restrictions
          .map((r) => r.description)
          .join('; ')}`,
      );
    }

    if (!result.valid && !this.hasSupervisorOverride(workflow, 'training')) {
      const labels = result.failures.map((f) => `${f.name} (${f.status})`);
      throw new BadRequestException(
        `Missing or expired training for permit: ${labels.join(
          ', ',
        )}. Supervisor override required.`,
      );
    }

    return result;
  }

  async submitPermit(id: string, actorId?: number) {
    const permit = await this.prisma.pmPermit.findUnique({ where: { id } });
    if (!permit) throw new NotFoundException('Permit not found');
    if (permit.status !== 'draft') {
      throw new BadRequestException('Only draft permits can be submitted');
    }

    const trainingCheck = await this.validatePermitTraining(permit);
    const workflow = ((permit as { workflowJson?: unknown }).workflowJson ??
      {}) as PermitWorkflowJson;
    const validated = trainingCheck.requirements
      .filter((r) => r.status === 'valid')
      .map((r) => r.code);

    const updated = await this.prisma.pmPermit.update({
      where: { id },
      data: {
        status: 'pending_approval',
        workflowJson: {
          ...workflow,
          trainingValidated: validated,
        } as Prisma.InputJsonValue,
      } as Prisma.PmPermitUncheckedUpdateInput,
    });
    await this.audit(permit.projectId, id, 'submitted', actorId);
    return this.mapPermit(updated);
  }

  async approvePermit(id: string, actorId: number) {
    const permit = await this.prisma.pmPermit.findUnique({ where: { id } });
    if (!permit) throw new NotFoundException('Permit not found');
    if (permit.status !== 'pending_approval') {
      throw new BadRequestException('Permit not pending approval');
    }

    await this.validatePermitTraining(permit);

    await this.prisma.pmPermitVersion.create({
      data: {
        id: randomUUID(),
        permitId: id,
        version: permit.version,
        snapshotJson: this.mapPermit(
          permit,
        ) as unknown as Prisma.InputJsonValue,
      },
    });

    const updated = await this.prisma.pmPermit.update({
      where: { id },
      data: {
        status: 'approved',
        approvedById: actorId,
        approvedAt: new Date(),
        version: { increment: 1 },
      },
    });
    await this.audit(permit.projectId, id, 'approved', actorId);
    return this.mapPermit(updated);
  }

  async activatePermit(id: string, actorId?: number) {
    const permit = await this.prisma.pmPermit.findUnique({ where: { id } });
    if (!permit) throw new NotFoundException('Permit not found');
    if (permit.status !== 'approved') {
      throw new BadRequestException(
        'Permit must be approved before activation',
      );
    }
    if (permit.validTo && permit.validTo < new Date()) {
      throw new BadRequestException('Permit expired');
    }
    const updated = await this.prisma.pmPermit.update({
      where: { id },
      data: { status: 'active', validFrom: permit.validFrom ?? new Date() },
    });
    await this.audit(permit.projectId, id, 'activated', actorId);
    return this.mapPermit(updated);
  }

  async closePermit(id: string, actorId?: number) {
    const permit = await this.prisma.pmPermit.findUnique({ where: { id } });
    if (!permit) throw new NotFoundException('Permit not found');
    const updated = await this.prisma.pmPermit.update({
      where: { id },
      data: { status: 'closed' },
    });
    await this.audit(permit.projectId, id, 'closed', actorId);
    return this.mapPermit(updated);
  }

  private async audit(
    projectId: number,
    permitId: string,
    action: string,
    actorId?: number,
  ) {
    await this.prisma.pmPmAuditLog
      .create({
        data: {
          id: randomUUID(),
          projectId,
          entityType: 'permit',
          entityId: permitId,
          eventType: action,
          actorId,
        },
      })
      .catch(() => undefined);
  }
}
