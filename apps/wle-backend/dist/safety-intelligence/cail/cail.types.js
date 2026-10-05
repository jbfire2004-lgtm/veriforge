"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIME_ROLES = exports.CAIL_TRANSITIONS = void 0;
exports.CAIL_TRANSITIONS = {
    open: ['in_progress', 'overdue', 'cancelled'],
    in_progress: ['resolved', 'overdue', 'cancelled'],
    overdue: ['in_progress', 'resolved', 'cancelled'],
    resolved: ['verified', 'open'],
    verified: [],
    cancelled: [],
};
exports.PRIME_ROLES = new Set([
    'ADMIN',
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
]);
//# sourceMappingURL=cail.types.js.map