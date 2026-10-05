"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTRACTOR_PORTAL_NOTIFICATION_TYPES = void 0;
exports.contractorPortalMessageReceived = contractorPortalMessageReceived;
exports.CONTRACTOR_PORTAL_NOTIFICATION_TYPES = {
    findingAssigned: 'contractor_portal.finding_assigned',
    capaDueSoon: 'contractor_portal.capa_due_soon',
    messageReceived: 'contractor_portal.message_received',
};
function contractorPortalMessageReceived(input) {
    return {
        type: exports.CONTRACTOR_PORTAL_NOTIFICATION_TYPES.messageReceived,
        title: `Message from ${input.primeName}`,
        body: input.preview.slice(0, 120),
        metadata: {
            messageId: input.messageId,
            primeCompanyId: input.primeCompanyId,
        },
    };
}
//# sourceMappingURL=contractor-portal-notification.templates.js.map