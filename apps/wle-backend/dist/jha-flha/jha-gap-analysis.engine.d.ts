import type { ControlSeed, HazardSeed } from './jha-library-seed';
type LibraryHazardRow = HazardSeed & {
    id?: string;
};
type LibraryControlRow = ControlSeed & {
    id?: string;
};
export type GapAnalysisInput = {
    taskDescription?: string;
    locationNote?: string;
    weather?: string;
    existingHazardDescriptions: string[];
    existingHazardCategories: string[];
    existingControlDescriptions: string[];
    existingControlTypes: string[];
    existingEnergyTypes: string[];
    hazardLibrary: LibraryHazardRow[];
    controlLibrary: LibraryControlRow[];
    onFormControls?: Array<{
        controlType: string;
        description: string;
        hazardId?: string | null;
        controlClass?: ControlSeed['controlClass'];
    }>;
};
export type GapAnalysisResult = {
    missedHazards: Array<LibraryHazardRow & {
        score: number;
        reason: string;
        profileId: string;
    }>;
    missedControls: Array<LibraryControlRow & {
        score: number;
        reason: string;
        profileId: string;
    }>;
    requiredEnergyTypes: string[];
    matchedProfiles: string[];
    gapWarnings: string[];
    hecaNotes: string[];
};
export declare function analyzeJhaGaps(input: GapAnalysisInput): GapAnalysisResult;
export {};
