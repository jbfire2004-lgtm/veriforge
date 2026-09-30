import { InspectionStatus } from '@prisma/client';
import { inspectionRepository } from '../models/inspection.repository';
import { scoringEngine } from '../engines/scoring.engine';
import { safetyGateEngine, parseChecklistItems } from '../engines/safety-gate.engine';
import { offlineSyncEngine } from '../engines/offline-sync.engine';
import { integrationClients } from '../clients/integration.clients';
import { eventPublisher } from '../events/publisher';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import type {
  ChecklistItem,
  InspectionFindingInput,
  OfflineSyncAction,
  InspectionStatus as InspectionStatusType,
} from '../types';
import { logger } from '../utils/logger';
import { env } from '../config/env';

function toInspectionDto(
  inspection: NonNullable<Awaited<ReturnType<typeof inspectionRepository.findById>>>,
) {
  return {
    id: inspection.id,
    companyId: inspection.companyId,
    projectId: inspection.projectId,
    checklistId: inspection.checklistId,
    checklistType: inspection.checklistType,
    title: inspection.title,
    description: inspection.description,
    checklistItems: inspection.checklistItems,
    equipmentId: inspection.equipmentId,
    workerId: inspection.workerId,
    inspectorId: inspection.inspectorId,
    location: inspection.location,
    scheduledAt: inspection.scheduledAt?.toISOString() ?? null,
    startedAt: inspection.startedAt?.toISOString() ?? null,
    submittedAt: inspection.submittedAt?.toISOString() ?? null,
    completedAt: inspection.completedAt?.toISOString() ?? null,
    status: inspection.status,
    score: inspection.score,
    maxScore: inspection.maxScore,
    passThreshold: inspection.passThreshold,
    safetyGatePassed: inspection.safetyGatePassed,
    safetyGateReason: inspection.safetyGateReason,
    metadata: inspection.metadata,
    findings: inspection.findings.map((f) => ({
      id: f.id,
      itemKey: f.itemKey,
      findingType: f.findingType,
      severity: f.severity,
      description: f.description,
      photoUrl: f.photoUrl,
      hazardId: f.hazardId,
      controlId: f.controlId,
      correctiveActionId: f.correctiveActionId,
      metadata: f.metadata,
      createdAt: f.createdAt.toISOString(),
    })),
    createdBy: inspection.createdBy,
    createdAt: inspection.createdAt.toISOString(),
    updatedAt: inspection.updatedAt.toISOString(),
    deletedAt: inspection.deletedAt?.toISOString() ?? null,
  };
}

function eventPayload(
  inspection: NonNullable<Awaited<ReturnType<typeof inspectionRepository.findById>>>,
) {
  return {
    inspectionId: inspection.id,
    companyId: inspection.companyId,
    projectId: inspection.projectId,
    status: inspection.status as InspectionStatusType,
    score: inspection.score,
    checklistType: inspection.checklistType,
  };
}

export const inspectionService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async create(input: {
    companyId: string;
    projectId: string;
    checklistType: string;
    title: string;
    description?: string;
    checklistId?: string;
    checklistItems?: ChecklistItem[];
    equipmentId?: string;
    workerId?: string;
    inspectorId?: string;
    location?: string;
    scheduledAt?: string;
    passThreshold?: number;
    metadata?: Record<string, unknown>;
    createdBy: string;
    schedule?: boolean;
  }) {
    const status =
      input.schedule === true || input.scheduledAt
        ? InspectionStatus.scheduled
        : InspectionStatus.draft;

    const inspection = await inspectionRepository.create({
      companyId: input.companyId,
      projectId: input.projectId,
      checklistId: input.checklistId,
      checklistType: input.checklistType,
      title: input.title,
      description: input.description,
      checklistItems: (input.checklistItems ?? []) as unknown as import('@prisma/client').Prisma.InputJsonValue,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      inspectorId: input.inspectorId ?? input.createdBy,
      location: input.location,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      status,
      passThreshold: input.passThreshold ?? env.defaultPassThreshold,
      metadata: (input.metadata ?? {}) as import('@prisma/client').Prisma.InputJsonValue,
      createdBy: input.createdBy,
    });

    logger.info('inspection created', {
      inspectionId: inspection.id,
      checklistType: input.checklistType,
      status,
    });

    await eventPublisher.inspectionCreated(eventPayload(inspection));

    const reloaded = await inspectionRepository.reload(inspection.id, input.companyId);
    return toInspectionDto(reloaded!);
  },

  async getById(id: string, companyId: string) {
    const inspection = await inspectionRepository.findById(id, companyId);
    if (!inspection) throw new NotFoundError('Inspection not found');
    return toInspectionDto(inspection);
  },

  async list(filters: {
    companyId: string;
    projectId?: string;
    workerId?: string;
    equipmentId?: string;
    status?: InspectionStatus;
  }) {
    const rows = await inspectionRepository.list(filters);
    return rows.map(toInspectionDto);
  },

  async update(input: {
    id: string;
    companyId: string;
    title?: string;
    description?: string;
    checklistItems?: ChecklistItem[];
    equipmentId?: string;
    workerId?: string;
    inspectorId?: string;
    location?: string;
    scheduledAt?: string;
    passThreshold?: number;
    metadata?: Record<string, unknown>;
  }) {
    const inspection = await inspectionRepository.findById(input.id, input.companyId);
    if (!inspection) throw new NotFoundError('Inspection not found');

    if (['submitted', 'failed', 'passed', 'closed'].includes(inspection.status)) {
      throw new ConflictError(`Cannot update inspection in status: ${inspection.status}`);
    }

    await inspectionRepository.update(input.id, input.companyId, {
      title: input.title,
      description: input.description,
      checklistItems: input.checklistItems as unknown as import('@prisma/client').Prisma.InputJsonValue,
      equipmentId: input.equipmentId,
      workerId: input.workerId,
      inspectorId: input.inspectorId,
      location: input.location,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      passThreshold: input.passThreshold,
      metadata: input.metadata as import('@prisma/client').Prisma.InputJsonValue,
    });

    const reloaded = await inspectionRepository.reload(input.id, input.companyId);
    return toInspectionDto(reloaded!);
  },

  async softDelete(id: string, companyId: string) {
    const inspection = await inspectionRepository.findById(id, companyId);
    if (!inspection) throw new NotFoundError('Inspection not found');

    await inspectionRepository.softDelete(id, companyId);
    return { id, deleted: true };
  },

  async submitFindings(input: {
    id: string;
    companyId: string;
    userId: string;
    token: string;
    findings: InspectionFindingInput[];
    autoCreateCapa?: boolean;
  }) {
    const inspection = await inspectionRepository.findById(input.id, input.companyId);
    if (!inspection) throw new NotFoundError('Inspection not found');

    if (['failed', 'passed', 'closed'].includes(inspection.status)) {
      throw new ConflictError(`Cannot submit findings for inspection in status: ${inspection.status}`);
    }

    const checklistItems = parseChecklistItems(inspection.checklistItems);
    const scoreResult = scoringEngine.compute(
      checklistItems,
      input.findings,
      inspection.passThreshold ?? undefined,
    );

    const enrichedFindings = [...input.findings];

    if (input.autoCreateCapa !== false) {
      for (const finding of enrichedFindings) {
        if (finding.findingType !== 'fail') continue;
        if (finding.correctiveActionId) continue;

        const capa = await integrationClients.createCorrectiveAction({
          companyId: input.companyId,
          projectId: inspection.projectId,
          sourceId: inspection.id,
          title: `Inspection finding: ${finding.itemKey}`,
          description: finding.description,
          severity: finding.severity ?? 'medium',
          hazardId: finding.hazardId,
          controlId: finding.controlId,
          equipmentId: inspection.equipmentId ?? undefined,
          workerId: inspection.workerId ?? undefined,
          token: input.token,
        });

        if (capa.id) finding.correctiveActionId = capa.id;
      }
    }

    await inspectionRepository.replaceFindings(
      input.id,
      enrichedFindings.map((f) => ({
        itemKey: f.itemKey,
        findingType: f.findingType,
        severity: f.severity,
        description: f.description,
        photoUrl: f.photoUrl,
        hazardId: f.hazardId,
        controlId: f.controlId,
        correctiveActionId: f.correctiveActionId,
        metadata: (f.metadata ?? {}) as import('@prisma/client').Prisma.InputJsonValue,
      })),
    );

    const now = new Date();
    await inspectionRepository.update(input.id, input.companyId, {
      status: InspectionStatus.submitted,
      score: scoreResult.score,
      maxScore: scoreResult.maxScore,
      submittedAt: now,
      startedAt: inspection.startedAt ?? now,
    });

    logger.info('inspection findings submitted', {
      inspectionId: input.id,
      score: scoreResult.score,
      findingCount: input.findings.length,
    });

    const reloaded = await inspectionRepository.reload(input.id, input.companyId);

    await eventPublisher.inspectionSubmitted(eventPayload(reloaded!));

    return toInspectionDto(reloaded!);
  },

  async complete(input: {
    id: string;
    companyId: string;
    userId: string;
    token: string;
  }) {
    const inspection = await inspectionRepository.findById(input.id, input.companyId);
    if (!inspection) throw new NotFoundError('Inspection not found');

    if (inspection.status !== InspectionStatus.submitted) {
      throw new BadRequestError('Inspection must be submitted before completion');
    }

    const gate = await this.safetyGateCheck({
      id: input.id,
      companyId: input.companyId,
      token: input.token,
    });

    if (!gate.passed) {
      throw new BadRequestError(`Safety gate failed: ${gate.reason}`);
    }

    const checklistItems = parseChecklistItems(inspection.checklistItems);
    const findings: InspectionFindingInput[] = inspection.findings.map((f) => ({
      itemKey: f.itemKey,
      findingType: f.findingType as InspectionFindingInput['findingType'],
      severity: f.severity ?? undefined,
    }));

    const scoreResult = scoringEngine.compute(
      checklistItems,
      findings,
      inspection.passThreshold ?? undefined,
    );

    const finalStatus = scoreResult.passed
      ? InspectionStatus.passed
      : InspectionStatus.failed;

    await inspectionRepository.update(input.id, input.companyId, {
      status: finalStatus,
      score: scoreResult.score,
      maxScore: scoreResult.maxScore,
      completedAt: new Date(),
      safetyGatePassed: gate.passed,
      safetyGateReason: gate.reason,
    });

    logger.info('inspection completed', {
      inspectionId: input.id,
      status: finalStatus,
      score: scoreResult.score,
    });

    const reloaded = await inspectionRepository.reload(input.id, input.companyId);

    if (finalStatus === InspectionStatus.failed) {
      await eventPublisher.inspectionFailed(eventPayload(reloaded!));
    }

    return toInspectionDto(reloaded!);
  },

  async safetyGateCheck(input: { id: string; companyId: string; token: string }) {
    const inspection = await inspectionRepository.findById(input.id, input.companyId);
    if (!inspection) throw new NotFoundError('Inspection not found');

    const checklistItems = parseChecklistItems(inspection.checklistItems);
    const findings: InspectionFindingInput[] = inspection.findings.map((f) => ({
      itemKey: f.itemKey,
      findingType: f.findingType as InspectionFindingInput['findingType'],
    }));

    const requiredKeys = new Set(
      checklistItems.filter((item) => item.required !== false).map((item) => item.key),
    );
    const answeredKeys = new Set(findings.map((f) => f.itemKey));
    const checklistComplete =
      requiredKeys.size === 0 || [...requiredKeys].every((key) => answeredKeys.has(key));

    let equipmentSafe: boolean | undefined;
    if (inspection.equipmentId) {
      const equipment = await integrationClients.getEquipmentSafety({
        equipmentId: inspection.equipmentId,
        companyId: input.companyId,
        token: input.token,
      });
      equipmentSafe = equipment?.safe ?? undefined;
    }

    let hazardControlsActive: boolean | undefined;
    const hazardIds = inspection.findings.map((f) => f.hazardId).filter(Boolean) as string[];
    const controlIds = inspection.findings.map((f) => f.controlId).filter(Boolean) as string[];

    if (hazardIds.length > 0 || controlIds.length > 0) {
      let active = true;
      for (const hazardId of hazardIds) {
        const hazard = await integrationClients.getHazard({
          hazardId,
          companyId: input.companyId,
          token: input.token,
        });
        if (hazard && hazard.active === false) active = false;
      }
      for (const controlId of controlIds) {
        const control = await integrationClients.getControl({
          controlId,
          companyId: input.companyId,
          token: input.token,
        });
        if (control && control.effective === false) active = false;
      }
      hazardControlsActive = active;
    }

    const openCriticalFindings = scoringEngine.countCriticalFailures(checklistItems, findings);

    const result = safetyGateEngine.evaluate(inspection.id, checklistItems, {
      equipmentSafe,
      hazardControlsActive,
      checklistComplete,
      openCriticalFindings,
      token: input.token,
    });

    await inspectionRepository.update(input.id, input.companyId, {
      safetyGatePassed: result.passed,
      safetyGateReason: result.reason,
    });

    return {
      inspectionId: inspection.id,
      ...result,
    };
  },

  async syncOffline(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    token: string;
    actions: OfflineSyncAction[];
    batchId?: string;
  }) {
    const results = [];
    let synced = 0;
    let failed = 0;

    for (const action of input.actions) {
      const result = await offlineSyncEngine.processAction({
        deviceId: input.deviceId,
        companyId: input.companyId,
        userId: input.userId,
        token: input.token,
        action,
      });
      results.push(result);
      if (result.ok) synced++;
      else failed++;
    }

    return {
      deviceId: input.deviceId,
      batchId: input.batchId,
      synced,
      failed,
      results,
      canCompleteSync: failed === 0,
    };
  },
};
