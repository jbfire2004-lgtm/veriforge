import { JhaEnergyType } from '@prisma/client';
import { CONTROL_CLASS_LOOKUP } from './jha-library-catalog';
export declare const ENERGY_WHEEL: Array<{
    type: JhaEnergyType;
    label: string;
    requiredControlTypes: string[];
    highExposureThreshold: number;
}>;
export declare const DEFAULT_HAZARD_SEED: import("./jha-library-seed").HazardSeed[];
export declare const DEFAULT_CONTROL_SEED: import("./jha-library-seed").ControlSeed[];
export declare const HAZARD_KEYWORD_LOOKUP: Map<string, string[]>;
export { CONTROL_CLASS_LOOKUP };
export declare function industryPackSeeds(_packIds?: string[]): {
    hazards: import("./jha-library-seed").HazardSeed[];
    controls: import("./jha-library-seed").ControlSeed[];
};
