import { PmUnifiedEnergyType } from '@prisma/client';
export type EnergyDetection = {
    energyType: PmUnifiedEnergyType;
    exposureLevel: number;
    highEnergyFlag: boolean;
    severityScore: number;
    autoDetected: boolean;
};
export declare class EnergyWheelEngine {
    detectFromText(description: string): EnergyDetection[];
    suggestControlDescriptions(energyTypes: PmUnifiedEnergyType[]): string[];
    aggregateEnergySeverity(energies: EnergyDetection[]): number;
}
