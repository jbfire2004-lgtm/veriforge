import { apiPost } from "@/lib/api";
import { submitInspection } from "@/lib/api/inspection";
import {
  assignWorkerToProject,
  linkEquipmentToCompany,
  linkWorkerToCompany,
} from "@/lib/api/vera-core";
import { syncJhaFlhaOffline } from "@/lib/jha-flha";
import { syncSifHecaOffline } from "@/lib/sif-heca";
import { syncPmInspectionsOffline } from "@/lib/pm-inspections";
import { captureInspectionPhoto } from "@/lib/pm-inspection-v2";
import { syncPmIncidentsOffline } from "@/lib/pm-incidents";
import { syncPmTrainingOffline } from "@/lib/pm-training";
import { syncPmCapaOffline } from "@/lib/pm-corrective-actions";
import { applyPmDocumentsOfflineSync } from "@/lib/pm-document-control";
import { applyPmEquipmentOfflineSync } from "@/lib/pm-equipment-safety";
import { applyPmEmergencyOfflineSync } from "@/lib/pm-emergency-response";
import {
  applyPmSiteAccessOfflineSync,
  syncPmSiteAccessOffline,
} from "@/lib/pm-site-access-control";
import {
  applyPmAttachmentsOfflineSync,
  syncPmAttachmentsOffline,
} from "@/lib/pm-attachments-media";
import { syncPmOfflineMode } from "@/lib/pm-offline-mode";
import {
  applyStationOfflineSync,
  syncPmSafetyStationsOffline,
} from "@/lib/pm-safety-stations";
import { syncPmProjectSafetyContextOffline } from "@/lib/pm-project-safety-context";
import { syncPmCompanySafetyContextOffline } from "@/lib/pm-company-safety-context";
import { syncPmWorkerSafetyProfileOffline } from "@/lib/pm-worker-safety-profile";
import {
  applyPmProjectManagementOfflineSync,
  syncPmProjectManagementOffline,
} from "@/lib/pm-project-management";
import { syncPmUnifiedHcOffline } from "@/lib/pm-unified-hazard-control";
import { syncUnifiedCapaOffline } from "@/lib/pm-unified-corrective-action";
import { syncUnifiedIntelOffline } from "@/lib/pm-unified-safety-intelligence";
import { syncSafetyMeetingOffline } from "@/lib/pm-safety-meetings";
import { syncSafetyFormOffline } from "@/lib/safety-forms";
import { apiGet } from "@/lib/api";
import type { SyncActionType, SyncQueueItem } from "./types";

export type SyncHandlerResult =
  | { ok: true; serverState?: Record<string, unknown> }
  | { ok: false; error: string; serverState?: Record<string, unknown> };

const handlers: Record<
  SyncActionType,
  (payload: Record<string, unknown>) => Promise<SyncHandlerResult>
> = {
  "worker.link": async (p) => {
    await linkWorkerToCompany({
      workerId: p.workerId as number,
      companyId: p.companyId as number,
      role: p.role as string | undefined,
      trade: p.trade as string | undefined,
    });
    return { ok: true };
  },

  "equipment.link": async (p) => {
    await linkEquipmentToCompany(p.equipmentId as number, p.companyId as number);
    return { ok: true, serverState: { lockedOut: false } };
  },

  "project.assignWorker": async (p) => {
    await assignWorkerToProject(p.projectId as number, p.workerId as number);
    return {
      ok: true,
      serverState: { projectStatus: p._serverProjectStatus },
    };
  },

  "project.assignEquipment": async (p) => {
    await apiPost(`/api/v1/core/projects/${p.projectId}/assign-equipment`, {
      equipmentId: p.equipmentId,
    });
    return { ok: true };
  },

  "inspection.submit": async (p) => {
    await submitInspection({
      equipmentId: p.equipmentId as number,
      workerId: p.workerId as number | undefined,
      inspectionType: p.inspectionType as import("@/lib/api/inspection").InspectionType,
      checklist: p.checklist as Record<string, { passed: boolean; notes?: string }>,
      passed: p.passed as boolean,
      photos: p.photoRefs as string[] | undefined,
      correctiveActions: p.correctiveActions as string | undefined,
      notes: p.notes as string | undefined,
    });
    return { ok: true };
  },

  "training.upload": async (p) => {
    const res = await apiPost<{ results?: Array<{ entityId?: number; serverState?: { workerId?: number } }> }>(
      "/api/v1/sync/batch",
      {
        actions: [
          {
            type: "training.upload",
            payload: p,
            clientTimestamp: p.clientTimestamp as string | undefined,
          },
        ],
      },
    );
    const row = res.results?.[0];
    return {
      ok: true,
      serverState: {
        workerId: row?.serverState?.workerId ?? p.workerId,
        trainingRecordId: row?.entityId,
      },
    };
  },

  "qr.tempRecord": async (p) => {
    await apiPost("/api/v1/field/offline-registry", p);
    return { ok: true };
  },

  "safetyForm.submit": async (p) => {
    await apiPost("/api/v1/sync/batch", {
      actions: [
        {
          type: "safetyForm.submit",
          payload: p,
          clientTimestamp: p.clientTimestamp as string | undefined,
        },
      ],
    });
    return {
      ok: true,
      serverState: {
        serverUpdatedAt: new Date().toISOString(),
        status: p.submit ? "SUBMITTED" : "DRAFT",
      },
    };
  },

  "pmCapa.sync": async (p) => {
    const row = await syncPmCapaOffline(p as never);
    return {
      ok: true,
      serverState: { id: row.id, status: row.status },
    };
  },

  "pmDocuments.sync": async (p) => {
    const projectId = Number(p.projectId);
    const result = await applyPmDocumentsOfflineSync(projectId, {
      acknowledgments: p.acknowledgments as Array<Record<string, unknown>> | undefined,
      sdsCreates: p.sdsCreates as Array<Record<string, unknown>> | undefined,
    });
    return { ok: true, serverState: result };
  },

  "pmEquipment.sync": async (p) => {
    const projectId = Number(p.projectId);
    const result = await applyPmEquipmentOfflineSync(projectId, p as Record<string, unknown>);
    return { ok: true, serverState: result };
  },

  "pmEmergency.sync": async (p) => {
    const projectId = Number(p.projectId);
    const result = await applyPmEmergencyOfflineSync(projectId, p as Record<string, unknown>);
    return { ok: true, serverState: result };
  },

  "pmSiteAccess.sync": async (p) => {
    const projectId = Number(p.projectId);
    if (p.attempts || p.overrides) {
      const result = await applyPmSiteAccessOfflineSync(
        projectId,
        p as Record<string, unknown>,
      );
      return { ok: true, serverState: result };
    }
    const bundle = await syncPmSiteAccessOffline(projectId);
    return { ok: true, serverState: bundle };
  },

  "pmAttachments.sync": async (p) => {
    const projectId = Number(p.projectId);
    if (p.attachments || p.annotations) {
      const result = await applyPmAttachmentsOfflineSync(
        projectId,
        p as Record<string, unknown>,
      );
      return { ok: true, serverState: result };
    }
    const bundle = await syncPmAttachmentsOffline(projectId);
    return { ok: true, serverState: bundle };
  },

  "pmOffline.sync": async (p) => {
    const deviceId = String(p.deviceId ?? "field-device-default");
    const actions = (p.actions as Array<Record<string, unknown>>) ?? [];
    if (actions.length === 0 && !p.forceStatus) {
      const status = await import("@/lib/pm-offline-mode").then((m) =>
        m.fetchPmOfflineModeDevice(deviceId, p.projectId ? Number(p.projectId) : undefined),
      );
      return { ok: true, serverState: status };
    }
    const result = await syncPmOfflineMode({
      deviceId,
      companyId: p.companyId as number | undefined,
      projectId: p.projectId ? Number(p.projectId) : undefined,
      batchId: p.batchId as string | undefined,
      actions: actions.map((a) => ({
        type: String(a.type),
        recordId: a.recordId as string | undefined,
        payload: (a.payload as Record<string, unknown>) ?? a,
        clientVersion: a.clientVersion as number | undefined,
        lastModified: a.lastModified as string | undefined,
      })),
    });
    return {
      ok: Boolean(result.canComplete ?? true),
      serverState: result,
      error: result.canComplete === false ? "Unresolved conflicts remain" : undefined,
    };
  },

  "pmWorkerSafetyProfile.sync": async (p) => {
    const workerId = Number(p.workerId);
    const hasUpload =
      p.profile ||
      p.training ||
      p.authorizations ||
      p.restrictions ||
      p.exposures ||
      p.correctiveActions ||
      p.overrides;
    if (hasUpload) {
      const { syncPmWorkerSafetyOffline } = await import("../pm-worker-safety");
      const result = await syncPmWorkerSafetyOffline(workerId, p as Record<string, unknown>);
      return { ok: true, ...result };
    }
    const bundle = await syncPmWorkerSafetyProfileOffline(workerId);
    return { ok: true, serverState: bundle };
  },

  "pmCompanySafetyContext.sync": async (p) => {
    const companyId = Number(p.companyId);
    const hasUpload =
      p.profile ||
      p.hazards ||
      p.controls ||
      p.training ||
      p.policies ||
      p.sds ||
      p.emergency ||
      p.equipmentRules ||
      p.zoneTemplates ||
      p.overrides;
    if (hasUpload) {
      const { syncPmCompanySafetyOffline } = await import("../pm-company-safety");
      const result = await syncPmCompanySafetyOffline(companyId, p as Record<string, unknown>);
      return { ok: true, ...result };
    }
    const bundle = await syncPmCompanySafetyContextOffline(companyId);
    return { ok: true, serverState: bundle };
  },

  "pmProjectSafetyContext.sync": async (p) => {
    const projectId = Number(p.projectId);
    const hasUpload =
      p.profile ||
      p.hazards ||
      p.controls ||
      p.overrides ||
      p.zoneRules;
    if (hasUpload) {
      const { syncPmProjectSafetyOffline } = await import("../pm-project-safety");
      const result = await syncPmProjectSafetyOffline(projectId, p as Record<string, unknown>);
      return { ok: true, ...result };
    }
    const bundle = await syncPmProjectSafetyContextOffline(projectId);
    return { ok: true, serverState: bundle };
  },

  "pmUnifiedCorrectiveAction.sync": async (p) => {
    const companyId = Number(p.companyId);
    const projectId = p.projectId ? Number(p.projectId) : undefined;
    const hasUpload = p.actions || p.verifications || p.attachments;
    if (hasUpload && projectId) {
      const { syncPmCorrectiveActionOffline } = await import("../pm-corrective-action");
      const result = await syncPmCorrectiveActionOffline({
        companyId,
        projectId,
        actions: p.actions as Array<Record<string, unknown>> | undefined,
        verifications: p.verifications as
          | Array<{
              actionId: string;
              outcome: "approve" | "reject";
              role: string;
              notes?: string;
            }>
          | undefined,
        attachments: p.attachments as
          | Array<{
              actionId: string;
              fileName?: string;
              mimeType?: string;
              dataUrl?: string;
              phase?: string;
              clientSyncId?: string;
            }>
          | undefined,
      });
      return { ok: true, ...result };
    }
    const bundle = await syncUnifiedCapaOffline(companyId, projectId);
    return { ok: true, serverState: bundle };
  },

  "wallet.sync": async (p) => {
    const workerId = Number(p.workerId);
    if (!Number.isFinite(workerId) || workerId <= 0) {
      return { ok: false, error: "wallet.sync requires a valid workerId" };
    }
    const bundle = await apiGet<Record<string, unknown>>(
      `/api/v1/worker-wallet/bundle/${workerId}`,
    );
    return {
      ok: true,
      serverState: {
        bundle,
        syncedAt: bundle.syncedAt ?? new Date().toISOString(),
        workerId,
      },
    };
  },

  "pmUnifiedSafetyIntelligence.sync": async (p) => {
    const companyId = Number(p.companyId);
    const projectId = p.projectId ? Number(p.projectId) : undefined;
    const hasUpload = p.predictions || p.scores || p.recommendations;
    if (hasUpload && projectId) {
      const { syncPmCailOffline } = await import("../pm-cail");
      const result = await syncPmCailOffline({
        companyId,
        projectId,
        predictions: p.predictions as Array<Record<string, unknown>> | undefined,
        scores: p.scores as Array<Record<string, unknown>> | undefined,
        recommendations: p.recommendations as Array<Record<string, unknown>> | undefined,
      });
      return { ok: true, ...result };
    }
    const bundle = await syncUnifiedIntelOffline(companyId, projectId);
    return { ok: true, serverState: bundle };
  },

  "pmUnifiedHazardControl.sync": async (p) => {
    const companyId = Number(p.companyId);
    const projectId = p.projectId ? Number(p.projectId) : undefined;
    const hasUpload = p.hazards || p.controls || p.mappings;
    if (hasUpload) {
      const { syncPmHazardOffline } = await import("../pm-hazard");
      const result = await syncPmHazardOffline({
        companyId,
        projectId,
        hazards: p.hazards as Array<Record<string, unknown>> | undefined,
        controls: p.controls as Array<Record<string, unknown>> | undefined,
        mappings: p.mappings as
          | Array<{ hazardId: string; controlId: string; effectivenessScore?: number }>
          | undefined,
      });
      return { ok: true, ...result };
    }
    const bundle = await syncPmUnifiedHcOffline(companyId, projectId);
    return { ok: true, serverState: bundle };
  },

  "pmProjectManagement.sync": async (p) => {
    const projectId = Number(p.projectId);
    const hasUpload =
      p.workPackages ||
      p.tasks ||
      p.schedule ||
      p.workerAssignments ||
      p.equipmentAssignments ||
      p.permits ||
      p.progress ||
      p.attachments;
    if (hasUpload) {
      const { syncPmProjectOffline } = await import("../pm-project");
      const result = await syncPmProjectOffline(projectId, p as Record<string, unknown>);
      return { ok: true, ...result };
    }
    const bundle = await syncPmProjectManagementOffline(projectId);
    return { ok: true, serverState: bundle };
  },

  "pmSafetyStations.sync": async (p) => {
    const stationId = Number(p.stationId);
    if (p.events && typeof p.events === "object") {
      const result = await applyStationOfflineSync(stationId, p.events as Record<string, unknown>);
      return { ok: true, serverState: result };
    }
    const bundle = await syncPmSafetyStationsOffline(stationId);
    return { ok: true, serverState: bundle };
  },

  "pmSafetyMeetings.sync": async (p) => {
    const row = await syncSafetyMeetingOffline(p);
    return {
      ok: true,
      serverState: { id: row.id, status: row.status },
    };
  },

  "pmIncidents.sync": async (p) => {
    const row = await syncPmIncidentsOffline(p as never);
    return {
      ok: true,
      serverState: { id: row.id, status: row.status },
    };
  },

  "pmTraining.sync": async (p) => {
    const row = await syncPmTrainingOffline(p as never);
    return {
      ok: true,
      serverState: { id: row.id, status: row.status },
    };
  },

  "pmInspections.sync": async (p) => {
    const row = await syncPmInspectionsOffline(p as never);
    return {
      ok: true,
      serverState: { id: row.id, status: row.status },
    };
  },

  "pmInspectionPhoto.capture": async (p) => {
    const inspectionId = String(p.inspectionId);
    const result = await captureInspectionPhoto(inspectionId, {
      dataUrl: p.dataUrl as string | undefined,
      caption: p.caption as string | undefined,
      clientSyncId: p.clientSyncId as string | undefined,
      mimeType: p.mimeType as string | undefined,
      fileName: p.fileName as string | undefined,
      checklistItemId: p.checklistItemId as string | undefined,
      defaultSubcontractorCompanyId: p.defaultSubcontractorCompanyId as number | undefined,
    });
    return {
      ok: true,
      serverState: {
        findingCount: result.findings?.length ?? 0,
        analysisEngine: result.analysisEngine,
      },
    };
  },

  "sifHeca.sync": async (p) => {
    const row = await syncSifHecaOffline({
      clientSyncId: String(p.clientSyncId),
      companyId: p.companyId as number,
      projectId: p.projectId as number,
      siteId: p.siteId as number | undefined,
      workerId: p.workerId as number | undefined,
      assessmentKind: p.assessmentKind as "SIF" | "HECA" | undefined,
      sourceType: (p.sourceType as string) ?? "general",
      sourceId: p.sourceId as string | undefined,
      title: String(p.title ?? "Field assessment"),
      jobDescription: p.jobDescription as string | undefined,
      workScope: p.workScope as string | undefined,
      locationNote: p.locationNote as string | undefined,
      environmentNote: p.environmentNote as string | undefined,
      equipmentNote: p.equipmentNote as string | undefined,
      hazards: p.hazards as
        | Array<{
            description: string;
            severity?: number;
            likelihood?: number;
            energyTypes?: string[];
          }>
        | undefined,
      controls: p.controls as
        | Array<{
            description?: string;
            controlType?: string;
            adequate?: boolean;
            effectivenessScore?: number;
          }>
        | undefined,
      energyTypes: p.energyTypes as string[] | undefined,
      submit: p.submit === true,
    });
    return {
      ok: true,
      serverState: { id: row.id, status: row.status },
    };
  },

  "jhaFlha.sync": async (p) => {
    const row = await syncJhaFlhaOffline({
      clientSyncId: String(p.clientSyncId),
      kind: (p.kind as "FLHA" | "JHA") ?? "FLHA",
      companyId: p.companyId as number,
      projectId: p.projectId as number,
      siteId: p.siteId as number | undefined,
      taskDescription: String(p.taskDescription ?? "Field work"),
      workScope: p.workScope as string | undefined,
      locationNote: p.locationNote as string | undefined,
      environmentalJson: (p.environmentalJson as Record<string, unknown>) ?? {},
      hazards: p.hazards as
        | Array<{
            description: string;
            category?: string;
            severity?: number;
            likelihood?: number;
            energyTypes?: string[];
          }>
        | undefined,
      controls: p.controls as
        | Array<{
            description: string;
            controlType?: string;
            hazardIndex?: number;
          }>
        | undefined,
      energySources: p.energySources as
        | Array<{ energyType: string; exposureLevel?: number }>
        | undefined,
      equipment: p.equipment as
        | Array<{ equipmentId: number; authorized?: boolean }>
        | undefined,
      workers: p.workers as Array<{ workerId: number; role?: string }> | undefined,
      signatures: p.signatures as
        | Array<{
            role: "WORKER" | "SUPERVISOR" | "AUTHORIZER";
            signatureData: string;
            signerName?: string;
            workerId?: number;
          }>
        | undefined,
      submit: p.submit === true,
    });
    return {
      ok: true,
      serverState: {
        id: row.id,
        status: row.status,
        updatedAt: row.updatedAt,
      },
    };
  },

  "safetyFormV2.submit": async (p) => {
    const row = await syncSafetyFormOffline({
      clientSyncId: String(p.clientSyncId),
      definitionId: String(p.definitionId),
      formData: (p.formData as Record<string, unknown>) ?? {},
      submit: p.submit === true,
      companyId: p.companyId as number | undefined,
      projectId: p.projectId as number | undefined,
      siteId: p.siteId as number | undefined,
      workerId: p.workerId as number | undefined,
      signatures: p.signatures as
        | Array<{ fieldId?: string; signatureData: string }>
        | undefined,
    });
    return {
      ok: true,
      serverState: {
        serverUpdatedAt: row.updatedAt,
        status: row.status,
      },
    };
  },

  "wallet.sync": async (p) => {
    const workerId = Number(p.workerId);
    if (!Number.isFinite(workerId) || workerId <= 0) {
      return { ok: false, error: "wallet.sync requires a valid workerId" };
    }
    const bundle = await apiGet<Record<string, unknown>>(
      `/api/v1/worker-wallet/bundle/${workerId}`,
    );
    return {
      ok: true,
      serverState: {
        bundle,
        syncedAt: bundle.syncedAt ?? new Date().toISOString(),
        workerId,
      },
    };
  },
};

export async function executeSyncAction(item: SyncQueueItem): Promise<SyncHandlerResult> {
  const handler = handlers[item.type];
  if (!handler) {
    return { ok: false, error: `Unknown sync type: ${item.type}` };
  }
  try {
    return await handler(item.payload);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Sync failed",
    };
  }
}
