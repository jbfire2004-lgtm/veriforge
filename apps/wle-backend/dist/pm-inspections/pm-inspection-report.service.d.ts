import { PrismaService } from '../prisma/prisma.service';
export type PhotoReportAnnotation = {
    photoNumber?: number;
    locationDescription?: string;
    pictureDescription?: string;
    safetyStatus?: 'safe' | 'at_risk';
    responsibleCompanyId?: number | null;
    responsibleCompanyName?: string | null;
    checklistItemId?: string;
};
export type InspectionReportPhoto = {
    photoNumber: number;
    attachmentId: string;
    fileName: string | null;
    dataUrl: string | null;
    mimeType: string | null;
    locationDescription: string;
    pictureDescription: string;
    safetyStatus: 'safe' | 'at_risk';
    responsibleCompanyId: number | null;
    responsibleCompanyName: string | null;
    correctionPhotoDataUrl?: string | null;
    findings: Array<{
        id: string;
        title: string;
        description: string | null;
        severity: string;
        category: string;
        correctiveActionId: string | null;
        correctiveActionStatus: string | null;
    }>;
};
export type InspectionReportSummaryRow = {
    photoNumber: number;
    locationDescription: string;
    pictureDescription: string;
    safetyStatus: 'safe' | 'at_risk';
    responsibleCompanyName: string | null;
    findingTitle: string | null;
    severity: string | null;
};
export declare class PmInspectionReportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    buildReport(inspectionId: string): Promise<{
        inspectionId: string;
        title: string;
        status: import(".prisma/client").$Enums.PmInspectionStatus;
        submittedAt: Date;
        project: {
            id: number;
            name: string;
        };
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        template: {
            name: string;
            category: import(".prisma/client").$Enums.PmInspectionTemplateCategory;
            inspectionKind: unknown;
            industry: unknown;
            focusArea: unknown;
        };
        siteAnswers: import(".prisma/client").Prisma.JsonValue;
        locationNote: string;
        totals: {
            photoCount: number;
            safeCount: number;
            atRiskCount: number;
        };
        photos: InspectionReportPhoto[];
        summarySheet: InspectionReportSummaryRow[];
        sharing: import("./pm-inspection-sharing.types").InspectionSharingConfig;
        generatedAt: string;
    }>;
}
