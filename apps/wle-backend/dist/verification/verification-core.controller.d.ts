import type { Request } from 'express';
import { VerificationService } from './verification.service';
type JwtRequestUser = {
    id: number;
    email?: string;
    role?: string;
};
export declare class VerificationCoreController {
    private readonly verification;
    constructor(verification: VerificationService);
    trainingRecord(id: number, expectedWorkerId?: string, expectedCompanyId?: string, expectedTrainingType?: string, expectedCertificateNumber?: string, expectedProvider?: string): Promise<import("./types/training-record-verification.types").TrainingRecordVerificationResult>;
    trainingSnapshot(id: number): Promise<{
        trainingRecordId: number;
        lastVerificationStatus: string;
        lastVerificationChecks: import(".prisma/client").Prisma.JsonValue;
        verifiedAt: string;
        completedAt: string;
        credentialNft: {
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
        };
        latestMintJob: {
            id: number;
            trainingRecordId: number;
            status: import(".prisma/client").$Enums.NftMintJobStatus;
            attempts: number;
            lastError: string | null;
            idempotencyKey: string;
            createdAt: Date;
            processedAt: Date | null;
        };
    }>;
    completeTrainingRecord(id: number, req: Request & {
        user?: JwtRequestUser;
    }): Promise<{
        ok: true;
    }>;
}
export {};
