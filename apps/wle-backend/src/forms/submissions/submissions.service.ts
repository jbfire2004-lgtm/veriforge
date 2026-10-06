import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Prisma, SafetyFormStatus } from '@prisma/client';

function toJson(data: Record<string, unknown>): Prisma.InputJsonValue {
  return data as Prisma.InputJsonValue;
}
import { PrismaService } from '../../prisma/prisma.service';
import { FormEngineService } from '../engine/form-engine.service';
import { DefinitionsLoader } from '../definitions/definitions.loader';
import { SafetyFormValidationService } from '../validation/validation.service';
import { SafetyFormWorkflowsService } from '../workflows/workflows.service';
import { SafetyFormCorrectiveActionsService } from '../corrective-actions/corrective-actions.service';
import { SafetyFormSignaturesService } from '../signatures/signatures.service';
import { SiteAccessService } from '../../safety-management/site-access/site-access.service';
import { SifHecaIngestionService } from '../../sif-heca/sif-heca-ingestion.service';
import { resolveSafetyFormLinks } from './resolve-safety-form-links';
import { resolveFormType } from '../engine/form-type.registry';

export type CreateSafetyFormInput = {
  definitionId: string;
  title?: string;
  formData?: Record<string, unknown>;
  companyId?: number;
  projectId?: number;
  siteId?: number;
  workerId?: number;
  equipmentId?: number;
  createdById?: number;
  clientSyncId?: string;
};

@Injectable()
export class SafetyFormSubmissionsService {
  private readonly logger = new Logger(SafetyFormSubmissionsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly loader: DefinitionsLoader,
    private readonly engine: FormEngineService,
    private readonly validation: SafetyFormValidationService,
    private readonly workflows: SafetyFormWorkflowsService,
    private readonly correctiveActions: SafetyFormCorrectiveActionsService,
    private readonly signatures: SafetyFormSignaturesService,
    private readonly siteAccess: SiteAccessService,
    @Optional() private readonly sifIngestion?: SifHecaIngestionService,
  ) {}

  async list(filters: {
    companyId?: number;
    projectId?: number;
    definitionId?: string;
    formType?: import('@prisma/client').SafetyFormType;
    status?: SafetyFormStatus;
    workerId?: number;
  }) {
    const started = Date.now();
    const rows = await this.prisma.safetyForm.findMany({
      where: {
        companyId: filters.companyId,
        projectId: filters.projectId,
        definitionId: filters.definitionId,
        formType: filters.formType,
        status: filters.status,
        workerId: filters.workerId,
      },
      include: {
        formDefinition: { select: { id: true, name: true, category: true } },
        worker: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    this.logger.log(
      JSON.stringify({
        type: 'safety_forms.list.query',
        companyId: filters.companyId ?? null,
        projectId: filters.projectId ?? null,
        status: filters.status ?? null,
        formType: filters.formType ?? null,
        rows: rows.length,
        durationMs: Date.now() - started,
      }),
    );
    return rows;
  }

  async getById(id: string) {
    const started = Date.now();
    const form = await this.prisma.safetyForm.findUnique({
      where: { id },
      include: {
        formDefinition: true,
        worker: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true, code: true } },
        equipment: { select: { id: true, name: true, assetTag: true } },
        signatures: true,
        attachments: true,
        actions: true,
        submissions: { orderBy: { versionNumber: 'desc' }, take: 5 },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!form) throw new NotFoundException('Safety form not found');
    this.logger.log(
      JSON.stringify({
        type: 'safety_forms.detail.query',
        formId: id,
        durationMs: Date.now() - started,
      }),
    );
    return form;
  }

  async create(input: CreateSafetyFormInput) {
    const def = this.loader.get(input.definitionId);
    if (!def) throw new NotFoundException('Form definition not found');

    const data = input.formData ?? {};
    const flags = this.engine.evaluateFlags(def, data);

    const formDataProjectId =
      typeof data.projectId === 'number'
        ? data.projectId
        : typeof data.projectId === 'string' && /^\d+$/.test(data.projectId)
        ? parseInt(data.projectId, 10)
        : undefined;
    const formDataWorkerId =
      typeof data.workerId === 'number'
        ? data.workerId
        : typeof data.workerId === 'string' && /^\d+$/.test(data.workerId)
        ? parseInt(data.workerId, 10)
        : undefined;

    const links = await resolveSafetyFormLinks(
      this.prisma,
      {
        companyId: input.companyId,
        projectId: input.projectId ?? formDataProjectId,
        siteId: input.siteId,
        workerId: input.workerId ?? formDataWorkerId,
        equipmentId: input.equipmentId,
      },
      { strict: false },
    );

    if (input.clientSyncId) {
      const existing = await this.prisma.safetyForm.findUnique({
        where: { clientSyncId: input.clientSyncId },
      });
      if (existing) return existing;
    }

    const form = await this.prisma.safetyForm.create({
      data: {
        definitionId: def.id,
        definitionVersion: def.version,
        formType: resolveFormType(def.id),
        title: input.title ?? def.name,
        formData: toJson(data),
        companyId: links.companyId,
        projectId: links.projectId,
        siteId: links.siteId,
        workerId: links.workerId,
        equipmentId: links.equipmentId,
        createdById: input.createdById,
        clientSyncId: input.clientSyncId,
        sifFlag: flags.sifFlag,
        hecaFlag: flags.hecaFlag,
      },
    });

    await this.prisma.safetyFormAuditLog.create({
      data: {
        formId: form.id,
        eventType: 'created',
        actorId: input.createdById,
      },
    });

    return form;
  }

  async saveDraft(
    id: string,
    formData: Record<string, unknown>,
    actorId?: number,
  ) {
    const form = await this.getById(id);
    if (form.status !== 'DRAFT' && form.status !== 'REJECTED') {
      throw new BadRequestException(
        'Only draft or rejected forms can be edited',
      );
    }
    const def = this.loader.get(form.definitionId);
    if (!def) throw new NotFoundException('Definition not found');

    const flags = this.engine.evaluateFlags(def, formData);
    const links = await this.linksFromFormData(form, formData);
    const updated = await this.prisma.safetyForm.update({
      where: { id },
      data: {
        formData: toJson(formData),
        sifFlag: flags.sifFlag,
        hecaFlag: flags.hecaFlag,
        clientVersion: { increment: 1 },
        offlinePending: false,
        ...links,
      },
    });

    await this.prisma.safetyFormAuditLog.create({
      data: { formId: id, eventType: 'draft_saved', actorId },
    });
    return updated;
  }

  async submit(
    id: string,
    formData: Record<string, unknown>,
    actorId?: number,
    signatures?: Array<{
      fieldId?: string;
      role?: 'WORKER' | 'SUPERVISOR' | 'AUTHORIZER' | 'WITNESS' | 'OTHER';
      signatureData: string;
      signerName?: string;
    }>,
  ) {
    const form = await this.getById(id);
    const def = this.loader.get(form.definitionId);
    if (!def) throw new NotFoundException('Definition not found');

    const errors = this.validation.validateSubmission(def, formData);
    if (errors.length) {
      throw new BadRequestException({ message: 'Validation failed', errors });
    }

    const flags = this.engine.evaluateFlags(def, formData);
    const links = await this.linksFromFormData(form, formData, true);
    const versionNumber =
      (await this.prisma.safetyFormSubmission.count({
        where: { formId: id },
      })) + 1;

    await this.prisma.$transaction(async (tx) => {
      await tx.safetyForm.update({
        where: { id },
        data: {
          formData: toJson(formData),
          sifFlag: flags.sifFlag,
          hecaFlag: flags.hecaFlag,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          submittedById: actorId,
          offlinePending: false,
          ...links,
        },
      });

      await tx.safetyFormSubmission.create({
        data: {
          formId: id,
          versionNumber,
          formData: toJson(formData),
          status: 'SUBMITTED',
          submittedById: actorId,
        },
      });

      await tx.safetyFormAuditLog.create({
        data: { formId: id, eventType: 'submitted', actorId },
      });
    });

    if (signatures?.length) {
      for (const sig of signatures) {
        await this.signatures.capture(id, {
          ...sig,
          signerUserId: actorId,
        });
      }
    }

    await this.correctiveActions.generateFromForm(
      id,
      def,
      formData,
      form.companyId,
      actorId,
      form.projectId,
      form.siteId,
      form.workerId,
      form.equipmentId,
    );

    if (
      form.definitionId === 'worker-site-access' &&
      form.projectId &&
      form.workerId
    ) {
      await this.siteAccess.processWorkerSiteAccessForm({
        formId: id,
        workerId: form.workerId,
        projectId: form.projectId,
        formData,
        actorUserId: actorId,
      });
    }

    if (this.sifIngestion && (form.sifFlag || form.hecaFlag)) {
      await this.sifIngestion.ingestFromSafetyForm(id, actorId);
    }

    return this.getById(id);
  }

  private async linksFromFormData(
    form: {
      companyId: number | null;
      projectId: number | null;
      siteId: number | null;
      workerId: number | null;
      equipmentId: number | null;
    },
    formData: Record<string, unknown>,
    strict = false,
  ) {
    const formDataProjectId =
      typeof formData.projectId === 'number'
        ? formData.projectId
        : typeof formData.projectId === 'string' &&
          /^\d+$/.test(formData.projectId)
        ? parseInt(formData.projectId, 10)
        : undefined;
    const formDataWorkerId =
      typeof formData.workerId === 'number'
        ? formData.workerId
        : typeof formData.workerId === 'string' &&
          /^\d+$/.test(formData.workerId)
        ? parseInt(formData.workerId, 10)
        : undefined;

    const resolved = await resolveSafetyFormLinks(
      this.prisma,
      {
        companyId: form.companyId ?? undefined,
        projectId: form.projectId ?? formDataProjectId,
        siteId: form.siteId ?? undefined,
        workerId: form.workerId ?? formDataWorkerId,
        equipmentId: form.equipmentId ?? undefined,
      },
      { strict },
    );

    const patch: {
      companyId?: number | null;
      projectId?: number | null;
      siteId?: number | null;
      workerId?: number | null;
      equipmentId?: number | null;
    } = {};
    if (resolved.companyId != null) patch.companyId = resolved.companyId;
    if (resolved.projectId != null) patch.projectId = resolved.projectId;
    if (resolved.siteId != null) patch.siteId = resolved.siteId;
    if (resolved.workerId != null) patch.workerId = resolved.workerId;
    if (resolved.equipmentId != null) patch.equipmentId = resolved.equipmentId;
    return patch;
  }

  async syncOffline(payload: {
    clientSyncId: string;
    definitionId: string;
    formData: Record<string, unknown>;
    submit?: boolean;
    companyId?: number;
    projectId?: number;
    siteId?: number;
    workerId?: number;
    actorId?: number;
    signatures?: Array<{ fieldId?: string; signatureData: string }>;
  }) {
    let form = await this.prisma.safetyForm.findUnique({
      where: { clientSyncId: payload.clientSyncId },
    });
    if (!form) {
      form = await this.create({
        definitionId: payload.definitionId,
        formData: payload.formData,
        companyId: payload.companyId,
        projectId: payload.projectId,
        siteId: payload.siteId,
        workerId: payload.workerId,
        createdById: payload.actorId,
        clientSyncId: payload.clientSyncId,
      });
    } else {
      form = await this.saveDraft(form.id, payload.formData, payload.actorId);
    }

    if (payload.submit) {
      return this.submit(
        form.id,
        payload.formData,
        payload.actorId,
        payload.signatures,
      );
    }
    return form;
  }

  async patchMeta(
    id: string,
    data: {
      formType?: import('@prisma/client').SafetyFormType;
      supervisorId?: number;
    },
  ) {
    return this.prisma.safetyForm.update({
      where: { id },
      data,
    });
  }
}
