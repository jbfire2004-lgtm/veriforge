import { PmEnergyControlState, PmUnifiedEnergyType } from '@prisma/client';
export type EnergyWheelEntry = {
    energyType: PmUnifiedEnergyType;
    controlState: PmEnergyControlState;
    existingControls: string[];
    missingOrFailedControls: string[];
    highEnergy: boolean;
};
export declare const ENERGY_WHEEL_TYPES: Array<{
    type: PmUnifiedEnergyType;
    label: string;
    defaultHighEnergy: boolean;
}>;
export declare class SmsEnergyWheelService {
    catalog(): {
        energyTypes: {
            type: PmUnifiedEnergyType;
            label: string;
            defaultHighEnergy: boolean;
        }[];
        controlStates: PmEnergyControlState[];
    };
    suggestControls(energyTypes: PmUnifiedEnergyType[]): string[];
    buildProfile(entries: EnergyWheelEntry[]): {
        entries: EnergyWheelEntry[];
        highEnergy: boolean;
        uncontrolledCount: number;
        systemicGaps: string[];
        suggestedControls: string[];
    };
    inferFromText(text: string): PmUnifiedEnergyType[];
}
