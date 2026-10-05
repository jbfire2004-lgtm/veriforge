import { TrainingCredentialNftCoordinatorService } from './training-credential-nft-coordinator.service';
import { TrainingCredentialNftProjectionService } from './training-credential-nft-projection.service';
import { TrainingCredentialNftRegistryService } from './training-credential-nft-registry.service';
export declare class TrainingCredentialNftController {
    private readonly projection;
    private readonly registry;
    private readonly coordinator;
    constructor(projection: TrainingCredentialNftProjectionService, registry: TrainingCredentialNftRegistryService, coordinator: TrainingCredentialNftCoordinatorService);
    getProjection(id: number): Promise<import("./training-credential-nft-projection.service").VerifiedByVeraProjection>;
    getNft(id: number): import(".prisma/client").Prisma.Prisma__TrainingCredentialNftClient<{
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
    retryMint(id: number): Promise<void>;
}
