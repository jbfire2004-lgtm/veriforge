"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAFETY_FORM_TRANSITIONS = void 0;
exports.SAFETY_FORM_TRANSITIONS = {
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['APPROVED', 'REJECTED', 'UNDER_REVIEW', 'CANCELLED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['CLOSED'],
    REJECTED: ['DRAFT', 'CANCELLED'],
    CLOSED: [],
    CANCELLED: [],
};
//# sourceMappingURL=form-engine.types.js.map