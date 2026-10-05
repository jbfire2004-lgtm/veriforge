export type ControlClass = 'direct' | 'alternative';
export type HazardSeed = {
    category: string;
    subcategory?: string;
    description: string;
    defaultSeverity?: number;
    defaultLikelihood?: number;
    defaultEnergyTypes: string[];
    taskTypes?: string[];
    keywords?: string[];
};
export type ControlSeed = {
    controlType: string;
    description: string;
    hazardCategories: string[];
    energyTypes?: string[];
    ppeRequired?: boolean;
    controlClass?: ControlClass;
};
export declare const FULL_HAZARD_SEED: HazardSeed[];
export declare const FULL_CONTROL_SEED: ControlSeed[];
