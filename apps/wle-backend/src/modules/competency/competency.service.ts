import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../audit/audit-actions';

export type ResolvedCompetencyRules = {
  minPassingScore: number;
  expiryDays: number | null;
  requireEvaluation: boolean;
  source: 'equipment' | 'type' | 'default';
  certificationId: number | null;
};

export type CompetencyCheckResult = {
  eligible: boolean;
  reason?: string;
  requireEvaluation: boolean;
  minPassingScore: number;
  latestEvaluation?: {
    id: number;
    passed: boolean;
    score: number;
    evaluationDate: Date;
    expiresAt: Date | null;
    expired: boolean;
  };
  /** Ingested training evidence for required certification (Document Storage / TrainingRecord). */
  trainingEvidence?: {
    trainingRecordId: number;
    certificationId: number;
    expiresAt: Date | null;
    expired: boolean;
    verificationStatus: string | null;
    eligible: boolean;
    href: string;
  } | null;
  rules: ResolvedCompetencyRules;
};

@Injectable()
export class CompetencyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly compliance: EquipmentComplianceService,
    private readonly auditLog: AuditLogService,
  ) {}

  async resolveRules(equipmentId: number): Promise<ResolvedCompetencyRules> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        competencyRequirements: true,
        type: { include: { competencyRequirement: true } },
      },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const assetReq = equipment.competencyRequirements[0];
    if (assetReq) {
      const r = assetReq;
      return {
        minPassingScore: r.minPassingScore,
        expiryDays: r.expiryDays,
        requireEvaluation: r.requireEvaluation,
        source: 'equipment',
        certificationId: r.certificationId,
      };
    }

    if (equipment.type?.competencyRequirement) {
      const r = equipment.type.competencyRequirement;
      return {
        minPassingScore: r.minPassingScore,
        expiryDays: r.expiryDays,
        requireEvaluation: r.requireEvaluation,
        source: 'type',
        certificationId: r.certificationId,
      };
    }

    return {
      minPassingScore: 70,
      expiryDays: 365,
      requireEvaluation: true,
      source: 'default',
      certificationId: null,
    };
  }

  private isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false;
    return expiresAt.getTime() < Date.now();
  }

  async expireStaleForWorker(workerId: number) {
    const now = new Date();
    const expired = await this.prisma.competencyEvaluation.findMany({
      where: {
        workerId,
        passed: true,
        expiresAt: { lt: now },
      },
      select: { equipmentId: true, id: true },
    });

    for (const ev of expired) {
      await this.prisma.workerWalletItem.updateMany({
        where: {
          workerId,
          equipmentId: ev.equipmentId,
          status: 'ACTIVE',
        },
        data: { status: 'EXPIRED', updatedAt: now },
      });
    }
    return expired.length;
  }

  async checkWorkerEquipment(
    workerId: number,
    equipmentId: number,
  ): Promise<CompetencyCheckResult> {
    await this.expireStaleForWorker(workerId);
    const rules = await this.resolveRules(equipmentId);

    const trainingEvidence = await this.resolveTrainingEvidence(
      workerId,
      rules.certificationId,
    );

    if (!rules.requireEvaluation) {
      const certOk = !rules.certificationId || trainingEvidence?.eligible;
      return {
        eligible: Boolean(certOk),
        reason: certOk
          ? undefined
          : 'Required training certification missing or expired',
        requireEvaluation: false,
        minPassingScore: rules.minPassingScore,
        trainingEvidence,
        rules,
      };
    }

    const latest = await this.prisma.competencyEvaluation.findFirst({
      where: { workerId, equipmentId, passed: true },
      orderBy: { evaluationDate: 'desc' },
    });

    if (!latest) {
      // Soft path: verified non-expired TrainingRecord for required cert
      if (trainingEvidence?.eligible) {
        return {
          eligible: true,
          reason:
            'Eligible via verified training evidence (evaluation still recommended)',
          requireEvaluation: true,
          minPassingScore: rules.minPassingScore,
          trainingEvidence,
          rules,
        };
      }
      return {
        eligible: false,
        reason: 'No passing competency evaluation on file',
        requireEvaluation: true,
        minPassingScore: rules.minPassingScore,
        trainingEvidence,
        rules,
      };
    }

    const expired = this.isExpired(latest.expiresAt);
    const scoreOk = latest.score >= rules.minPassingScore;

    const latestEvaluation = {
      id: latest.id,
      passed: latest.passed,
      score: latest.score,
      evaluationDate: latest.evaluationDate,
      expiresAt: latest.expiresAt,
      expired,
    };

    if (expired) {
      if (trainingEvidence?.eligible) {
        return {
          eligible: true,
          reason:
            'Evaluation expired — eligible via verified training evidence pending re-evaluation',
          requireEvaluation: true,
          minPassingScore: rules.minPassingScore,
          latestEvaluation,
          trainingEvidence,
          rules,
        };
      }
      return {
        eligible: false,
        reason: 'Competency evaluation has expired',
        requireEvaluation: true,
        minPassingScore: rules.minPassingScore,
        latestEvaluation,
        trainingEvidence,
        rules,
      };
    }

    if (!scoreOk) {
      return {
        eligible: false,
        reason: `Score below minimum (${rules.minPassingScore})`,
        requireEvaluation: true,
        minPassingScore: rules.minPassingScore,
        latestEvaluation,
        trainingEvidence,
        rules,
      };
    }

    return {
      eligible: true,
      requireEvaluation: true,
      minPassingScore: rules.minPassingScore,
      latestEvaluation,
      trainingEvidence,
      rules,
    };
  }

  private async resolveTrainingEvidence(
    workerId: number,
    certificationId: number | null,
  ): Promise<CompetencyCheckResult['trainingEvidence']> {
    if (certificationId == null) return null;

    const rec = await this.prisma.trainingRecord.findFirst({
      where: { workerId, certificationId },
      orderBy: [{ expiresAt: 'desc' }, { issuedAt: 'desc' }],
      include: {
        validationResults: {
          where: { outcome: 'APPROVED' },
          take: 1,
          orderBy: { id: 'desc' },
        },
      },
    });
    if (!rec) {
      return null;
    }

    const expired = this.isExpired(rec.expiresAt);
    const verified =
      rec.lastVerificationStatus === 'VERIFIED' ||
      rec.validationResults.length > 0;
    const eligible = verified && !expired;

    return {
      trainingRecordId: rec.id,
      certificationId,
      expiresAt: rec.expiresAt,
      expired,
      verificationStatus: rec.lastVerificationStatus,
      eligible,
      href: `/core/training-competency?workerId=${workerId}&trainingRecordId=${rec.id}`,
    };
  }

  async assertEligible(workerId: number, equipmentId: number) {
    const check = await this.checkWorkerEquipment(workerId, equipmentId);
    if (!check.eligible) {
      throw new ForbiddenException(
        check.reason ?? 'Worker is not competent for this equipment',
      );
    }
    return check;
  }

  async evaluate(data: {
    workerId: number;
    equipmentId: number;
    evaluatorUserId?: number;
    score: number;
    passed: boolean;
    evaluationDate?: Date;
    notes?: string;
    evidenceNotes?: string;
    evidencePhotos?: string[];
    workerSignature?: string;
    evaluatorSignature?: string;
  }) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: data.equipmentId },
    });
    if (!equipment) throw new BadRequestException('Equipment not found');

    const rules = await this.resolveRules(data.equipmentId);
    const passed = data.passed && data.score >= rules.minPassingScore;

    const evaluationDate = data.evaluationDate ?? new Date();
    let expiresAt: Date | null = null;
    if (passed && rules.expiryDays != null && rules.expiryDays > 0) {
      expiresAt = new Date(evaluationDate);
      expiresAt.setDate(expiresAt.getDate() + rules.expiryDays);
    }

    const evaluation = await this.prisma.competencyEvaluation.create({
      data: {
        workerId: data.workerId,
        equipmentId: data.equipmentId,
        evaluatorUserId: data.evaluatorUserId,
        equipmentTypeKey: equipment.catalogTypeKey ?? equipment.name,
        score: data.score,
        passed,
        evaluationDate,
        expiresAt,
        notes: data.notes ?? data.evidenceNotes,
        evidenceNotes: data.evidenceNotes,
        evidencePhotos: data.evidencePhotos,
        workerSignature: data.workerSignature,
        evaluatorSignature: data.evaluatorSignature,
      },
      include: { worker: true, equipment: true, evaluator: true },
    });

    await this.auditLog.logAudit(
      { id: data.evaluatorUserId ?? null, companyId: equipment.companyId },
      AuditAction.ASSESSMENT_EQUIPMENT_COMPETENCY,
      {
        type: AuditEntityType.COMPETENCY_EVALUATION,
        id: evaluation.id,
        tenantId: equipment.companyId,
      },
      {
        workerId: data.workerId,
        equipmentId: data.equipmentId,
        score: data.score,
        passed,
      },
    );

    if (passed) {
      const companyLink = await this.prisma.companyLink.findFirst({
        where: { workerId: data.workerId, active: true },
      });
      const catalogKey = equipment.catalogTypeKey ?? equipment.name;
      const existing = await this.prisma.workerWalletItem.findFirst({
        where: {
          workerId: data.workerId,
          equipmentId: data.equipmentId,
        },
      });
      if (existing) {
        await this.prisma.workerWalletItem.update({
          where: { id: existing.id },
          data: {
            status: 'ACTIVE',
            notes: `Competency valid until ${
              expiresAt?.toISOString() ?? 'no expiry'
            }`,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.workerWalletItem.create({
          data: {
            workerId: data.workerId,
            catalogTypeKey: catalogKey,
            equipmentId: data.equipmentId,
            companyId: companyLink?.companyId,
            status: 'ACTIVE',
            notes: 'Competency evaluation passed',
          },
        });
      }
    } else {
      await this.prisma.workerWalletItem.updateMany({
        where: {
          workerId: data.workerId,
          equipmentId: data.equipmentId,
        },
        data: { status: 'FAILED', updatedAt: new Date() },
      });
    }

    await this.compliance.recalculate(data.equipmentId, {
      trigger: 'COMPETENCY',
      assessedByUserId: data.evaluatorUserId,
      notes: passed
        ? 'Competency evaluation passed'
        : 'Competency evaluation failed',
    });

    return evaluation;
  }

  async listForWorker(workerId: number) {
    await this.expireStaleForWorker(workerId);
    return this.prisma.competencyEvaluation.findMany({
      where: { workerId },
      include: { equipment: true, evaluator: true },
      orderBy: { evaluationDate: 'desc' },
    });
  }

  async listForEquipment(equipmentId: number) {
    return this.prisma.competencyEvaluation.findMany({
      where: { equipmentId },
      include: { worker: true, evaluator: true },
      orderBy: { evaluationDate: 'desc' },
    });
  }

  async getEquipmentRequirements(equipmentId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        competencyRequirements: { include: { certification: true } },
        type: {
          include: {
            competencyRequirement: { include: { certification: true } },
          },
        },
      },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    const resolved = await this.resolveRules(equipmentId);
    return {
      equipmentId,
      assetRequirement: equipment.competencyRequirements,
      typeRequirement: equipment.type?.competencyRequirement ?? null,
      resolved,
    };
  }

  async upsertEquipmentRequirement(
    equipmentId: number,
    data: {
      minPassingScore?: number;
      expiryDays?: number | null;
      requireEvaluation?: boolean;
      certificationId?: number | null;
    },
  ) {
    await this.prisma.equipment.findUniqueOrThrow({
      where: { id: equipmentId },
    });
    return this.prisma.equipmentCompetencyRequirement.upsert({
      where: { equipmentId },
      create: {
        equipmentId,
        minPassingScore: data.minPassingScore ?? 70,
        expiryDays: data.expiryDays ?? 365,
        requireEvaluation: data.requireEvaluation ?? true,
        certificationId: data.certificationId ?? null,
      },
      update: {
        ...(data.minPassingScore !== undefined
          ? { minPassingScore: data.minPassingScore }
          : {}),
        ...(data.expiryDays !== undefined
          ? { expiryDays: data.expiryDays }
          : {}),
        ...(data.requireEvaluation !== undefined
          ? { requireEvaluation: data.requireEvaluation }
          : {}),
        ...(data.certificationId !== undefined
          ? { certificationId: data.certificationId }
          : {}),
      },
      include: { certification: true },
    });
  }

  async upsertTypeRequirement(
    equipmentTypeId: number,
    data: {
      minPassingScore?: number;
      expiryDays?: number | null;
      requireEvaluation?: boolean;
      certificationId?: number | null;
    },
  ) {
    await this.prisma.equipmentType.findUniqueOrThrow({
      where: { id: equipmentTypeId },
    });
    return this.prisma.equipmentTypeCompetencyRequirement.upsert({
      where: { equipmentTypeId },
      create: {
        equipmentTypeId,
        minPassingScore: data.minPassingScore ?? 70,
        expiryDays: data.expiryDays ?? 365,
        requireEvaluation: data.requireEvaluation ?? true,
        certificationId: data.certificationId ?? null,
      },
      update: {
        ...(data.minPassingScore !== undefined
          ? { minPassingScore: data.minPassingScore }
          : {}),
        ...(data.expiryDays !== undefined
          ? { expiryDays: data.expiryDays }
          : {}),
        ...(data.requireEvaluation !== undefined
          ? { requireEvaluation: data.requireEvaluation }
          : {}),
        ...(data.certificationId !== undefined
          ? { certificationId: data.certificationId }
          : {}),
      },
      include: { certification: true },
    });
  }

  async dashboard(companyId?: number) {
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);

    const companyFilter = companyId
      ? {
          equipment: {
            equipmentLinks: { some: { companyId, active: true } },
          },
        }
      : {};

    const [totalEvaluations, passing, expiringSoon, expired, operatorLinks] =
      await Promise.all([
        this.prisma.competencyEvaluation.count({ where: companyFilter }),
        this.prisma.competencyEvaluation.count({
          where: {
            passed: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            ...companyFilter,
          },
        }),
        this.prisma.competencyEvaluation.count({
          where: {
            passed: true,
            expiresAt: { gt: now, lte: in30 },
            ...companyFilter,
          },
        }),
        this.prisma.competencyEvaluation.count({
          where: {
            passed: true,
            expiresAt: { lt: now },
            ...companyFilter,
          },
        }),
        this.prisma.equipmentLinkWorker.count({
          where: companyId
            ? { equipmentLink: { companyId, active: true } }
            : {},
        }),
      ]);

    const recent = await this.prisma.competencyEvaluation.findMany({
      where: companyFilter,
      take: 10,
      orderBy: { evaluationDate: 'desc' },
      include: {
        worker: true,
        equipment: true,
        evaluator: true,
      },
    });

    return {
      totalEvaluations,
      passing,
      expiringSoon,
      expired,
      operatorLinks,
      recent,
    };
  }
}
