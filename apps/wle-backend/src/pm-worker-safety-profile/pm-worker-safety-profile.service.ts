import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmWorkerAuthorizationType,
  PmWorkerMedicalRestrictionType,
  PmWorkerSafetyOverrideType,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PmCompanySafetyContextService } from '../pm-company-safety-context/pm-company-safety-context.service';
import { PmProjectSafetyContextService } from '../pm-project-safety-context/pm-project-safety-context.service';
import { PmSiteAccessControlService } from '../pm-site-access-control/pm-site-access-control.service';
import { WorkerScoringEngine } from './worker-scoring.engine';
import { WorkerEnforcementEngine } from './worker-enforcement.engine';
import { WorkerTrainingEngine } from './worker-training.engine';
import { PmWorkerSafetyCailIntelligenceService } from './pm-worker-safety-cail-intelligence.service';

@Injectable()
export class PmWorkerSafetyProfileService {
  private readonly scoringEngine = new WorkerScoringEngine();
  private readonly enforcementEngine = new WorkerEnforcementEngine();
  private readonly trainingEngine: WorkerTrainingEngine;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmWorkerSafetyCailIntelligenceService,
    @Optional() private readonly companyContext?: PmCompanySafetyContextService,
    @Optional() private readonly projectContext?: PmProjectSafetyContextService,
    @Optional() private readonly siteAccess?: PmSiteAccessControlService,
  ) {
    this.trainingEngine = new WorkerTrainingEngine(prisma);
  }

  private async audit(
    workerId: number,
    entityType: string,
    entityId: string,
    eventType: string,
    profileId?: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmWorkerSafetyAuditLog.create({
      data: {
        workerId,
        profileId,
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async updateWorkerIdentity(
    workerId: number,
    data: { roleType?: string; tradeCode?: string },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    const updated = await this.prisma.pmWorkerSafetyProfile.update({
      where: { id: profile.id },
      data: { roleType: data.roleType, tradeCode: data.tradeCode },
    });
    await this.audit(
      workerId,
      'profile',
      profile.id,
      'updated',
      profile.id,
      actorId,
    );
    return updated;
  }

  async getOrCreateProfile(workerId: number) {
    const existing = await this.prisma.pmWorkerSafetyProfile.findUnique({
      where: { workerId },
    });
    if (existing) return existing;

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return this.prisma.pmWorkerSafetyProfile.create({
      data: {
        id: randomUUID(),
        workerId,
        companyId: worker.companyId,
        status: 'draft',
      },
    });
  }

  async rebuildProfile(workerId: number, projectId?: number, actorId?: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: { projectAssignments: { where: { status: 'ACTIVE' } } },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const profile = await this.getOrCreateProfile(workerId);
    await this.trainingEngine.syncFromRecords(workerId, profile.id);
    await this.syncAuthorizations(workerId, profile.id);
    await this.syncHazardExposure(workerId, profile.id, projectId);
    await this.syncIncidentHistory(workerId, profile.id, projectId);
    await this.syncCorrectiveActions(workerId, profile.id);
    await this.syncAccessLogs(workerId, profile.id, projectId);

    const scoreResult = await this.recalculateScore(workerId, projectId);
    const updated = await this.prisma.pmWorkerSafetyProfile.update({
      where: { id: profile.id },
      data: {
        safetyScore: scoreResult.score,
        riskLevel: scoreResult.riskLevel,
        scoreFactorsJson: scoreResult.factors as Prisma.InputJsonValue,
        requiredActionsJson:
          scoreResult.requiredActions as Prisma.InputJsonValue,
        requiresSupervisorReview: scoreResult.requiresSupervisorReview,
        status: 'published',
        version: { increment: 1 },
      },
    });

    await this.prisma.pmWorkerSafetyScore.create({
      data: {
        workerId,
        profileId: profile.id,
        score: scoreResult.score,
        riskLevel: scoreResult.riskLevel,
        factorsJson: scoreResult.factors as Prisma.InputJsonValue,
      },
    });

    await this.audit(
      workerId,
      'profile',
      profile.id,
      'rebuilt',
      profile.id,
      actorId,
      {
        score: scoreResult.score,
      },
    );
    return { profile: updated, score: scoreResult };
  }

  async getFullProfile(workerId: number, projectId?: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        email: true,
        qrToken: true,
        projectAssignments: {
          where: { status: 'ACTIVE' },
          include: { project: { select: { id: true, name: true } } },
        },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
      where: { workerId },
      include: {
        trainingSnapshots: { take: 50, orderBy: { updatedAt: 'desc' } },
        competencies: true,
        authorizations: { where: { active: true } },
        medicalRestrictions: { where: { active: true } },
        hazardExposures: { take: 30, orderBy: { exposedAt: 'desc' } },
        incidentHistory: { take: 20, orderBy: { occurredAt: 'desc' } },
        correctiveActionLinks: {
          where: { status: { in: ['open', 'overdue'] } },
        },
        accessLogs: { take: 30, orderBy: { createdAt: 'desc' } },
        overrides: { where: { active: true } },
        scoreHistory: { take: 12, orderBy: { computedAt: 'desc' } },
      },
    });

    let accessEvaluation: Record<string, unknown> | null = null;
    if (projectId && this.siteAccess) {
      const r = await this.siteAccess.validateAccess({
        workerId,
        projectId,
        recordAttempt: false,
      });
      accessEvaluation = r as unknown as Record<string, unknown>;
    }

    const cailInsights = await this.cail.workerInsights(workerId, projectId);

    return {
      identity: {
        workerId: worker.id,
        name: `${worker.firstName} ${worker.lastName}`,
        companyId: worker.companyId,
        email: worker.email,
        qrToken: worker.qrToken,
        projects: worker.projectAssignments.map((a) => a.project),
      },
      profile,
      accessEvaluation,
      cailInsights,
      integrations: {
        companyContext: !!this.companyContext,
        projectContext: !!this.projectContext,
        siteAccess: !!this.siteAccess,
      },
    };
  }

  async recalculateScore(workerId: number, projectId?: number) {
    const since30 = new Date(Date.now() - 30 * 86400000);
    const since12m = new Date(Date.now() - 365 * 86400000);

    const training = await this.prisma.pmWorkerSafetyTraining.findMany({
      where: { workerId },
    });
    const expiredTraining = training.filter(
      (t) => t.status === 'expired',
    ).length;

    let missingTraining = 0;
    if (
      this.companyContext &&
      (await this.prisma.worker.findUnique({ where: { id: workerId } }))
        ?.companyId
    ) {
      const check = await this.companyContext.workerTrainingCheck(workerId);
      missingTraining = check.missing.length;
    }

    const capaLinks = await this.prisma.pmWorkerCorrectiveActionLink.findMany({
      where: { workerId },
    });
    const openCapa = capaLinks.filter((c) => c.status === 'open').length;
    const overdueCapa = capaLinks.filter(
      (c) => c.status === 'overdue' || (c.dueAt && c.dueAt < new Date()),
    ).length;
    const sifCapa = capaLinks.filter(
      (c) => c.sifLinked && c.status !== 'closed',
    ).length;

    const incidentCount12m = await this.prisma.pmWorkerIncidentHistory.count({
      where: { workerId, occurredAt: { gte: since12m } },
    });

    const hazardExposureHigh = await this.prisma.pmWorkerHazardExposure.count({
      where: { workerId, severity: { gte: 4 }, exposedAt: { gte: since12m } },
    });

    const accessDenials30d = await this.prisma.pmWorkerAccessLog.count({
      where: {
        workerId,
        granted: false,
        createdAt: { gte: since30 },
        ...(projectId ? { projectId } : {}),
      },
    });
    const accessAttempts30d = await this.prisma.pmWorkerAccessLog.count({
      where: {
        workerId,
        createdAt: { gte: since30 },
        ...(projectId ? { projectId } : {}),
      },
    });

    const expiredAuths = await this.prisma.pmWorkerSafetyAuthorization.count({
      where: {
        workerId,
        active: true,
        expiresAt: { lt: new Date() },
      },
    });

    const activeMedicalBlocks =
      await this.prisma.pmWorkerMedicalRestriction.count({
        where: {
          workerId,
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          blocksHighRisk: true,
        },
      });

    const missingSdsAck = 0;
    let missingPolicyAck = 0;
    if (this.companyContext) {
      const policies = await this.companyContext.policyAckCheck(workerId);
      missingPolicyAck = policies.missing;
    }

    const staleFlha = projectId
      ? !(await this.prisma.jhaFlha.findFirst({
          where: {
            projectId,
            kind: 'FLHA',
            workers: { some: { workerId } },
            OR: [
              { submittedAt: { gte: new Date(Date.now() - 24 * 3600000) } },
              { approvedAt: { gte: new Date(Date.now() - 24 * 3600000) } },
            ],
          },
        }))
      : false;

    const meetingReq = projectId
      ? await this.prisma.safetyMeetingAttendee.count({
          where: {
            workerId,
            meeting: { projectId, status: { in: ['completed', 'reviewed'] } },
          },
        })
      : 1;
    const poorMeetingAttendance = projectId ? meetingReq === 0 : false;

    return this.scoringEngine.compute({
      expiredTraining,
      missingTraining,
      openCapa,
      overdueCapa,
      sifCapa,
      incidentCount12m,
      hazardExposureHigh,
      accessDenials30d,
      accessAttempts30d,
      expiredAuths,
      activeMedicalBlocks,
      missingSdsAck,
      missingPolicyAck,
      staleFlha,
      poorMeetingAttendance,
    });
  }

  private async syncAuthorizations(workerId: number, profileId: string) {
    const auths = await this.prisma.pmWorkerEquipmentAuthorization.findMany({
      where: { workerId, active: true },
    });
    for (const a of auths) {
      const authType = a.authType as PmWorkerAuthorizationType;
      const existing = await this.prisma.pmWorkerSafetyAuthorization.findFirst({
        where: { workerId, legacyAuthId: a.id },
      });
      if (!existing) {
        await this.prisma.pmWorkerSafetyAuthorization.create({
          data: {
            workerId,
            profileId,
            companyId: a.companyId,
            authType,
            equipmentId: a.equipmentId,
            issuedAt: a.issuedAt,
            expiresAt: a.expiresAt,
            legacyAuthId: a.id,
            active: a.active,
          },
        });
      }
    }
  }

  private async syncHazardExposure(
    workerId: number,
    profileId: string,
    projectId?: number,
  ) {
    const jhaWorkers = await this.prisma.jhaFlhaWorker.findMany({
      where: { workerId, ...(projectId ? { jhaFlha: { projectId } } : {}) },
      include: { jhaFlha: { include: { hazards: true } } },
      take: 20,
    });
    for (const jw of jhaWorkers) {
      for (const h of jw.jhaFlha.hazards) {
        const dup = await this.prisma.pmWorkerHazardExposure.findFirst({
          where: { workerId, sourceType: 'jha_flha', sourceId: h.id },
        });
        if (!dup) {
          await this.prisma.pmWorkerHazardExposure.create({
            data: {
              workerId,
              profileId,
              projectId: jw.jhaFlha.projectId,
              sourceType: 'jha_flha',
              sourceId: h.id,
              hazardType: h.category ?? 'energy',
              severity: h.severity,
              likelihood: h.likelihood,
              sifPotential: h.sifIndicator,
              exposedAt: jw.jhaFlha.submittedAt ?? new Date(),
            },
          });
        }
      }
    }
  }

  private async syncIncidentHistory(
    workerId: number,
    profileId: string,
    projectId?: number,
  ) {
    const events = await this.prisma.pmSafetyEventPerson.findMany({
      where: {
        workerId,
        ...(projectId ? { event: { projectId } } : {}),
      },
      include: { event: true },
      take: 50,
    });
    for (const p of events) {
      const dup = await this.prisma.pmWorkerIncidentHistory.findFirst({
        where: { workerId, sourceId: p.eventId },
      });
      if (!dup && p.event) {
        await this.prisma.pmWorkerIncidentHistory.create({
          data: {
            workerId,
            profileId,
            projectId: p.event.projectId,
            eventType: p.event.eventType,
            sourceId: p.event.id,
            title: p.event.title,
            severity: p.event.severity,
            occurredAt: p.event.occurredAt,
          },
        });
      }
    }
  }

  private async syncCorrectiveActions(workerId: number, profileId: string) {
    const capas = await this.prisma.pmCorrectiveAction.findMany({
      where: {
        workerId,
        status: { notIn: ['closed', 'cancelled', 'verified'] },
      },
      take: 50,
    });
    for (const c of capas) {
      const dup = await this.prisma.pmWorkerCorrectiveActionLink.findFirst({
        where: { workerId, capaId: c.id },
      });
      if (!dup) {
        await this.prisma.pmWorkerCorrectiveActionLink.create({
          data: {
            workerId,
            profileId,
            capaId: c.id,
            status: c.dueAt && c.dueAt < new Date() ? 'overdue' : 'open',
            dueAt: c.dueAt,
            sifLinked:
              c.sourceModule === 'sif_heca' || c.sourceModule === 'sif',
          },
        });
      }
    }
  }

  private async syncAccessLogs(
    workerId: number,
    profileId: string,
    projectId?: number,
  ) {
    const attempts = await this.prisma.pmAccessAttempt.findMany({
      where: {
        workerId,
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    for (const a of attempts) {
      const dup = await this.prisma.pmWorkerAccessLog.findFirst({
        where: { sourceAttemptId: a.id },
      });
      if (!dup) {
        await this.prisma.pmWorkerAccessLog.create({
          data: {
            workerId,
            profileId,
            projectId: a.projectId,
            zoneCode: a.zoneCode,
            equipmentId: a.equipmentId,
            granted: a.decision === 'granted',
            decision: a.decision,
            denialReasons: a.denialReasons as Prisma.InputJsonValue,
            sourceAttemptId: a.id,
            createdAt: a.createdAt,
          },
        });
      }
    }
  }

  async recordAccessFromValidation(
    workerId: number,
    projectId: number,
    result: {
      granted: boolean;
      decision?: string;
      denialReasons?: string[];
      attemptId?: string;
      zoneCode?: string;
      equipmentId?: number;
    },
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    await this.prisma.pmWorkerAccessLog.create({
      data: {
        workerId,
        profileId: profile.id,
        projectId,
        zoneCode: result.zoneCode,
        equipmentId: result.equipmentId,
        granted: result.granted,
        decision: result.decision,
        denialReasons: (result.denialReasons ?? []) as Prisma.InputJsonValue,
        sourceAttemptId: result.attemptId,
      },
    });
  }

  async addMedicalRestriction(
    workerId: number,
    data: {
      restrictionType: PmWorkerMedicalRestrictionType;
      description: string;
      blocksHighRisk?: boolean;
      blocksConfinedSpace?: boolean;
      blocksHotWork?: boolean;
      blocksEquipment?: boolean;
      expiresAt?: string;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    const row = await this.prisma.pmWorkerMedicalRestriction.create({
      data: {
        workerId,
        profileId: profile.id,
        restrictionType: data.restrictionType,
        description: data.description,
        blocksHighRisk: data.blocksHighRisk ?? false,
        blocksConfinedSpace: data.blocksConfinedSpace ?? false,
        blocksHotWork: data.blocksHotWork ?? false,
        blocksEquipment: data.blocksEquipment ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    await this.audit(
      workerId,
      'medical',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    await this.rebuildProfile(workerId, undefined, actorId);
    return row;
  }

  async listMedicalRestrictions(workerId: number) {
    return this.prisma.pmWorkerMedicalRestriction.findMany({
      where: { workerId, active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listTraining(workerId: number) {
    return this.prisma.pmWorkerSafetyTraining.findMany({
      where: { workerId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listOverrides(workerId: number) {
    return this.prisma.pmWorkerSafetyOverride.findMany({
      where: { workerId, active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listHazardExposure(workerId: number, limit = 50) {
    return this.prisma.pmWorkerHazardExposure.findMany({
      where: { workerId },
      orderBy: { exposedAt: 'desc' },
      take: limit,
    });
  }

  async listAuthorizations(workerId: number) {
    return this.prisma.pmWorkerSafetyAuthorization.findMany({
      where: { workerId, active: true },
    });
  }

  getMedicalBlocks(
    restrictions: Array<{
      blocksHighRisk: boolean;
      blocksConfinedSpace: boolean;
      blocksHotWork: boolean;
      blocksEquipment: boolean;
      active: boolean;
      expiresAt: Date | null;
    }>,
    zoneType?: string,
    equipmentAccess?: boolean,
  ): string[] {
    const now = new Date();
    const active = restrictions.filter(
      (r) => r.active && (!r.expiresAt || r.expiresAt > now),
    );
    const blocks: string[] = [];
    if (equipmentAccess && active.some((r) => r.blocksEquipment)) {
      blocks.push('equipment_operation');
    }
    if (zoneType === 'high_risk' && active.some((r) => r.blocksHighRisk)) {
      blocks.push('high_risk_zone');
    }
    if (
      zoneType === 'confined_space' &&
      active.some((r) => r.blocksConfinedSpace)
    ) {
      blocks.push('confined_space');
    }
    if (zoneType === 'hot_work' && active.some((r) => r.blocksHotWork)) {
      blocks.push('hot_work');
    }
    return blocks;
  }

  async createOverride(
    workerId: number,
    data: {
      overrideType: PmWorkerSafetyOverrideType;
      ruleKey: string;
      reason: string;
      expiresAt: string;
      projectId?: number;
      supervisorSig?: string;
      safetySig?: string;
    },
    actorId?: number,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    const profile = await this.getOrCreateProfile(workerId);

    if (!data.reason?.trim()) throw new BadRequestException('Reason required');
    if (!data.expiresAt) throw new BadRequestException('Expiry required');

    const highRisk =
      data.overrideType === 'medical' || data.ruleKey.includes('SIF');
    if (highRisk && !data.safetySig) {
      throw new BadRequestException('Safety signature required');
    }

    const row = await this.prisma.pmWorkerSafetyOverride.create({
      data: {
        workerId,
        profileId: profile.id,
        companyId: worker.companyId,
        projectId: data.projectId,
        overrideType: data.overrideType,
        ruleKey: data.ruleKey,
        reason: data.reason,
        expiresAt: new Date(data.expiresAt),
        supervisorSig: data.supervisorSig,
        safetySig: data.safetySig,
        approvedById: actorId,
      },
    });
    await this.audit(
      workerId,
      'override',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async enforcementGate(
    workerId: number,
    projectId: number,
    zoneCode?: string,
    equipmentId?: number,
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    const restrictions = await this.listMedicalRestrictions(workerId);
    const rule = await this.prisma.siteAccessRule.findUnique({
      where: {
        projectId_zoneCode: { projectId, zoneCode: zoneCode ?? 'SITE' },
      },
    });
    const medicalBlocks = this.getMedicalBlocks(
      restrictions,
      rule?.zoneType,
      !!equipmentId,
    );

    const overrides = await this.prisma.pmWorkerSafetyOverride.findMany({
      where: {
        workerId,
        active: true,
        expiresAt: { gt: new Date() },
        OR: [{ projectId: null }, { projectId }],
      },
    });

    const trainingRows = await this.prisma.pmWorkerSafetyTraining.findMany({
      where: { workerId, required: true },
    });
    const trainingOk =
      trainingRows.length === 0 ||
      trainingRows.every((t) => t.status === 'valid');

    const openCapa = await this.prisma.pmWorkerCorrectiveActionLink.count({
      where: { workerId, status: { in: ['open', 'overdue'] } },
    });

    let policyAck = true;
    let companyTraining = true;
    if (this.companyContext) {
      const p = await this.companyContext.policyAckCheck(workerId);
      policyAck = p.satisfied;
      const t = await this.companyContext.workerTrainingCheck(workerId);
      companyTraining = t.complete;
    }

    let siteChecks: Record<string, boolean> = {};
    if (this.siteAccess) {
      const r = await this.siteAccess.validateAccess({
        workerId,
        projectId,
        zoneCode,
        equipmentId,
        recordAttempt: true,
      });
      siteChecks = r.checks;
      await this.recordAccessFromValidation(workerId, projectId, {
        granted: r.granted,
        decision: r.decision,
        denialReasons: r.denialReasons,
        attemptId: r.attemptId,
        zoneCode,
        equipmentId,
      });
    }

    const authOk =
      !equipmentId ||
      (await this.prisma.pmWorkerSafetyAuthorization.count({
        where: {
          workerId,
          active: true,
          OR: [{ equipmentId }, { equipmentId: null }],
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          ],
        },
      })) > 0;

    const checks: Record<string, boolean> = {
      ...siteChecks,
      training: trainingOk && companyTraining && siteChecks.training !== false,
      equipmentAuth: authOk && siteChecks.equipment !== false,
      capa: openCapa === 0 && siteChecks.capa !== false,
      policyAck,
      sdsAck: siteChecks.sdsAck !== false,
      jha: siteChecks.flha !== false && siteChecks.jha !== false,
    };

    const company = await this.prisma.pmCompanySafetyProfile.findUnique({
      where: {
        companyId:
          (
            await this.prisma.worker.findUnique({ where: { id: workerId } })
          )?.companyId ?? 0,
      },
    });

    const result = this.enforcementEngine.evaluate({
      checks,
      medicalBlocks,
      activeOverrides: overrides.map((o) => ({
        overrideType: o.overrideType,
        ruleKey: o.ruleKey,
      })),
      corporateRiskLevel: company?.corporateRiskLevel,
    });

    return { ...result, profileScore: profile.safetyScore, checks };
  }

  async buildOfflineBundle(workerId: number) {
    const full = await this.getFullProfile(workerId);
    const bundle = { ...full, syncedAt: new Date().toISOString() };

    await this.prisma.pmWorkerSafetyOfflineCache.upsert({
      where: { workerId_cacheKey: { workerId, cacheKey: 'full_profile' } },
      create: {
        id: randomUUID(),
        workerId,
        cacheKey: 'full_profile',
        payload: bundle as unknown as Prisma.InputJsonValue,
      },
      update: {
        payload: bundle as unknown as Prisma.InputJsonValue,
        cacheVersion: { increment: 1 },
        syncedAt: new Date(),
      },
    });
    return bundle;
  }

  mapComplianceState(input: {
    allowed: boolean;
    violations: string[];
    waived: string[];
    activeOverrides: number;
    medicalBlocks: string[];
    requiresSupervisorReview?: boolean;
  }):
    | 'compliant'
    | 'non_compliant'
    | 'restricted'
    | 'override_required'
    | 'override_approved' {
    if (input.medicalBlocks.length > 0 && input.waived.length === 0) {
      return 'restricted';
    }
    if (input.activeOverrides > 0 && input.allowed) {
      return 'override_approved';
    }
    if (!input.allowed && input.violations.length > 0) {
      return input.requiresSupervisorReview
        ? 'override_required'
        : 'non_compliant';
    }
    if (input.allowed && input.violations.length === 0) {
      return 'compliant';
    }
    return input.allowed ? 'compliant' : 'non_compliant';
  }

  async validateCompliance(workerId: number, projectId?: number) {
    const errors: string[] = [];
    const training = await this.prisma.pmWorkerSafetyTraining.findMany({
      where: { workerId, required: true },
    });
    const expiredTraining = training.filter((t) => t.status === 'expired');
    if (expiredTraining.length > 0) {
      errors.push(
        `${expiredTraining.length} required training record(s) expired`,
      );
    }

    const expiredAuths = await this.prisma.pmWorkerSafetyAuthorization.count({
      where: { workerId, active: true, expiresAt: { lt: new Date() } },
    });
    if (expiredAuths > 0) {
      errors.push(`${expiredAuths} equipment authorization(s) expired`);
    }

    const activeMedical = await this.prisma.pmWorkerMedicalRestriction.count({
      where: {
        workerId,
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    const openCapa = await this.prisma.pmWorkerCorrectiveActionLink.count({
      where: { workerId, status: { in: ['open', 'overdue'] } },
    });
    if (openCapa > 0) {
      errors.push(`${openCapa} open corrective action(s)`);
    }

    let gate: Record<string, unknown> | null = null;
    if (projectId) {
      gate = await this.enforcementGate(workerId, projectId);
    }

    return {
      valid: errors.length === 0 && gate?.allowed !== false,
      errors,
      activeMedicalRestrictions: activeMedical,
      enforcement: gate,
    };
  }

  async getWorkerSafetyScore(workerId: number, projectId?: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { id: true, firstName: true, lastName: true, companyId: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const scoreResult = await this.recalculateScore(workerId, projectId);
    const profile = await this.getOrCreateProfile(workerId);

    const updated = await this.prisma.pmWorkerSafetyProfile.update({
      where: { id: profile.id },
      data: {
        safetyScore: scoreResult.score,
        riskLevel: scoreResult.riskLevel,
        scoreFactorsJson: scoreResult.factors as Prisma.InputJsonValue,
        requiredActionsJson:
          scoreResult.requiredActions as Prisma.InputJsonValue,
        requiresSupervisorReview: scoreResult.requiresSupervisorReview,
      },
    });

    await this.prisma.pmWorkerSafetyScore.create({
      data: {
        workerId,
        profileId: profile.id,
        score: scoreResult.score,
        riskLevel: scoreResult.riskLevel,
        factorsJson: scoreResult.factors as Prisma.InputJsonValue,
      },
    });

    const exposures = await this.prisma.pmWorkerHazardExposure.findMany({
      where: { workerId },
      select: { sifPotential: true, severity: true, exposedAt: true },
      take: 100,
    });
    const since30 = new Date(Date.now() - 30 * 86400000);
    const denials = await this.prisma.pmWorkerAccessLog.count({
      where: { workerId, granted: false, createdAt: { gte: since30 } },
    });
    const openCapa = await this.prisma.pmWorkerCorrectiveActionLink.count({
      where: { workerId, status: { in: ['open', 'overdue'] } },
    });
    const overdueCapa = await this.prisma.pmWorkerCorrectiveActionLink.count({
      where: { workerId, status: 'overdue' },
    });

    const chronic = this.cail.chronicHazardExposure(exposures);
    const [trainingNeeds, authNeeds, forecast] = await Promise.all([
      this.cail.predictTrainingNeeds(workerId),
      this.cail.predictAuthorizationNeeds(workerId),
      this.cail.predictIncidentLikelihood(
        scoreResult.score,
        exposures.filter((e) => e.sifPotential && e.exposedAt >= since30)
          .length,
        denials,
      ),
    ]);

    const overrides = await this.listOverrides(workerId);
    const complianceState = this.mapComplianceState({
      allowed: scoreResult.score >= 60 && openCapa === 0,
      violations: scoreResult.requiredActions as string[],
      waived: [],
      activeOverrides: overrides.length,
      medicalBlocks: [],
      requiresSupervisorReview: scoreResult.requiresSupervisorReview,
    });

    return {
      workerId,
      workerName: `${worker.firstName} ${worker.lastName}`,
      score: scoreResult.score,
      maxScore: 100,
      riskLevel: scoreResult.riskLevel,
      complianceState,
      factors: scoreResult.factors,
      requiredActions: scoreResult.requiredActions,
      chronicHazardExposure: chronic,
      trainingNeeds,
      authorizationNeeds: authNeeds,
      weakControlSignals: this.cail.weakControlSignals(
        openCapa,
        overdueCapa,
        denials,
      ),
      incidentForecast: forecast,
      profile: updated,
      computedAt: new Date().toISOString(),
    };
  }

  async upsertTrainingSnapshot(
    workerId: number,
    data: {
      trainingCode: string;
      courseName: string;
      completedAt?: string;
      expiresAt?: string;
      competencyLevel?: number;
      certificatePath?: string;
      required?: boolean;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    const now = new Date();
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    const status = expiresAt && expiresAt < now ? 'expired' : 'valid';

    const existing = await this.prisma.pmWorkerSafetyTraining.findFirst({
      where: { workerId, trainingCode: data.trainingCode },
    });
    const row = existing
      ? await this.prisma.pmWorkerSafetyTraining.update({
          where: { id: existing.id },
          data: {
            courseName: data.courseName,
            completedAt: data.completedAt
              ? new Date(data.completedAt)
              : undefined,
            expiresAt,
            competencyLevel: data.competencyLevel,
            status,
          },
        })
      : await this.prisma.pmWorkerSafetyTraining.create({
          data: {
            workerId,
            profileId: profile.id,
            trainingCode: data.trainingCode,
            courseName: data.courseName,
            completedAt: data.completedAt ? new Date(data.completedAt) : now,
            expiresAt,
            competencyLevel: data.competencyLevel ?? 1,
            required: data.required ?? true,
            status,
            sourceType: 'manual',
          },
        });

    await this.audit(
      workerId,
      'training',
      row.id,
      'upserted',
      profile.id,
      actorId,
    );
    return row;
  }

  async upsertAuthorization(
    workerId: number,
    data: {
      authType: PmWorkerAuthorizationType;
      equipmentId?: number;
      issuedAt?: string;
      expiresAt?: string;
      requiredTraining?: unknown[];
    },
    actorId?: number,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    const profile = await this.getOrCreateProfile(workerId);

    const row = await this.prisma.pmWorkerSafetyAuthorization.create({
      data: {
        workerId,
        profileId: profile.id,
        companyId: worker.companyId,
        authType: data.authType,
        equipmentId: data.equipmentId,
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        requiredTraining: (data.requiredTraining ??
          []) as Prisma.InputJsonValue,
        active: true,
      },
    });
    await this.audit(
      workerId,
      'authorization',
      row.id,
      'created',
      profile.id,
      actorId,
    );
    return row;
  }

  async recordHazardExposure(
    workerId: number,
    data: {
      hazardType: string;
      severity?: number;
      likelihood?: number;
      sifPotential?: boolean;
      projectId?: number;
      sourceType?: import('@prisma/client').PmWorkerHazardExposureSource;
      sourceId?: string;
      exposureDate?: string;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    const row = await this.prisma.pmWorkerHazardExposure.create({
      data: {
        workerId,
        profileId: profile.id,
        projectId: data.projectId,
        hazardType: data.hazardType,
        severity: data.severity ?? 3,
        likelihood: data.likelihood ?? 3,
        sifPotential: data.sifPotential ?? false,
        sourceType: data.sourceType ?? 'inspection',
        sourceId: data.sourceId,
        exposedAt: data.exposureDate ? new Date(data.exposureDate) : new Date(),
      },
    });
    await this.audit(
      workerId,
      'hazard_exposure',
      row.id,
      'recorded',
      profile.id,
      actorId,
    );
    return row;
  }

  async linkCorrectiveAction(
    workerId: number,
    data: { correctiveActionId: string; status?: string; dueDate?: string },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    const capa = await this.prisma.pmCorrectiveAction.findUnique({
      where: { id: data.correctiveActionId },
    });
    if (!capa) throw new NotFoundException('Corrective action not found');

    const existing = await this.prisma.pmWorkerCorrectiveActionLink.findFirst({
      where: { workerId, capaId: data.correctiveActionId },
    });
    if (existing) {
      return this.prisma.pmWorkerCorrectiveActionLink.update({
        where: { id: existing.id },
        data: {
          status: data.status ?? existing.status,
          dueAt: data.dueDate ? new Date(data.dueDate) : existing.dueAt,
        },
      });
    }

    const row = await this.prisma.pmWorkerCorrectiveActionLink.create({
      data: {
        workerId,
        profileId: profile.id,
        capaId: data.correctiveActionId,
        status: data.status ?? 'open',
        dueAt: data.dueDate ? new Date(data.dueDate) : capa.dueAt,
        sifLinked:
          capa.sourceModule === 'sif_heca' || capa.sourceModule === 'sif',
      },
    });
    await this.audit(
      workerId,
      'corrective_action',
      row.id,
      'linked',
      profile.id,
      actorId,
    );
    return row;
  }

  async upsertCompetency(
    workerId: number,
    data: {
      competencyType: string;
      level: number;
      verifiedBy?: number;
      verifiedAt?: string;
      expiresAt?: string;
    },
    actorId?: number,
  ) {
    const profile = await this.getOrCreateProfile(workerId);
    const row = await this.prisma.pmWorkerSafetyCompetency.upsert({
      where: {
        workerId_competencyKey: {
          workerId,
          competencyKey: data.competencyType,
        },
      },
      create: {
        workerId,
        profileId: profile.id,
        competencyKey: data.competencyType,
        level: data.level,
        evaluatorId: data.verifiedBy ?? actorId,
        evaluatedAt: data.verifiedAt ? new Date(data.verifiedAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      update: {
        level: data.level,
        evaluatorId: data.verifiedBy ?? actorId,
        evaluatedAt: data.verifiedAt ? new Date(data.verifiedAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    await this.audit(
      workerId,
      'competency',
      row.id,
      'upserted',
      profile.id,
      actorId,
    );
    return row;
  }

  async applyOfflineSync(
    workerId: number,
    payload: {
      profile?: { roleType?: string; tradeCode?: string };
      training?: Array<Record<string, unknown>>;
      authorizations?: Array<Record<string, unknown>>;
      restrictions?: Array<Record<string, unknown>>;
      exposures?: Array<Record<string, unknown>>;
      correctiveActions?: Array<Record<string, unknown>>;
      overrides?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    let applied = 0;
    const profile = await this.getOrCreateProfile(workerId);

    if (payload.profile) {
      await this.prisma.pmWorkerSafetyProfile.update({
        where: { id: profile.id },
        data: {
          roleType: payload.profile.roleType,
          tradeCode: payload.profile.tradeCode,
        },
      });
      applied++;
    }

    for (const t of payload.training ?? []) {
      if (t.trainingCode && t.courseName) {
        await this.upsertTrainingSnapshot(
          workerId,
          t as Parameters<
            PmWorkerSafetyProfileService['upsertTrainingSnapshot']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const a of payload.authorizations ?? []) {
      if (a.authType) {
        await this.upsertAuthorization(
          workerId,
          a as Parameters<
            PmWorkerSafetyProfileService['upsertAuthorization']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const r of payload.restrictions ?? []) {
      if (r.restrictionType && r.description) {
        await this.addMedicalRestriction(
          workerId,
          r as Parameters<
            PmWorkerSafetyProfileService['addMedicalRestriction']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const e of payload.exposures ?? []) {
      if (e.hazardType) {
        await this.recordHazardExposure(
          workerId,
          e as Parameters<
            PmWorkerSafetyProfileService['recordHazardExposure']
          >[1],
          actorId,
        );
        applied++;
      }
    }

    for (const c of payload.correctiveActions ?? []) {
      if (c.correctiveActionId || c.capaId) {
        await this.linkCorrectiveAction(
          workerId,
          {
            correctiveActionId: (c.correctiveActionId ?? c.capaId) as string,
            status: c.status as string | undefined,
            dueDate: (c.dueDate ?? c.dueAt) as string | undefined,
          },
          actorId,
        );
        applied++;
      }
    }

    for (const o of payload.overrides ?? []) {
      if (o.overrideType && o.ruleKey && o.reason && o.expiresAt) {
        await this.createOverride(
          workerId,
          o as Parameters<PmWorkerSafetyProfileService['createOverride']>[1],
          actorId,
        );
        applied++;
      }
    }

    await this.rebuildProfile(workerId, undefined, actorId);
    const bundle = await this.buildOfflineBundle(workerId);
    await this.audit(
      workerId,
      'offline_sync',
      profile.id,
      'applied',
      profile.id,
      actorId,
      {
        applied,
      },
    );
    return { ok: true, applied, serverState: bundle };
  }

  async analytics(workerId: number) {
    const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
      where: { workerId },
      include: { scoreHistory: { take: 12, orderBy: { computedAt: 'asc' } } },
    });

    const since30 = new Date(Date.now() - 30 * 86400000);
    const denials = await this.prisma.pmWorkerAccessLog.count({
      where: { workerId, granted: false, createdAt: { gte: since30 } },
    });
    const attempts = await this.prisma.pmWorkerAccessLog.count({
      where: { workerId, createdAt: { gte: since30 } },
    });

    const trainingValid = await this.prisma.pmWorkerSafetyTraining.count({
      where: { workerId, status: 'valid' },
    });
    const trainingExpired = await this.prisma.pmWorkerSafetyTraining.count({
      where: { workerId, status: 'expired' },
    });

    const sifExposures = await this.prisma.pmWorkerHazardExposure.count({
      where: { workerId, sifPotential: true, exposedAt: { gte: since30 } },
    });

    const forecast = this.cail.predictIncidentLikelihood(
      profile?.safetyScore ?? 100,
      sifExposures,
      denials,
    );

    return {
      currentScore: profile?.safetyScore ?? null,
      riskLevel: profile?.riskLevel ?? null,
      scoreTrend: profile?.scoreHistory.map((s) => ({
        score: s.score,
        at: s.computedAt.toISOString(),
      })),
      trainingCompliancePct:
        trainingValid + trainingExpired > 0
          ? Math.round(
              (trainingValid / (trainingValid + trainingExpired)) * 100,
            )
          : 100,
      accessDenialRate30d:
        attempts > 0 ? Math.round((denials / attempts) * 100) : 0,
      hazardExposures30d: await this.prisma.pmWorkerHazardExposure.count({
        where: { workerId, exposedAt: { gte: since30 } },
      }),
      openCapa: await this.prisma.pmWorkerCorrectiveActionLink.count({
        where: { workerId, status: { in: ['open', 'overdue'] } },
      }),
      incidentForecast: forecast,
      cailInsights: await this.cail.workerInsights(workerId),
    };
  }
}
