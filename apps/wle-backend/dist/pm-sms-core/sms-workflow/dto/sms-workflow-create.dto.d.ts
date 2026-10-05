import { JhaFlhaKind } from '@prisma/client';
export declare class SmsWorkflowCreateDto {
    companyId: number;
    projectId: number;
    clientSyncId?: string;
    kind?: JhaFlhaKind;
    taskDescription?: string;
    workScope?: string;
    locationNote?: string;
    templateId?: string;
    title?: string;
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    sourceModule?: string;
    sourceId?: string;
    description?: string;
    actionType?: string;
    severity?: string;
    assignUserId?: number;
    publish?: boolean;
    eventId?: string;
    leadInvestigatorId?: number;
}
