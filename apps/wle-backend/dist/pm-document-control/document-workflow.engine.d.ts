import { PmDocumentStatus } from '@prisma/client';
export declare class DocumentWorkflowEngine {
    assertTransition(from: PmDocumentStatus, to: PmDocumentStatus): void;
    publishFields(now?: Date): {
        publishedAt: Date;
        status: PmDocumentStatus;
    };
    supersedeFields(now?: Date): {
        status: PmDocumentStatus;
        supersededAt: Date;
    };
    archiveFields(now?: Date): {
        status: PmDocumentStatus;
        archivedAt: Date;
    };
}
