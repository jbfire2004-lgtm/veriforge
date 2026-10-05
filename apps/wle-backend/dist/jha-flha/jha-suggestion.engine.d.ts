import type { ControlSeed, HazardSeed } from './jha-library-seed';
import type { ProjectLearnings } from './jha-library-learning.service';
export type LibraryHazardRow = HazardSeed & {
    id?: string;
};
export type LibraryControlRow = ControlSeed & {
    id?: string;
};
export type JhaSuggestionInput = {
    taskDescription?: string;
    locationNote?: string;
    weather?: string;
    selectedHazardCategories: string[];
    selectedEnergyTypes: string[];
    existingHazardDescriptions: string[];
    existingControlDescriptions: string[];
    hazardLibrary: LibraryHazardRow[];
    controlLibrary: LibraryControlRow[];
    focusedHazardCategory?: string;
    focusedHazardEnergyTypes?: string[];
    focusedHazardDescription?: string;
    projectLearnings?: ProjectLearnings;
    onFormControls?: Array<{
        controlType: string;
        description: string;
        controlClass?: ControlSeed['controlClass'];
    }>;
};
export type JhaSuggestionResult = {
    suggestedHazards: Array<LibraryHazardRow & {
        score: number;
        reason: string;
    }>;
    suggestedControls: Array<LibraryControlRow & {
        score: number;
        reason: string;
    }>;
    warnings: string[];
    crewOftenAdds?: {
        hazards: Array<{
            description: string;
            category?: string;
            count: number;
            reason: string;
        }>;
        controls: Array<{
            description: string;
            controlType?: string;
            count: number;
            reason: string;
        }>;
    };
    missedHazards?: Array<LibraryHazardRow & {
        score: number;
        reason: string;
        profileId?: string;
    }>;
    missedControls?: Array<LibraryControlRow & {
        score: number;
        reason: string;
        profileId?: string;
    }>;
    requiredEnergyTypes?: string[];
    matchedTaskProfiles?: string[];
    gapWarnings?: string[];
    hecaNotes?: string[];
};
export declare function suggestJhaLibrary(input: JhaSuggestionInput): JhaSuggestionResult;
