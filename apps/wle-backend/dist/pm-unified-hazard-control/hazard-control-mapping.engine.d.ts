import { PmUnifiedControlType } from '@prisma/client';
export type MappingValidation = {
    complete: boolean;
    missing: string[];
    weakControls: string[];
    requiredJhaControls: string[];
    requiredInspectionItems: string[];
};
export declare class HazardControlMappingEngine {
    validateMapping(input: {
        hazardTitle: string;
        linkedControlCount: number;
        ppeCount: number;
        trainingCount: number;
        weakIssues: string[];
        sifPotential: boolean;
    }): MappingValidation;
    hierarchyRank(type: PmUnifiedControlType): number;
}
