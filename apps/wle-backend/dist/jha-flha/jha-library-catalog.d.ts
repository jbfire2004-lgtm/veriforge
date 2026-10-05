import type { ControlSeed, HazardSeed } from './jha-library-seed';
export declare function getCompleteCatalog(): {
    hazards: HazardSeed[];
    controls: ControlSeed[];
};
export declare const CONTROL_CLASS_LOOKUP: Map<string, ControlSeed['controlClass']>;
export declare const TASK_HAZARD_PROFILES: Array<{
    id: string;
    label: string;
    tokens: string[];
    hazardCategories: string[];
    hazardKeywords: string[];
    energyTypes: string[];
    requiredControlCategories: string[];
    minDirectControls?: number;
}>;
