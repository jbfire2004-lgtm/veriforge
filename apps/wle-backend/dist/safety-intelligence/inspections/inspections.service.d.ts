import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import type { CreateSafetyInspectionDto } from '../dto/create-safety-inspection.dto';
import type { CreateInspectionItemDto } from '../dto/create-inspection-item.dto';
import { VsiAttachmentsService } from '../attachments/vsi-attachments.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';
import { OcrExtractionService } from '../../training-ingestion/ocr-extraction.service';
export declare class SafetyInspectionsService {
    private readonly prisma;
    private readonly emitter;
    private readonly scope;
    private readonly attachments;
    private readonly ai;
    private readonly ocr;
    private readonly copilotEnrich;
    constructor(prisma: PrismaService, emitter: CailEmitterService, scope: CailScopeService, attachments: VsiAttachmentsService, ai: SafetyIntelligenceAiService, ocr: OcrExtractionService, copilotEnrich: CailCopilotEnrichmentService);
    list(actor: CailActor, projectId?: number): Promise<({
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
    getById(id: string, actor: CailActor): Promise<{
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
            aiSuggestions: Prisma.JsonValue | null;
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
    create(dto: CreateSafetyInspectionDto, actor: CailActor): Promise<{
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
    addItem(inspectionId: string, dto: CreateInspectionItemDto, actor: CailActor): Promise<{
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
        aiSuggestions: Prisma.JsonValue | null;
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
        aiSuggestions: Prisma.JsonValue | null;
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
        aiSuggestions: Prisma.JsonValue | null;
        createdAt: Date;
    }>;
    classifyPhoto(input: {
        caption?: string;
        ocrText?: string;
        imageUrl?: string;
        coreFileId?: number;
        companyId?: number;
        projectId?: number;
    }): Promise<import("../ai/safety-intelligence-ai.service").PhotoClassificationResult>;
    private itemPreviewUrl;
    private mapItemsWithPreviews;
    complete(inspectionId: string, actor: CailActor): Promise<{
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
            aiSuggestions: Prisma.JsonValue | null;
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
