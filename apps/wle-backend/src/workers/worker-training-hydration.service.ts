import { Injectable, NotFoundException } from '@nestjs/common';
import { PmCompanyTrainingRoleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type TrainingItemStatus = 'valid' | 'expired' | 'missing';

export type WorkerTrainingRequirement = {
  code: string;
  name: string;
  status: TrainingItemStatus;
  matchedRecordId: number | null;
  expiresAt: string | null;
};

export type WorkerTrainingHydration = {
  workerId: number;
  companyId: number | null;
  records: Array<{
    id: number;
    certificationId: number;
    code: string;
    name: string;
    issuedAt: string;
    expiresAt: string | null;
    completedAt: string | null;
    status: 'valid' | 'expired';
    certificateNumber: string | null;
    certificateUrl: string | null;
    projectId: number | null;
    companyId: number | null;
  }>;
  competencies: Array<{
    id: number;
    equipmentTypeKey: string;
    equipmentName: string | null;
    score: number;
    passed: boolean;
    evaluationDate: string;
    expiresAt: string | null;
    status: TrainingItemStatus;
  }>;
  certifications: Array<{
    id: number;
    code: string;
    name: string;
    latestRecordId: number;
    expiresAt: string | null;
    status: 'valid' | 'expired';
  }>;
  expiries: Array<{
    type: 'training' | 'competency' | 'restriction';
    key: string;
    name: string;
    expiresAt: string;
    status: 'valid' | 'expired';
  }>;
  restrictions: Array<{
    id: string;
    type: string;
    description: string;
    blocksHighRisk: boolean;
    blocksConfinedSpace: boolean;
    blocksHotWork: boolean;
    blocksEquipment: boolean;
    startsAt: string;
    expiresAt: string | null;
    active: boolean;
  }>;
  requirements: WorkerTrainingRequirement[];
  summary: {
    valid: number;
    expired: number;
    missing: number;
    totalRecords: number;
    hasBlockingRestrictions: boolean;
  };
  hydratedAt: string;
};

type HydrationOptions = {
  roleType?: PmCompanyTrainingRoleType;
  requiredCodes?: string[];
  projectId?: number;
};

@Injectable()
export class WorkerTrainingHydrationService {
  constructor(private readonly prisma: PrismaService) {}

  matchTrainingCode(
    cert: { code: string | null; name: string },
    requiredCode: string,
  ): boolean {
    const req = requiredCode.trim().toLowerCase();
    if (!req) return false;
    const code = (cert.code ?? '').trim().toLowerCase();
    const name = cert.name.trim().toLowerCase();
    return (
      code === req ||
      name === req ||
      name.includes(req) ||
      code.includes(req) ||
      req.includes(name)
    );
  }

  recordStatus(
    record: { expiresAt: Date | null; issuedAt: Date },
    now: Date,
  ): 'valid' | 'expired' {
    if (!record.expiresAt) return 'valid';
    return record.expiresAt > now ? 'valid' : 'expired';
  }

  buildRequirements(
    requiredCodes: string[],
    records: Array<{
      id: number;
      expiresAt: Date | null;
      issuedAt: Date;
      certification: { code: string | null; name: string };
    }>,
    now: Date,
  ): WorkerTrainingRequirement[] {
    return requiredCodes.map((code) => {
      const matches = records.filter((r) =>
        this.matchTrainingCode(r.certification, code),
      );
      const valid = matches.find((r) => this.recordStatus(r, now) === 'valid');
      const expired = matches.find(
        (r) => this.recordStatus(r, now) === 'expired',
      );
      const match = valid ?? expired;
      return {
        code,
        name: code,
        status: valid ? 'valid' : expired ? 'expired' : 'missing',
        matchedRecordId: match?.id ?? null,
        expiresAt: match?.expiresAt?.toISOString() ?? null,
      };
    });
  }

  async hydrateWorkerTraining(
    workerId: number,
    options: HydrationOptions = {},
  ): Promise<WorkerTrainingHydration> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        trainingRecords: {
          where: options.projectId
            ? { OR: [{ projectId: options.projectId }, { projectId: null }] }
            : undefined,
          include: { certification: true },
          orderBy: { expiresAt: 'asc' },
        },
        competencyEvaluations: {
          include: {
            equipment: { select: { name: true, assetTag: true } },
          },
          orderBy: { evaluationDate: 'desc' },
        },
        pmWorkerMedicalRestrictions: {
          where: { active: true },
          orderBy: { startsAt: 'desc' },
        },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const now = new Date();

    const records = worker.trainingRecords.map((r) => ({
      id: r.id,
      certificationId: r.certificationId,
      code: r.certification.code ?? r.certification.name,
      name: r.certification.name,
      issuedAt: r.issuedAt.toISOString(),
      expiresAt: r.expiresAt?.toISOString() ?? null,
      completedAt: r.completedAt?.toISOString() ?? null,
      status: this.recordStatus(r, now),
      certificateNumber: r.certificateNumber,
      certificateUrl: r.certificateUrl,
      projectId: r.projectId,
      companyId: r.companyId,
    }));

    const competencies = worker.competencyEvaluations.map((c) => {
      let status: TrainingItemStatus = 'valid';
      if (!c.passed) status = 'missing';
      else if (c.expiresAt && c.expiresAt <= now) status = 'expired';
      return {
        id: c.id,
        equipmentTypeKey: c.equipmentTypeKey,
        equipmentName: c.equipment?.name ?? c.equipment?.assetTag ?? null,
        score: c.score,
        passed: c.passed,
        evaluationDate: c.evaluationDate.toISOString(),
        expiresAt: c.expiresAt?.toISOString() ?? null,
        status,
      };
    });

    const certMap = new Map<
      number,
      WorkerTrainingHydration['certifications'][number]
    >();
    for (const r of worker.trainingRecords) {
      const status = this.recordStatus(r, now);
      const existing = certMap.get(r.certificationId);
      if (
        !existing ||
        (status === 'valid' && existing.status !== 'valid') ||
        (status === existing.status &&
          (r.expiresAt?.getTime() ?? 0) >
            new Date(existing.expiresAt ?? 0).getTime())
      ) {
        certMap.set(r.certificationId, {
          id: r.certificationId,
          code: r.certification.code ?? r.certification.name,
          name: r.certification.name,
          latestRecordId: r.id,
          expiresAt: r.expiresAt?.toISOString() ?? null,
          status,
        });
      }
    }
    const certifications = Array.from(certMap.values());

    const restrictions = worker.pmWorkerMedicalRestrictions.map((r) => ({
      id: r.id,
      type: r.restrictionType,
      description: r.description,
      blocksHighRisk: r.blocksHighRisk,
      blocksConfinedSpace: r.blocksConfinedSpace,
      blocksHotWork: r.blocksHotWork,
      blocksEquipment: r.blocksEquipment,
      startsAt: r.startsAt.toISOString(),
      expiresAt: r.expiresAt?.toISOString() ?? null,
      active: r.active && (!r.expiresAt || r.expiresAt > now),
    }));

    const expiries: WorkerTrainingHydration['expiries'] = [
      ...records
        .filter((r) => r.expiresAt)
        .map((r) => ({
          type: 'training' as const,
          key: r.code,
          name: r.name,
          expiresAt: r.expiresAt!,
          status: r.status,
        })),
      ...competencies
        .filter((c) => c.expiresAt)
        .map((c) => ({
          type: 'competency' as const,
          key: c.equipmentTypeKey,
          name: c.equipmentName ?? c.equipmentTypeKey,
          expiresAt: c.expiresAt!,
          status:
            c.status === 'valid' ? ('valid' as const) : ('expired' as const),
        })),
      ...restrictions
        .filter((r) => r.expiresAt)
        .map((r) => ({
          type: 'restriction' as const,
          key: r.type,
          name: r.description,
          expiresAt: r.expiresAt!,
          status: (new Date(r.expiresAt!) > now ? 'valid' : 'expired') as
            | 'valid'
            | 'expired',
        })),
    ].sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );

    let requiredCodes = options.requiredCodes ?? [];
    if (worker.companyId && requiredCodes.length === 0) {
      const matrix = await this.prisma.pmCompanyTrainingMatrix.findMany({
        where: {
          companyId: worker.companyId,
          roleType: options.roleType ?? PmCompanyTrainingRoleType.worker,
          active: true,
          status: 'published',
        },
      });
      requiredCodes = matrix.map((m) => m.trainingName || m.trainingCode);
    }

    const requirements = this.buildRequirements(
      requiredCodes,
      worker.trainingRecords,
      now,
    );

    const summary = {
      valid: requirements.filter((r) => r.status === 'valid').length,
      expired: requirements.filter((r) => r.status === 'expired').length,
      missing: requirements.filter((r) => r.status === 'missing').length,
      totalRecords: records.length,
      hasBlockingRestrictions: restrictions.some(
        (r) =>
          r.active &&
          (r.blocksHighRisk || r.blocksConfinedSpace || r.blocksHotWork),
      ),
    };

    return {
      workerId,
      companyId: worker.companyId,
      records,
      competencies,
      certifications,
      expiries,
      restrictions,
      requirements,
      summary,
      hydratedAt: new Date().toISOString(),
    };
  }

  async validateRequiredTraining(workerId: number, requiredCodes: string[]) {
    const hydration = await this.hydrateWorkerTraining(workerId, {
      requiredCodes,
    });
    const failures = hydration.requirements.filter((r) => r.status !== 'valid');
    return {
      valid: failures.length === 0,
      requirements: hydration.requirements,
      failures,
      hasBlockingRestrictions: hydration.summary.hasBlockingRestrictions,
      restrictions: hydration.restrictions.filter((r) => r.active),
    };
  }
}
