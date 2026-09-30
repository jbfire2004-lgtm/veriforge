import {
  AccessLogResult,
  EmergencyModeType,
  StationStatus,
} from '@prisma/client';
import { safetyClients } from '../clients/safety.clients';
import {
  heartbeatEngine,
  workerValidationEngine,
  equipmentValidationEngine,
  safetyGatingEngine,
} from '../engines/station.engine';
import { stationRepository } from '../models/station.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type {
  StationValidationResult,
  WorkerValidationContext,
  EquipmentValidationContext,
  OfflineSyncAction,
  OfflineSyncResult,
} from '../types';
import { offlineSyncEngine } from '../engines/offline-sync.engine';
import { logger } from '../utils/logger';

function mapStation(s: Awaited<ReturnType<typeof stationRepository.findStation>>) {
  if (!s) return null;
  const stale = heartbeatEngine.isStale(s.lastHeartbeat);
  return {
    id: s.id,
    companyId: s.companyId,
    projectId: s.projectId,
    stationType: s.stationType,
    hardwareId: s.hardwareId,
    firmwareVersion: s.firmwareVersion,
    location: s.location,
    zoneId: s.zoneId,
    status: stale && s.status === StationStatus.online ? StationStatus.offline : s.status,
    emergencyMode: s.emergencyMode,
    lastHeartbeat: s.lastHeartbeat?.toISOString() ?? null,
    heartbeatStale: stale,
  };
}

async function requireStation(stationId: string, companyId: string) {
  const station = await stationRepository.findStation(stationId, companyId);
  if (!station) throw new NotFoundError('Station not found');
  return station;
}

export const stationService = {
  async register(input: {
    companyId: string;
    projectId?: string;
    stationType: string;
    hardwareId: string;
    firmwareVersion?: string;
    location?: string;
    zoneId?: string;
  }) {
    const station = await stationRepository.upsertStation(input);
    logger.info('station registered', { stationId: station.id, hardwareId: input.hardwareId });
    return mapStation(station);
  },

  async heartbeat(input: {
    companyId: string;
    stationId: string;
    firmwareVersion?: string;
    recordedAt?: string;
  }) {
    const station = await requireStation(input.stationId, input.companyId);
    const heartbeatAt = input.recordedAt ? new Date(input.recordedAt) : new Date();

    const status = heartbeatEngine.resolveStatus(
      heartbeatAt,
      station.status,
      Boolean(station.emergencyMode && station.emergencyMode !== EmergencyModeType.all_clear),
    );

    await stationRepository.updateHeartbeat(input.stationId, input.companyId, {
      firmwareVersion: input.firmwareVersion,
      status,
      lastHeartbeat: heartbeatAt,
    });

    const updated = await stationRepository.findStation(input.stationId, input.companyId);
    return mapStation(updated);
  },

  async validateWorker(
    input: {
      companyId: string;
      stationId: string;
      workerId: string;
      requiredJhaIds?: string[];
      workerContext?: WorkerValidationContext;
      recordedAt?: string;
    },
    token: string,
  ): Promise<StationValidationResult> {
    const station = await requireStation(input.stationId, input.companyId);

    if (heartbeatEngine.isStale(station.lastHeartbeat)) {
      throw new BadRequestError('Station offline — heartbeat stale');
    }

    const worker = await safetyClients.fetchWorkerContext(
      input.workerId,
      input.companyId,
      token,
      input.workerContext,
    );

    if (input.requiredJhaIds?.length && envHasJhaService()) {
      for (const jhaId of input.requiredJhaIds) {
        const valid = await safetyClients.validateJha(jhaId, input.workerId, input.companyId, token);
        if (!valid && !(worker.signedJhaIds ?? []).includes(jhaId)) {
          worker.signedJhaIds = worker.signedJhaIds ?? [];
        } else if (valid) {
          worker.signedJhaIds = [...(worker.signedJhaIds ?? []), jhaId];
        }
      }
    }

    const checks = workerValidationEngine.evaluate(
      worker,
      input.requiredJhaIds ?? [],
      station.emergencyMode,
    );
    const decision = safetyGatingEngine.aggregate(checks);

    const log = await stationRepository.createAccessLog({
      stationId: input.stationId,
      workerId: input.workerId,
      result: decision.granted ? AccessLogResult.granted : AccessLogResult.denied,
      reason: decision.reason,
      timestamp: input.recordedAt ? new Date(input.recordedAt) : undefined,
    });

    return {
      granted: decision.granted,
      reason: decision.reason,
      gates: decision.failedGates,
      logId: log.id,
    };
  },

  async validateEquipment(
    input: {
      companyId: string;
      stationId: string;
      equipmentId: string;
      equipmentContext?: EquipmentValidationContext;
      recordedAt?: string;
    },
    token: string,
  ): Promise<StationValidationResult> {
    const station = await requireStation(input.stationId, input.companyId);

    if (heartbeatEngine.isStale(station.lastHeartbeat)) {
      throw new BadRequestError('Station offline — heartbeat stale');
    }

    const equipment = await safetyClients.fetchEquipmentContext(
      input.equipmentId,
      input.companyId,
      token,
      input.equipmentContext,
    );

    const checks = equipmentValidationEngine.evaluate(equipment, station.emergencyMode);
    const decision = safetyGatingEngine.aggregate(checks);

    const log = await stationRepository.createAccessLog({
      stationId: input.stationId,
      equipmentId: input.equipmentId,
      result: decision.granted ? AccessLogResult.granted : AccessLogResult.denied,
      reason: decision.reason,
      timestamp: input.recordedAt ? new Date(input.recordedAt) : undefined,
    });

    return {
      granted: decision.granted,
      reason: decision.reason,
      gates: decision.failedGates,
      logId: log.id,
    };
  },

  async musterCheckin(input: {
    companyId: string;
    stationId: string;
    workerId: string;
    musterPoint: string;
    notes?: string;
    checkedInAt?: string;
  }) {
    await requireStation(input.stationId, input.companyId);

    const checkin = await stationRepository.createMusterCheckin({
      stationId: input.stationId,
      workerId: input.workerId,
      musterPoint: input.musterPoint,
      notes: input.notes,
      checkedInAt: input.checkedInAt ? new Date(input.checkedInAt) : undefined,
    });

    await stationRepository.createAccessLog({
      stationId: input.stationId,
      workerId: input.workerId,
      result: AccessLogResult.granted,
      reason: `Muster check-in at ${input.musterPoint}`,
      timestamp: checkin.checkedInAt,
    });

    return {
      id: checkin.id,
      stationId: checkin.stationId,
      workerId: checkin.workerId,
      musterPoint: checkin.musterPoint,
      checkedInAt: checkin.checkedInAt.toISOString(),
      notes: checkin.notes,
    };
  },

  async setEmergencyMode(input: {
    companyId: string;
    stationId?: string;
    projectId?: string;
    mode: EmergencyModeType;
  }) {
    if (input.stationId) {
      const station = await requireStation(input.stationId, input.companyId);
      const status =
        input.mode === EmergencyModeType.all_clear
          ? StationStatus.online
          : StationStatus.emergency;

      await stationRepository.setEmergencyMode(
        input.stationId,
        input.companyId,
        input.mode === EmergencyModeType.all_clear ? null : input.mode,
        status,
      );

      const updated = await stationRepository.findStation(input.stationId, input.companyId);
      return { scope: 'station', station: mapStation(updated) };
    }

    if (input.projectId) {
      await stationRepository.setProjectEmergencyMode(
        input.companyId,
        input.projectId,
        input.mode === EmergencyModeType.all_clear ? null : input.mode,
      );
      return { scope: 'project', projectId: input.projectId, mode: input.mode };
    }

    throw new BadRequestError('station_id or project_id required for emergency mode');
  },

  async offlineSync(input: {
    companyId: string;
    stationId: string;
    token: string;
    actions: OfflineSyncAction[];
  }): Promise<{ results: OfflineSyncResult[]; synced: number; failed: number }> {
    await requireStation(input.stationId, input.companyId);

    const results: OfflineSyncResult[] = [];
    for (const action of input.actions) {
      const result = await offlineSyncEngine.processAction({
        stationId: input.stationId,
        companyId: input.companyId,
        token: input.token,
        action,
      });
      results.push(result);
    }

    const synced = results.filter((r) => r.ok).length;
    return { results, synced, failed: results.length - synced };
  },
};

function envHasJhaService(): boolean {
  return Boolean(process.env.JHA_SERVICE_URL);
}
