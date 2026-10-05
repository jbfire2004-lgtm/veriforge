import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import type { InspectionScoreResult } from './inspection-scoring.engine';
import type { ChecklistItemDef } from './pm-inspections.constants';
import { type InspectionCompletedCriticalFlag, type InspectionCompletedEventData, type InspectionCompletedFindingPayload, type InspectionCompletedFindingsSummary, type InspectionCompletedSignaturePayload } from './pm-inspection-completed-event.types';
type SignatureRow = {
    role: string;
    signerName: string | null;
    signedAt: Date;
    coreFileId: number | null;
};
export declare class PmInspectionCompletedEventService {
    private readonly prisma;
    private readonly eventBus?;
    constructor(prisma: PrismaService, eventBus?: EventBusService);
    hasAlreadyEmitted(inspectionId: string): Promise<boolean>;
    buildCriticalFlags(checklistItems: ChecklistItemDef[], failedItemIds: string[]): InspectionCompletedCriticalFlag[];
    buildFindingsSummary(findings: InspectionCompletedFindingPayload[], criticalFlags: InspectionCompletedCriticalFlag[]): InspectionCompletedFindingsSummary;
    buildEventData(input: {
        inspectionId: string;
        score: InspectionScoreResult;
        signatures: SignatureRow[];
        checklistItems: ChecklistItemDef[];
        deficiencies: Array<{
            id: string;
            itemId: string;
            title: string;
            severity: string;
            category: string | null;
        }>;
        photoFindings: Array<{
            id: string;
            title: string;
            severity: string;
            category: string;
        }>;
    }): InspectionCompletedEventData;
    emitOnceOnSubmit(input: {
        inspectionId: string;
        companyId: number;
        projectId: number;
        actorId: number;
        score: InspectionScoreResult;
        signatures: SignatureRow[];
        checklistItems: ChecklistItemDef[];
    }): Promise<{
        emitted: boolean;
        data?: InspectionCompletedEventData;
    }>;
}
export declare function buildFindings(deficiencies: Array<{
    id: string;
    itemId: string;
    title: string;
    severity: string;
    category: string | null;
}>, photoFindings: Array<{
    id: string;
    title: string;
    severity: string;
    category: string;
}>): InspectionCompletedFindingPayload[];
export declare function buildSignatures(signatures: SignatureRow[]): InspectionCompletedSignaturePayload[];
export {};
