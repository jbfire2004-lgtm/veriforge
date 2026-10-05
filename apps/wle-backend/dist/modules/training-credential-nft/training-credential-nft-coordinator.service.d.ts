import { PrismaService } from '../../prisma/prisma.service';
import { TrainingCredentialNftEligibilityService } from './training-credential-nft-eligibility.service';
import { TrainingCredentialNftMintingService } from './training-credential-nft-minting.service';
export declare class TrainingCredentialNftCoordinatorService {
    private readonly prisma;
    private readonly eligibility;
    private readonly minting;
    private readonly logger;
    constructor(prisma: PrismaService, eligibility: TrainingCredentialNftEligibilityService, minting: TrainingCredentialNftMintingService);
    scheduleMintIfEligible(trainingRecordId: number, regulatoryDecisionId?: number): Promise<void>;
}
