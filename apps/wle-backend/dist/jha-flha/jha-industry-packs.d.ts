import type { ControlSeed, HazardSeed } from './jha-library-seed';
export type JhaIndustryPackId = 'mining' | 'pipeline' | 'turnaround' | 'construction' | 'oil_gas' | 'forestry' | 'utilities';
export type JhaIndustryPack = {
    id: JhaIndustryPackId;
    label: string;
    industryMatchers: string[];
    hazards: HazardSeed[];
    controls: ControlSeed[];
};
export declare const MINING_HAZARDS: HazardSeed[];
export declare const MINING_CONTROLS: ControlSeed[];
export declare const PIPELINE_HAZARDS: HazardSeed[];
export declare const PIPELINE_CONTROLS: ControlSeed[];
export declare const TURNAROUND_HAZARDS: HazardSeed[];
export declare const TURNAROUND_CONTROLS: ControlSeed[];
export declare const JHA_INDUSTRY_PACKS: JhaIndustryPack[];
export declare function resolveIndustryPacks(industry?: string | null): JhaIndustryPackId[];
export declare function seedsForPacks(packIds: JhaIndustryPackId[]): {
    hazards: HazardSeed[];
    controls: ControlSeed[];
};
export declare function packLabels(packIds: JhaIndustryPackId[]): string[];
