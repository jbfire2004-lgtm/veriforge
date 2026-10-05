import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { type JhaIndustryPackId } from './jha-industry-packs';
import { JhaLibraryLearningService, type ProjectLearnings } from './jha-library-learning.service';
import { type JhaSuggestionInput } from './jha-suggestion.engine';
export declare class JhaLibraryService {
    private readonly prisma;
    private readonly learning;
    constructor(prisma: PrismaService, learning: JhaLibraryLearningService);
    energyWheel(): {
        type: import(".prisma/client").JhaEnergyType;
        label: string;
        requiredControlTypes: string[];
        highExposureThreshold: number;
    }[];
    resolveCompanyPacks(companyId: number): Promise<JhaIndustryPackId[]>;
    ensureSeed(companyId: number, projectId?: number): Promise<void>;
    mapHazardRow(h: {
        id: string;
        category: string;
        subcategory?: string | null;
        description: string;
        defaultSeverity: number;
        defaultLikelihood: number;
        defaultEnergyTypes: unknown;
    }): {
        id: string;
        category: string;
        subcategory: string;
        description: string;
        defaultSeverity: number;
        defaultLikelihood: number;
        defaultEnergyTypes: string[];
        keywords: string[];
    };
    mapControlRow(c: {
        id: string;
        controlType: string;
        description: string;
        hazardCategories: unknown;
        energyTypes?: unknown;
        ppeRequired: boolean;
    }): {
        id: string;
        controlType: string;
        description: string;
        hazardCategories: string[];
        energyTypes: string[];
        ppeRequired: boolean;
        controlClass: "direct" | "alternative";
    };
    listHazards(companyId: number, projectId?: number, taskCode?: string): Promise<{
        id: string;
        seedKey: string | null;
        companyId: number | null;
        projectId: number | null;
        category: string;
        subcategory: string | null;
        description: string;
        defaultSeverity: number;
        defaultLikelihood: number;
        defaultEnergyTypes: Prisma.JsonValue;
        defaultControlKeys: Prisma.JsonValue;
        taskTypes: Prisma.JsonValue;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
    }[]>;
    listControls(companyId: number, projectId?: number, category?: string): Promise<{
        id: string;
        seedKey: string | null;
        companyId: number | null;
        projectId: number | null;
        controlType: string;
        description: string;
        hazardCategories: Prisma.JsonValue;
        energyTypes: Prisma.JsonValue;
        ppeRequired: boolean;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
    }[]>;
    createHazard(data: {
        companyId: number;
        projectId?: number;
        category: string;
        description: string;
        subcategory?: string;
        defaultSeverity?: number;
        defaultLikelihood?: number;
        defaultEnergyTypes?: string[];
    }): Promise<{
        id: string;
        seedKey: string | null;
        companyId: number | null;
        projectId: number | null;
        category: string;
        subcategory: string | null;
        description: string;
        defaultSeverity: number;
        defaultLikelihood: number;
        defaultEnergyTypes: Prisma.JsonValue;
        defaultControlKeys: Prisma.JsonValue;
        taskTypes: Prisma.JsonValue;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
    }>;
    createControl(data: {
        companyId: number;
        projectId?: number;
        controlType: string;
        description: string;
        hazardCategories?: string[];
        ppeRequired?: boolean;
    }): Promise<{
        id: string;
        seedKey: string | null;
        companyId: number | null;
        projectId: number | null;
        controlType: string;
        description: string;
        hazardCategories: Prisma.JsonValue;
        energyTypes: Prisma.JsonValue;
        ppeRequired: boolean;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
    }>;
    getProjectLearnings(projectId: number): Promise<ProjectLearnings>;
    promoteFromApprovedJha(jhaFlhaId: string): Promise<{
        hazardsAdded: number;
        controlsAdded: number;
    }>;
    suggest(input: JhaSuggestionInput, projectId?: number): Promise<import("./jha-suggestion.engine").JhaSuggestionResult>;
    listTasks(companyId: number, projectId?: number): Promise<{
        id: string;
        companyId: number | null;
        projectId: number | null;
        taskCode: string;
        title: string;
        description: string | null;
        defaultHazardIds: Prisma.JsonValue;
        requiredTraining: Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
    }[]>;
    createTask(data: {
        companyId: number;
        projectId?: number;
        taskCode: string;
        title: string;
        description?: string;
        requiredTraining?: string[];
    }): Promise<{
        id: string;
        companyId: number | null;
        projectId: number | null;
        taskCode: string;
        title: string;
        description: string | null;
        defaultHazardIds: Prisma.JsonValue;
        requiredTraining: Prisma.JsonValue;
        active: boolean;
        createdAt: Date;
    }>;
}
