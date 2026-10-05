import { UserRole } from '@prisma/client';
import { CailScopeService } from '../cail/cail-scope.service';
import { SafetyInspectionsService } from './inspections.service';
import { CreateSafetyInspectionDto } from '../dto/create-safety-inspection.dto';
import { CreateInspectionItemDto } from '../dto/create-inspection-item.dto';
import { ClassifyPhotoDto } from '../dto/classify-photo.dto';
export declare class SafetyInspectionsController {
    private readonly inspections;
    private readonly scope;
    constructor(inspections: SafetyInspectionsService, scope: CailScopeService);
    list(req: {
        user: {
            id: number;
            role: UserRole;
        };
    }, projectId?: string): Promise<({
        project: {
            id: number;
            name: string;
        };
        _count: {
            items: number;
        };
        inspector: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        projectId: number;
        inspectorUserId: number;
        companyId: number | null;
        title: string | null;
        startedAt: Date;
        completedAt: Date | null;
        siteId: number | null;
        locationNote: string | null;
        status: import(".prisma/client").$Enums.SafetyInspectionStatus;
        createdAt: Date;
    })[]>;
    getOne(id: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        items: ({
            cailEntry: {
                id: string;
                status: import(".prisma/client").$Enums.CailStatus;
                title: string;
            };
            ownerCompany: {
                id: number;
                name: string;
            };
        } & {
            id: string;
            inspectionId: string;
            polarity: import(".prisma/client").$Enums.ObservationPolarity;
            photoStorageKey: string | null;
            photoDataUrl: string | null;
            coreFileId: number | null;
            caption: string | null;
            ownerCompanyId: number | null;
            assignedUserId: number | null;
            equipmentId: number | null;
            riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
            severity: import(".prisma/client").$Enums.CailSeverity | null;
            notes: string | null;
            cailEntryId: string | null;
            aiSuggestions: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        } & {
            photoPreviewUrl: string;
        })[];
        site: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        inspector: {
            id: number;
            username: string;
        };
        id: string;
        projectId: number;
        inspectorUserId: number;
        companyId: number | null;
        title: string | null;
        startedAt: Date;
        completedAt: Date | null;
        siteId: number | null;
        locationNote: string | null;
        status: import(".prisma/client").$Enums.SafetyInspectionStatus;
        createdAt: Date;
    }>;
    create(dto: CreateSafetyInspectionDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        project: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        projectId: number;
        inspectorUserId: number;
        companyId: number | null;
        title: string | null;
        startedAt: Date;
        completedAt: Date | null;
        siteId: number | null;
        locationNote: string | null;
        status: import(".prisma/client").$Enums.SafetyInspectionStatus;
        createdAt: Date;
    }>;
    aiSuggest(dto: ClassifyPhotoDto): Promise<import("../ai/safety-intelligence-ai.service").PhotoClassificationResult>;
    addItem(id: string, dto: CreateInspectionItemDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        id: string;
        inspectionId: string;
        polarity: import(".prisma/client").$Enums.ObservationPolarity;
        photoStorageKey: string | null;
        photoDataUrl: string | null;
        coreFileId: number | null;
        caption: string | null;
        ownerCompanyId: number | null;
        assignedUserId: number | null;
        equipmentId: number | null;
        riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        notes: string | null;
        cailEntryId: string | null;
        aiSuggestions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
    } | {
        photoPreviewUrl: string;
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            title: string;
        };
        id: string;
        inspectionId: string;
        polarity: import(".prisma/client").$Enums.ObservationPolarity;
        photoStorageKey: string | null;
        photoDataUrl: string | null;
        coreFileId: number | null;
        caption: string | null;
        ownerCompanyId: number | null;
        assignedUserId: number | null;
        equipmentId: number | null;
        riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        notes: string | null;
        cailEntryId: string | null;
        aiSuggestions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
    } | {
        photoPreviewUrl: string;
        id: string;
        inspectionId: string;
        polarity: import(".prisma/client").$Enums.ObservationPolarity;
        photoStorageKey: string | null;
        photoDataUrl: string | null;
        coreFileId: number | null;
        caption: string | null;
        ownerCompanyId: number | null;
        assignedUserId: number | null;
        equipmentId: number | null;
        riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        notes: string | null;
        cailEntryId: string | null;
        aiSuggestions: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
    }>;
    complete(id: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        items: ({
            cailEntry: {
                id: string;
                status: import(".prisma/client").$Enums.CailStatus;
            };
        } & {
            id: string;
            inspectionId: string;
            polarity: import(".prisma/client").$Enums.ObservationPolarity;
            photoStorageKey: string | null;
            photoDataUrl: string | null;
            coreFileId: number | null;
            caption: string | null;
            ownerCompanyId: number | null;
            assignedUserId: number | null;
            equipmentId: number | null;
            riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
            severity: import(".prisma/client").$Enums.CailSeverity | null;
            notes: string | null;
            cailEntryId: string | null;
            aiSuggestions: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        })[];
    } & {
        id: string;
        projectId: number;
        inspectorUserId: number;
        companyId: number | null;
        title: string | null;
        startedAt: Date;
        completedAt: Date | null;
        siteId: number | null;
        locationNote: string | null;
        status: import(".prisma/client").$Enums.SafetyInspectionStatus;
        createdAt: Date;
    }>;
}
