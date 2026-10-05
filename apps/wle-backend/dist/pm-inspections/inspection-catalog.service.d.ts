import { PmInspectionTemplateStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
export declare class InspectionCatalogService {
    private readonly prisma;
    private readonly pmTemplates;
    constructor(prisma: PrismaService, pmTemplates: PmInspectionTemplatesService);
    private mapTemplate;
    ensurePmLibrary(companyId: number, projectId?: number): Promise<{
        created: number;
        updated: number;
        total: number;
        checklistCount: number;
        focusAuditCount: number;
    }>;
    listPmTemplates(companyId: number, projectId?: number, options?: {
        status?: PmInspectionTemplateStatus;
        kind?: string;
        autoSeed?: boolean;
    }): Promise<{
        templates: {
            scoringRules: Record<string, unknown>;
            inspectionKind: string;
            items: any[];
            id: string;
            name: string;
            category: string;
            status: string;
            version: number;
            description: string | null;
            scoringMode: string;
            equipmentTypeKeys: unknown;
            requiredSignatures: unknown;
        }[];
        counts: {
            smart_site: number;
            focus_audit: number;
            checklist: number;
        };
    }>;
    getSmartCatalog(companyId: number, projectId?: number): Promise<{
        categories: {
            id: string;
            name: string;
            description: string;
            version: number;
        }[];
        smartSiteTemplate: {
            scoringRules: Record<string, unknown>;
            inspectionKind: string;
            items: any[];
            id: string;
            name: string;
            category: string;
            status: string;
            version: number;
            description: string | null;
            scoringMode: string;
            equipmentTypeKeys: unknown;
            requiredSignatures: unknown;
        };
        focusAudits: {
            scoringRules: Record<string, unknown>;
            inspectionKind: string;
            items: any[];
            id: string;
            name: string;
            category: string;
            status: string;
            version: number;
            description: string | null;
            scoringMode: string;
            equipmentTypeKeys: unknown;
            requiredSignatures: unknown;
        }[];
        counts: {
            smart_site: number;
            focus_audit: number;
            checklist: number;
        };
        photoFirst: boolean;
    }>;
    listUnifiedChecklists(companyId: number, projectId?: number, filters?: {
        inspectionType?: string;
        category?: string;
        activeOnly?: boolean;
    }): Promise<{
        core: {
            id: number;
            seedKey: string | null;
            name: string;
            category: import(".prisma/client").$Enums.InspectionChecklistCategory;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            items: import(".prisma/client").Prisma.JsonValue;
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pm: {
            scoringRules: Record<string, unknown>;
            inspectionKind: string;
            items: any[];
            id: string;
            name: string;
            category: string;
            status: string;
            version: number;
            description: string | null;
            scoringMode: string;
            equipmentTypeKeys: unknown;
            requiredSignatures: unknown;
        }[];
        counts: {
            core: number;
            pm: number;
        };
    }>;
}
