import { JhaLibraryService } from './jha-library.service';
export type HazardCatalogRow = ReturnType<JhaLibraryService['mapHazardRow']>;
export type ControlCatalogRow = ReturnType<JhaLibraryService['mapControlRow']>;
export declare class HazardControlCatalogService {
    private readonly library;
    constructor(library: JhaLibraryService);
    private filterBySearch;
    listHazards(companyId: number, projectId?: number, options?: {
        category?: string;
        search?: string;
        taskCode?: string;
    }): Promise<{
        hazards: {
            id: string;
            category: string;
            subcategory: string;
            description: string;
            defaultSeverity: number;
            defaultLikelihood: number;
            defaultEnergyTypes: string[];
            keywords: string[];
        }[];
        categories: string[];
        counts: Record<string, number>;
        total: number;
    }>;
    listControls(companyId: number, projectId?: number, options?: {
        hazardCategory?: string;
        hazardCategories?: string[];
        search?: string;
    }): Promise<{
        controls: {
            id: string;
            controlType: string;
            description: string;
            hazardCategories: string[];
            energyTypes: string[];
            ppeRequired: boolean;
            controlClass: "direct" | "alternative";
        }[];
        controlTypes: string[];
        counts: Record<string, number>;
        total: number;
    }>;
    suggestHazardsForTask(companyId: number, projectId: number | undefined, input: {
        taskDescription: string;
        locationNote?: string;
        weather?: string;
        existingHazardDescriptions?: string[];
    }): Promise<{
        suggestedHazards: (import("./jha-library-seed").HazardSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
        })[];
        missedHazards: (import("./jha-library-seed").HazardSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
            profileId?: string;
        })[];
        matchedTaskProfiles: string[];
        warnings: string[];
    }>;
    suggestControlsForHazards(companyId: number, projectId: number | undefined, input: {
        taskDescription?: string;
        hazardCategories?: string[];
        hazardDescriptions?: string[];
        energyTypes?: string[];
        focusedHazardCategory?: string;
        focusedHazardDescription?: string;
        focusedHazardEnergyTypes?: string[];
        existingControlDescriptions?: string[];
    }): Promise<{
        suggestedControls: (import("./jha-library-seed").ControlSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
        })[];
        missedControls: (import("./jha-library-seed").ControlSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
            profileId?: string;
        })[];
        warnings: string[];
        crewOftenAdds: {
            description: string;
            controlType?: string;
            count: number;
            reason: string;
        }[];
    }>;
    aiIdentifyHazards(companyId: number, projectId: number | undefined, body: {
        taskDescription: string;
        workScope?: string;
        locationNote?: string;
        equipment?: string[];
    }): Promise<{
        source: "stub";
        model: any;
        message: string;
        hazards: (import("./jha-library-seed").HazardSeed & {
            id?: string;
        } & {
            score: number;
            reason: string;
        })[];
        matchedTaskProfiles: string[];
        warnings: string[];
    }>;
}
