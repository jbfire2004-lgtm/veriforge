import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  forwardRef,
} from '@nestjs/common';
import {
  InspectionType,
  PmSafetyWorkflowKind,
  TrainingValidationOutcome,
  TrainingValidationSubject,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from '../vera-core/company-links.service';
import { ProjectsService } from '../vera-core/projects.service';
import { EquipmentLinksService } from '../vera-core/equipment-links.service';
import { TrainingRecordsService } from '../../training-records/training-records.service';
import { PmSafetyWorkflowService } from '../../pm-safety-workflow/pm-safety-workflow.service';
import { SafetyFormSubmissionsService } from '../../forms/submissions/submissions.service';
import type { CreateTrainingRecordDto } from '../../training-records/dto/create-training-record.dto';
import type { CreatePmSafetyWorkflowDto } from '../../pm-safety-workflow/dto/create-pm-safety-workflow.dto';
import { TrainingWalletIntegrationService } from '../vera-core/training-wallet-integration.service';

export type BatchActionInput = {
  type: string;
  payload: Record<string, unknown>;
  clientTimestamp?: string;
  clientVersion?: number;
};

export type BatchActionResult = {
  type: string;
  ok: boolean;
  error?: string;
  /** Stable machine code for client retry / conflict handling. */
  code?: string;
  statusCode?: number;
  serverState?: Record<string, unknown>;
  entityId?: number | string;
};

@Injectable()
export class FieldSyncBatchProcessor {
  private readonly logger = new Logger(FieldSyncBatchProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly companyLinks: CompanyLinksService,
    private readonly projects: ProjectsService,
    private readonly equipmentLinks: EquipmentLinksService,
    private readonly trainingRecords: TrainingRecordsService,
    private readonly pmSafety: PmSafetyWorkflowService,
    private readonly safetyForms: SafetyFormSubmissionsService,
    @Optional()
    @Inject(forwardRef(() => TrainingWalletIntegrationService))
    private readonly walletIntegration?: TrainingWalletIntegrationService,
  ) {}

  async processOne(
    action: BatchActionInput,
    actorUserId: number,
  ): Promise<BatchActionResult> {
    try {
      switch (action.type) {
        case 'worker.link':
          return await this.workerLink(action.payload);
        case 'equipment.link':
          return await this.equipmentLink(action.payload);
        case 'project.assignWorker':
          return await this.assignWorker(action.payload, actorUserId);
        case 'project.assignEquipment':
          return await this.assignEquipment(action.payload);
        case 'inspection.submit':
          return await this.inspectionSubmit(action.payload, actorUserId);
        case 'training.upload':
          return await this.trainingUpload(action.payload);
        case 'qr.tempRecord':
          return this.qrTemp(action.payload);
        case 'safetyForm.submit':
          return await this.safetyFormSubmit(action.payload, actorUserId);
        case 'safetyFormV2.submit':
          return await this.safetyFormV2Submit(action.payload, actorUserId);
        default:
          return {
            type: action.type,
            ok: false,
            error: `Unsupported sync action: ${action.type}`,
          };
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Batch action ${action.type} failed: ${msg}`);
      return { type: action.type, ok: false, error: msg };
    }
  }

  private async workerLink(
    p: Record<string, unknown>,
  ): Promise<BatchActionResult> {
    const workerId = Number(p.workerId);
    const companyId = Number(p.companyId);
    if (!Number.isFinite(workerId) || !Number.isFinite(companyId)) {
      throw new BadRequestException('workerId and companyId required');
    }
    await this.companyLinks.linkWorker(workerId, companyId, {
      role: p.role as string | undefined,
      trade: p.trade as string | undefined,
    });
    return {
      type: 'worker.link',
      ok: true,
      serverState: { workerActive: true },
      entityId: workerId,
    };
  }

  private async equipmentLink(
    p: Record<string, unknown>,
  ): Promise<BatchActionResult> {
    const equipmentId = Number(p.equipmentId);
    const companyId = Number(p.companyId);
    if (!Number.isFinite(equipmentId) || !Number.isFinite(companyId)) {
      throw new BadRequestException('equipmentId and companyId required');
    }
    await this.equipmentLinks.linkEquipment(equipmentId, companyId);
    return {
      type: 'equipment.link',
      ok: true,
      serverState: { lockedOut: false },
      entityId: equipmentId,
    };
  }

  private async assignWorker(
    p: Record<string, unknown>,
    actorUserId: number,
  ): Promise<BatchActionResult> {
    const projectId = Number(p.projectId);
    const workerId = Number(p.workerId);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.projects.assignWorker(projectId, workerId, actorUserId);
    return {
      type: 'project.assignWorker',
      ok: true,
      serverState: { projectStatus: project.status },
      entityId: projectId,
    };
  }

  private async assignEquipment(
    p: Record<string, unknown>,
  ): Promise<BatchActionResult> {
    const projectId = Number(p.projectId);
    const equipmentId = Number(p.equipmentId);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    await this.projects.assignEquipment(projectId, equipmentId);
    return {
      type: 'project.assignEquipment',
      ok: true,
      serverState: { projectStatus: project.status },
      entityId: projectId,
    };
  }

  private async inspectionSubmit(
    p: Record<string, unknown>,
    actorUserId: number,
  ): Promise<BatchActionResult> {
    const equipmentId = Number(p.equipmentId);
    const row = await this.prisma.inspection.create({
      data: {
        equipmentId,
        workerId: p.workerId != null ? Number(p.workerId) : null,
        supervisorId: actorUserId,
        inspectionType:
          (p.inspectionType as InspectionType) ?? InspectionType.PRE_USE,
        checklist: p.checklist as object,
        passed: p.passed === true,
        notes: p.notes as string | undefined,
        correctiveActions: p.correctiveActions as string | undefined,
        photos: p.photoRefs as object,
        completedAt: new Date(),
        status: 'COMPLETED',
      },
    });
    return {
      type: 'inspection.submit',
      ok: true,
      entityId: row.id,
      serverState: { lockedOut: row.lockoutTriggered },
    };
  }

  private async trainingUpload(
    p: Record<string, unknown>,
  ): Promise<BatchActionResult> {
    const record = p.record as CreateTrainingRecordDto;
    if (!record?.workerId || !record?.certificationId) {
      throw new BadRequestException('training.upload requires record payload');
    }
    const created = await this.trainingRecords.create(record);
    await this.prisma.trainingValidationResult.create({
      data: {
        subjectType: TrainingValidationSubject.TRAINING_RECORD,
        outcome: TrainingValidationOutcome.PENDING,
        trainingRecordId: created.id,
        details: { source: 'field_sync' },
      },
    });

    if (this.walletIntegration) {
      await this.walletIntegration
        .syncAfterTrainingRecord(created.id)
        .catch((e) =>
          this.logger.warn(`Field sync wallet pipeline failed: ${e}`),
        );
    }

    return {
      type: 'training.upload',
      ok: true,
      entityId: created.id,
      serverState: { workerId: created.workerId, trainingRecordId: created.id },
    };
  }

  private qrTemp(p: Record<string, unknown>): BatchActionResult {
    this.logger.log(`QR temp record: ${JSON.stringify(p).slice(0, 200)}`);
    return {
      type: 'qr.tempRecord',
      ok: true,
      entityId: String(p.tempId ?? ''),
    };
  }

  private async safetyFormSubmit(
    p: Record<string, unknown>,
    actorUserId: number,
  ): Promise<BatchActionResult> {
    const kind = String(p.kind ?? 'JHA') as PmSafetyWorkflowKind;
    const dto: CreatePmSafetyWorkflowDto = {
      title: String(p.title ?? `${kind} (offline)`),
      kind,
      companyId: p.companyId != null ? Number(p.companyId) : undefined,
      siteId: p.siteId != null ? Number(p.siteId) : undefined,
      workDescription: p.workDescription as string | undefined,
      hazardSummary: p.hazardSummary as string | undefined,
      controlMeasures: p.controlMeasures as string | undefined,
      jobLocation: p.jobLocation as string | undefined,
      taskStepsJson: p.taskStepsJson as string | undefined,
    };
    const row = await this.pmSafety.create(dto);
    if (p.submit === true) {
      await this.pmSafety.transition(
        row.id,
        'submit',
        { userId: actorUserId, role: UserRole.SUPERVISOR },
        'Submitted from field offline sync',
      );
    }
    return {
      type: 'safetyForm.submit',
      ok: true,
      entityId: row.id,
      serverState: {
        serverUpdatedAt: row.updatedAt.toISOString(),
        status: row.status,
      },
    };
  }

  private async safetyFormV2Submit(
    p: Record<string, unknown>,
    actorUserId: number,
  ): Promise<BatchActionResult> {
    const clientSyncId = String(p.clientSyncId ?? p.draftId ?? '');
    const definitionId = String(p.definitionId ?? '');
    if (!clientSyncId || !definitionId) {
      throw new BadRequestException('clientSyncId and definitionId required');
    }
    const row = await this.safetyForms.syncOffline({
      clientSyncId,
      definitionId,
      formData: (p.formData as Record<string, unknown>) ?? {},
      submit: p.submit === true,
      companyId: p.companyId != null ? Number(p.companyId) : undefined,
      projectId: p.projectId != null ? Number(p.projectId) : undefined,
      siteId: p.siteId != null ? Number(p.siteId) : undefined,
      workerId: p.workerId != null ? Number(p.workerId) : undefined,
      actorId: actorUserId,
      signatures: p.signatures as
        | Array<{ fieldId?: string; signatureData: string }>
        | undefined,
    });
    return {
      type: 'safetyFormV2.submit',
      ok: true,
      entityId: row.id,
      serverState: {
        serverUpdatedAt: row.updatedAt.toISOString(),
        status: row.status,
      },
    };
  }
}
