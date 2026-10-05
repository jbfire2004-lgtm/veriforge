import { TenantScopeService } from '../security/tenant-scope.service';
import type { SecurityActor } from '../security/security.types';
import { HazardControlCatalogService } from './hazard-control-catalog.service';
export declare class HazardCatalogController {
    private readonly catalog;
    private readonly tenant;
    constructor(catalog: HazardControlCatalogService, tenant: TenantScopeService);
    listHazards(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string, category?: string, search?: string, taskCode?: string): Promise<{
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
    suggestForTask(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string, taskDescription?: string, locationNote?: string, weather?: string, existingHazards?: string): Promise<{
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
    aiIdentify(req: {
        user?: SecurityActor;
    }, companyId: string, body: {
        taskDescription: string;
        workScope?: string;
        locationNote?: string;
        equipment?: string[];
    }, projectId?: string): Promise<{
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
export declare class ControlCatalogController {
    private readonly catalog;
    private readonly tenant;
    constructor(catalog: HazardControlCatalogService, tenant: TenantScopeService);
    listControls(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string, hazardCategory?: string, hazardCategories?: string, search?: string): Promise<{
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
    suggestForHazards(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string, taskDescription?: string, hazardCategories?: string, hazardDescriptions?: string, energyTypes?: string, focusedHazardCategory?: string, focusedHazardDescription?: string, focusedHazardEnergyTypes?: string, existingControls?: string): Promise<{
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
}
