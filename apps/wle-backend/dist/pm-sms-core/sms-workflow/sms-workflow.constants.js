"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMS_WORKFLOW_API_SURFACE = exports.SMS_WORKFLOW_ENTITIES = void 0;
exports.parseSmsWorkflowEntity = parseSmsWorkflowEntity;
exports.notImplemented = notImplemented;
const common_1 = require("@nestjs/common");
exports.SMS_WORKFLOW_ENTITIES = [
    'flha',
    'jha',
    'inspection',
    'audit',
    'corrective-action',
    'investigation',
];
exports.SMS_WORKFLOW_API_SURFACE = {
    basePath: '/api/v1/pm/sms/workflows',
    entities: exports.SMS_WORKFLOW_ENTITIES,
    operations: ['list', 'create', 'get', 'patch', 'submit'],
    legacyPaths: {
        flha: '/api/v1/pm/jha-flha',
        jha: '/api/v1/pm/jha-flha',
        inspection: '/api/v1/pm/inspections',
        audit: '/api/v1/pm/inspections',
        correctiveAction: '/api/v1/pm/corrective-actions',
        investigation: '/api/v1/pm/incidents/:eventId/investigation',
        sclHecaEnergy: '/api/v1/pm/sms',
    },
    statusEnums: {
        flha: [
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'LOCKED',
            'REJECTED',
        ],
        inspection: [
            'draft',
            'in_progress',
            'submitted',
            'review_required',
            'approved',
            'rejected',
            'closed',
        ],
        correctiveAction: [
            'draft',
            'open',
            'assigned',
            'in_progress',
            'verification_pending',
            'verified',
            'closed',
            'cancelled',
        ],
        investigation: [
            'not_started',
            'evidence_gathering',
            'analysis',
            'root_cause',
            'capa_planning',
            'review',
            'closed',
        ],
    },
};
function parseSmsWorkflowEntity(value) {
    if (!exports.SMS_WORKFLOW_ENTITIES.includes(value)) {
        throw new common_1.BadRequestException({
            code: 'INVALID_ENTITY',
            message: `Unknown SMS workflow entity "${value}". Valid entities: ${exports.SMS_WORKFLOW_ENTITIES.join(', ')}`,
        });
    }
    return value;
}
function notImplemented(feature) {
    throw new common_1.HttpException({
        code: 'NOT_IMPLEMENTED',
        message: `${feature} is not implemented yet. See GET /api/v1/pm/sms/workflows for supported operations.`,
    }, common_1.HttpStatus.NOT_IMPLEMENTED);
}
//# sourceMappingURL=sms-workflow.constants.js.map