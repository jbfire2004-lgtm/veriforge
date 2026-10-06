import { Injectable } from '@nestjs/common';
import { EquipmentWalletService } from '../equipment-wallet/equipment-wallet.service';
import { ToolsPpeCoreService } from '../tools-ppe-core/tools-ppe-core.service';
import { RegistryService } from './registry.service';
import { TrainingWalletIntegrationService } from './training-wallet-integration.service';
import {
  workerStaffWalletPath,
  workerVerifyUrl,
} from '../../common/wallet-routes';

@Injectable()
export class WalletsService {
  constructor(
    private readonly registry: RegistryService,
    private readonly toolsPpe: ToolsPpeCoreService,
    private readonly equipmentWallet: EquipmentWalletService,
    private readonly walletIntegration: TrainingWalletIntegrationService,
  ) {}

  async getWorkerWallet(workerId: number) {
    const profile = await this.registry.getWorkerProfile(workerId);
    const qrToken = await this.registry.ensureWorkerQrToken(workerId);
    const baseUrl = process.env.PUBLIC_BASE_URL || 'https://app.vera.local';

    const toolsPpe = await this.toolsPpe.getWorkerToolsPpe(workerId);
    const training = await this.walletIntegration.listWalletTraining(workerId);

    return {
      type: 'worker' as const,
      workerId,
      qrToken,
      qrContent: workerVerifyUrl(workerId, baseUrl),
      verifyUrl: workerVerifyUrl(workerId, baseUrl),
      walletUrl: workerStaffWalletPath(workerId),
      qrJson: { type: 'worker', id: workerId, token: qrToken },
      training,
      companyHistory: profile.companyLinks,
      projectHistory: profile.projectAssignments,
      unionHalls: profile.unionMemberships,
      equipmentCompetency: profile.competencyEvaluations,
      walletItems: profile.workerWalletItems,
      toolsAssigned: toolsPpe.tools,
      ppeAssigned: toolsPpe.ppe,
    };
  }

  async getEquipmentWallet(equipmentId: number) {
    const profile = await this.registry.getEquipmentProfile(equipmentId);
    const qrToken = await this.registry.ensureEquipmentQrToken(equipmentId);
    const lockedOut = Boolean(profile.lockedOutAt);

    const linkStatus = profile.equipmentLinks.find(
      (l) => l.active,
    )?.complianceStatus;
    const complianceStatus =
      profile.complianceStatus ??
      linkStatus ??
      (lockedOut ? 'LOCKED_OUT' : 'COMPLIANT');

    return {
      type: 'equipment' as const,
      equipmentId,
      qrToken,
      qrContent: JSON.stringify({
        type: 'equipment',
        id: equipmentId,
        token: qrToken,
      }),
      inspectionHistory: profile.inspections,
      competencyRequirements: profile.competencyRequirements,
      trainingRequirements: profile.trainingRequirements,
      assignedWorkers: profile.equipmentLinks.flatMap((l) =>
        l.assignedWorkers.map((aw) => ({
          ...aw.worker,
          companyId: l.companyId,
        })),
      ),
      assignedProjects: profile.projectAssignments,
      companyHistory: profile.equipmentLinks,
      complianceStatus,
      lastInspectionAt: profile.lastInspectionAt,
      nextInspectionAt: profile.nextInspectionAt,
      lockoutStatus: profile.lockoutStatus,
      competencyRequired: profile.competencyRequired,
      trainingRequired: profile.trainingRequired,
      complianceUpdatedAt: profile.complianceUpdatedAt,
      lockedOut,
      lockoutReason: profile.lockoutReason,
      walletUrl: `/equipment/${equipmentId}/wallet`,
    };
  }

  /** Canonical full equipment wallet (inspections, competency, maintenance, compliance). */
  async getEquipmentWalletFull(equipmentId: number) {
    return this.equipmentWallet.getFullWallet(equipmentId);
  }
}
