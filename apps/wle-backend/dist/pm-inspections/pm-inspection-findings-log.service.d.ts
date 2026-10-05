import { PrismaService } from '../prisma/prisma.service';
export type FindingsLogEntry = {
    id: string;
    inspectionId: string;
    inspectionTitle: string | null;
    inspectionStatus: string;
    submittedAt: string | null;
    attachmentId: string;
    photoNumber: number | null;
    locationDescription: string;
    pictureDescription: string;
    safetyStatus: 'safe' | 'at_risk' | 'unknown';
    responsibleCompanyId: number | null;
    responsibleCompanyName: string | null;
    correctionPhotoDataUrl: string | null;
    correctionCompletedAt: string | null;
    correctiveActionId: string | null;
    correctiveActionStatus: string | null;
    dispatchStatus: string | null;
    loggedAt: string;
};
export declare class PmInspectionFindingsLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listProjectLog(projectId: number, filters?: {
        companyId?: number;
    }): Promise<{
        projectId: number;
        total: number;
        entries: FindingsLogEntry[];
        sharingNote: string;
    }>;
}
