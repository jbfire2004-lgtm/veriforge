import { PrismaService } from '../prisma/prisma.service';
import type { ContractorComplianceEngineInput, ContractorComplianceEngineOutput, WorkScope } from './contractor-compliance-engine.types';
export declare class ContractorComplianceEngineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generate(input: ContractorComplianceEngineInput): ContractorComplianceEngineOutput;
    buildInputFromMembership(membershipId: string, workScope?: WorkScope): Promise<ContractorComplianceEngineInput>;
    private estimateTrif;
    private assessRiskProfile;
    private findComplianceGaps;
    private matchRequirement;
    private textCoveredByDocuments;
    private assessPerformance;
    private rateStats;
    private statsNotes;
    private rateIncidentTrend;
    private incidentNotes;
    private rateAudits;
    private auditNotes;
    private decideApproval;
    private buildConditions;
    private buildContractorFeedback;
    private buildInternalSummary;
}
