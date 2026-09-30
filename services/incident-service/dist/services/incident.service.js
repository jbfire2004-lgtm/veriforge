"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentService = void 0;
const client_1 = require("@prisma/client");
const incident_repository_1 = require("../models/incident.repository");
const env_1 = require("../config/env");
const sif_heca_scoring_engine_1 = require("../engines/sif-heca-scoring.engine");
const safety_gate_engine_1 = require("../engines/safety-gate.engine");
const offline_sync_engine_1 = require("../engines/offline-sync.engine");
const integration_clients_1 = require("../clients/integration.clients");
const publisher_1 = require("../events/publisher");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function toIncidentDto(incident) {
    return {
        id: incident.id,
        companyId: incident.companyId,
        projectId: incident.projectId,
        incidentNumber: incident.incidentNumber,
        incidentType: incident.incidentType,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        occurredAt: incident.occurredAt.toISOString(),
        latitude: incident.latitude,
        longitude: incident.longitude,
        workerId: incident.workerId,
        equipmentId: incident.equipmentId,
        severityLevel: incident.severityLevel,
        likelihoodLevel: incident.likelihoodLevel,
        riskScore: incident.riskScore,
        sifScore: incident.sifScore,
        sifPotential: incident.sifPotential,
        hecaCategory: incident.hecaCategory,
        safetyGatePassed: incident.safetyGatePassed,
        safetyGateReason: incident.safetyGateReason,
        reportedBy: incident.reportedBy,
        investigatedBy: incident.investigatedBy,
        closedBy: incident.closedBy,
        investigatedAt: incident.investigatedAt?.toISOString() ?? null,
        closedAt: incident.closedAt?.toISOString() ?? null,
        closeNotes: incident.closeNotes,
        metadata: incident.metadata,
        witnesses: incident.witnesses.map((w) => ({
            id: w.id,
            name: w.name,
            contact: w.contact,
            workerId: w.workerId,
            statement: w.statement,
            interviewedAt: w.interviewedAt?.toISOString() ?? null,
            interviewedBy: w.interviewedBy,
            createdAt: w.createdAt.toISOString(),
        })),
        investigations: incident.investigations.map((i) => ({
            id: i.id,
            investigatedBy: i.investigatedBy,
            findings: i.findings,
            rootCause: i.rootCause,
            method: i.method,
            recommendations: i.recommendations,
            metadata: i.metadata,
            createdAt: i.createdAt.toISOString(),
        })),
        correctiveActionLinks: incident.correctiveActionLinks.map((l) => ({
            id: l.id,
            correctiveActionId: l.correctiveActionId,
            linkedBy: l.linkedBy,
            createdAt: l.createdAt.toISOString(),
        })),
        createdBy: incident.createdBy,
        updatedBy: incident.updatedBy,
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
    };
}
function eventPayloadFrom(incident) {
    return {
        incidentId: incident.id,
        companyId: incident.companyId,
        projectId: incident.projectId,
        incidentNumber: incident.incidentNumber,
        severity: incident.severity,
        status: incident.status,
        sifPotential: incident.sifPotential,
        hecaCategory: incident.hecaCategory,
        reportedBy: incident.reportedBy,
        investigatedBy: incident.investigatedBy ?? undefined,
        closedBy: incident.closedBy ?? undefined,
    };
}
exports.incidentService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async buildSafetyContext(input) {
        let workerSafetyOk;
        if (input.incident.workerId && input.token) {
            const worker = await integration_clients_1.integrationClients.getWorkerScore({
                workerId: input.incident.workerId,
                companyId: input.incident.companyId,
                token: input.token,
            });
            if (worker) {
                workerSafetyOk = !worker.blocked && (worker.score ?? 100) >= 40;
            }
        }
        let activeEmergency;
        if (input.token) {
            const emergency = await integration_clients_1.integrationClients.hasActiveEmergency({
                projectId: input.incident.projectId,
                companyId: input.incident.companyId,
                token: input.token,
            });
            if (emergency !== null)
                activeEmergency = emergency;
        }
        return {
            workerSafetyOk,
            activeEmergency,
            sifPotential: input.incident.sifPotential,
            witnessCount: input.incident.witnesses.length,
            severity: input.incident.severity,
            investigationComplete: input.incident.investigations.length > 0,
            correctiveActionsLinked: input.incident.correctiveActionLinks.length,
            closing: input.closing,
        };
    },
    async report(input) {
        const severityLevel = sif_heca_scoring_engine_1.SEVERITY_TO_LEVEL[input.severity] ?? 3;
        const likelihoodLevel = input.likelihoodLevel ?? (0, sif_heca_scoring_engine_1.defaultLikelihoodForSeverity)(input.severity);
        const score = sif_heca_scoring_engine_1.sifHecaScoringEngine.score({
            severity: severityLevel,
            likelihood: likelihoodLevel,
            highEnergyCount: input.equipmentId ? 1 : 0,
            openCapaCount: 0,
            priorIncidentCount: 0,
        });
        const incidentNumber = await incident_repository_1.incidentRepository.nextIncidentNumber(input.companyId);
        const incident = await incident_repository_1.incidentRepository.create({
            companyId: input.companyId,
            projectId: input.projectId,
            incidentNumber,
            incidentType: input.incidentType,
            title: input.title,
            description: input.description,
            severity: input.severity,
            location: input.location,
            occurredAt: new Date(input.occurredAt),
            latitude: input.latitude,
            longitude: input.longitude,
            workerId: input.workerId,
            equipmentId: input.equipmentId,
            severityLevel,
            likelihoodLevel,
            riskScore: score.riskScore,
            sifScore: score.sifScore,
            sifPotential: score.sifPotential,
            hecaCategory: score.hecaCategory,
            reportedBy: input.reportedBy,
            createdBy: input.reportedBy,
        });
        for (const witness of input.witnesses ?? []) {
            await incident_repository_1.incidentRepository.addWitness({
                incidentId: incident.id,
                name: witness.name,
                contact: witness.contact,
                workerId: witness.workerId,
                statement: witness.statement,
                createdBy: input.reportedBy,
            });
        }
        const reloaded = (await incident_repository_1.incidentRepository.reload(incident.id, input.companyId));
        const gateContext = await this.buildSafetyContext({ incident: reloaded, token: input.token });
        const gate = safety_gate_engine_1.safetyGateEngine.evaluate(incident.id, gateContext);
        await incident_repository_1.incidentRepository.update(incident.id, input.companyId, {
            safetyGatePassed: gate.passed,
            safetyGateReason: gate.reason,
            updatedBy: input.reportedBy,
        });
        if (input.workerId && input.token) {
            await integration_clients_1.integrationClients.recordWorkerExposure({
                companyId: input.companyId,
                workerId: input.workerId,
                severity: severityLevel,
                likelihood: likelihoodLevel,
                token: input.token,
            });
        }
        if (score.sifPotential && input.token) {
            await integration_clients_1.integrationClients.declareEmergencyForSif({
                companyId: input.companyId,
                projectId: input.projectId,
                incidentId: incident.id,
                description: input.description,
                token: input.token,
            });
        }
        let autoCapaId;
        if ((input.autoCreateCapa || score.requireCapa) && input.token) {
            const capa = await integration_clients_1.integrationClients.createCorrectiveAction({
                companyId: input.companyId,
                projectId: input.projectId,
                sourceId: incident.id,
                title: `CAPA: ${input.title}`,
                description: input.description,
                severity: input.severity === 'critical' ? 'critical' : 'high',
                workerId: input.workerId,
                equipmentId: input.equipmentId,
                sifLinked: score.sifPotential,
                hecaLinked: !!score.hecaCategory,
                token: input.token,
            });
            if (capa.id) {
                autoCapaId = capa.id;
                await incident_repository_1.incidentRepository.addCorrectiveActionLink({
                    incidentId: incident.id,
                    correctiveActionId: capa.id,
                    linkedBy: input.reportedBy,
                });
            }
        }
        const final = (await incident_repository_1.incidentRepository.reload(incident.id, input.companyId));
        await publisher_1.eventPublisher.incidentReported(eventPayloadFrom(final));
        logger_1.logger.info('incident reported', {
            incidentId: incident.id,
            incidentNumber,
            sifPotential: score.sifPotential,
            autoCapaId,
        });
        return toIncidentDto(final);
    },
    async getById(id, companyId) {
        const incident = await incident_repository_1.incidentRepository.findById(id, companyId);
        if (!incident)
            throw new errors_1.NotFoundError('Incident not found');
        return toIncidentDto(incident);
    },
    async list(input) {
        const rows = await incident_repository_1.incidentRepository.list(input);
        return rows.map(toIncidentDto);
    },
    async investigate(input) {
        const incident = await incident_repository_1.incidentRepository.findById(input.incidentId, input.companyId);
        if (!incident)
            throw new errors_1.NotFoundError('Incident not found');
        if (incident.status === client_1.IncidentStatus.closed) {
            throw new errors_1.ConflictError('Cannot investigate a closed incident');
        }
        await incident_repository_1.incidentRepository.addInvestigation({
            incidentId: input.incidentId,
            investigatedBy: input.investigatedBy,
            findings: input.findings,
            rootCause: input.rootCause,
            method: input.method,
            recommendations: input.recommendations,
            createdBy: input.investigatedBy,
        });
        await incident_repository_1.incidentRepository.update(input.incidentId, input.companyId, {
            status: client_1.IncidentStatus.investigated,
            investigatedBy: input.investigatedBy,
            investigatedAt: new Date(),
            updatedBy: input.investigatedBy,
        });
        const reloaded = (await incident_repository_1.incidentRepository.reload(input.incidentId, input.companyId));
        await publisher_1.eventPublisher.incidentInvestigated(eventPayloadFrom(reloaded));
        logger_1.logger.info('incident investigated', { incidentId: input.incidentId });
        return toIncidentDto(reloaded);
    },
    async close(input) {
        const incident = await incident_repository_1.incidentRepository.findById(input.incidentId, input.companyId);
        if (!incident)
            throw new errors_1.NotFoundError('Incident not found');
        if (incident.status === client_1.IncidentStatus.closed) {
            throw new errors_1.ConflictError('Incident already closed');
        }
        const gateContext = await this.buildSafetyContext({
            incident,
            token: input.token,
            closing: true,
        });
        const gate = safety_gate_engine_1.safetyGateEngine.evaluate(input.incidentId, gateContext);
        if (!gate.passed) {
            throw new errors_1.BadRequestError(`Safety gate blocked close: ${gate.reason}`);
        }
        await incident_repository_1.incidentRepository.update(input.incidentId, input.companyId, {
            status: client_1.IncidentStatus.closed,
            closedBy: input.closedBy,
            closedAt: new Date(),
            closeNotes: input.closeNotes,
            safetyGatePassed: gate.passed,
            safetyGateReason: gate.reason,
            updatedBy: input.closedBy,
        });
        const reloaded = (await incident_repository_1.incidentRepository.reload(input.incidentId, input.companyId));
        await publisher_1.eventPublisher.incidentClosed(eventPayloadFrom(reloaded));
        logger_1.logger.info('incident closed', { incidentId: input.incidentId });
        return toIncidentDto(reloaded);
    },
    async linkCorrectiveActions(input) {
        const incident = await incident_repository_1.incidentRepository.findById(input.incidentId, input.companyId);
        if (!incident)
            throw new errors_1.NotFoundError('Incident not found');
        const ids = [...input.correctiveActionIds];
        if (ids.length === 0 && input.createIfMissing && input.token) {
            const capa = await integration_clients_1.integrationClients.createCorrectiveAction({
                companyId: input.companyId,
                projectId: incident.projectId,
                sourceId: incident.id,
                title: input.createIfMissing.title ?? `CAPA: ${incident.title}`,
                description: input.createIfMissing.description ?? incident.description ?? undefined,
                severity: input.createIfMissing.severity ?? incident.severity,
                workerId: incident.workerId ?? undefined,
                equipmentId: incident.equipmentId ?? undefined,
                sifLinked: incident.sifPotential,
                hecaLinked: !!incident.hecaCategory,
                token: input.token,
            });
            if (capa.id)
                ids.push(capa.id);
        }
        for (const correctiveActionId of ids) {
            if (input.token && env_1.env.correctiveActionServiceUrl) {
                const remote = await integration_clients_1.integrationClients.getCorrectiveAction({
                    correctiveActionId,
                    companyId: input.companyId,
                    token: input.token,
                });
                if (!remote) {
                    throw new errors_1.BadRequestError(`Corrective action ${correctiveActionId} not found`);
                }
            }
            try {
                await incident_repository_1.incidentRepository.addCorrectiveActionLink({
                    incidentId: input.incidentId,
                    correctiveActionId,
                    linkedBy: input.linkedBy,
                });
            }
            catch (e) {
                if (e && typeof e === 'object' && 'code' in e && e.code !== 'P2002')
                    throw e;
            }
        }
        const reloaded = (await incident_repository_1.incidentRepository.reload(input.incidentId, input.companyId));
        return toIncidentDto(reloaded);
    },
    async addWitness(input) {
        const incident = await incident_repository_1.incidentRepository.findById(input.incidentId, input.companyId);
        if (!incident)
            throw new errors_1.NotFoundError('Incident not found');
        await incident_repository_1.incidentRepository.addWitness({
            incidentId: input.incidentId,
            name: input.name,
            contact: input.contact,
            workerId: input.workerId,
            statement: input.statement,
            createdBy: input.createdBy,
        });
        const reloaded = (await incident_repository_1.incidentRepository.reload(input.incidentId, input.companyId));
        return toIncidentDto(reloaded);
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
                action,
                token: input.token,
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
