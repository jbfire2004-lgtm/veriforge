import { PmUnifiedControlType, PmUnifiedEnergyType } from '@prisma/client';
export type ControlSuggestion = {
    title: string;
    description: string;
    controlType: PmUnifiedControlType;
    controlStrength: number;
    hierarchyLevel: number;
    trainingCodes: string[];
    ppeTypes: string[];
    permitTypes: string[];
    reason: string;
};
export declare class ControlSuggestionEngine {
    suggest(input: {
        category: string;
        energyTypes: PmUnifiedEnergyType[];
        equipmentType?: string;
        sifPotential: boolean;
        missingControlCount: number;
    }): ControlSuggestion[];
    detectWeakControls(links: Array<{
        effectivenessScore?: number | null;
        verified: boolean;
    }>): string[];
}
