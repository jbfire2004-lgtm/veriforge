import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmAccessDecision,
  PmAccessOverrideType,
  PmAccessPointType,
  PmAccessZoneType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';
import { PmInspectionsService } from '../pm-inspections/pm-inspections.service';
import { PmSafetyEventsService } from '../pm-safety-events/pm-safety-events.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import { PmDocumentControlService } from '../pm-document-control/pm-document-control.service';
import { PmEquipmentSafetyService } from '../pm-equipment-safety/pm-equipment-safety.service';
import { PmEmergencyResponseService } from '../pm-emergency-response/pm-emergency-response.service';
import { PmProjectSafetyContextService } from '../pm-project-safety-context/pm-project-safety-context.service';
import { PmCompanySafetyContextService } from '../pm-company-safety-context/pm-company-safety-context.service';
import { AccessDecisionEngine } from './access-decision.engine';
import { ZoneAccessRulesEngine } from './zone-access-rules.engine';
import { PmSiteAccessCailIntelligenceService } from './pm-site-access-cail-intelligence.service';

export type AccessValidationResult = {
  decision: PmAccessDecision;
  granted: boolean;
  denialReasons: string[];
  checks: Record<string, boolean>;
  attemptId?: string;
  overrideId?: string;
};

@Injectable()
export class PmSiteAccessControlService {
  private readonly decisionEngine = new AccessDecisionEngine();
  private readonly zoneEngine = new ZoneAccessRulesEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmSiteAccessCailIntelligenceService,
    @Optional() private readonly sifHeca?: SifHecaService,
    @Optional() private readonly pmInspections?: PmInspectionsService,
    @Optional() private readonly pmSafetyEvents?: PmSafetyEventsService,
    @Optional() private readonly pmCapa?: PmCorrectiveActionsService,
    @Optional() private readonly pmDocuments?: PmDocumentControlService,
    @Optional() private readonly pmEquipment?: PmEquipmentSafetyService,
    @Optional() private readonly pmEmergency?: PmEmergencyResponseService,
    @Optional()
    private readonly pmProjectContext?: PmProjectSafetyContextService,
    @Optional()
    private readonly pmCompanyContext?: PmCompanySafetyContextService,
  ) {}

  private async audit(
    entityType: string,
    entityId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmAccessAuditLog.create({
      data: {
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async validateAccess(input: {
    workerId: number;
    projectId: number;
    zoneCode?: string;
    equipmentId?: number;
    accessPointId?: string;
    actorId?: number;
    recordAttempt?: boolean;
  }): Promise<AccessValidationResult> {
    const zoneCode = input.zoneCode ?? 'SITE';
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
      include: { site: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const denialReasons: string[] = [];
    const checks: Record<string, boolean> = {};

    const override = await this.findActiveOverride({
      projectId: input.projectId,
      workerId: input.workerId,
      zoneCode,
      equipmentId: input.equipmentId,
    });

    const rule = await this.prisma.siteAccessRule.findUnique({
      where: {
        projectId_zoneCode: { projectId: input.projectId, zoneCode },
      },
    });

    const effectiveRule = rule ?? {
      requiresFlhaHours: 24,
      requiresOrientation: true,
      requiresTrainingCodes: [] as Prisma.JsonArray,
      requiresJha: false,
      requiresSdsAck: false,
      requiresPermitIds: [] as Prisma.JsonArray,
      highRisk: false,
      zoneType: 'general_work' as PmAccessZoneType,
      timeWindowStart: null as string | null,
      timeWindowEnd: null as string | null,
    };

    if (rule) {
      const timeErr = this.zoneEngine.evaluateTimeWindow({
        timeWindowStart: rule.timeWindowStart,
        timeWindowEnd: rule.timeWindowEnd,
        requiresJha: rule.requiresJha,
        requiresSdsAck: rule.requiresSdsAck,
        requiresPermitIds: (rule.requiresPermitIds as string[]) ?? [],
        requiredPpe: (rule.requiredPpe as string[]) ?? [],
      });
      if (timeErr) {
        denialReasons.push(timeErr);
        checks.timeWindow = false;
      } else {
        checks.timeWindow = true;
      }
    }

    if (effectiveRule.requiresOrientation) {
      const orientation = await this.prisma.safetyForm.findFirst({
        where: {
          workerId: input.workerId,
          projectId: input.projectId,
          definitionId: 'site-orientation',
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] },
        },
      });
      checks.orientation = !!orientation;
      if (!orientation) denialReasons.push('Site orientation not completed');
    }

    const codes = Array.isArray(effectiveRule.requiresTrainingCodes)
      ? (effectiveRule.requiresTrainingCodes as string[])
      : [];
    const now = new Date();
    for (const code of codes) {
      const records = await this.prisma.trainingRecord.findMany({
        where: {
          workerId: input.workerId,
          OR: [{ projectId: input.projectId }, { projectId: null }],
        },
        include: { certification: { select: { code: true, name: true } } },
      });
      const match = records.find(
        (r) =>
          (r.certification.code === code ||
            r.certification.name.toLowerCase() === code.toLowerCase()) &&
          (!r.expiresAt || r.expiresAt > now),
      );
      checks[`training_${code}`] = !!match;
      if (!match) denialReasons.push(`Missing or expired training: ${code}`);
    }

    const hours = effectiveRule.requiresFlhaHours ?? 24;
    const flhaSince = new Date(Date.now() - hours * 60 * 60 * 1000);
    const flhaJha = await this.prisma.jhaFlha.findFirst({
      where: {
        projectId: input.projectId,
        kind: 'FLHA',
        status: { in: ['APPROVED', 'LOCKED', 'SUBMITTED', 'UNDER_REVIEW'] },
        workers: { some: { workerId: input.workerId } },
        OR: [
          { approvedAt: { gte: flhaSince } },
          { submittedAt: { gte: flhaSince } },
        ],
      },
    });
    checks.flha = !!flhaJha;
    if (!checks.flha) {
      denialReasons.push(`FLHA/JHA not completed within last ${hours} hours`);
    }

    if (effectiveRule.requiresJha) {
      const jha = await this.prisma.jhaFlha.findFirst({
        where: {
          projectId: input.projectId,
          status: { in: ['APPROVED', 'LOCKED'] },
          workers: { some: { workerId: input.workerId } },
        },
        include: { signatures: true },
      });
      checks.jha = !!jha;
      if (!jha) {
        denialReasons.push('Approved JHA required for zone entry');
      } else {
        const supervisorSig = jha.signatures.some(
          (s) => s.role === 'SUPERVISOR',
        );
        checks.jhaSupervisorSig = supervisorSig;
        if (!supervisorSig) {
          denialReasons.push('JHA missing supervisor approval signature');
        }
      }
    }

    if (effectiveRule.requiresSdsAck && this.pmDocuments) {
      const doc = await this.pmDocuments.workerAccessCheck(
        input.workerId,
        input.projectId,
      );
      checks.sdsAck = doc.missingSdsAcks === 0;
      if (doc.missingSdsAcks > 0) {
        denialReasons.push('SDS acknowledgment required for chemical zone');
      }
    }

    await this.runModuleGates(
      input.workerId,
      input.projectId,
      denialReasons,
      checks,
    );

    if (input.equipmentId && this.pmEquipment) {
      const eqVal = await this.pmEquipment.validateAssignment({
        workerId: input.workerId,
        equipmentId: input.equipmentId,
        projectId: input.projectId,
      });
      checks.equipment = eqVal.allowed;
      if (!eqVal.allowed) {
        denialReasons.push(...eqVal.failures);
      }
    }

    const workerBanned = await this.prisma.workerSiteAccess.findUnique({
      where: {
        workerId_siteId: {
          workerId: input.workerId,
          siteId: project.siteId ?? 0,
        },
      },
    });
    if (project.siteId && workerBanned?.status === 'BANNED') {
      denialReasons.push('Worker banned from site');
      checks.siteBan = false;
    }

    if (this.pmProjectContext) {
      const profileGate = await this.pmProjectContext.enforcementGate(
        input.projectId,
        checks,
      );
      checks.projectSafetyProfile = profileGate.allowed;
      if (!profileGate.allowed) {
        denialReasons.push(...profileGate.reasons);
      }
    }

    if (this.pmCompanyContext) {
      const companyGate = await this.pmCompanyContext.enforcementGate(
        input.workerId,
        checks,
      );
      checks.companySafetyProfile = companyGate.allowed;
      if (!companyGate.allowed) {
        denialReasons.push(...companyGate.reasons);
      }
    }

    const decided = this.decisionEngine.decide({
      denialReasons,
      checks,
      zoneHighRisk: effectiveRule.highRisk ?? false,
      hasActiveOverride: !!override,
    });

    let attemptId: string | undefined;
    if (input.recordAttempt !== false) {
      const attempt = await this.prisma.pmAccessAttempt.create({
        data: {
          companyId: project.companyId,
          projectId: input.projectId,
          accessPointId: input.accessPointId,
          workerId: input.workerId,
          equipmentId: input.equipmentId,
          zoneCode,
          decision: decided.decision,
          denialReasons: decided.denialReasons as Prisma.InputJsonValue,
          checksJson: decided.checks as Prisma.InputJsonValue,
          overrideId: override?.id,
        },
      });
      attemptId = attempt.id;
      for (const msg of decided.denialReasons) {
        await this.prisma.pmAccessDenial.create({
          data: {
            attemptId: attempt.id,
            reasonCode: msg.slice(0, 40).replace(/\s+/g, '_'),
            reasonMessage: msg,
          },
        });
      }
    }

    return {
      decision: decided.decision,
      granted: decided.decision === 'granted',
      denialReasons: decided.denialReasons,
      checks: decided.checks,
      attemptId,
      overrideId: override?.id,
    };
  }

  private async runModuleGates(
    workerId: number,
    projectId: number,
    denialReasons: string[],
    checks: Record<string, boolean>,
  ) {
    if (this.pmEmergency) {
      const em = await this.pmEmergency.workerAccessCheck(workerId, projectId);
      checks.emergency = em.allowed;
      if (!em.allowed) denialReasons.push(em.reason ?? 'Emergency lock active');
    }

    if (this.sifHeca) {
      const sif = await this.sifHeca.workerAccessCheck(workerId, projectId);
      checks.sif = sif.allowed;
      if (!sif.allowed) {
        denialReasons.push(
          `SIF/HECA: ${sif.openCriticalEvents} events, ${sif.openCorrectiveActions} CAPA`,
        );
      }
    }

    if (this.pmInspections) {
      const insp = await this.pmInspections.workerAccessCheck(
        workerId,
        projectId,
      );
      checks.inspections = insp.allowed;
      if (!insp.allowed) {
        denialReasons.push(
          `Inspections: ${insp.openCriticalDeficiencies} critical, ${insp.overdueEquipmentCount} overdue equipment`,
        );
      }
    }

    if (this.pmSafetyEvents) {
      const ev = await this.pmSafetyEvents.workerAccessCheck(
        workerId,
        projectId,
      );
      checks.safetyEvents = ev.allowed;
      if (!ev.allowed) {
        denialReasons.push(
          `Safety events: ${ev.criticalEventsWithoutClearance} critical without clearance`,
        );
      }
    }

    if (this.pmCapa) {
      const capa = await this.pmCapa.workerAccessCheck(workerId, projectId);
      checks.capa = capa.allowed;
      if (!capa.allowed) {
        denialReasons.push(
          `CAPA: ${capa.criticalOpen} critical open, ${capa.overdueCount} overdue`,
        );
      }
    }

    if (this.pmDocuments) {
      const doc = await this.pmDocuments.workerAccessCheck(workerId, projectId);
      checks.documents = doc.allowed;
      if (!doc.allowed) {
        if (doc.missingPolicyAcks > 0) {
          denialReasons.push(`Policy acks missing: ${doc.missingPolicyAcks}`);
        }
        if (doc.missingSdsAcks > 0) {
          denialReasons.push(`SDS acks missing: ${doc.missingSdsAcks}`);
        }
      }
    }

    if (this.pmEquipment) {
      const eq = await this.pmEquipment.workerAccessCheck(workerId, projectId);
      checks.equipmentFleet = eq.allowed;
      if (!eq.allowed) {
        denialReasons.push(
          `Equipment: ${eq.blockedEquipmentCount} blocked — ${eq.reasons.join(
            '; ',
          )}`,
        );
      }
    }

    const meetings = await this.prisma.siteAccessMeetingRequirement.findMany({
      where: { projectId, active: true },
    });
    for (const req of meetings) {
      const windowStart = new Date(
        Date.now() - req.windowHours * 60 * 60 * 1000,
      );
      const attended = await this.prisma.safetyMeetingAttendee.findFirst({
        where: {
          workerId,
          status: 'present',
          checkedInAt: { gte: windowStart },
          meeting: {
            projectId,
            meetingType: req.meetingType,
            status: { in: ['completed', 'reviewed', 'locked'] },
          },
        },
      });
      checks[`meeting_${req.meetingType}`] = !!attended;
      if (!attended) {
        denialReasons.push(
          `Required ${req.meetingType} meeting not attended (${req.windowHours}h)`,
        );
      }
    }
  }

  private async findActiveOverride(input: {
    projectId: number;
    workerId: number;
    zoneCode: string;
    equipmentId?: number;
  }) {
    const now = new Date();
    return this.prisma.pmAccessOverride.findFirst({
      where: {
        projectId: input.projectId,
        active: true,
        revokedAt: null,
        expiresAt: { gt: now },
        OR: [
          { workerId: input.workerId, zoneCode: null, equipmentId: null },
          { workerId: input.workerId, zoneCode: input.zoneCode },
          ...(input.equipmentId ? [{ equipmentId: input.equipmentId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------- Access points ----------

  listAccessPoints(companyId: number, projectId?: number) {
    return this.prisma.pmAccessPoint.findMany({
      where: { companyId, projectId, deletedAt: null, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async createAccessPoint(
    data: {
      companyId: number;
      projectId?: number;
      siteId?: number;
      pointType: PmAccessPointType;
      name: string;
      zoneCode?: string;
      description?: string;
      geoJson?: Record<string, unknown>;
    },
    actorId?: number,
  ) {
    const point = await this.prisma.pmAccessPoint.create({
      data: {
        ...data,
        geoJson: data.geoJson as Prisma.InputJsonValue | undefined,
      },
    });
    await this.audit('access_point', point.id, 'created', actorId);
    return point;
  }

  // ---------- Zone rules ----------

  listZoneRules(projectId: number) {
    return this.prisma.siteAccessRule.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { zoneCode: 'asc' },
    });
  }

  async upsertZoneRule(
    data: {
      projectId: number;
      zoneCode?: string;
      zoneType?: PmAccessZoneType;
      requiresFlhaHours?: number;
      requiresTrainingCodes?: string[];
      requiresOrientation?: boolean;
      requiresJha?: boolean;
      requiresSdsAck?: boolean;
      requiresPermitIds?: string[];
      requiredPpe?: string[];
      highRisk?: boolean;
      timeWindowStart?: string;
      timeWindowEnd?: string;
      accessPointId?: string;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });
    const zoneCode = data.zoneCode ?? 'SITE';
    const rule = await this.prisma.siteAccessRule.upsert({
      where: {
        projectId_zoneCode: { projectId: data.projectId, zoneCode },
      },
      create: {
        companyId: project?.companyId,
        projectId: data.projectId,
        zoneCode,
        zoneType: data.zoneType ?? 'general_work',
        requiresFlhaHours: data.requiresFlhaHours ?? 24,
        requiresTrainingCodes: (data.requiresTrainingCodes ??
          []) as Prisma.InputJsonValue,
        requiresOrientation: data.requiresOrientation ?? true,
        requiresJha: data.requiresJha ?? false,
        requiresSdsAck: data.requiresSdsAck ?? false,
        requiresPermitIds: (data.requiresPermitIds ??
          []) as Prisma.InputJsonValue,
        requiredPpe: (data.requiredPpe ?? []) as Prisma.InputJsonValue,
        highRisk: data.highRisk ?? false,
        timeWindowStart: data.timeWindowStart,
        timeWindowEnd: data.timeWindowEnd,
        accessPointId: data.accessPointId,
      },
      update: {
        zoneType: data.zoneType,
        requiresFlhaHours: data.requiresFlhaHours,
        requiresTrainingCodes: data.requiresTrainingCodes as
          | Prisma.InputJsonValue
          | undefined,
        requiresOrientation: data.requiresOrientation,
        requiresJha: data.requiresJha,
        requiresSdsAck: data.requiresSdsAck,
        requiresPermitIds: data.requiresPermitIds as
          | Prisma.InputJsonValue
          | undefined,
        requiredPpe: data.requiredPpe as Prisma.InputJsonValue | undefined,
        highRisk: data.highRisk,
        timeWindowStart: data.timeWindowStart,
        timeWindowEnd: data.timeWindowEnd,
        accessPointId: data.accessPointId,
        active: true,
      },
    });
    await this.audit('zone_rule', rule.id, 'upserted', actorId);
    return rule;
  }

  // ---------- Overrides ----------

  async createOverride(
    data: {
      companyId: number;
      projectId: number;
      workerId?: number;
      equipmentId?: number;
      zoneCode?: string;
      overrideType: PmAccessOverrideType;
      reason: string;
      expiresAt: Date;
      supervisorUserId?: number;
      safetyUserId?: number;
      supervisorSignature?: string;
      safetySignature?: string;
      clientSyncId?: string;
      attemptId?: string;
    },
    actorId?: number,
  ) {
    if (!data.reason?.trim()) {
      throw new BadRequestException('Override reason is required');
    }
    const rule = await this.prisma.siteAccessRule.findFirst({
      where: { projectId: data.projectId, highRisk: true },
    });
    if (rule && !data.safetyUserId && !data.safetySignature) {
      throw new BadRequestException(
        'Safety signature required for high-risk zone override',
      );
    }

    const override = await this.prisma.pmAccessOverride.create({
      data: {
        ...data,
        supervisorUserId: data.supervisorUserId ?? actorId,
        clientSyncId: data.clientSyncId,
      },
    });

    if (data.attemptId) {
      await this.prisma.pmAccessAttempt.update({
        where: { id: data.attemptId },
        data: { overrideId: override.id },
      });
    }

    await this.audit('override', override.id, 'created', actorId, {
      reason: data.reason,
      attemptId: data.attemptId,
    });
    return override;
  }

  listOverrides(projectId: number, activeOnly = true) {
    return this.prisma.pmAccessOverride.findMany({
      where: {
        projectId,
        ...(activeOnly ? { active: true, revokedAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async revokeOverride(id: string, actorId?: number) {
    const updated = await this.prisma.pmAccessOverride.update({
      where: { id },
      data: { active: false, revokedAt: new Date() },
    });
    await this.audit('override', id, 'revoked', actorId);
    return updated;
  }

  // ---------- Analytics ----------

  async analytics(projectId: number) {
    const since = new Date(Date.now() - 30 * 86400000);
    const [attempts, denials, overrides, insights] = await Promise.all([
      this.prisma.pmAccessAttempt.count({
        where: { projectId, createdAt: { gte: since } },
      }),
      this.prisma.pmAccessAttempt.count({
        where: {
          projectId,
          decision: { in: ['denied', 'denied_with_reason'] },
          createdAt: { gte: since },
        },
      }),
      this.prisma.pmAccessOverride.count({
        where: { projectId, createdAt: { gte: since } },
      }),
      this.cail.projectInsights(projectId),
    ]);

    const granted = attempts - denials;
    const compliancePct =
      attempts > 0 ? Math.round((granted / attempts) * 100) : 100;

    const zoneDenials = await this.prisma.pmAccessAttempt.groupBy({
      by: ['zoneCode'],
      where: {
        projectId,
        decision: { in: ['denied', 'denied_with_reason'] },
        createdAt: { gte: since },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const workerDenials = await this.prisma.pmAccessAttempt.groupBy({
      by: ['workerId'],
      where: {
        projectId,
        workerId: { not: null },
        decision: { in: ['denied', 'denied_with_reason'] },
        createdAt: { gte: since },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const equipmentDenials = await this.prisma.pmAccessAttempt.count({
      where: {
        projectId,
        equipmentId: { not: null },
        decision: { in: ['denied', 'denied_with_reason'] },
        createdAt: { gte: since },
      },
    });

    const zoneScores = await Promise.all(
      zoneDenials.map(async (z) => {
        const risk = await this.cail.predictZoneRisk(projectId, z.zoneCode);
        return { zoneCode: z.zoneCode, denials: z._count.id, ...risk };
      }),
    );

    return {
      attempts30d: attempts,
      denials30d: denials,
      overrides30d: overrides,
      compliancePct,
      denialRate: attempts > 0 ? denials / attempts : 0,
      overrideRate: attempts > 0 ? overrides / attempts : 0,
      projectAccessScore: compliancePct,
      trends: {
        denialByZone: zoneDenials.map((z) => ({
          zoneCode: z.zoneCode,
          count: z._count.id,
        })),
        topDeniedWorkers: workerDenials.map((w) => ({
          workerId: w.workerId,
          denials: w._count.id,
        })),
        equipmentDenials30d: equipmentDenials,
      },
      zoneComplianceScores: zoneScores,
      workerComplianceScores: workerDenials.map((w) => ({
        workerId: w.workerId,
        complianceScore: Math.max(0, 100 - w._count.id * 10),
      })),
      leadingIndicators: {
        overrideRate: attempts > 0 ? overrides / attempts : 0,
      },
      cailInsights: insights,
    };
  }

  // ---------- Offline sync ----------

  async syncBundle(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const [points, rules, workers, overrides] = await Promise.all([
      this.listAccessPoints(project.companyId, projectId),
      this.listZoneRules(projectId),
      this.prisma.projectAssignment.findMany({
        where: { projectId, endedAt: null },
        include: {
          worker: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.listOverrides(projectId, true),
    ]);

    return {
      syncedAt: new Date().toISOString(),
      projectId,
      accessPoints: points,
      zoneRules: rules,
      roster: workers,
      activeOverrides: overrides,
    };
  }

  async stationValidate(input: {
    workerId: number;
    projectId: number;
    zoneCode?: string;
    equipmentId?: number;
  }) {
    return this.validateAccess({
      ...input,
      recordAttempt: true,
    });
  }

  mapSpecResult(
    decision: PmAccessDecision,
  ): 'granted' | 'denied' | 'override_required' {
    if (decision === 'granted') return 'granted';
    if (
      decision === 'requires_supervisor_override' ||
      decision === 'requires_safety_override'
    ) {
      return 'override_required';
    }
    return 'denied';
  }

  mapWorkflowState(
    decision: PmAccessDecision,
    hasActiveOverride: boolean,
    overrideExpired?: boolean,
  ):
    | 'access_granted'
    | 'access_denied'
    | 'override_required'
    | 'override_approved'
    | 'override_expired' {
    if (overrideExpired) return 'override_expired';
    if (hasActiveOverride && decision === 'granted') return 'override_approved';
    if (
      decision === 'requires_supervisor_override' ||
      decision === 'requires_safety_override'
    ) {
      return 'override_required';
    }
    if (decision === 'granted') return 'access_granted';
    return 'access_denied';
  }

  async getWorkerAccessProfile(workerId: number, projectId: number) {
    const since = new Date(Date.now() - 30 * 86400000);
    const [worker, attempts, requirements, cail] = await Promise.all([
      this.prisma.worker.findUnique({
        where: { id: workerId },
        select: { id: true, firstName: true, lastName: true, companyId: true },
      }),
      this.prisma.pmAccessAttempt.findMany({
        where: { workerId, projectId, createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: { denials: true },
      }),
      this.prisma.pmWorkerAccessRequirement.findMany({
        where: { workerId, OR: [{ projectId }, { projectId: null }] },
      }),
      this.cail.predictAccessDenial(workerId, projectId),
    ]);

    if (!worker) throw new NotFoundException('Worker not found');

    const denials = attempts.filter((a) =>
      ['denied', 'denied_with_reason'].includes(a.decision),
    ).length;
    const granted = attempts.length - denials;
    const complianceScore =
      attempts.length > 0 ? Math.round((granted / attempts.length) * 100) : 100;

    const activeOverride = await this.findActiveOverride({
      projectId,
      workerId,
      zoneCode: 'SITE',
    });

    return {
      workerId,
      projectId,
      worker,
      complianceScore,
      attempts30d: attempts.length,
      denials30d: denials,
      workflowState: activeOverride
        ? 'override_approved'
        : attempts[0]
        ? this.mapWorkflowState(attempts[0].decision, false)
        : 'access_granted',
      recentAttempts: attempts.map((a) => ({
        id: a.id,
        timestamp: a.createdAt,
        result: this.mapSpecResult(a.decision),
        reason: (a.denialReasons as string[])[0] ?? null,
        zoneCode: a.zoneCode,
      })),
      requirements,
      cail,
    };
  }

  async getEquipmentAccessProfile(equipmentId: number, projectId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        pmEquipmentAccessRequirements: true,
        pmFailures: {
          where: {
            status: {
              in: [
                'reported',
                'supervisor_review',
                'owner_review',
                'locked_out',
                'capa_open',
              ],
            },
          },
          take: 5,
        },
      },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const since = new Date(Date.now() - 30 * 86400000);
    const attempts = await this.prisma.pmAccessAttempt.findMany({
      where: { equipmentId, projectId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const score = this.pmEquipment
      ? await this.pmEquipment.getEquipmentScore(equipmentId, projectId)
      : null;

    const cail = await this.cail.predictEquipmentRisk(equipmentId, projectId);
    const unsafe =
      equipment.operationalStatus === 'out_of_service' ||
      equipment.operationalStatus === 'locked_out' ||
      equipment.lockoutStatus === 'LOCKED_OUT' ||
      equipment.pmFailures.length > 0;

    const denialReasons: string[] = [];
    if (unsafe) {
      if (equipment.operationalStatus === 'out_of_service') {
        denialReasons.push('Equipment out of service');
      }
      if (
        equipment.lockoutStatus === 'LOCKED_OUT' ||
        equipment.operationalStatus === 'locked_out'
      ) {
        denialReasons.push('Equipment under lockout');
      }
      if (equipment.pmFailures.length > 0) {
        denialReasons.push(`${equipment.pmFailures.length} open failure(s)`);
      }
    }

    return {
      equipmentId,
      projectId,
      equipment: {
        id: equipment.id,
        name: equipment.name,
        operationalStatus: equipment.operationalStatus,
        lockoutStatus: equipment.lockoutStatus,
      },
      accessAllowed: !unsafe,
      equipmentScore: score,
      denialReasons,
      requirements: equipment.pmEquipmentAccessRequirements,
      recentAttempts: attempts.map((a) => ({
        id: a.id,
        timestamp: a.createdAt,
        result: this.mapSpecResult(a.decision),
        workerId: a.workerId,
      })),
      cail,
    };
  }

  async applyOfflineSync(
    projectId: number,
    payload: {
      attempts?: Array<{
        workerId: number;
        zoneCode?: string;
        equipmentId?: number;
        accessPointId?: string;
        decision: PmAccessDecision;
        denialReasons?: string[];
        checksJson?: Record<string, boolean>;
        clientSyncId?: string;
        createdAt?: string;
      }>;
      overrides?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const counts = { attempts: 0, overrides: 0 };

    for (const row of payload.attempts ?? []) {
      if (row.clientSyncId) {
        const exists = await this.prisma.pmAccessAttempt.findUnique({
          where: { clientSyncId: row.clientSyncId },
        });
        if (exists) continue;
      }

      const attempt = await this.prisma.pmAccessAttempt.create({
        data: {
          companyId: project.companyId,
          projectId,
          workerId: row.workerId,
          equipmentId: row.equipmentId,
          accessPointId: row.accessPointId,
          zoneCode: row.zoneCode ?? 'SITE',
          decision: row.decision,
          denialReasons: (row.denialReasons ?? []) as Prisma.InputJsonValue,
          checksJson: (row.checksJson ?? {}) as Prisma.InputJsonValue,
          clientSyncId: row.clientSyncId,
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
        },
      });

      for (const msg of row.denialReasons ?? []) {
        await this.prisma.pmAccessDenial.create({
          data: {
            attemptId: attempt.id,
            reasonCode: msg.slice(0, 40).replace(/\s+/g, '_'),
            reasonMessage: msg,
          },
        });
      }
      counts.attempts++;
    }

    for (const o of payload.overrides ?? []) {
      const clientSyncId = o.clientSyncId as string | undefined;
      if (clientSyncId) {
        const exists = await this.prisma.pmAccessOverride.findUnique({
          where: { clientSyncId },
        });
        if (exists) continue;
      }
      await this.createOverride(
        {
          companyId: project.companyId,
          projectId,
          workerId: o.workerId as number | undefined,
          equipmentId: o.equipmentId as number | undefined,
          zoneCode: o.zoneCode as string | undefined,
          overrideType: (o.overrideType as PmAccessOverrideType) ?? 'temporary',
          reason: (o.reason as string) ?? 'Offline override',
          expiresAt: new Date((o.expiresAt as string) ?? Date.now() + 86400000),
          clientSyncId,
        },
        actorId,
      );
      counts.overrides++;
    }

    await this.audit(
      'offline_sync',
      String(projectId),
      'applied',
      actorId,
      counts,
    );
    return { projectId, ...counts, syncedAt: new Date().toISOString() };
  }
}
