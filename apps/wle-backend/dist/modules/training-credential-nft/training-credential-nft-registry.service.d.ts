import { PrismaService } from '../../prisma/prisma.service';
export declare class TrainingCredentialNftRegistryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByTrainingRecordId(trainingRecordId: number): import(".prisma/client").Prisma.Prisma__TrainingCredentialNftClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByWorkerId(workerId: number): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
}
