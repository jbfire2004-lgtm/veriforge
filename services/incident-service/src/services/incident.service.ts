import { IncidentStatus } from '@prisma/client';
import { incidentRepository } from '../models/incident.repository';
import { env } from '../config/env';
import {
  sifHecaScoringEngine,
  SEVERITY_TO_LEVEL,
  defaultLikelihoodForSeverity,
} from '../engines/sif-heca-scoring.engine';
import { safetyGateEngine } from '../engines/safety-gate.engine';
import { offlineSyncEngine } from '../engines/offline-sync.engine';
import { integrationClients } from '../clients/integration.clients';
import { eventPublisher } from '../events/publisher';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import type { WitnessInput, OfflineSyncAction, IncidentEventPayload } from '../types';
import { logger } from '../utils/logger';

function toIncidentDto(
  incident: NonNullable<Awaited<ReturnType<typeof incidentRepository.findById>>>,
) {
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

function eventPayloadFrom(
  incident: NonNullable<Awaited<ReturnType<typeof incidentRepository.findById>>>,
): IncidentEventPayload {
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

export const incidentService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async buildSafetyContext(input: {
    incident: NonNullable<Awaited<ReturnType<typeof incidentRepository.findById>>>;
    token?: string;
    closing?: boolean;
  }) {
    let workerSafetyOk: boolean | undefined;
    if (input.incident.workerId && input.token) {
      const worker = await integrationClients.getWorkerScore({
        workerId: input.incident.workerId,
        companyId: input.incident.companyId,
        token: input.token,
      });
      if (worker) {
        workerSafetyOk = !worker.blocked && (worker.score ?? 100) >= 40;
      }
    }

    let activeEmergency: boolean | undefined;
    if (input.token) {
      const emergency = await integrationClients.hasActiveEmergency({
        projectId: input.incident.projectId,
        companyId: input.incident.companyId,
        token: input.token,
      });
      if (emergency !== null) activeEmergency = emergency;
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

  async report(input: {
    companyId: string;
    projectId: string;
    incidentType: string;
    title: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    location?: string;
    occurredAt: string;
    latitude?: number;
    longitude?: number;
    workerId?: string;
    equipmentId?: string;
    likelihoodLevel?: number;
    witnesses?: WitnessInput[];
    reportedBy: string;
    token?: string;
    autoCreateCapa?: boolean;
  }) {
    const severityLevel = SEVERITY_TO_LEVEL[input.severity] ?? 3;
    const likelihoodLevel = input.likelihoodLevel ?? defaultLikelihoodForSeverity(input.severity);

    const score = sifHecaScoringEngine.score({
      severity: severityLevel,
      likelihood: likelihoodLevel,
      highEnergyCount: input.equipmentId ? 1 : 0,
      openCapaCount: 0,
      priorIncidentCount: 0,
    });

    const incidentNumber = await incidentRepository.nextIncidentNumber(input.companyId);

    const incident = await incidentRepository.create({
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
      await incidentRepository.addWitness({
        incidentId: incident.id,
        name: witness.name,
        contact: witness.contact,
        workerId: witness.workerId,
        statement: witness.statement,
        createdBy: input.reportedBy,
      });
    }

    const reloaded = (await incidentRepository.reload(incident.id, input.companyId))!;
    const gateContext = await this.buildSafetyContext({ incident: reloaded, token: input.token });
    const gate = safetyGateEngine.evaluate(incident.id, gateContext);

    await incidentRepository.update(incident.id, input.companyId, {
      safetyGatePassed: gate.passed,
      safetyGateReason: gate.reason,
      updatedBy: input.reportedBy,
    });

    if (input.workerId && input.token) {
      await integrationClients.recordWorkerExposure({
        companyId: input.companyId,
        workerId: input.workerId,
        severity: severityLevel,
        likelihood: likelihoodLevel,
        token: input.token,
      });
    }

    if (score.sifPotential && input.token) {
      await integrationClients.declareEmergencyForSif({
        companyId: input.companyId,
        projectId: input.projectId,
        incidentId: incident.id,
        description: input.description,
        token: input.token,
      });
    }

    let autoCapaId: string | undefined;
    if ((input.autoCreateCapa || score.requireCapa) && input.token) {
      const capa = await integrationClients.createCorrectiveAction({
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
        await incidentRepository.addCorrectiveActionLink({
          incidentId: incident.id,
          correctiveActionId: capa.id,
          linkedBy: input.reportedBy,
        });
      }
    }

    const final = (await incidentRepository.reload(incident.id, input.companyId))!;
    await eventPublisher.incidentReported(eventPayloadFrom(final));

    logger.info('incident reported', {
      incidentId: incident.id,
      incidentNumber,
      sifPotential: score.sifPotential,
      autoCapaId,
    });

    return toIncidentDto(final);
  },

  async getById(id: string, companyId: string) {
    const incident = await incidentRepository.findById(id, companyId);
    if (!incident) throw new NotFoundError('Incident not found');
    return toIncidentDto(incident);
  },

  async list(input: {
    companyId: string;
    projectId?: string;
    status?: IncidentStatus;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    limit?: number;
    offset?: number;
  }) {
    const rows = await incidentRepository.list(input);
    return rows.map(toIncidentDto);
  },

  async investigate(input: {
    incidentId: string;
    companyId: string;
    investigatedBy: string;
    findings: string;
    rootCause?: string;
    method?: string;
    recommendations?: string;
  }) {
    const incident = await incidentRepository.findById(input.incidentId, input.companyId);
    if (!incident) throw new NotFoundError('Incident not found');
    if (incident.status === IncidentStatus.closed) {
      throw new ConflictError('Cannot investigate a closed incident');
    }

    await incidentRepository.addInvestigation({
      incidentId: input.incidentId,
      investigatedBy: input.investigatedBy,
      findings: input.findings,
      rootCause: input.rootCause,
      method: input.method,
      recommendations: input.recommendations,
      createdBy: input.investigatedBy,
    });

    await incidentRepository.update(input.incidentId, input.companyId, {
      status: IncidentStatus.investigated,
      investigatedBy: input.investigatedBy,
      investigatedAt: new Date(),
      updatedBy: input.investigatedBy,
    });

    const reloaded = (await incidentRepository.reload(input.incidentId, input.companyId))!;
    await eventPublisher.incidentInvestigated(eventPayloadFrom(reloaded));

    logger.info('incident investigated', { incidentId: input.incidentId });
    return toIncidentDto(reloaded);
  },

  async close(input: {
    incidentId: string;
    companyId: string;
    closedBy: string;
    closeNotes?: string;
    token?: string;
  }) {
    const incident = await incidentRepository.findById(input.incidentId, input.companyId);
    if (!incident) throw new NotFoundError('Incident not found');
    if (incident.status === IncidentStatus.closed) {
      throw new ConflictError('Incident already closed');
    }

    const gateContext = await this.buildSafetyContext({
      incident,
      token: input.token,
      closing: true,
    });
    const gate = safetyGateEngine.evaluate(input.incidentId, gateContext);
    if (!gate.passed) {
      throw new BadRequestError(`Safety gate blocked close: ${gate.reason}`);
    }

    await incidentRepository.update(input.incidentId, input.companyId, {
      status: IncidentStatus.closed,
      closedBy: input.closedBy,
      closedAt: new Date(),
      closeNotes: input.closeNotes,
      safetyGatePassed: gate.passed,
      safetyGateReason: gate.reason,
      updatedBy: input.closedBy,
    });

    const reloaded = (await incidentRepository.reload(input.incidentId, input.companyId))!;
    await eventPublisher.incidentClosed(eventPayloadFrom(reloaded));

    logger.info('incident closed', { incidentId: input.incidentId });
    return toIncidentDto(reloaded);
  },

  async linkCorrectiveActions(input: {
    incidentId: string;
    companyId: string;
    linkedBy: string;
    correctiveActionIds: string[];
    token?: string;
    createIfMissing?: {
      title?: string;
      description?: string;
      severity?: string;
    };
  }) {
    const incident = await incidentRepository.findById(input.incidentId, input.companyId);
    if (!incident) throw new NotFoundError('Incident not found');

    const ids = [...input.correctiveActionIds];

    if (ids.length === 0 && input.createIfMissing && input.token) {
      const capa = await integrationClients.createCorrectiveAction({
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
      if (capa.id) ids.push(capa.id);
    }

    for (const correctiveActionId of ids) {
      if (input.token && env.correctiveActionServiceUrl) {
        const remote = await integrationClients.getCorrectiveAction({
          correctiveActionId,
          companyId: input.companyId,
          token: input.token,
        });
        if (!remote) {
          throw new BadRequestError(`Corrective action ${correctiveActionId} not found`);
        }
      }

      try {
        await incidentRepository.addCorrectiveActionLink({
          incidentId: input.incidentId,
          correctiveActionId,
          linkedBy: input.linkedBy,
        });
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code !== 'P2002') throw e;
      }
    }

    const reloaded = (await incidentRepository.reload(input.incidentId, input.companyId))!;
    return toIncidentDto(reloaded);
  },

  async addWitness(input: {
    incidentId: string;
    companyId: string;
    createdBy: string;
    name?: string;
    contact?: string;
    workerId?: string;
    statement?: string;
  }) {
    const incident = await incidentRepository.findById(input.incidentId, input.companyId);
    if (!incident) throw new NotFoundError('Incident not found');

    await incidentRepository.addWitness({
      incidentId: input.incidentId,
      name: input.name,
      contact: input.contact,
      workerId: input.workerId,
      statement: input.statement,
      createdBy: input.createdBy,
    });

    const reloaded = (await incidentRepository.reload(input.incidentId, input.companyId))!;
    return toIncidentDto(reloaded);
  },

  async syncOffline(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    actions: OfflineSyncAction[];
    batchId?: string;
    token: string;
  }) {
    const results = [];
    let synced = 0;
    let failed = 0;

    for (const action of input.actions) {
      const result = await offlineSyncEngine.processAction({
        deviceId: input.deviceId,
        companyId: input.companyId,
        userId: input.userId,
        action,
        token: input.token,
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
