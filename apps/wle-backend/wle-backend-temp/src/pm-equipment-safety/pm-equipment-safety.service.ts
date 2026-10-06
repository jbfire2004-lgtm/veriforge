import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  EquipmentSafetyStatus,
  PmEquipmentCertificationStatus,
  PmEquipmentFailureStatus,
  PmEquipmentInspectionCadence,
  PmEquipmentLotoStatus,
  PmEquipmentOperationalStatus,
  PmEquipmentSafetyCategory,
  PmWorkerEquipmentAuthType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EquipmentComplianceService } from '../modules/equipment-compliance/equipment-compliance.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { EquipmentConditionEngine } from './equipment-condition.engine';
import { EquipmentAssignmentEngine } from './equipment-assignment.engine';
import { LotoWorkflowEngine } from './loto-workflow.engine';
import { FailureWorkflowEngine } from './failure-workflow.engine';
import { PmEquipmentCailIntelligenceService } from './pm-equipment-cail-intelligence.service';

@Injectable()
export class PmEquipmentSafetyService {
  private readonly conditionEngine = new EquipmentConditionEngine();
  private readonly assignmentEngine = new EquipmentAssignmentEngine();
  private readonly lotoWorkflow = new LotoWorkflowEngine();
  private readonly failureWorkflow = new FailureWorkflowEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly compliance: EquipmentComplianceService,
    private readonly cail: PmEquipmentCailIntelligenceService,
    @Optional() private readonly capaAuto?: PmCapaAutoGenerateService,
  ) {}

  private async audit(
    entityType: string,
    entityId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmEquipmentSafetyAudit.create({
      data: {
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  mapOperationalStatus(
    status: PmEquipmentOperationalStatus,
  ): 'active' | 'in_service' | 'out_of_service' | 'locked_out' {
    return status === 'in_service'
      ? 'in_service'
      : status === 'out_of_service'
      ? 'out_of_service'
      : status === 'locked_out'
      ? 'locked_out'
      : 'active';
  }

  async registerEquipment(
    data: {
      companyId: number;
      projectId?: number;
      name: string;
      serialNumber?: string;
      manufacturer?: string;
      model?: string;
      safetyCategory?: PmEquipmentSafetyCategory;
      typeId?: number;
      categoryId?: number;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    if (data.clientSyncId) {
      const existing = await this.prisma.equipment.findFirst({
        where: {
          companyId: data.companyId,
          deletedAt: null,
          pmSafetyMetadataJson: {
            path: ['clientSyncId'],
            equals: data.clientSyncId,
          },
        },
      });
      if (existing) return existing;
    }

    const eq = await this.prisma.equipment.create({
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        manufacturer: data.manufacturer,
        model: data.model,
        companyId: data.companyId,
        typeId: data.typeId,
        categoryId: data.categoryId,
        safetyCategory: data.safetyCategory,
        operationalStatus: 'active',
        safetyStatus: EquipmentSafetyStatus.OK,
        pmSafetyMetadataJson: data.clientSyncId
          ? ({ clientSyncId: data.clientSyncId } as Prisma.InputJsonValue)
          : {},
      },
    });

    if (data.projectId) {
      await this.prisma.equipmentProjectAssignment.create({
        data: {
          equipmentId: eq.id,
          projectId: data.projectId,
          companyId: data.companyId,
          assignedAt: new Date(),
        },
      });
    }

    await this.audit('equipment', String(eq.id), 'registered', actorId);
    await this.recalculateCondition(eq.id, data.projectId);
    return eq;
  }

  async getEquipmentScore(equipmentId: number, projectId?: number) {
    const condition = await this.recalculateCondition(equipmentId, projectId);
    const eq = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: {
        operationalStatus: true,
        lockoutStatus: true,
        complianceStatus: true,
        nextInspectionAt: true,
        lastInspectionAt: true,
      },
    });
    return {
      equipmentId,
      conditionScore: condition.score,
      riskBand: condition.riskBand,
      factors: condition.factors,
      status: eq ? this.mapOperationalStatus(eq.operationalStatus) : 'active',
      nextInspectionDue: eq?.nextInspectionAt,
      lastInspectionDate: eq?.lastInspectionAt,
      lockoutStatus: eq?.lockoutStatus,
      complianceStatus: eq?.complianceStatus,
    };
  }

  async recordEquipmentInspection(data: {
    companyId: number;
    projectId: number;
    equipmentId: number;
    inspectorUserId?: number;
    templateId?: string;
    pmInspectionId?: string;
    cadence?: PmEquipmentInspectionCadence;
    passed?: boolean;
    notes?: string;
    conditionScore?: number;
    items?: Array<{
      itemKey: string;
      label: string;
      passed?: boolean;
      score?: number;
      notes?: string;
      deficiencySeverity?: string;
    }>;
    clientSyncId?: string;
  }) {
    const row = await this.registerEquipmentInspection({
      companyId: data.companyId,
      projectId: data.projectId,
      equipmentId: data.equipmentId,
      pmInspectionId: data.pmInspectionId,
      cadence: data.cadence ?? 'pre_use',
      conditionScore: data.conditionScore,
      passed: data.passed,
      items: data.items,
      clientSyncId: data.clientSyncId,
    });

    if (data.passed === false) {
      await this.createLoto(
        {
          companyId: data.companyId,
          equipmentId: data.equipmentId,
          reason: data.notes ?? 'Failed equipment inspection',
          stepsJson: [{ step: 'Tag out — failed inspection', completed: true }],
        },
        data.inspectorUserId,
      );
    } else {
      await this.prisma.equipment.update({
        where: { id: data.equipmentId },
        data: {
          lastInspectionAt: new Date(),
          operationalStatus: 'in_service',
        },
      });
    }

    await this.audit(
      'equipment_inspection',
      row.id,
      'recorded',
      data.inspectorUserId,
      {
        passed: data.passed,
        templateId: data.templateId,
      },
    );

    return row;
  }

  async unlockEquipment(equipmentId: number, actorId?: number) {
    const active = await this.prisma.pmEquipmentLoto.findMany({
      where: { equipmentId, status: { in: ['active', 'verified'] } },
    });
    if (active.length === 0) {
      throw new BadRequestException('No active lockout on equipment');
    }
    for (const loto of active) {
      await this.removeLoto(loto.id, actorId ?? 0);
    }
    return { equipmentId, lockoutsRemoved: active.length };
  }

  // ---------- Profiles ----------

  async listProfiles(filters: {
    companyId: number;
    projectId?: number;
    safetyCategory?: PmEquipmentSafetyCategory;
    operationalStatus?: PmEquipmentOperationalStatus;
  }) {
    const projectEquipmentIds = filters.projectId
      ? (
          await this.prisma.equipmentProjectAssignment.findMany({
            where: { projectId: filters.projectId, endedAt: null },
            select: { equipmentId: true },
          })
        ).map((a) => a.equipmentId)
      : null;

    return this.prisma.equipment.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        safetyCategory: filters.safetyCategory,
        operationalStatus: filters.operationalStatus,
        ...(projectEquipmentIds ? { id: { in: projectEquipmentIds } } : {}),
      },
      include: {
        category: true,
        type: true,
        pmCertifications: { where: { deletedAt: null }, take: 5 },
        pmConditionScores: { orderBy: { scoredAt: 'desc' }, take: 1 },
      },
      orderBy: { name: 'asc' },
      take: 300,
    });
  }

  async getProfile(equipmentId: number) {
    const eq = await this.prisma.equipment.findFirst({
      where: { id: equipmentId, deletedAt: null },
      include: {
        category: true,
        type: true,
        attachments: { take: 20 },
        pmCertifications: { where: { deletedAt: null } },
        pmEquipmentInspections: { orderBy: { createdAt: 'desc' }, take: 10 },
        pmFailures: { orderBy: { createdAt: 'desc' }, take: 10 },
        pmLotoEvents: { where: { status: { in: ['active', 'verified'] } } },
        lockoutHistory: { orderBy: { lockedAt: 'desc' }, take: 5 },
        maintenanceRecords: { orderBy: { performedAt: 'desc' }, take: 5 },
        workerAuthorizations: { where: { active: true } },
      },
    });
    if (!eq) throw new NotFoundException('Equipment not found');
    return eq;
  }

  async updateProfile(
    equipmentId: number,
    data: {
      name?: string;
      serialNumber?: string;
      manufacturer?: string;
      model?: string;
      yearMade?: number;
      capacity?: string;
      safetyCategory?: PmEquipmentSafetyCategory;
      operationalStatus?: PmEquipmentOperationalStatus;
      loadChartJson?: Record<string, unknown>;
      pmSafetyMetadataJson?: Record<string, unknown>;
    },
    actorId?: number,
  ) {
    const updated = await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        manufacturer: data.manufacturer,
        model: data.model,
        yearMade: data.yearMade,
        capacity: data.capacity,
        safetyCategory: data.safetyCategory,
        operationalStatus: data.operationalStatus,
        loadChartJson: data.loadChartJson as Prisma.InputJsonValue | undefined,
        pmSafetyMetadataJson: data.pmSafetyMetadataJson as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
    await this.audit(
      'equipment',
      String(equipmentId),
      'profile_updated',
      actorId,
    );
    return updated;
  }

  async recalculateCondition(equipmentId: number, projectId?: number) {
    const eq = await this.getProfile(equipmentId);
    const now = new Date();
    const expiredCerts = eq.pmCertifications.filter(
      (c) => c.status === 'approved' && c.expiresAt && c.expiresAt < now,
    ).length;
    const chronicFailures = await this.prisma.pmEquipmentFailure.count({
      where: {
        equipmentId,
        createdAt: { gte: new Date(now.getTime() - 90 * 86400000) },
      },
    });
    const openCritical = await this.prisma.pmInspectionDeficiency.count({
      where: {
        severity: 'critical',
        status: { not: 'closed' },
        inspection: { equipmentId },
      },
    });
    const lastInsp = eq.pmEquipmentInspections[0];

    const result = this.conditionEngine.score({
      complianceStatus: eq.complianceStatus,
      safetyStatus: eq.safetyStatus,
      lockoutStatus: eq.lockoutStatus,
      operationalStatus: eq.operationalStatus,
      lastInspectionScore: lastInsp?.conditionScore,
      openCriticalDeficiencies: openCritical,
      expiredCertifications: expiredCerts,
      chronicFailureCount: chronicFailures,
    });

    await this.prisma.pmEquipmentConditionScore.create({
      data: {
        equipmentId,
        projectId,
        score: result.score,
        riskBand: result.riskBand,
        factorsJson: result.factors as Prisma.InputJsonValue,
      },
    });

    if (result.riskBand === 'critical') {
      await this.prisma.equipment.update({
        where: { id: equipmentId },
        data: { safetyStatus: EquipmentSafetyStatus.UNSAFE },
      });
    }

    return result;
  }

  // ---------- Certifications ----------

  async listCertifications(equipmentId: number) {
    return this.prisma.pmEquipmentCertification.findMany({
      where: { equipmentId, deletedAt: null },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async createCertification(
    data: {
      companyId: number;
      equipmentId: number;
      certificationType: Prisma.PmEquipmentCertificationCreateInput['certificationType'];
      certificateNumber?: string;
      issuedAt?: Date;
      expiresAt?: Date;
      storageKey?: string;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const cert = await this.prisma.pmEquipmentCertification.create({
      data: { ...data, status: 'draft' },
    });
    await this.audit('certification', cert.id, 'created', actorId);
    return cert;
  }

  async approveCertification(id: string, actorId: number) {
    const cert = await this.prisma.pmEquipmentCertification.findUnique({
      where: { id },
    });
    if (!cert) throw new NotFoundException('Certification not found');
    const updated = await this.prisma.pmEquipmentCertification.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedByUserId: actorId,
      },
    });
    await this.compliance.recalculate(cert.equipmentId, {
      trigger: 'MANUAL',
      assessedByUserId: actorId,
    });
    await this.audit('certification', id, 'approved', actorId);
    return updated;
  }

  async flagExpiredCertifications(companyId: number) {
    const now = new Date();
    const expired = await this.prisma.pmEquipmentCertification.findMany({
      where: {
        companyId,
        status: 'approved',
        expiresAt: { lt: now },
        deletedAt: null,
      },
    });
    for (const c of expired) {
      await this.prisma.pmEquipmentCertification.update({
        where: { id: c.id },
        data: { status: 'expired' },
      });
      await this.prisma.equipment.update({
        where: { id: c.equipmentId },
        data: {
          operationalStatus: 'out_of_service',
          safetyStatus: EquipmentSafetyStatus.UNSAFE,
        },
      });
      await this.compliance.recalculate(c.equipmentId, {
        trigger: 'MANUAL',
        forceStatus: 'NON_COMPLIANT',
      });
    }
    return { expiredCount: expired.length };
  }

  // ---------- Inspections (equipment layer) ----------

  async registerEquipmentInspection(data: {
    companyId: number;
    projectId: number;
    equipmentId: number;
    pmInspectionId?: string;
    cadence: PmEquipmentInspectionCadence;
    conditionScore?: number;
    passed?: boolean;
    requiresSupervisorReview?: boolean;
    items?: Array<{
      itemKey: string;
      label: string;
      passed?: boolean;
      score?: number;
      notes?: string;
      deficiencySeverity?: string;
    }>;
    clientSyncId?: string;
  }) {
    const row = await this.prisma.pmEquipmentInspection.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        equipmentId: data.equipmentId,
        ...(data.pmInspectionId ? { pmInspectionId: data.pmInspectionId } : {}),
        cadence: data.cadence,
        conditionScore: data.conditionScore,
        passed: data.passed,
        requiresSupervisorReview: data.requiresSupervisorReview ?? false,
        clientSyncId: data.clientSyncId,
        items: data.items?.length
          ? {
              create: data.items.map((i) => ({
                itemKey: i.itemKey,
                label: i.label,
                passed: i.passed,
                score: i.score,
                notes: i.notes,
                deficiencySeverity: i.deficiencySeverity,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
    await this.recalculateCondition(data.equipmentId, data.projectId);
    return row;
  }

  // ---------- Failures ----------

  async reportFailure(
    data: {
      companyId: number;
      projectId?: number;
      equipmentId: number;
      failureType: Prisma.PmEquipmentFailureCreateInput['failureType'];
      title: string;
      description?: string;
      hazardCreated?: boolean;
      reportedByUserId?: number;
      autoLockout?: boolean;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const failure = await this.prisma.pmEquipmentFailure.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        equipmentId: data.equipmentId,
        failureType: data.failureType,
        title: data.title,
        description: data.description,
        hazardCreated: data.hazardCreated ?? false,
        reportedByUserId: data.reportedByUserId ?? actorId,
        clientSyncId: data.clientSyncId,
        status: 'reported',
      },
    });

    if (data.autoLockout !== false) {
      await this.createLoto(
        {
          companyId: data.companyId,
          equipmentId: data.equipmentId,
          reason: `Failure: ${data.title}`,
          stepsJson: [{ step: 'Isolate energy', completed: true }],
          authorizedWorkerIds: [],
        },
        actorId,
      );
      await this.prisma.pmEquipmentFailure.update({
        where: { id: failure.id },
        data: { status: 'locked_out', lockedOutAt: new Date() },
      });
    }

    if (this.capaAuto) {
      const capa = await this.capaAuto.fromDocumentDeficiency({
        companyId: data.companyId,
        projectId: data.projectId,
        sourceModule: 'equipment_failure',
        sourceId: failure.id,
        title: `Equipment failure: ${data.title}`,
        description: data.description,
        severity: 'high',
        actorId: actorId ?? 1,
      });
      if (capa) {
        await this.prisma.pmEquipmentFailure.update({
          where: { id: failure.id },
          data: { status: 'capa_open', correctiveActionId: capa.id },
        });
      }
    }

    await this.audit('failure', failure.id, 'reported', actorId);
    return failure;
  }

  async transitionFailure(
    id: string,
    to: PmEquipmentFailureStatus,
    actorId?: number,
  ) {
    const row = await this.prisma.pmEquipmentFailure.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException('Failure not found');
    this.failureWorkflow.assertTransition(row.status, to);
    const update: Prisma.PmEquipmentFailureUpdateInput = { status: to };
    if (to === 'supervisor_review') update.supervisorReviewedAt = new Date();
    if (to === 'owner_review') update.ownerReviewedAt = new Date();
    if (to === 'closed') update.updatedAt = new Date();
    const updated = await this.prisma.pmEquipmentFailure.update({
      where: { id },
      data: update,
    });
    await this.audit('failure', id, `status_${to}`, actorId);
    return updated;
  }

  // ---------- LOTO ----------

  async listActiveLoto(equipmentId: number) {
    return this.prisma.pmEquipmentLoto.findMany({
      where: { equipmentId, status: { in: ['active', 'verified'] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLoto(
    data: {
      companyId: number;
      equipmentId: number;
      reason: string;
      stepsJson?: unknown[];
      authorizedWorkerIds?: number[];
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const legacy = await this.prisma.equipmentLockout.create({
      data: {
        equipmentId: data.equipmentId,
        companyId: data.companyId,
        reason: data.reason,
        lockedByUserId: actorId,
      },
    });

    const loto = await this.prisma.pmEquipmentLoto.create({
      data: {
        companyId: data.companyId,
        equipmentId: data.equipmentId,
        reason: data.reason,
        stepsJson: (data.stepsJson ?? []) as Prisma.InputJsonValue,
        authorizedWorkerIds: (data.authorizedWorkerIds ??
          []) as Prisma.InputJsonValue,
        legacyLockoutId: legacy.id,
        clientSyncId: data.clientSyncId,
        status: 'active',
      },
    });

    await this.prisma.equipment.update({
      where: { id: data.equipmentId },
      data: {
        lockedOutAt: new Date(),
        lockoutReason: data.reason,
        lockoutStatus: 'LOCKED_OUT',
        operationalStatus: 'locked_out',
        safetyStatus: EquipmentSafetyStatus.UNSAFE,
      },
    });
    await this.compliance.recalculate(data.equipmentId, {
      trigger: 'LOCKOUT',
      assessedByUserId: actorId,
      forceStatus: 'LOCKED_OUT',
    });
    await this.audit('loto', loto.id, 'created', actorId);
    return loto;
  }

  async verifyLoto(id: string, actorId: number) {
    const loto = await this.prisma.pmEquipmentLoto.findUnique({
      where: { id },
    });
    if (!loto) throw new NotFoundException('LOTO not found');
    this.lotoWorkflow.assertTransition(loto.status, 'verified');
    return this.prisma.pmEquipmentLoto.update({
      where: { id },
      data: {
        status: 'verified',
        verifiedAt: new Date(),
        verifiedByUserId: actorId,
      },
    });
  }

  async removeLoto(id: string, actorId: number) {
    const loto = await this.prisma.pmEquipmentLoto.findUnique({
      where: { id },
    });
    if (!loto) throw new NotFoundException('LOTO not found');
    this.lotoWorkflow.assertTransition(loto.status, 'removed');

    await this.prisma.pmEquipmentLoto.update({
      where: { id },
      data: {
        status: 'removed',
        removedAt: new Date(),
        removedByUserId: actorId,
      },
    });

    if (loto.legacyLockoutId) {
      await this.prisma.equipmentLockout.update({
        where: { id: loto.legacyLockoutId },
        data: { unlockedAt: new Date(), unlockedByUserId: actorId },
      });
    }

    const activeCount = await this.prisma.pmEquipmentLoto.count({
      where: {
        equipmentId: loto.equipmentId,
        status: { in: ['active', 'verified'] },
      },
    });

    if (activeCount === 0) {
      await this.prisma.equipment.update({
        where: { id: loto.equipmentId },
        data: {
          lockedOutAt: null,
          lockoutReason: null,
          lockoutStatus: 'CLEAR',
          operationalStatus: 'active',
          safetyStatus: EquipmentSafetyStatus.OK,
        },
      });
      await this.compliance.recalculate(loto.equipmentId, {
        trigger: 'UNLOCK',
        assessedByUserId: actorId,
      });
    }

    await this.audit('loto', id, 'removed', actorId);
    return { removed: true };
  }

  // ---------- Authorization ----------

  async listAuthorizations(filters: {
    companyId: number;
    workerId?: number;
    equipmentId?: number;
  }) {
    return this.prisma.pmWorkerEquipmentAuthorization.findMany({
      where: {
        companyId: filters.companyId,
        workerId: filters.workerId,
        equipmentId: filters.equipmentId,
        active: true,
      },
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        equipment: { select: { id: true, name: true } },
      },
    });
  }

  async grantAuthorization(
    data: {
      companyId: number;
      workerId: number;
      authType: PmWorkerEquipmentAuthType;
      equipmentId?: number;
      equipmentCategory?: PmEquipmentSafetyCategory;
      expiresAt?: Date;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const auth = await this.prisma.pmWorkerEquipmentAuthorization.create({
      data: {
        ...data,
        issuedByUserId: actorId,
      },
    });
    await this.audit('authorization', auth.id, 'granted', actorId);
    return auth;
  }

  async validateWorkerAuthorization(workerId: number, equipmentId: number) {
    const eq = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!eq) return { authorized: false, reason: 'Equipment not found' };

    const now = new Date();
    const auth = await this.prisma.pmWorkerEquipmentAuthorization.findFirst({
      where: {
        workerId,
        active: true,
        OR: [{ equipmentId }, { equipmentId: null }],
        AND: [
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
    });

    return {
      authorized: !!auth,
      authId: auth?.id,
      expiresAt: auth?.expiresAt,
    };
  }

  // ---------- Assignment ----------

  async validateAssignment(input: {
    workerId: number;
    equipmentId: number;
    projectId?: number;
    actorId?: number;
  }) {
    const eq = await this.getProfile(input.equipmentId);
    const auth = await this.validateWorkerAuthorization(
      input.workerId,
      input.equipmentId,
    );
    const now = new Date();
    const certValid =
      (await this.prisma.pmEquipmentCertification.count({
        where: {
          equipmentId: input.equipmentId,
          status: 'approved',
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      })) > 0 || eq.pmCertifications.length === 0;

    const inspectionCurrent =
      !eq.nextInspectionAt || eq.nextInspectionAt >= now;

    const underLoto =
      (await this.prisma.pmEquipmentLoto.count({
        where: {
          equipmentId: input.equipmentId,
          status: { in: ['active', 'verified'] },
        },
      })) > 0;

    const condition = await this.recalculateCondition(
      input.equipmentId,
      input.projectId,
    );

    const result = this.assignmentEngine.validate({
      workerId: input.workerId,
      equipmentId: input.equipmentId,
      hasAuthorization: auth.authorized,
      authorizationExpired: false,
      certificationValid: certValid,
      inspectionCurrent,
      conditionScore: condition.score,
      underLoto,
    });

    await this.prisma.pmEquipmentAssignmentAudit.create({
      data: {
        equipmentId: input.equipmentId,
        workerId: input.workerId,
        projectId: input.projectId,
        action: 'validate',
        passedRules: result.allowed,
        ruleFailuresJson: result.failures as Prisma.InputJsonValue,
        actorId: input.actorId,
      },
    });

    return result;
  }

  // ---------- Site access ----------

  async workerAccessCheck(workerId: number, projectId: number) {
    const assignments = await this.prisma.equipmentAssignment.findMany({
      where: { workerId, endedAt: null, equipmentId: { not: null } },
      select: { equipmentId: true },
    });

    let blocked = 0;
    const reasons: string[] = [];

    for (const a of assignments) {
      if (!a.equipmentId) continue;
      const validation = await this.validateAssignment({
        workerId,
        equipmentId: a.equipmentId,
        projectId,
      });
      if (!validation.allowed) {
        blocked++;
        reasons.push(...validation.failures);
      }
    }

    return {
      allowed: blocked === 0,
      blockedEquipmentCount: blocked,
      reasons: [...new Set(reasons)].slice(0, 10),
    };
  }

  // ---------- Analytics ----------

  async analytics(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const equipmentIds = (
      await this.prisma.equipmentProjectAssignment.findMany({
        where: { projectId, endedAt: null },
        select: { equipmentId: true },
      })
    ).map((a) => a.equipmentId);

    const now = new Date();
    const [
      total,
      lockedOut,
      overdueInspection,
      expiredCerts,
      openFailures,
      avgCondition,
      insights,
    ] = await Promise.all([
      equipmentIds.length,
      this.prisma.equipment.count({
        where: {
          id: { in: equipmentIds },
          operationalStatus: 'locked_out',
        },
      }),
      this.prisma.equipment.count({
        where: {
          id: { in: equipmentIds },
          nextInspectionAt: { lt: now },
        },
      }),
      this.prisma.pmEquipmentCertification.count({
        where: {
          equipmentId: { in: equipmentIds },
          status: 'expired',
        },
      }),
      this.prisma.pmEquipmentFailure.count({
        where: {
          equipmentId: { in: equipmentIds },
          status: { notIn: ['closed', 'verified'] },
        },
      }),
      this.prisma.pmEquipmentConditionScore.aggregate({
        where: { equipmentId: { in: equipmentIds } },
        _avg: { score: true },
      }),
      this.cail.projectInsights(projectId),
    ]);

    const projectScore = avgCondition._avg.score ?? 100;

    const since90 = new Date(now.getTime() - 90 * 86400000);
    const failures90d = await this.prisma.pmEquipmentFailure.count({
      where: {
        equipmentId: { in: equipmentIds },
        createdAt: { gte: since90 },
      },
    });

    const failureByType = await this.prisma.pmEquipmentFailure.groupBy({
      by: ['failureType'],
      where: { equipmentId: { in: equipmentIds }, createdAt: { gte: since90 } },
      _count: true,
    });

    return {
      equipmentCount: total,
      lockedOut,
      overdueInspection,
      expiredCerts,
      openFailures,
      avgConditionScore: Math.round(avgCondition._avg.score ?? 0),
      projectEquipmentScore: Math.round(projectScore),
      certificationCompliancePct:
        total > 0 ? Math.round(((total - expiredCerts) / total) * 100) : 100,
      inspectionCompliancePct:
        total > 0
          ? Math.round(((total - overdueInspection) / total) * 100)
          : 100,
      equipmentComplianceScore: Math.round(projectScore),
      trends: {
        failures90d,
        failureByType,
        lockoutRate90d: total > 0 ? lockedOut / total : 0,
      },
      leadingIndicators: {
        failureRate: total > 0 ? openFailures / total : 0,
        lockoutRate: total > 0 ? lockedOut / total : 0,
        inspectionCompliancePct:
          total > 0
            ? Math.round(((total - overdueInspection) / total) * 100)
            : 100,
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

    const equipment = await this.listProfiles({
      companyId: project.companyId,
      projectId,
    });
    const authorizations = await this.listAuthorizations({
      companyId: project.companyId,
    });

    return {
      syncedAt: new Date().toISOString(),
      projectId,
      equipment,
      authorizations,
    };
  }

  async applyOfflineSync(
    projectId: number,
    payload: {
      inspections?: Array<Record<string, unknown>>;
      lotoCreates?: Array<Record<string, unknown>>;
      failures?: Array<Record<string, unknown>>;
      authorizations?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const counts = { inspections: 0, loto: 0, failures: 0, auths: 0 };

    for (const f of payload.failures ?? []) {
      const clientSyncId = f.clientSyncId as string | undefined;
      if (clientSyncId) {
        const exists = await this.prisma.pmEquipmentFailure.findUnique({
          where: { clientSyncId },
        });
        if (exists) continue;
      }
      await this.reportFailure(
        {
          companyId: project.companyId,
          projectId,
          equipmentId: f.equipmentId as number,
          failureType:
            f.failureType as Prisma.PmEquipmentFailureCreateInput['failureType'],
          title: f.title as string,
          description: f.description as string | undefined,
          clientSyncId,
        },
        actorId,
      );
      counts.failures++;
    }

    for (const l of payload.lotoCreates ?? []) {
      const clientSyncId = l.clientSyncId as string | undefined;
      if (clientSyncId) {
        const exists = await this.prisma.pmEquipmentLoto.findUnique({
          where: { clientSyncId },
        });
        if (exists) continue;
      }
      await this.createLoto(
        {
          companyId: project.companyId,
          equipmentId: l.equipmentId as number,
          reason: l.reason as string,
          stepsJson: l.stepsJson as unknown[],
          clientSyncId,
        },
        actorId,
      );
      counts.loto++;
    }

    return counts;
  }

  /** Safety station real-time payload */
  async stationPayload(companyId: number) {
    const equipment = await this.prisma.equipment.findMany({
      where: { companyId, deletedAt: null },
      select: {
        id: true,
        name: true,
        operationalStatus: true,
        lockoutStatus: true,
        nextInspectionAt: true,
        complianceStatus: true,
      },
      take: 500,
    });
    const activeLoto = await this.prisma.pmEquipmentLoto.findMany({
      where: { companyId, status: { in: ['active', 'verified'] } },
      take: 100,
    });
    return {
      generatedAt: new Date().toISOString(),
      equipment,
      activeLoto,
      inspectionReminders: equipment.filter(
        (e) =>
          e.nextInspectionAt &&
          e.nextInspectionAt < new Date(Date.now() + 7 * 86400000),
      ),
    };
  }
}
