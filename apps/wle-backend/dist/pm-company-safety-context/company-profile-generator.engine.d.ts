import { PmProjectSafetyRiskLevel } from '@prisma/client';
export type CompanyProfileGeneratorInput = {
    projectCount?: number;
    workerCount?: number;
    incidentCount12m?: number;
    sifCount12m?: number;
    industryType?: string;
};
export type GeneratedCompanyProfile = {
    corporateRiskLevel: PmProjectSafetyRiskLevel;
    ppeStandards: string[];
    enforcementRules: Record<string, unknown>;
    defaultTrainingMatrix: Array<{
        roleType: string;
        category: string;
        trainingCode: string;
        trainingName: string;
        expiresInDays: number;
    }>;
};
export declare class CompanyProfileGeneratorEngine {
    generate(input: CompanyProfileGeneratorInput): GeneratedCompanyProfile;
}
