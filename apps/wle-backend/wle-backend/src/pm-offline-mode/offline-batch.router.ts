import {
  HttpException,
  Injectable,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  FieldSyncBatchProcessor,
  type BatchActionInput,
  type BatchActionResult,
} from '../modules/field-sync/field-sync-batch.processor';
import { isPrismaUniqueViolation } from '../common/prisma-errors';
import { JhaFlhaService } from '../jha-flha/jha-flha.service';
import { PmInspectionsService } from '../pm-inspections/pm-inspections.service';
import { PmInspectionPhotoPipelineService } from '../pm-inspections/pm-inspection-photo-pipeline.service';
import { PmSafetyEventsService } from '../pm-safety-events/pm-safety-events.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import { PmTrainingService } from '../pm-training/pm-training.service';
import { PmDocumentControlService } from '../pm-document-control/pm-document-control.service';
import { PmEquipmentSafetyService } from '../pm-equipment-safety/pm-equipment-safety.service';
import { PmEmergencyResponseService } from '../pm-emergency-response/pm-emergency-response.service';
import { PmSiteAccessControlService } from '../pm-site-access-control/pm-site-access-control.service';
import { PmAttachmentsMediaService } from '../pm-attachments-media/pm-attachments-media.service';
import { PmSafetyStationsService } from '../pm-safety-stations/pm-safety-stations.service';
import { PmProjectManagementService } from '../pm-project-management/pm-project-management.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';
import { PmSafetyMeetingsService } from '../pm-safety-meetings/pm-safety-meetings.service';
import { SafetyFormSubmissionsService } from '../forms/submissions/submissions.service';

@Injectable()
export class OfflineBatchRouter {
  constructor(
    private readonly fieldProcessor: FieldSyncBatchProcessor,
    @Optional() private readonly jha?: JhaFlhaService,
    @Optional() private readonly inspections?: PmInspectionsService,
    @Optional()
    private readonly inspectionPhotos?: PmInspectionPhotoPipelineService,
    @Optional() private readonly incidents?: PmSafetyEventsService,
    @Optional() private readonly capa?: PmCorrectiveActionsService,
    @Optional() private readonly training?: PmTrainingService,
    @Optional() private readonly documents?: PmDocumentControlService,
    @Optional() private readonly equipment?: PmEquipmentSafetyService,
    @Optional() private readonly emergency?: PmEmergencyResponseService,
    @Optional() private readonly siteAccess?: PmSiteAccessControlService,
    @Optional() private readonly attachments?: PmAttachmentsMediaService,
    @Optional() private readonly stations?: PmSafetyStationsService,
    @Optional() private readonly pm?: PmProjectManagementService,
    @Optional() private readonly sifHeca?: SifHecaService,
    @Optional() private readonly meetings?: PmSafetyMeetingsService,
    @Optional() private readonly safetyForms?: SafetyFormSubmissionsService,
  ) {}

  async process(
    action: BatchActionInput,
    actorUserId: number,
  ): Promise<BatchActionResult> {
    const coreTypes = new Set([
      'worker.link',
      'equipment.link',
      'project.assignWorker',
      'project.assignEquipment',
      'inspection.submit',
      'training.upload',
      'qr.tempRecord',
      'safetyForm.submit',
      'safetyFormV2.submit',
    ]);

    if (coreTypes.has(action.type) && action.type !== 'safetyFormV2.submit') {
      return this.fieldProcessor.processOne(action, actorUserId);
    }

    try {
      switch (action.type) {
        case 'jhaFlha.sync':
          if (!this.jha)
            throw new ServiceUnavailableException('JHA module not loaded');
          {
            const row = await this.jha.syncOffline(action.payload as never);
            return {
              type: action.type,
              ok: true,
              entityId: row.id,
              serverState: { id: row.id, status: row.status },
            };
          }
        case 'pmInspections.sync':
          if (!this.inspections)
            throw new ServiceUnavailableException(
              'Inspections module not loaded',
            );
          {
            const row = await this.inspections.syncOffline(
              action.payload as never,
            );
            return {
              type: action.type,
              ok: true,
              entityId: row.id,
              serverState: { id: row.id, status: row.status },
            };
          }
        case 'pmInspectionPhoto.capture':
          if (!this.inspectionPhotos)
            throw new ServiceUnavailableException(
              'Inspection photo pipeline not loaded',
            );
          {
            const payload = action.payload as {
              inspectionId: string;
              dataUrl?: string;
              caption?: string;
              clientSyncId?: string;
              mimeType?: string;
              fileName?: string;
              defaultSubcontractorCompanyId?: number;
            };
            const result = await this.inspectionPhotos.captureAndAnalyze({
              inspectionId: payload.inspectionId,
              actorId: actorUserId,
              dataUrl: payload.dataUrl,
              caption: payload.caption,
              clientSyncId: payload.clientSyncId,
              mimeType: payload.mimeType,
              fileName: payload.fileName,
              defaultSubcontractorCompanyId:
                payload.defaultSubcontractorCompanyId,
              offline: true,
              waitForAnalysis: false,
            });
            return {
              type: action.type,
              ok: true,
              serverState: {
                attachmentId: result.attachment?.id,
                analysisStatus:
                  result.analysisStatus ?? result.attachment?.analysisStatus,
                findingCount: result.findings?.length ?? 0,
                analysisEngine: result.analysisEngine,
              },
            };
          }
        case 'pmIncidents.sync':
          if (!this.incidents) throw new ServiceUnavailableException('Incidents module not loaded');
          {
            const row = await this.incidents.syncOffline(
              action.payload as never,
            );
            return {
              type: action.type,
              ok: true,
              entityId: row.id,
              serverState: { id: row.id, status: row.status },
            };
          }
        case 'pmCapa.sync':
          if (!this.capa) throw new ServiceUnavailableException('CAPA module not loaded');
          {
            const row = await this.capa.syncOffline(action.payload as never);
            return {
              type: action.type,
              ok: true,
              entityId: row.id,
              serverState: { id: row.id, status: row.status },
            };
          }
        case 'pmTraining.sync':
          if (!this.training) throw new ServiceUnavailableException('Training module not loaded');
          {
            const row = await this.training.syncOffline(
              action.payload as never,
            );
            return {
              type: action.type,
              ok: true,
              entityId: row.id,
              serverState: row as Record<string, unknown>,
            };
          }
        case 'pmDocuments.sync':
          if (!this.documents)
            throw new ServiceUnavailableException('Document control module not loaded');
          {
            const projectId = Number(action.payload.projectId);
            const result = await this.documents.applyOfflineSync(
              projectId,
              action.payload as never,
              actorUserId,
            );
            return { type: action.type, ok: true, serverState: result };
          }
        case 'pmEquipment.sync':
          if (!this.equipment) throw new ServiceUnavailableException('Equipment module not loaded');
          {
            const projectId = Number(action.payload.projectId);
            const result = await this.equipment.applyOfflineSync(
              projectId,
              action.payload as never,
              actorUserId,
            );
            return { type: action.type, ok: true, serverState: result };
          }
        case 'pmEmergency.sync':
          if (!this.emergency) throw new ServiceUnavailableException('Emergency module not loaded');
          {
            const projectId = Number(action.payload.projectId);
            const result = await this.emergency.applyOfflineSync(
              projectId,
              action.payload as never,
              actorUserId,
            );
            return { type: action.type, ok: true, serverState: result };
          }
        case 'pmSiteAccess.sync':
          if (!this.siteAccess)
            throw new ServiceUnavailableException('Site access module not loaded');
          {
            const projectId = Number(action.payload.projectId);
            const result = await this.siteAccess.applyOfflineSync(
              projectId,
              action.payload as never,
              actorUserId,
            );
            return { type: action.type, ok: true, serverState: result };
          }
        case 'pmAttachments.sync':
          if (!this.attachments)
            throw new ServiceUnavailableException('Attachments module not loaded');
          {
            const projectId = Number(action.payload.projectId);
            const result = await this.attachments.applyOfflineSync(
              projectId,
              action.payload as never,
              actorUserId,
            );
            return { type: action.type, ok: true, serverState: result };
          }
        case 'pmSafetyStations.sync':
          if (!this.stations)
            throw new ServiceUnavailableException('Safety stations module not loaded');
          {
            const stationId = Number(action.payload.stationId);
            const result = await this.stations.applyOfflineSync(
              stationId,
              action.payload as never,
            );
            return { type: action.type, ok: true, serverState: result };
          }
        case 'pmProjectManagement.sync':
          if (!this.pm) throw new ServiceUnavailableException('PM module not loaded');
          {
            const projectId = Number(action.payload.projectId);
            const result = await this.pm.applyOfflineSync(
              projectId,
              action.payload as never,
              actorUserId,
            );
            return { type: action.type, ok: true, serverState: result };
          }
        case 'sifHeca.sync':
          if (!this.sifHeca) throw new ServiceUnavailableException('SIF/HECA module not loaded');
          {
            const row = await this.sifHeca.syncOffline(action.payload as never);
            return {
              type: action.type,
              ok: true,
              entityId: row.id,
              serverState: { id: row.id, status: row.status },
            };
          }
        case 'pmSafetyMeetings.sync':
          if (!this.meetings)
            throw new ServiceUnavailableException('Safety meetings module not loaded');
          {
            const row = await this.meetings.syncOffline(action.payload);
            return {
              type: action.type,
              ok: true,
              entityId: row.id,
              serverState: { id: row.id, status: row.status },
            };
          }
        case 'safetyFormV2.submit':
          if (!this.safetyForms) {
            return this.fieldProcessor.processOne(action, actorUserId);
          }
          {
            const row = await this.safetyForms.syncOffline(
              action.payload as never,
            );
            return {
              type: action.type,
              ok: true,
              serverState: { status: row.status, updatedAt: row.updatedAt },
            };
          }
        default:
          return this.fieldProcessor.processOne(action, actorUserId);
      }
    } catch (e) {
      if (e instanceof HttpException) {
        const status = e.getStatus();
        const body = e.getResponse();
        const message =
          typeof body === 'string'
            ? body
            : Array.isArray((body as { message?: unknown }).message)
              ? ((body as { message: string[] }).message).join('; ')
              : String(
                  (body as { message?: string }).message ?? e.message,
                );
        return {
          type: action.type,
          ok: false,
          error: message,
          code:
            status === 409
              ? 'OFFLINE_SYNC_CONFLICT'
              : status === 404
                ? 'NOT_FOUND'
                : status === 503
                  ? 'SERVICE_UNAVAILABLE'
                  : 'HTTP_ERROR',
          statusCode: status,
        };
      }
      if (isPrismaUniqueViolation(e)) {
        return {
          type: action.type,
          ok: false,
          error: 'Duplicate clientSyncId',
          code: 'OFFLINE_SYNC_CONFLICT',
          statusCode: 409,
        };
      }
      const msg = e instanceof Error ? e.message : String(e);
      return {
        type: action.type,
        ok: false,
        error: msg,
        code: 'BATCH_ACTION_FAILED',
      };
    }
  }
}
