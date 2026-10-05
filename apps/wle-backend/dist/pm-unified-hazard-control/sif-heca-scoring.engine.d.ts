export type SifHecaInput = {
    severity: number;
    likelihood: number;
    sifPotential?: boolean;
    highEnergyCount: number;
    openCapaCount: number;
    priorIncidentCount: number;
};
export type SifHecaResult = {
    riskScore: number;
    sifScore: number;
    sifPotential: boolean;
    hecaCategoryKey: string;
    supervisorReviewRequired: boolean;
    requireCapa: boolean;
    explanation: string[];
};
export declare class SifHecaScoringEngine {
    score(input: SifHecaInput): SifHecaResult;
}
