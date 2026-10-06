export const CONTRACTOR_PORTAL_NOTIFICATION_TYPES = {
  findingAssigned: 'contractor_portal.finding_assigned',
  capaDueSoon: 'contractor_portal.capa_due_soon',
  messageReceived: 'contractor_portal.message_received',
} as const;

export function contractorPortalMessageReceived(input: {
  primeName: string;
  preview: string;
  messageId: string;
  primeCompanyId: number;
}) {
  return {
    type: CONTRACTOR_PORTAL_NOTIFICATION_TYPES.messageReceived,
    title: `Message from ${input.primeName}`,
    body: input.preview.slice(0, 120),
    metadata: {
      messageId: input.messageId,
      primeCompanyId: input.primeCompanyId,
    },
  };
}
