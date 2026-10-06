import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  JhaFlhaKind,
  JhaFlhaStatus,
  PmCorrectiveActionStatus,
  PmInspectionStatus,
  PmInvestigationStatus,
  PmSafetyEventStatus,
} from '@prisma/client';
import { JhaFlhaService } from '../../jha-flha/jha-flha.service';
import { PmInspectionsService } from '../../pm-inspections/pm-inspections.service';
import { inspectionKind } from '../../pm-inspections/pm-inspection-kind.util';
import { PmCorrectiveActionsService } from '../../pm-corrective-actions/pm-corrective-actions.service';
import { PmSafetyEventsInvestigationService } from '../../pm-safety-events/pm-safety-events-investigation.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  notImplemented,
  parseSmsWorkflowEntity,
  type SmsWorkflowEntity,
} from './sms-workflow.constants';
import type { SmsWorkflowCreateDto } from './dto/sms-workflow-create.dto';
import type { SmsWorkflowListQueryDto } from './dto/sms-workflow-list-query.dto';
import type { SmsWorkflowUpdateDto } from './dto/sms-workflow-update.dto';

@Injectable()
export class SmsWorkflowService {
  private readonly logger = new Logger(SmsWorkflowService.name);

  constructor(
    private readonly jhaFlha: JhaFlhaService,
    private readonly inspections: PmInspectionsService,
    private readonly capa: PmCorrectiveActionsService,
    private readonly investigation: PmSafetyEventsInvestigationService,
    private readonly prisma: PrismaService,
  ) {}

  parseEntity(entity: string): SmsWorkflowEntity {
    return parseSmsWorkflowEntity(entity);
  }

  async list(entityInput: string, query: SmsWorkflowListQueryDto) {
    const entity = this.parseEntity(entityInput);
    this.log('list', entity, { query });

    switch (entity) {
      case 'flha':
        return this.jhaFlha.list({
          companyId: query.companyId,
          projectId: query.projectId,
          status: query.status as JhaFlhaStatus | undefined,
          kind: 'FLHA',
        });
      case 'jha':
        return this.jhaFlha.list({
          companyId: query.companyId,
          projectId: query.projectId,
          status: query.status as JhaFlhaStatus | undefined,
          kind: 'JHA',
        });
      case 'inspection':
        return this.filterInspectionsByKind(query, 'inspection');
      case 'audit':
        return this.filterInspectionsByKind(query, 'focus_audit');
      case 'corrective-action':
        return this.capa.list({
          companyId: query.companyId,
          projectId: query.projectId,
          status: query.status as PmCorrectiveActionStatus | undefined,
        });
      case 'investigation':
        return this.listInvestigations(query);
      default:
        return notImplemented(`list for ${entity}`);
    }
  }

  async create(
    entityInput: string,
    body: SmsWorkflowCreateDto,
    actorId?: number,
  ) {
    const entity = this.parseEntity(entityInput);
    this.log('create', entity, {
      companyId: body.companyId,
      projectId: body.projectId,
      actorId,
    });

    switch (entity) {
      case 'flha':
        return this.createJhaFlha(body, 'FLHA', actorId);
      case 'jha':
        return this.createJhaFlha(body, 'JHA', actorId);
      case 'inspection':
      case 'audit':
        return this.createInspection(entity, body, actorId);
      case 'corrective-action':
        return this.createCapa(body, actorId);
      case 'investigation':
        return this.openInvestigation(body, actorId);
      default:
        return notImplemented(`create for ${entity}`);
    }
  }

  async getById(entityInput: string, id: string) {
    const entity = this.parseEntity(entityInput);
    this.log('get', entity, { id });

    switch (entity) {
      case 'flha':
      case 'jha': {
        const row = await this.jhaFlha.getById(id);
        if (entity === 'flha' && row.kind !== 'FLHA') {
          throw new NotFoundException('FLHA record not found');
        }
        if (entity === 'jha' && row.kind !== 'JHA') {
          throw new NotFoundException('JHA record not found');
        }
        return row;
      }
      case 'inspection':
      case 'audit': {
        const row = await this.inspections.get(id);
        const kind = inspectionKind(row.template);
        if (entity === 'audit' && kind !== 'focus_audit') {
          throw new NotFoundException('Audit record not found');
        }
        if (entity === 'inspection' && kind === 'focus_audit') {
          throw new NotFoundException('Inspection record not found');
        }
        return row;
      }
      case 'corrective-action':
        return this.capa.get(id);
      case 'investigation':
        return this.investigation.getOrCreate(id);
      default:
        return notImplemented(`get for ${entity}`);
    }
  }

  async patch(
    entityInput: string,
    id: string,
    body: SmsWorkflowUpdateDto,
    actorId?: number,
  ) {
    const entity = this.parseEntity(entityInput);
    this.log('patch', entity, { id, actorId });

    if (body.hazards?.length || body.findings?.length) {
      throw new HttpException(
        {
          code: 'NOT_IMPLEMENTED',
          message:
            'Bulk hazards/findings updates via workflow PATCH are not supported. Use entity-specific endpoints (e.g. POST /pm/jha-flha/:id/hazards or inspection photo capture).',
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    if (body.controls?.length || body.actions?.length) {
      throw new HttpException(
        {
          code: 'NOT_IMPLEMENTED',
          message:
            'Bulk controls/actions updates via workflow PATCH are not supported. Use entity-specific CAPA or control endpoints.',
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    if (body.signatures?.length) {
      throw new HttpException(
        {
          code: 'NOT_IMPLEMENTED',
          message:
            'Bulk signatures via workflow PATCH are not supported. Use POST /pm/inspections/:id/signatures or JHA sign endpoints.',
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    if (body.attachments?.length) {
      throw new HttpException(
        {
          code: 'NOT_IMPLEMENTED',
          message:
            'Bulk attachments via workflow PATCH are not supported. Use entity attachment upload endpoints.',
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    const overview = body.overview ?? {};

    switch (entity) {
      case 'flha':
      case 'jha':
        return this.jhaFlha.updateDraft(
          id,
          {
            taskDescription:
              body.taskDescription ??
              (overview.taskDescription as string | undefined),
            workScope:
              body.workScope ?? (overview.workScope as string | undefined),
            locationNote:
              body.locationNote ??
              (overview.locationNote as string | undefined),
            environmentalJson:
              body.environmentalJson ??
              (overview.environmentalJson as
                | Record<string, unknown>
                | undefined),
          },
          actorId,
        );
      case 'inspection':
      case 'audit': {
        if (body.answers) {
          await this.inspections.saveAnswers(id, body.answers, actorId);
        }
        const title = body.title ?? (overview.title as string | undefined);
        const locationNote =
          body.locationNote ?? (overview.locationNote as string | undefined);
        if (title != null || locationNote != null) {
          await this.prisma.pmInspection.update({
            where: { id },
            data: {
              ...(title != null ? { title } : {}),
              ...(locationNote != null ? { locationNote } : {}),
            },
          });
        }
        return this.getById(entity, id);
      }
      case 'corrective-action':
        return this.capa.updateDraft(
          id,
          {
            title: body.title ?? (overview.title as string | undefined),
            description:
              body.description ?? (overview.description as string | undefined),
          },
          actorId,
        );
      case 'investigation':
        return this.investigation.update(id, {
          narrative:
            body.narrative ?? (overview.narrative as string | undefined),
          immediateActions:
            body.immediateActions ??
            (overview.immediateActions as string | undefined),
          status: body.status as PmInvestigationStatus | undefined,
          currentStep: body.currentStep,
          guidedAnswersJson: body.guidedAnswersJson,
        });
      default:
        return notImplemented(`patch for ${entity}`);
    }
  }

  async submit(entityInput: string, id: string, actorId?: number) {
    const entity = this.parseEntity(entityInput);
    this.log('submit', entity, { id, actorId });

    switch (entity) {
      case 'flha':
      case 'jha':
        return this.jhaFlha.submit(id, actorId);
      case 'inspection':
      case 'audit':
        if (!actorId) {
          throw new BadRequestException(
            'Authenticated user required to submit',
          );
        }
        return this.inspections.submit(id, actorId);
      case 'corrective-action':
        if (!actorId) {
          throw new BadRequestException(
            'Authenticated user required to submit',
          );
        }
        return this.capa.submitForVerification(id, actorId);
      case 'investigation':
        return this.investigation.update(id, { status: 'review' });
      default:
        return notImplemented(`submit for ${entity}`);
    }
  }

  private async createJhaFlha(
    body: SmsWorkflowCreateDto,
    kind: JhaFlhaKind,
    actorId?: number,
  ) {
    if (!body.taskDescription?.trim()) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'taskDescription is required to create an FLHA/JHA draft',
        details: { field: 'taskDescription' },
      });
    }
    return this.jhaFlha.create({
      kind,
      companyId: body.companyId,
      projectId: body.projectId,
      taskDescription: body.taskDescription,
      workScope: body.workScope,
      locationNote: body.locationNote,
      siteId: body.siteId,
      createdByUserId: actorId,
      clientSyncId: body.clientSyncId,
    });
  }

  private async createInspection(
    entity: 'inspection' | 'audit',
    body: SmsWorkflowCreateDto,
    actorId?: number,
  ) {
    if (!body.templateId) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message:
          'templateId is required to create an inspection or audit draft',
        details: { field: 'templateId' },
      });
    }
    if (!actorId) {
      throw new BadRequestException(
        'Authenticated user required to create inspections',
      );
    }

    const template = await this.prisma.pmInspectionTemplate.findUnique({
      where: { id: body.templateId },
    });
    if (!template) {
      throw new NotFoundException('Inspection template not found');
    }
    const kind = inspectionKind(template);
    if (entity === 'audit' && kind !== 'focus_audit') {
      throw new BadRequestException(
        'templateId must reference a Focus Audit template',
      );
    }
    if (entity === 'inspection' && kind === 'focus_audit') {
      throw new BadRequestException(
        'Use entity audit for Focus Audit templates, or choose a checklist/smart-site template',
      );
    }

    return this.inspections.createFromTemplate({
      templateId: body.templateId,
      companyId: body.companyId,
      projectId: body.projectId,
      inspectorUserId: actorId,
      siteId: body.siteId,
      equipmentId: body.equipmentId,
      workerId: body.workerId,
      title: body.title,
      locationNote: body.locationNote,
      clientSyncId: body.clientSyncId,
    });
  }

  private async createCapa(body: SmsWorkflowCreateDto, actorId?: number) {
    if (!body.title?.trim()) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'title is required to create a corrective action',
        details: { field: 'title' },
      });
    }
    if (!body.sourceModule?.trim() || !body.sourceId?.trim()) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message:
          'sourceModule and sourceId are required for corrective actions',
        details: { fields: ['sourceModule', 'sourceId'] },
      });
    }
    return this.capa.create({
      companyId: body.companyId,
      projectId: body.projectId,
      sourceModule: body.sourceModule,
      sourceId: body.sourceId,
      title: body.title,
      description: body.description,
      actionType: body.actionType as never,
      severity: body.severity,
      siteId: body.siteId,
      equipmentId: body.equipmentId,
      workerId: body.workerId,
      assignUserId: body.assignUserId,
      clientSyncId: body.clientSyncId,
      publish: body.publish,
      createdByUserId: actorId ?? 0,
    });
  }

  private async openInvestigation(
    body: SmsWorkflowCreateDto,
    actorId?: number,
  ) {
    const eventId = body.eventId;
    if (!eventId) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'eventId is required to open an investigation',
        details: { field: 'eventId' },
      });
    }
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
    });
    if (!event) {
      throw new NotFoundException('Parent safety event not found');
    }
    return this.investigation.getOrCreate(
      eventId,
      body.leadInvestigatorId ?? actorId,
    );
  }

  private async filterInspectionsByKind(
    query: SmsWorkflowListQueryDto,
    expectedKind: string,
  ) {
    const rows = await this.inspections.list({
      companyId: query.companyId,
      projectId: query.projectId,
      status: query.status as PmInspectionStatus | undefined,
    });
    return rows.filter((row) => inspectionKind(row.template) === expectedKind);
  }

  private async listInvestigations(query: SmsWorkflowListQueryDto) {
    return this.prisma.pmSafetyEventInvestigation.findMany({
      where: {
        ...(query.status
          ? { status: query.status as PmInvestigationStatus }
          : {}),
        event: {
          deletedAt: null,
          ...(query.companyId ? { companyId: query.companyId } : {}),
          ...(query.projectId ? { projectId: query.projectId } : {}),
          ...(query.status && !this.isInvestigationStatus(query.status)
            ? { status: query.status as PmSafetyEventStatus }
            : {}),
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            status: true,
            companyId: true,
            projectId: true,
          },
        },
        leadInvestigator: { select: { id: true, username: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: query.limit ?? 100,
    });
  }

  private isInvestigationStatus(status: string): boolean {
    return [
      'not_started',
      'evidence_gathering',
      'analysis',
      'root_cause',
      'capa_planning',
      'review',
      'closed',
    ].includes(status);
  }

  private log(
    operation: string,
    entity: SmsWorkflowEntity,
    meta: Record<string, unknown>,
  ) {
    this.logger.log(
      JSON.stringify({
        type: 'sms.workflow',
        operation,
        entity,
        ...meta,
      }),
    );
  }
}
