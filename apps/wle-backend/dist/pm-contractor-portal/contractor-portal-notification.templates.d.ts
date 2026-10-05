export declare const CONTRACTOR_PORTAL_NOTIFICATION_TYPES: {
    readonly findingAssigned: "contractor_portal.finding_assigned";
    readonly capaDueSoon: "contractor_portal.capa_due_soon";
    readonly messageReceived: "contractor_portal.message_received";
};
export declare function contractorPortalMessageReceived(input: {
    primeName: string;
    preview: string;
    messageId: string;
    primeCompanyId: number;
}): {
    type: "contractor_portal.message_received";
    title: string;
    body: string;
    metadata: {
        messageId: string;
        primeCompanyId: number;
    };
};
