import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { CompetencyService } from '../competency/competency.service';
import { MaintenanceCalibrationCoreService } from '../maintenance-calibration-core/maintenance-calibration-core.service';
import {
  equipmentScanAliasUrl,
  equipmentStaffWalletPath,
  equipmentVerifyUrl,
} from '../../common/wallet-routes';

@Injectable()
export class EquipmentWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly competency: CompetencyService,
    private readonly maintenanceCalibration: MaintenanceCalibrationCoreService,
  ) {}

  async getQr(equipmentId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { id: true, name: true, serialNumber: true, assetTag: true },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const qrToken = await this.ensureEquipmentQrToken(equipmentId);
    const baseUrl = process.env.PUBLIC_BASE_URL || 'https://app.vera.local';

    return {
      equipmentId,
      equipmentName: equipment.name,
      serialNumber: equipment.serialNumber,
      assetTag: equipment.assetTag,
      qrToken,
      qrContent: JSON.stringify({
        type: 'equipment',
        id: equipmentId,
        token: qrToken,
      }),
      scanUrl: equipmentScanAliasUrl(equipmentId, baseUrl),
      verifyUrl: equipmentVerifyUrl(equipmentId, baseUrl),
      walletUrl: `${baseUrl}${equipmentStaffWalletPath(equipmentId)}`,
    };
  }

  async getInspectionHistory(equipmentId: number) {
    await this.assertExists(equipmentId);
    const rows = await this.prisma.inspection.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        supervisor: { select: { id: true, email: true, username: true } },
        checklistTemplate: {
          select: { id: true, name: true, inspectionType: true },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      inspectionType: row.inspectionType,
      kind: row.kind,
      passed: row.passed,
      status: row.status,
      lockoutTriggered: row.lockoutTriggered,
      completedAt: row.completedAt,
      nextInspectionDate: row.nextInspectionDate,
      createdAt: row.createdAt,
      worker: row.worker,
      inspectorId: row.supervisorId,
      inspector: row.supervisor,
      checklistName: row.checklistTemplate?.name,
    }));
  }

  async getCompetencyRequirements(equipmentId: number) {
    await this.assertExists(equipmentId);
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

    const rules = await this.competency.resolveRules(equipmentId);

    const assetReq = equipment.competencyRequirements[0];
    const assetRequirement = assetReq
      ? {
          source: 'equipment' as const,
          minPassingScore: assetReq.minPassingScore,
          expiryDays: assetReq.expiryDays,
          requireEvaluation: assetReq.requireEvaluation,
          certification: assetReq.certification,
        }
      : null;

    const typeRequirement = equipment.type?.competencyRequirement
      ? {
          source: 'type' as const,
          equipmentTypeId: equipment.typeId,
          equipmentTypeName: equipment.type.name,
          minPassingScore: equipment.type.competencyRequirement.minPassingScore,
          expiryDays: equipment.type.competencyRequirement.expiryDays,
          requireEvaluation:
            equipment.type.competencyRequirement.requireEvaluation,
          certification: equipment.type.competencyRequirement.certification,
        }
      : null;

    const recentEvaluations = await this.prisma.competencyEvaluation.findMany({
      where: { equipmentId },
      orderBy: { evaluationDate: 'desc' },
      take: 20,
      include: {
        worker: { select: { id: true, firstName: true, lastName: true } },
        evaluator: { select: { id: true, email: true, username: true } },
      },
    });

    return {
      equipmentId,
      competencyRequired: equipment.competencyRequired,
      resolvedRules: rules,
      assetRequirement,
      typeRequirement,
      recentEvaluations,
    };
  }

  async getAssignedWorkers(equipmentId: number) {
    await this.assertExists(equipmentId);
    const links = await this.prisma.equipmentLink.findMany({
      where: { equipmentId, active: true },
      include: {
        company: { select: { id: true, name: true } },
        assignedWorkers: {
          include: {
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return links.flatMap((link) =>
      link.assignedWorkers.map((aw) => ({
        equipmentLinkId: link.id,
        companyId: link.companyId,
        companyName: link.company.name,
        worker: aw.worker,
        assignedAt: aw.assignedAt,
      })),
    );
  }

  async getAssignedProjects(equipmentId: number) {
    await this.assertExists(equipmentId);
    const assignments = await this.prisma.equipmentProjectAssignment.findMany({
      where: { equipmentId },
      orderBy: { assignedAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            companyId: true,
            company: { select: { id: true, name: true } },
          },
        },
      },
    });

    return assignments.map((a) => ({
      id: a.id,
      equipmentId: a.equipmentId,
      projectId: a.projectId,
      status: a.status,
      assignedAt: a.assignedAt,
      endedAt: a.endedAt,
      project: a.project,
    }));
  }

  async getComplianceStatus(equipmentId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        equipmentLinks: {
          where: { active: true },
          select: {
            id: true,
            companyId: true,
            complianceStatus: true,
            company: { select: { id: true, name: true } },
          },
        },
        complianceHistory: {
          orderBy: { assessedAt: 'desc' },
          take: 15,
        },
      },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const lockedOut = Boolean(equipment.lockedOutAt);
    const activeLink = equipment.equipmentLinks[0];

    return {
      equipmentId,
      complianceStatus: equipment.complianceStatus,
      linkComplianceStatus: activeLink?.complianceStatus ?? null,
      lastInspectionAt: equipment.lastInspectionAt,
      nextInspectionAt: equipment.nextInspectionAt,
      lockoutStatus: equipment.lockoutStatus,
      lockedOut,
      lockoutReason: equipment.lockoutReason,
      safetyStatus: equipment.safetyStatus,
      competencyRequired: equipment.competencyRequired,
      trainingRequired: equipment.trainingRequired,
      complianceUpdatedAt: equipment.complianceUpdatedAt,
      activeCompany: activeLink?.company ?? null,
      history: equipment.complianceHistory,
    };
  }

  async getFullWallet(equipmentId: number) {
    const [
      qr,
      inspections,
      competency,
      workers,
      projects,
      compliance,
      equipment,
    ] = await Promise.all([
      this.getQr(equipmentId),
      this.getInspectionHistory(equipmentId),
      this.getCompetencyRequirements(equipmentId),
      this.getAssignedWorkers(equipmentId),
      this.getAssignedProjects(equipmentId),
      this.getComplianceStatus(equipmentId),
      this.prisma.equipment.findUnique({
        where: { id: equipmentId },
        select: {
          id: true,
          name: true,
          serialNumber: true,
          assetTag: true,
          catalogTypeKey: true,
          photoUrl: true,
        },
      }),
    ]);

    if (!equipment) throw new NotFoundException('Equipment not found');

    const [trainingRequirements, maintenanceCalibration] = await Promise.all([
      this.prisma.equipmentTrainingRequirement.findMany({
        where: { equipmentId },
        include: { certification: true },
      }),
      this.maintenanceCalibration.getEquipmentSummary(equipmentId),
    ]);

    return {
      type: 'equipment' as const,
      equipment,
      qr,
      inspections,
      competency,
      assignedWorkers: workers,
      assignedProjects: projects,
      compliance,
      trainingRequirements,
      maintenance: maintenanceCalibration,
    };
  }

  async getMaintenanceCalibration(equipmentId: number) {
    return this.maintenanceCalibration.getEquipmentSummary(equipmentId);
  }

  private async assertExists(equipmentId: number) {
    const count = await this.prisma.equipment.count({
      where: { id: equipmentId },
    });
    if (!count) throw new NotFoundException('Equipment not found');
  }

  private async ensureEquipmentQrToken(equipmentId: number) {
    const e = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!e) throw new NotFoundException('Equipment not found');
    if (e.qrToken) return e.qrToken;
    const qrToken = `e-${randomBytes(8).toString('hex')}`;
    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { qrToken },
    });
    return qrToken;
  }
}
