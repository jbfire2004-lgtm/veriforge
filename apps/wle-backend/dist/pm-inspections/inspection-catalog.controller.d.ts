import { PmInspectionTemplateStatus } from '@prisma/client';
import { TenantScopeService } from '../security/tenant-scope.service';
import type { SecurityActor } from '../security/security.types';
import { InspectionCatalogService } from './inspection-catalog.service';
export declare class InspectionCatalogController {
    private readonly catalog;
    private readonly tenant;
    constructor(catalog: InspectionCatalogService, tenant: TenantScopeService);
    listTemplates(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string, kind?: string, status?: PmInspectionTemplateStatus, autoSeed?: string): Promise<{
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
    getSmart(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string): Promise<{
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
    listPmChecklists(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string): Promise<{
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
