import { TrainingCredentialNftProjectionService } from '../training-credential-nft/training-credential-nft-projection.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from './company-links.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance/training-standards-compliance.service';
import { WalletTrainingRecordDto } from './training-wallet.mapper';
import { CompanyTrainingComplianceService } from '../../companies/company-training-compliance.service';
import { UnionHallTrainingService } from './union-hall-training.service';
export declare class TrainingWalletIntegrationService {
    private readonly prisma;
    private readonly companyLinks;
    private readonly equipmentCompliance;
    private readonly standardsCompliance?;
    private readonly companyTraining?;
    private readonly unionHallTraining?;
    private readonly veraProjection?;
    constructor(prisma: PrismaService, companyLinks: CompanyLinksService, equipmentCompliance: EquipmentComplianceService, standardsCompliance?: TrainingStandardsComplianceService, companyTraining?: CompanyTrainingComplianceService, unionHallTraining?: UnionHallTrainingService, veraProjection?: TrainingCredentialNftProjectionService);
    syncAfterTrainingRecord(trainingRecordId: number, equipmentId?: number): Promise<WalletTrainingRecordDto>;
    listWalletTraining(workerId: number): Promise<WalletTrainingRecordDto[]>;
    private syncWorkerWalletItem;
    private syncProjectCompliance;
    private syncEquipmentCompetency;
}
