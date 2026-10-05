"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INSPECTION_NOTIFICATION_TEMPLATES = void 0;
exports.INSPECTION_NOTIFICATION_TEMPLATES = {
    photoFindingCreated: (p) => ({
        title: `Inspection finding: ${p.findingTitle}`,
        body: `A new ${p.severity} severity finding was detected during inspection${p.projectName ? ` on ${p.projectName}` : ''}.`,
        type: 'inspection.finding.created',
        metadata: p,
    }),
    correctiveActionAssigned: (p) => ({
        title: `Corrective action assigned: ${p.findingTitle}`,
        body: p.dueAt
            ? `Due ${new Date(p.dueAt).toLocaleDateString()}. Evidence of completion is required.`
            : 'Evidence of completion is required.',
        type: 'inspection.capa.assigned',
        metadata: p,
    }),
    contractorDispatchSent: (p) => ({
        title: `Corrective action package — ${p.contractorName}`,
        body: `${p.findingTitle}. Review photos, description, deadline, and submit proof of completion.`,
        type: 'inspection.contractor.dispatch',
        metadata: p,
    }),
    contractorDispatchOverdue: (p) => ({
        title: `OVERDUE — ${p.contractorName}`,
        body: `Corrective action "${p.findingTitle}" is past due. Immediate attention required.`,
        type: 'inspection.contractor.overdue',
        metadata: p,
    }),
    correctiveActionOverdue: (p) => {
        var _a;
        return ({
            title: `Overdue corrective action`,
            body: `"${p.findingTitle}" is past due on ${(_a = p.projectName) !== null && _a !== void 0 ? _a : 'project'}.`,
            type: 'inspection.capa.overdue',
            metadata: p,
        });
    },
    correctionProofReceived: (p) => ({
        title: `Correction photo received`,
        body: `Contractor submitted proof for "${p.findingTitle}"${p.projectName ? ` on ${p.projectName}` : ''}. Review in the inspection report.`,
        type: 'inspection.correction.proof',
        metadata: p,
    }),
};
//# sourceMappingURL=inspection-notification.templates.js.map