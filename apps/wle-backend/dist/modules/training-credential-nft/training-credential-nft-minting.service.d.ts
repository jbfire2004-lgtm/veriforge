import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainCredentialProvider } from './blockchain-provider.interface';
export declare class TrainingCredentialNftMintingService {
    private readonly prisma;
    private readonly chain;
    private readonly logger;
    constructor(prisma: PrismaService, chain: BlockchainCredentialProvider);
    mintTrainingCredentialNft(trainingRecordId: number, regulatoryVerificationDecisionId: number): Promise<{
        id: number;
        trainingRecordId: number;
        workerId: number;
        regulatoryVerificationDecisionId: number;
        nftTokenId: string | null;
        chain: string;
        transactionHash: string | null;
        mintStatus: import(".prisma/client").$Enums.TrainingCredentialNftMintStatus;
        regulatoryDecisionHash: string;
        originalDocumentHash: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        mintedAt: Date | null;
        createdAt: Date;
    }>;
    processMintJob(jobId: number): Promise<void>;
}
