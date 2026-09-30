"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectionService = void 0;
const client_1 = require("@prisma/client");
const inspection_repository_1 = require("../models/inspection.repository");
const scoring_engine_1 = require("../engines/scoring.engine");
const safety_gate_engine_1 = require("../engines/safety-gate.engine");
const offline_sync_engine_1 = require("../engines/offline-sync.engine");
const integration_clients_1 = require("../clients/integration.clients");
const publisher_1 = require("../events/publisher");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
function toInspectionDto(inspection) {
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
function eventPayload(inspection) {
    return {
        inspectionId: inspection.id,
        companyId: inspection.companyId,
        projectId: inspection.projectId,
        status: inspection.status,
        score: inspection.score,
        checklistType: inspection.checklistType,
    };
}
exports.inspectionService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async create(input) {
        const status = input.schedule === true || input.scheduledAt
            ? client_1.InspectionStatus.scheduled
            : client_1.InspectionStatus.draft;
        const inspection = await inspection_repository_1.inspectionRepository.create({
            companyId: input.companyId,
            projectId: input.projectId,
            checklistId: input.checklistId,
            checklistType: input.checklistType,
            title: input.title,
            description: input.description,
            checklistItems: (input.checklistItems ?? []),
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            inspectorId: input.inspectorId ?? input.createdBy,
            location: input.location,
            scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
            status,
            passThreshold: input.passThreshold ?? env_1.env.defaultPassThreshold,
            metadata: (input.metadata ?? {}),
            createdBy: input.createdBy,
        });
        logger_1.logger.info('inspection created', {
            inspectionId: inspection.id,
            checklistType: input.checklistType,
            status,
        });
        await publisher_1.eventPublisher.inspectionCreated(eventPayload(inspection));
        const reloaded = await inspection_repository_1.inspectionRepository.reload(inspection.id, input.companyId);
        return toInspectionDto(reloaded);
    },
    async getById(id, companyId) {
        const inspection = await inspection_repository_1.inspectionRepository.findById(id, companyId);
        if (!inspection)
            throw new errors_1.NotFoundError('Inspection not found');
        return toInspectionDto(inspection);
    },
    async list(filters) {
        const rows = await inspection_repository_1.inspectionRepository.list(filters);
        return rows.map(toInspectionDto);
    },
    async update(input) {
        const inspection = await inspection_repository_1.inspectionRepository.findById(input.id, input.companyId);
        if (!inspection)
            throw new errors_1.NotFoundError('Inspection not found');
        if (['submitted', 'failed', 'passed', 'closed'].includes(inspection.status)) {
            throw new errors_1.ConflictError(`Cannot update inspection in status: ${inspection.status}`);
        }
        await inspection_repository_1.inspectionRepository.update(input.id, input.companyId, {
            title: input.title,
            description: input.description,
            checklistItems: input.checklistItems,
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            inspectorId: input.inspectorId,
            location: input.location,
            scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
            passThreshold: input.passThreshold,
            metadata: input.metadata,
        });
        const reloaded = await inspection_repository_1.inspectionRepository.reload(input.id, input.companyId);
        return toInspectionDto(reloaded);
    },
    async softDelete(id, companyId) {
        const inspection = await inspection_repository_1.inspectionRepository.findById(id, companyId);
        if (!inspection)
            throw new errors_1.NotFoundError('Inspection not found');
        await inspection_repository_1.inspectionRepository.softDelete(id, companyId);
        return { id, deleted: true };
    },
    async submitFindings(input) {
        const inspection = await inspection_repository_1.inspectionRepository.findById(input.id, input.companyId);
        if (!inspection)
            throw new errors_1.NotFoundError('Inspection not found');
        if (['failed', 'passed', 'closed'].includes(inspection.status)) {
            throw new errors_1.ConflictError(`Cannot submit findings for inspection in status: ${inspection.status}`);
        }
        const checklistItems = (0, safety_gate_engine_1.parseChecklistItems)(inspection.checklistItems);
        const scoreResult = scoring_engine_1.scoringEngine.compute(checklistItems, input.findings, inspection.passThreshold ?? undefined);
        const enrichedFindings = [...input.findings];
        if (input.autoCreateCapa !== false) {
            for (const finding of enrichedFindings) {
                if (finding.findingType !== 'fail')
                    continue;
                if (finding.correctiveActionId)
                    continue;
                const capa = await integration_clients_1.integrationClients.createCorrectiveAction({
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
                if (capa.id)
                    finding.correctiveActionId = capa.id;
            }
        }
        await inspection_repository_1.inspectionRepository.replaceFindings(input.id, enrichedFindings.map((f) => ({
            itemKey: f.itemKey,
            findingType: f.findingType,
            severity: f.severity,
            description: f.description,
            photoUrl: f.photoUrl,
            hazardId: f.hazardId,
            controlId: f.controlId,
            correctiveActionId: f.correctiveActionId,
            metadata: (f.metadata ?? {}),
        })));
        const now = new Date();
        await inspection_repository_1.inspectionRepository.update(input.id, input.companyId, {
            status: client_1.InspectionStatus.submitted,
            score: scoreResult.score,
            maxScore: scoreResult.maxScore,
            submittedAt: now,
            startedAt: inspection.startedAt ?? now,
        });
        logger_1.logger.info('inspection findings submitted', {
            inspectionId: input.id,
            score: scoreResult.score,
            findingCount: input.findings.length,
        });
        const reloaded = await inspection_repository_1.inspectionRepository.reload(input.id, input.companyId);
        await publisher_1.eventPublisher.inspectionSubmitted(eventPayload(reloaded));
        return toInspectionDto(reloaded);
    },
    async complete(input) {
        const inspection = await inspection_repository_1.inspectionRepository.findById(input.id, input.companyId);
        if (!inspection)
            throw new errors_1.NotFoundError('Inspection not found');
        if (inspection.status !== client_1.InspectionStatus.submitted) {
            throw new errors_1.BadRequestError('Inspection must be submitted before completion');
        }
        const gate = await this.safetyGateCheck({
            id: input.id,
            companyId: input.companyId,
            token: input.token,
        });
        if (!gate.passed) {
            throw new errors_1.BadRequestError(`Safety gate failed: ${gate.reason}`);
        }
        const checklistItems = (0, safety_gate_engine_1.parseChecklistItems)(inspection.checklistItems);
        const findings = inspection.findings.map((f) => ({
            itemKey: f.itemKey,
            findingType: f.findingType,
            severity: f.severity ?? undefined,
        }));
        const scoreResult = scoring_engine_1.scoringEngine.compute(checklistItems, findings, inspection.passThreshold ?? undefined);
        const finalStatus = scoreResult.passed
            ? client_1.InspectionStatus.passed
            : client_1.InspectionStatus.failed;
        await inspection_repository_1.inspectionRepository.update(input.id, input.companyId, {
            status: finalStatus,
            score: scoreResult.score,
            maxScore: scoreResult.maxScore,
            completedAt: new Date(),
            safetyGatePassed: gate.passed,
            safetyGateReason: gate.reason,
        });
        logger_1.logger.info('inspection completed', {
            inspectionId: input.id,
            status: finalStatus,
            score: scoreResult.score,
        });
        const reloaded = await inspection_repository_1.inspectionRepository.reload(input.id, input.companyId);
        if (finalStatus === client_1.InspectionStatus.failed) {
            await publisher_1.eventPublisher.inspectionFailed(eventPayload(reloaded));
        }
        return toInspectionDto(reloaded);
    },
    async safetyGateCheck(input) {
        const inspection = await inspection_repository_1.inspectionRepository.findById(input.id, input.companyId);
        if (!inspection)
            throw new errors_1.NotFoundError('Inspection not found');
        const checklistItems = (0, safety_gate_engine_1.parseChecklistItems)(inspection.checklistItems);
        const findings = inspection.findings.map((f) => ({
            itemKey: f.itemKey,
            findingType: f.findingType,
        }));
        const requiredKeys = new Set(checklistItems.filter((item) => item.required !== false).map((item) => item.key));
        const answeredKeys = new Set(findings.map((f) => f.itemKey));
        const checklistComplete = requiredKeys.size === 0 || [...requiredKeys].every((key) => answeredKeys.has(key));
        let equipmentSafe;
        if (inspection.equipmentId) {
            const equipment = await integration_clients_1.integrationClients.getEquipmentSafety({
                equipmentId: inspection.equipmentId,
                companyId: input.companyId,
                token: input.token,
            });
            equipmentSafe = equipment?.safe ?? undefined;
        }
        let hazardControlsActive;
        const hazardIds = inspection.findings.map((f) => f.hazardId).filter(Boolean);
        const controlIds = inspection.findings.map((f) => f.controlId).filter(Boolean);
        if (hazardIds.length > 0 || controlIds.length > 0) {
            let active = true;
            for (const hazardId of hazardIds) {
                const hazard = await integration_clients_1.integrationClients.getHazard({
                    hazardId,
                    companyId: input.companyId,
                    token: input.token,
                });
                if (hazard && hazard.active === false)
                    active = false;
            }
            for (const controlId of controlIds) {
                const control = await integration_clients_1.integrationClients.getControl({
                    controlId,
                    companyId: input.companyId,
                    token: input.token,
                });
                if (control && control.effective === false)
                    active = false;
            }
            hazardControlsActive = active;
        }
        const openCriticalFindings = scoring_engine_1.scoringEngine.countCriticalFailures(checklistItems, findings);
        const result = safety_gate_engine_1.safetyGateEngine.evaluate(inspection.id, checklistItems, {
            equipmentSafe,
            hazardControlsActive,
            checklistComplete,
            openCriticalFindings,
            token: input.token,
        });
        await inspection_repository_1.inspectionRepository.update(input.id, input.companyId, {
            safetyGatePassed: result.passed,
            safetyGateReason: result.reason,
        });
        return {
            inspectionId: inspection.id,
            ...result,
        };
    },
    async syncOffline(input) {
        const results = [];
        let synced = 0;
        let failed = 0;
        for (const action of input.actions) {
            const result = await offline_sync_engine_1.offlineSyncEngine.processAction({
                deviceId: input.deviceId,
                companyId: input.companyId,
                userId: input.userId,
                token: input.token,
                action,
            });
            results.push(result);
            if (result.ok)
                synced++;
            else
                failed++;
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
