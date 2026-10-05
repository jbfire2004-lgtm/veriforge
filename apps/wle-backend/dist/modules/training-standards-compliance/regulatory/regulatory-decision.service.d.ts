import { PrismaService } from '../../../prisma/prisma.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance.service';
import { RegulatoryEquivalencyService } from './regulatory-equivalency.service';
import type { RegulatoryDecision, RegulatoryTrainingInput } from './regulatory-decision.types';
import { TrainingCredentialNftCoordinatorService } from '../../training-credential-nft/training-credential-nft-coordinator.service';
export declare class RegulatoryDecisionService {
    private readonly prisma;
    private readonly standards;
    private readonly equivalency;
    private readonly nftCoordinator?;
    constructor(prisma: PrismaService, standards: TrainingStandardsComplianceService, equivalency: RegulatoryEquivalencyService, nftCoordinator?: TrainingCredentialNftCoordinatorService);
    verifyTrainingAgainstRegulations(input: RegulatoryTrainingInput | number, validatedBy?: number): Promise<RegulatoryDecision>;
    getLatestDecision(trainingRecordId: number): Promise<RegulatoryDecision | null>;
    private mapToRegulatoryStatus;
    private mapRecommendedAction;
    private buildReasons;
}
