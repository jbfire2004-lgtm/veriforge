import { PrismaService } from '../../prisma/prisma.service';
export type MintEligibility = {
    eligible: boolean;
    reason?: string;
    decisionId?: number;
    workerId?: number;
};
export declare class TrainingCredentialNftEligibilityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkMintEligibility(trainingRecordId: number, regulatoryDecisionId?: number): Promise<MintEligibility>;
}
