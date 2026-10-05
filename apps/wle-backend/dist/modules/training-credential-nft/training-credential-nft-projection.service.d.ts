import { PrismaService } from '../../prisma/prisma.service';
export type VerifiedByVeraStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'VERIFIED_WITH_NFT';
export type VerifiedByVeraProjection = {
    trainingRecordId: number;
    verifiedByVeraStatus: VerifiedByVeraStatus;
    jurisdictionCoverage: string[];
    regulatorySummary: string | null;
    nftTokenId: string | null;
    nftChain: string | null;
};
export declare class TrainingCredentialNftProjectionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProjection(trainingRecordId: number): Promise<VerifiedByVeraProjection>;
    getProjectionsForRecords(trainingRecordIds: number[]): Promise<Map<number, VerifiedByVeraProjection>>;
}
