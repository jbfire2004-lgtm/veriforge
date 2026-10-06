import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmSafetyStationAccessAction,
  PmSafetyStationStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PmSiteAccessControlService } from '../pm-site-access-control/pm-site-access-control.service';
import { PmEquipmentSafetyService } from '../pm-equipment-safety/pm-equipment-safety.service';
import { PmEmergencyResponseService } from '../pm-emergency-response/pm-emergency-response.service';
import { PmDocumentControlService } from '../pm-document-control/pm-document-control.service';
import { StationRegistrationEngine } from './station-registration.engine';
import { StationHeartbeatEngine } from './station-heartbeat.engine';
import { StationJhaEngine } from './station-jha.engine';
import { PmSafetyStationsCailIntelligenceService } from './pm-safety-stations-cail-intelligence.service';

@Injectable()
export class PmSafetyStationsService {
  private readonly registrationEngine = new StationRegistrationEngine();
  private readonly heartbeatEngine = new StationHeartbeatEngine();
  private readonly jhaEngine: StationJhaEngine;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmSafetyStationsCailIntelligenceService,
    @Optional() private readonly siteAccess?: PmSiteAccessControlService,
    @Optional() private readonly equipmentSafety?: PmEquipmentSafetyService,
    @Optional() private readonly emergency?: PmEmergencyResponseService,
    @Optional() private readonly documents?: PmDocumentControlService,
  ) {
    this.jhaEngine = new StationJhaEngine(prisma);
  }

  private async audit(
    entityType: string,
    entityId: string,
    eventType: string,
    stationId?: number,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmSafetyStationAuditLog.create({
      data: {
        stationId,
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async resolveStation(stationId?: number, code?: string, hardwareId?: string) {
    if (stationId) {
      const s = await this.prisma.safetyStation.findFirst({
        where: { id: stationId, deletedAt: null },
      });
      if (!s) throw new NotFoundException('Station not found');
      return s;
    }
    if (code) {
      const s = await this.prisma.safetyStation.findFirst({
        where: { code, deletedAt: null },
      });
      if (!s) throw new NotFoundException('Station not found');
      return s;
    }
    if (hardwareId) {
      const s = await this.prisma.safetyStation.findFirst({
        where: { hardwareId, deletedAt: null },
      });
      if (!s) throw new NotFoundException('Station not found');
      return s;
    }
    throw new BadRequestException('stationId, code, or hardwareId required');
  }

  // ---------- Registration ----------

  async register(input: {
    name: string;
    code: string;
    companyId: number;
    projectId?: number;
    siteId?: number;
    zoneCode?: string;
    stationType?: import('./station-registration.engine').StationRegistrationInput['stationType'];
    hardwareId?: string;
    firmwareVersion?: string;
    networkMode?: import('./station-registration.engine').StationRegistrationInput['networkMode'];
    equipmentId?: number;
    latitude?: number;
    longitude?: number;
    heartbeatIntervalSec?: number;
    actorId?: number;
  }) {
    const validation = this.registrationEngine.validateRegistration(input);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join('; '));
    }

    const row = await this.prisma.safetyStation.create({
      data: {
        name: input.name,
        code: input.code,
        companyId: input.companyId,
        projectId: input.projectId,
        siteId: input.siteId,
        zoneCode: input.zoneCode ?? 'SITE',
        stationType: input.stationType ?? 'zone',
        hardwareId: input.hardwareId,
        firmwareVersion: input.firmwareVersion,
        networkMode: input.networkMode ?? 'online',
        equipmentId: input.equipmentId,
        latitude: input.latitude,
        longitude: input.longitude,
        heartbeatIntervalSec: input.heartbeatIntervalSec ?? 60,
        status: 'pending',
        active: true,
      },
    });

    await this.audit(
      'safety_station',
      String(row.id),
      'registered',
      row.id,
      input.actorId,
    );
    return row;
  }

  async activate(stationId: number, actorId?: number) {
    const station = await this.resolveStation(stationId);
    const next = this.registrationEngine.activationTransition(
      station.status,
      !!station.hardwareId,
      !!station.projectId,
    );
    const updated = await this.prisma.safetyStation.update({
      where: { id: stationId },
      data: { status: next, active: next === 'active' },
    });
    await this.audit(
      'safety_station',
      String(stationId),
      'activated',
      stationId,
      actorId,
      {
        status: next,
      },
    );
    return updated;
  }

  async deactivate(stationId: number, actorId?: number) {
    const updated = await this.prisma.safetyStation.update({
      where: { id: stationId },
      data: {
        status: 'deactivated',
        active: false,
        deletedAt: new Date(),
      },
    });
    await this.audit(
      'safety_station',
      String(stationId),
      'deactivated',
      stationId,
      actorId,
    );
    return updated;
  }

  async list(filters: {
    companyId: number;
    projectId?: number;
    siteId?: number;
    stationType?: string;
    status?: PmSafetyStationStatus;
  }) {
    return this.prisma.safetyStation.findMany({
      where: {
        companyId: filters.companyId,
        projectId: filters.projectId,
        siteId: filters.siteId,
        stationType: filters.stationType as never,
        status: filters.status,
        deletedAt: null,
      },
      include: {
        site: true,
        project: true,
        equipment: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ---------- Heartbeat ----------

  async recordHeartbeat(
    stationCode: string,
    payload?: HeartbeatPayload & { payload?: Record<string, unknown> },
  ) {
    const station = await this.resolveStation(undefined, stationCode);
    const now = new Date();
    const sensorHealth =
      payload?.sensorHealth ??
      (payload?.payload?.sensorHealth as Record<string, boolean> | undefined);

    const alerts = this.heartbeatEngine.evaluateAlerts({
      lastPing: station.lastPing,
      heartbeatIntervalSec: station.heartbeatIntervalSec,
      batteryLevel: payload?.batteryLevel,
      sensorHealth,
      expectedFirmware: station.firmwareVersion,
      reportedFirmware: payload?.firmwareVersion,
    });

    await this.prisma.$transaction([
      this.prisma.safetyStation.update({
        where: { id: station.id },
        data: {
          lastPing: now,
          status: station.status === 'pending' ? station.status : 'active',
          networkMode:
            payload?.online === false ? 'offline' : station.networkMode,
          firmwareVersion: payload?.firmwareVersion ?? station.firmwareVersion,
        },
      }),
      this.prisma.safetyStationHeartbeat.create({
        data: {
          stationId: station.id,
          payload: (payload?.payload ?? payload ?? {}) as Prisma.InputJsonValue,
          batteryLevel: payload?.batteryLevel,
          storageFreeMb: payload?.storageFreeMb,
          sensorHealthJson: (sensorHealth ?? {}) as Prisma.InputJsonValue,
          firmwareVersion: payload?.firmwareVersion,
          alertsJson: alerts as Prisma.InputJsonValue,
          online: payload?.online !== false,
        },
      }),
    ]);

    if (alerts.some((a) => a.severity === 'critical')) {
      await this.audit(
        'safety_station',
        String(station.id),
        'heartbeat_alert',
        station.id,
        undefined,
        {
          alerts,
        },
      );
    }

    return {
      stationId: station.id,
      lastPing: now.toISOString(),
      ok: true,
      alerts,
      healthy: this.heartbeatEngine.isHealthy(alerts),
    };
  }

  async stationHealth(projectId?: number, siteId?: number) {
    const stations = await this.prisma.safetyStation.findMany({
      where: {
        deletedAt: null,
        active: true,
        projectId,
        siteId,
      },
      select: {
        id: true,
        code: true,
        name: true,
        lastPing: true,
        status: true,
        stationType: true,
        heartbeatIntervalSec: true,
      },
    });

    const latestHeartbeats = await Promise.all(
      stations.map(async (s) => {
        const hb = await this.prisma.safetyStationHeartbeat.findFirst({
          where: { stationId: s.id },
          orderBy: { createdAt: 'desc' },
        });
        const alerts = this.heartbeatEngine.evaluateAlerts({
          lastPing: s.lastPing,
          heartbeatIntervalSec: s.heartbeatIntervalSec,
          batteryLevel: hb?.batteryLevel,
          sensorHealth: (hb?.sensorHealthJson as Record<string, boolean>) ?? {},
          reportedFirmware: hb?.firmwareVersion,
        });
        return {
          ...s,
          healthy: this.heartbeatEngine.isHealthy(alerts),
          alerts,
          batteryLevel: hb?.batteryLevel,
        };
      }),
    );

    return latestHeartbeats;
  }

  async listHeartbeats(stationId: number, limit = 50) {
    return this.prisma.safetyStationHeartbeat.findMany({
      where: { stationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ---------- Worker sign-in/out ----------

  async validateWorker(input: {
    stationId?: number;
    stationCode?: string;
    workerId: number;
    projectId: number;
    zoneCode?: string;
    equipmentId?: number;
    action?: PmSafetyStationAccessAction;
    actorId?: number;
    clientSyncId?: string;
  }) {
    const station = await this.resolveStation(
      input.stationId,
      input.stationCode,
    );
    const zoneCode = input.zoneCode ?? station.zoneCode ?? 'SITE';
    const action = input.action ?? 'sign_in';

    if (station.emergencyModeActive) {
      const log = await this.writeAccessLog({
        stationId: station.id,
        workerId: input.workerId,
        projectId: input.projectId,
        zoneCode,
        action,
        granted: false,
        decision: 'denied',
        denialReasons: ['Emergency mode active — access locked'],
        checksJson: { emergencyLock: false },
        clientSyncId: input.clientSyncId,
      });
      return { granted: false, log, denialReasons: ['Emergency mode active'] };
    }

    const rule = await this.prisma.siteAccessRule.findUnique({
      where: {
        projectId_zoneCode: {
          projectId: input.projectId,
          zoneCode,
        },
      },
    });

    let accessResult: {
      granted: boolean;
      denialReasons: string[];
      checks: Record<string, boolean>;
      attemptId?: string;
      decision?: string;
    } = {
      granted: false,
      denialReasons: ['Site access module unavailable'],
      checks: {},
    };

    if (this.siteAccess) {
      const r = await this.siteAccess.stationValidate({
        workerId: input.workerId,
        projectId: input.projectId,
        zoneCode,
        equipmentId: input.equipmentId ?? station.equipmentId ?? undefined,
      });
      accessResult = {
        granted: r.granted,
        denialReasons: r.denialReasons,
        checks: r.checks,
        attemptId: r.attemptId,
        decision: r.decision,
      };
    }

    const jha = await this.jhaEngine.validateForStation({
      workerId: input.workerId,
      projectId: input.projectId,
      zoneCode,
      requiresJha: rule?.requiresJha ?? false,
      flhaHours: rule?.requiresFlhaHours ?? 24,
      equipmentId: input.equipmentId ?? station.equipmentId ?? undefined,
    });

    const mergedChecks = { ...accessResult.checks, ...jha.checks };
    const denialReasons = [...accessResult.denialReasons, ...jha.denialReasons];
    const granted = accessResult.granted && jha.valid;

    const log = await this.writeAccessLog({
      stationId: station.id,
      workerId: input.workerId,
      projectId: input.projectId,
      zoneCode,
      action,
      granted,
      decision: accessResult.decision,
      denialReasons,
      checksJson: mergedChecks,
      accessAttemptId: accessResult.attemptId,
      jhaFlhaId: jha.jhaFlhaId,
      clientSyncId: input.clientSyncId,
    });

    await this.audit(
      'access_log',
      log.id,
      granted ? 'access_granted' : 'access_denied',
      station.id,
      input.actorId,
      { workerId: input.workerId, denialReasons },
    );

    const prediction = this.cail.predictAccessDenial(mergedChecks);

    return {
      granted,
      log,
      denialReasons,
      checks: mergedChecks,
      requiredPpe: jha.requiredPpe,
      cail: prediction,
    };
  }

  private async writeAccessLog(data: {
    stationId: number;
    workerId: number;
    projectId?: number;
    zoneCode: string;
    action: PmSafetyStationAccessAction;
    granted: boolean;
    decision?: string;
    denialReasons: string[];
    checksJson: Record<string, unknown>;
    accessAttemptId?: string;
    jhaFlhaId?: string;
    clientSyncId?: string;
  }) {
    return this.prisma.pmSafetyStationAccessLog.create({
      data: {
        id: randomUUID(),
        stationId: data.stationId,
        workerId: data.workerId,
        projectId: data.projectId,
        zoneCode: data.zoneCode,
        action: data.action,
        granted: data.granted,
        decision: data.decision,
        denialReasons: data.denialReasons as Prisma.InputJsonValue,
        checksJson: data.checksJson as Prisma.InputJsonValue,
        accessAttemptId: data.accessAttemptId,
        jhaFlhaId: data.jhaFlhaId,
        clientSyncId: data.clientSyncId,
      },
    });
  }

  // ---------- Equipment ----------

  async validateEquipment(input: {
    stationId?: number;
    stationCode?: string;
    equipmentId: number;
    workerId?: number;
    projectId?: number;
    actorId?: number;
    clientSyncId?: string;
  }) {
    const station = await this.resolveStation(
      input.stationId,
      input.stationCode,
    );

    if (!this.equipmentSafety) {
      throw new BadRequestException('Equipment safety module unavailable');
    }

    let granted = true;
    const denialReasons: string[] = [];
    const checks: Record<string, boolean> = {};

    if (input.workerId) {
      const validation = await this.equipmentSafety.validateAssignment({
        workerId: input.workerId,
        equipmentId: input.equipmentId,
        projectId: input.projectId ?? station.projectId ?? undefined,
        actorId: input.actorId,
      });
      granted = validation.allowed;
      if (!validation.allowed) denialReasons.push(...validation.failures);
      checks.assignment = validation.allowed;
    } else {
      const eq = await this.prisma.equipment.findUnique({
        where: { id: input.equipmentId },
      });
      if (!eq) throw new NotFoundException('Equipment not found');
      const blocked =
        eq.operationalStatus === 'out_of_service' ||
        eq.operationalStatus === 'locked_out' ||
        eq.lockoutStatus !== 'CLEAR';
      granted = !blocked;
      checks.operational = !blocked;
      if (blocked)
        denialReasons.push(`Equipment status: ${eq.operationalStatus}`);
    }

    const log = await this.prisma.pmSafetyStationEquipmentLog.create({
      data: {
        id: randomUUID(),
        stationId: station.id,
        equipmentId: input.equipmentId,
        workerId: input.workerId,
        granted,
        denialReasons: denialReasons as Prisma.InputJsonValue,
        checksJson: checks as Prisma.InputJsonValue,
        clientSyncId: input.clientSyncId,
      },
    });

    return { granted, log, denialReasons, checks };
  }

  // ---------- Muster ----------

  async musterCheckIn(input: {
    stationId?: number;
    stationCode?: string;
    workerId: number;
    musterPointCode?: string;
    geoJson?: Record<string, unknown>;
    clientSyncId?: string;
  }) {
    const station = await this.resolveStation(
      input.stationId,
      input.stationCode,
    );
    const projectId = station.projectId;
    if (!projectId)
      throw new BadRequestException('Station not assigned to project');

    const activeMuster = await this.prisma.musterEvent.findFirst({
      where: { projectId, status: { in: ['activated', 'accounting'] } },
      orderBy: { triggeredAt: 'desc' },
    });

    const log = await this.prisma.pmSafetyStationMusterLog.create({
      data: {
        id: randomUUID(),
        stationId: station.id,
        workerId: input.workerId,
        musterEventId: activeMuster?.id,
        action: 'check_in',
        musterPointCode: input.musterPointCode ?? station.zoneCode,
        geoJson: input.geoJson as Prisma.InputJsonValue | undefined,
        clientSyncId: input.clientSyncId,
      },
    });

    if (activeMuster) {
      await this.prisma.musterCheckin.upsert({
        where: {
          musterEventId_workerId: {
            musterEventId: activeMuster.id,
            workerId: input.workerId,
          },
        },
        create: {
          musterEventId: activeMuster.id,
          workerId: input.workerId,
          method: `safety_station:${station.code}`,
        },
        update: {
          checkedInAt: new Date(),
          method: 'safety_station',
        },
      });
    }

    return { log, musterEventId: activeMuster?.id };
  }

  async musterStatus(projectId: number) {
    const activeMuster = await this.prisma.musterEvent.findFirst({
      where: { projectId, status: { in: ['activated', 'accounting'] } },
      include: { checkins: true },
    });
    if (!activeMuster) return { active: false };

    const missing = Array.isArray(activeMuster.missingWorkerIds)
      ? (activeMuster.missingWorkerIds as number[])
      : [];

    return {
      active: true,
      musterEventId: activeMuster.id,
      checkedIn: activeMuster.checkins.length,
      missingWorkerIds: missing,
    };
  }

  // ---------- Emergency mode ----------

  async setEmergencyMode(stationId: number, active: boolean, actorId?: number) {
    const updated = await this.prisma.safetyStation.update({
      where: { id: stationId },
      data: { emergencyModeActive: active },
    });
    await this.audit(
      'safety_station',
      String(stationId),
      active ? 'emergency_mode_on' : 'emergency_mode_off',
      stationId,
      actorId,
    );
    return updated;
  }

  async emergencyPayload(stationId: number) {
    const station = await this.resolveStation(stationId);
    if (!station.companyId || !station.siteId) {
      return { plans: [], lock: null };
    }
    const plans = this.emergency
      ? await this.emergency.stationPayload(station.companyId, station.siteId)
      : [];
    const lock = station.projectId
      ? await this.prisma.pmSiteEmergencyLock.findFirst({
          where: { projectId: station.projectId, active: true },
        })
      : null;
    return { plans, lock, emergencyModeActive: station.emergencyModeActive };
  }

  // ---------- Offline sync ----------

  async buildOfflineBundle(stationId: number) {
    const station = await this.resolveStation(stationId);
    const projectId = station.projectId;
    if (!projectId || !station.companyId) {
      throw new BadRequestException(
        'Station requires company and project for sync',
      );
    }

    const workers = await this.prisma.projectAssignment.findMany({
      where: { projectId, endedAt: null },
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            qrToken: true,
          },
        },
      },
    });

    const equipment = await this.prisma.equipmentProjectAssignment.findMany({
      where: { projectId, endedAt: null },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            qrToken: true,
            operationalStatus: true,
            lockoutStatus: true,
          },
        },
      },
    });

    const jha = await this.jhaEngine.syncPayload(projectId);
    const zoneRules = await this.prisma.siteAccessRule.findMany({
      where: { projectId },
    });
    const emergency = await this.emergencyPayload(stationId);
    const sds = this.documents
      ? await this.documents.stationSyncPayload(
          station.companyId,
          station.siteId ?? undefined,
        )
      : { documents: [] };

    const bundle = {
      station: {
        id: station.id,
        code: station.code,
        zoneCode: station.zoneCode,
        stationType: station.stationType,
      },
      workers: workers.map((w) => w.worker),
      equipment: equipment.map((e) => e.equipment),
      jha,
      zoneRules,
      emergency,
      sds,
      syncedAt: new Date().toISOString(),
    };

    await this.prisma.pmSafetyStationOfflineCache.upsert({
      where: {
        stationId_cacheKey: { stationId, cacheKey: 'full_bundle' },
      },
      create: {
        id: randomUUID(),
        stationId,
        cacheKey: 'full_bundle',
        payload: bundle as Prisma.InputJsonValue,
      },
      update: {
        payload: bundle as Prisma.InputJsonValue,
        cacheVersion: { increment: 1 },
        syncedAt: new Date(),
      },
    });

    await this.prisma.safetyStation.update({
      where: { id: stationId },
      data: { lastSyncAt: new Date() },
    });

    return bundle;
  }

  async applyOfflineSync(
    stationId: number,
    events: {
      accessLogs?: Array<Record<string, unknown>>;
      equipmentLogs?: Array<Record<string, unknown>>;
      musterLogs?: Array<Record<string, unknown>>;
      attachments?: Array<Record<string, unknown>>;
    },
  ) {
    const results: Record<string, number> = {
      access: 0,
      equipment: 0,
      muster: 0,
      attachments: 0,
      conflicts: 0,
    };

    for (const row of events.accessLogs ?? []) {
      const clientSyncId = row.clientSyncId as string | undefined;
      if (clientSyncId) {
        const existing = await this.prisma.pmSafetyStationAccessLog.findUnique({
          where: { clientSyncId },
        });
        if (existing) {
          results.conflicts++;
          continue;
        }
      }
      await this.prisma.pmSafetyStationAccessLog.create({
        data: {
          id: randomUUID(),
          stationId,
          workerId: row.workerId as number,
          projectId: row.projectId as number | undefined,
          zoneCode: (row.zoneCode as string) ?? 'SITE',
          action: (row.action as PmSafetyStationAccessAction) ?? 'sign_in',
          granted: !!row.granted,
          decision: row.decision as string | undefined,
          denialReasons: (row.denialReasons ?? []) as Prisma.InputJsonValue,
          checksJson: (row.checksJson ?? {}) as Prisma.InputJsonValue,
          clientSyncId,
        },
      });
      results.access++;
    }

    for (const row of events.equipmentLogs ?? []) {
      const clientSyncId = row.clientSyncId as string | undefined;
      if (clientSyncId) {
        const existing =
          await this.prisma.pmSafetyStationEquipmentLog.findUnique({
            where: { clientSyncId },
          });
        if (existing) {
          results.conflicts++;
          continue;
        }
      }
      await this.prisma.pmSafetyStationEquipmentLog.create({
        data: {
          id: randomUUID(),
          stationId,
          equipmentId: row.equipmentId as number,
          workerId: row.workerId as number | undefined,
          granted: !!row.granted,
          denialReasons: (row.denialReasons ?? []) as Prisma.InputJsonValue,
          checksJson: (row.checksJson ?? {}) as Prisma.InputJsonValue,
          clientSyncId,
        },
      });
      results.equipment++;
    }

    for (const row of events.musterLogs ?? []) {
      const clientSyncId = row.clientSyncId as string | undefined;
      if (clientSyncId) {
        const existing = await this.prisma.pmSafetyStationMusterLog.findUnique({
          where: { clientSyncId },
        });
        if (existing) {
          results.conflicts++;
          continue;
        }
      }
      await this.prisma.pmSafetyStationMusterLog.create({
        data: {
          id: randomUUID(),
          stationId,
          workerId: row.workerId as number,
          action: (row.action as string) ?? 'check_in',
          musterEventId: row.musterEventId as string | undefined,
          clientSyncId,
        },
      });
      results.muster++;
    }

    for (const row of events.attachments ?? []) {
      const clientSyncId = row.clientSyncId as string | undefined;
      if (clientSyncId) {
        const existing = await this.prisma.pmSafetyStationAttachment.findUnique(
          {
            where: { clientSyncId },
          },
        );
        if (existing) {
          results.conflicts++;
          continue;
        }
      }
      await this.prisma.pmSafetyStationAttachment.create({
        data: {
          id: randomUUID(),
          stationId,
          entityType: row.entityType as string,
          entityId: row.entityId as string,
          fileName: row.fileName as string | undefined,
          mimeType: row.mimeType as string | undefined,
          dataUrl: row.dataUrl as string | undefined,
          clientSyncId,
        },
      });
      results.attachments++;
    }

    await this.audit(
      'safety_station',
      String(stationId),
      'offline_sync_applied',
      stationId,
      undefined,
      results,
    );
    return results;
  }

  // ---------- Attachments ----------

  async addAttachment(input: {
    stationId: number;
    entityType: string;
    entityId: string;
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
    clientSyncId?: string;
  }) {
    return this.prisma.pmSafetyStationAttachment.create({
      data: {
        id: randomUUID(),
        stationId: input.stationId,
        entityType: input.entityType,
        entityId: input.entityId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        dataUrl: input.dataUrl,
        clientSyncId: input.clientSyncId,
      },
    });
  }

  // ---------- Analytics ----------

  mapOperationalState(input: {
    emergencyModeActive: boolean;
    networkMode: string;
    alerts: Array<{ code: string; severity: string }>;
  }): 'online' | 'offline' | 'low_battery' | 'sensor_fault' | 'emergency_mode' {
    if (input.emergencyModeActive) return 'emergency_mode';
    if (input.alerts.some((a) => a.code === 'station_offline'))
      return 'offline';
    if (input.alerts.some((a) => a.code === 'sensor_failure'))
      return 'sensor_fault';
    if (input.alerts.some((a) => a.code === 'low_battery'))
      return 'low_battery';
    if (input.networkMode === 'offline') return 'offline';
    return 'online';
  }

  async getStation(id: number) {
    const station = await this.resolveStation(id);
    const hb = await this.prisma.safetyStationHeartbeat.findFirst({
      where: { stationId: id },
      orderBy: { createdAt: 'desc' },
    });
    const alerts = this.heartbeatEngine.evaluateAlerts({
      lastPing: station.lastPing,
      heartbeatIntervalSec: station.heartbeatIntervalSec,
      batteryLevel: hb?.batteryLevel,
      sensorHealth: (hb?.sensorHealthJson as Record<string, boolean>) ?? {},
      reportedFirmware: hb?.firmwareVersion,
      expectedFirmware: station.firmwareVersion,
    });
    return {
      ...station,
      operationalState: this.mapOperationalState({
        emergencyModeActive: station.emergencyModeActive,
        networkMode: station.networkMode,
        alerts,
      }),
      lastHeartbeat: hb,
      healthy: this.heartbeatEngine.isHealthy(alerts),
    };
  }

  async analytics(projectId: number) {
    const since30 = new Date(Date.now() - 30 * 86400000);
    const accessLogs = await this.prisma.pmSafetyStationAccessLog.findMany({
      where: { projectId, createdAt: { gte: since30 } },
      select: { granted: true, createdAt: true, workerId: true },
    });

    const denied = accessLogs.filter((l) => !l.granted).length;
    const granted = accessLogs.filter((l) => l.granted).length;
    const equipmentLogs = await this.prisma.pmSafetyStationEquipmentLog.count({
      where: {
        station: { projectId },
        createdAt: { gte: since30 },
      },
    });
    const musterLogs = await this.prisma.pmSafetyStationMusterLog.count({
      where: {
        station: { projectId },
        createdAt: { gte: since30 },
      },
    });

    const health = await this.stationHealth(projectId);
    const uptimePct =
      health.length > 0
        ? Math.round(
            (health.filter((h) => h.healthy).length / health.length) * 100,
          )
        : 100;

    const cailInsights = await this.cail.projectInsights(projectId);
    const musterAnomaly = await this.cail.musterAnomalyDetection(projectId);
    if (musterAnomaly) cailInsights.push(musterAnomaly);

    const denialRate = accessLogs.length > 0 ? denied / accessLogs.length : 0;

    return {
      access: { granted, denied, total: accessLogs.length },
      equipmentValidations: equipmentLogs,
      musterCheckins: musterLogs,
      stationUptimePct: uptimePct,
      stations: health.length,
      denialRate,
      syncSuccessRate: accessLogs.length > 0 ? granted / accessLogs.length : 1,
      musterCompliancePct:
        granted + denied > 0
          ? Math.round((granted / (granted + denied)) * 100)
          : 100,
      cailInsights,
    };
  }

  async accessLogs(filters: {
    stationId?: number;
    projectId?: number;
    workerId?: number;
    limit?: number;
  }) {
    return this.prisma.pmSafetyStationAccessLog.findMany({
      where: {
        stationId: filters.stationId,
        projectId: filters.projectId,
        workerId: filters.workerId,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 100,
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        station: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async equipmentLogs(stationId?: number, limit = 100) {
    return this.prisma.pmSafetyStationEquipmentLog.findMany({
      where: { stationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        equipment: { select: { id: true, name: true } },
      },
    });
  }
}

type HeartbeatPayload = {
  batteryLevel?: number;
  storageFreeMb?: number;
  sensorHealth?: Record<string, boolean>;
  firmwareVersion?: string;
  online?: boolean;
  payload?: Record<string, unknown>;
};
