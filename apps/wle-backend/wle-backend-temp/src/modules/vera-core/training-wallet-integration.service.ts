import { Injectable, Optional, Inject, forwardRef } from '@nestjs/common';
import { TrainingCredentialNftProjectionService } from '../training-credential-nft/training-credential-nft-projection.service';
import { AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from './company-links.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance/training-standards-compliance.service';
import {
  mapTrainingRecordForWallet,
  TRAINING_RECORD_WALLET_INCLUDE,
  WalletTrainingRecordDto,
} from './training-wallet.mapper';
import { CompanyTrainingComplianceService } from '../../companies/company-training-compliance.service';
import { UnionHallTrainingService } from './union-hall-training.service';

@Injectable()
export class TrainingWalletIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyLinks: CompanyLinksService,
    private readonly equipmentCompliance: EquipmentComplianceService,
    @Optional()
    private readonly standardsCompliance?: TrainingStandardsComplianceService,
    @Optional()
    @Inject(forwardRef(() => CompanyTrainingComplianceService))
    private readonly companyTraining?: CompanyTrainingComplianceService,
    @Optional()
    @Inject(forwardRef(() => UnionHallTrainingService))
    private readonly unionHallTraining?: UnionHallTrainingService,
    @Optional()
    private readonly veraProjection?: TrainingCredentialNftProjectionService,
  ) {}

  async syncAfterTrainingRecord(
    trainingRecordId: number,
    equipmentId?: number,
  ): Promise<WalletTrainingRecordDto> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      include: TRAINING_RECORD_WALLET_INCLUDE,
    });
    if (!record) {
      throw new Error(`Training record ${trainingRecordId} not found`);
    }

    if (record.companyId) {
      await this.companyLinks.linkWorker(record.workerId, record.companyId, {
        deactivateOtherCompanies: false,
      });
    }

    await this.syncWorkerWalletItem(record, equipmentId);
    await this.syncProjectCompliance(record);
    await this.syncEquipmentCompetency(record, equipmentId);

    let validationOutcome = null as Awaited<
      ReturnType<TrainingStandardsComplianceService['validateTraining']>
    > | null;
    if (this.standardsCompliance) {
      const existing = await this.prisma.trainingValidationResult.findFirst({
        where: { trainingRecordId },
        orderBy: { validatedAt: 'desc' },
      });
      if (!existing) {
        validationOutcome = await this.standardsCompliance.validateTraining(
          trainingRecordId,
        );
      } else {
        validationOutcome = {
          outcome: existing.outcome,
          jurisdictionCode: existing.jurisdictionCode ?? 'ON',
        } as never;
      }
    }

    if (this.unionHallTraining) {
      await this.unionHallTraining
        .ensurePendingReceiptsForRecord(trainingRecordId)
        .catch(() => undefined);
    }

    if (this.companyTraining) {
      await this.companyTraining
        .refreshAfterTrainingRecord(trainingRecordId)
        .catch(() => undefined);
    }

    return mapTrainingRecordForWallet(record, {
      validationOutcome: validationOutcome?.outcome,
      jurisdictionCode: validationOutcome?.jurisdictionCode,
    });
  }

  async listWalletTraining(
    workerId: number,
  ): Promise<WalletTrainingRecordDto[]> {
    const records = await this.prisma.trainingRecord.findMany({
      where: { workerId },
      include: TRAINING_RECORD_WALLET_INCLUDE,
      orderBy: { issuedAt: 'desc' },
    });

    const validations = await this.prisma.trainingValidationResult.findMany({
      where: { trainingRecordId: { in: records.map((r) => r.id) } },
      orderBy: { validatedAt: 'desc' },
    });
    const latestByRecord = new Map<number, (typeof validations)[0]>();
    for (const v of validations) {
      if (v.trainingRecordId && !latestByRecord.has(v.trainingRecordId)) {
        latestByRecord.set(v.trainingRecordId, v);
      }
    }

    const veraProjections = this.veraProjection
      ? await this.veraProjection.getProjectionsForRecords(
          records.map((r) => r.id),
        )
      : new Map();

    return records.map((r) => {
      const vera = veraProjections.get(r.id);
      return mapTrainingRecordForWallet(r, {
        validationOutcome: latestByRecord.get(r.id)?.outcome,
        jurisdictionCode:
          vera?.jurisdictionCoverage?.[0] ??
          latestByRecord.get(r.id)?.jurisdictionCode ??
          undefined,
        verifiedByVeraStatus: vera?.verifiedByVeraStatus,
        jurisdictionCoverage: vera?.jurisdictionCoverage,
        regulatorySummary: vera?.regulatorySummary ?? undefined,
        nftTokenId: vera?.nftTokenId ?? undefined,
        nftChain: vera?.nftChain ?? undefined,
      });
    });
  }

  private async syncWorkerWalletItem(
    record: {
      id: number;
      workerId: number;
      certificationId: number;
      companyId: number | null;
      course: { code: string } | null;
      certification: { name: string };
    },
    equipmentId?: number,
  ) {
    const catalogTypeKey = record.course?.code
      ? `training:${record.course.code}`
      : `certification:${record.certificationId}`;

    const existing = await this.prisma.workerWalletItem.findFirst({
      where: { trainingRecordId: record.id },
    });

    const notes = JSON.stringify({
      source: 'training_provider',
      certificationName: record.certification.name,
      syncedAt: new Date().toISOString(),
    });

    if (existing) {
      await this.prisma.workerWalletItem.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          companyId: record.companyId ?? existing.companyId,
          equipmentId: equipmentId ?? existing.equipmentId,
          catalogTypeKey,
          notes,
          updatedAt: new Date(),
        },
      });
      return;
    }

    await this.prisma.workerWalletItem.create({
      data: {
        workerId: record.workerId,
        trainingRecordId: record.id,
        catalogTypeKey,
        companyId: record.companyId ?? undefined,
        equipmentId: equipmentId ?? undefined,
        status: 'ACTIVE',
        notes,
      },
    });
  }

  private async syncProjectCompliance(record: {
    workerId: number;
    projectId: number | null;
    companyId: number | null;
  }) {
    if (!record.projectId || !record.companyId) return;

    const existing = await this.prisma.projectAssignment.findFirst({
      where: {
        workerId: record.workerId,
        projectId: record.projectId,
        status: AssignmentStatus.ACTIVE,
      },
    });
    if (!existing) {
      await this.prisma.projectAssignment.create({
        data: {
          workerId: record.workerId,
          projectId: record.projectId,
          companyId: record.companyId,
          status: AssignmentStatus.ACTIVE,
        },
      });
    }
  }

  private async syncEquipmentCompetency(
    record: { workerId: number; certificationId: number },
    equipmentId?: number,
  ) {
    const equipmentIds = new Set<number>();
    if (equipmentId) equipmentIds.add(equipmentId);

    const assignments = await this.prisma.workerAssignment.findMany({
      where: {
        workerId: record.workerId,
        endedAt: null,
        equipmentId: { not: null },
      },
      select: { equipmentId: true },
    });
    for (const a of assignments) {
      if (a.equipmentId) equipmentIds.add(a.equipmentId);
    }

    const linkWorkers = await this.prisma.equipmentLinkWorker.findMany({
      where: { workerId: record.workerId },
      include: {
        equipmentLink: {
          include: {
            equipment: {
              include: { trainingRequirements: true },
            },
          },
        },
      },
    });
    for (const lw of linkWorkers) {
      const eq = lw.equipmentLink.equipment;
      const requires = eq.trainingRequirements.some(
        (r) => r.certificationId === record.certificationId,
      );
      if (requires) equipmentIds.add(eq.id);
    }

    await this.equipmentCompliance.recalculateForCertification(
      record.certificationId,
    );

    for (const id of equipmentIds) {
      await this.equipmentCompliance.recalculate(id, {
        trigger: 'TRAINING',
        notes: `Training record synced to worker wallet (cert ${record.certificationId})`,
      });
    }
  }
}
