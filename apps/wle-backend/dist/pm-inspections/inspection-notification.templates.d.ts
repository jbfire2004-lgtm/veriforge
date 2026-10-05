export type InspectionNotificationPayload = {
    inspectionId: string;
    projectName?: string;
    findingTitle: string;
    severity: string;
    dueAt?: string;
    correctiveActionId?: string;
    dispatchId?: string;
};
export declare const INSPECTION_NOTIFICATION_TEMPLATES: {
    photoFindingCreated: (p: InspectionNotificationPayload) => {
        title: string;
        body: string;
        type: "inspection.finding.created";
        metadata: InspectionNotificationPayload;
    };
    correctiveActionAssigned: (p: InspectionNotificationPayload) => {
        title: string;
        body: string;
        type: "inspection.capa.assigned";
        metadata: InspectionNotificationPayload;
    };
    contractorDispatchSent: (p: InspectionNotificationPayload & {
        contractorName: string;
    }) => {
        title: string;
        body: string;
        type: "inspection.contractor.dispatch";
        metadata: InspectionNotificationPayload & {
            contractorName: string;
        };
    };
    contractorDispatchOverdue: (p: InspectionNotificationPayload & {
        contractorName: string;
    }) => {
        title: string;
        body: string;
        type: "inspection.contractor.overdue";
        metadata: InspectionNotificationPayload & {
            contractorName: string;
        };
    };
    correctiveActionOverdue: (p: InspectionNotificationPayload) => {
        title: string;
        body: string;
        type: "inspection.capa.overdue";
        metadata: InspectionNotificationPayload;
    };
    correctionProofReceived: (p: InspectionNotificationPayload & {
        inspectorName?: string;
    }) => {
        title: string;
        body: string;
        type: "inspection.correction.proof";
        metadata: InspectionNotificationPayload & {
            inspectorName?: string;
        };
    };
};
