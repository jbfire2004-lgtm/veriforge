export type InspectionNotificationPayload = {
  inspectionId: string;
  projectName?: string;
  findingTitle: string;
  severity: string;
  dueAt?: string;
  correctiveActionId?: string;
  dispatchId?: string;
};

export const INSPECTION_NOTIFICATION_TEMPLATES = {
  photoFindingCreated: (p: InspectionNotificationPayload) => ({
    title: `Inspection finding: ${p.findingTitle}`,
    body: `A new ${p.severity} severity finding was detected during inspection${
      p.projectName ? ` on ${p.projectName}` : ''
    }.`,
    type: 'inspection.finding.created' as const,
    metadata: p,
  }),

  correctiveActionAssigned: (p: InspectionNotificationPayload) => ({
    title: `Corrective action assigned: ${p.findingTitle}`,
    body: p.dueAt
      ? `Due ${new Date(
          p.dueAt,
        ).toLocaleDateString()}. Evidence of completion is required.`
      : 'Evidence of completion is required.',
    type: 'inspection.capa.assigned' as const,
    metadata: p,
  }),

  contractorDispatchSent: (
    p: InspectionNotificationPayload & { contractorName: string },
  ) => ({
    title: `Corrective action package — ${p.contractorName}`,
    body: `${p.findingTitle}. Review photos, description, deadline, and submit proof of completion.`,
    type: 'inspection.contractor.dispatch' as const,
    metadata: p,
  }),

  contractorDispatchOverdue: (
    p: InspectionNotificationPayload & { contractorName: string },
  ) => ({
    title: `OVERDUE — ${p.contractorName}`,
    body: `Corrective action "${p.findingTitle}" is past due. Immediate attention required.`,
    type: 'inspection.contractor.overdue' as const,
    metadata: p,
  }),

  correctiveActionOverdue: (p: InspectionNotificationPayload) => ({
    title: `Overdue corrective action`,
    body: `"${p.findingTitle}" is past due on ${p.projectName ?? 'project'}.`,
    type: 'inspection.capa.overdue' as const,
    metadata: p,
  }),

  correctionProofReceived: (
    p: InspectionNotificationPayload & { inspectorName?: string },
  ) => ({
    title: `Correction photo received`,
    body: `Contractor submitted proof for "${p.findingTitle}"${
      p.projectName ? ` on ${p.projectName}` : ''
    }. Review in the inspection report.`,
    type: 'inspection.correction.proof' as const,
    metadata: p,
  }),
};
