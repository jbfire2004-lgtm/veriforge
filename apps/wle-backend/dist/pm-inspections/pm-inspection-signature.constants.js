"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_WORKER_SIGNATURE = exports.DEFAULT_SUPERVISOR_SIGNATURE = exports.PM_INSPECTION_SIGNATURE_ROLES = void 0;
exports.PM_INSPECTION_SIGNATURE_ROLES = {
    SUPERVISOR: 'supervisor',
    WORKER: 'worker',
};
exports.DEFAULT_SUPERVISOR_SIGNATURE = {
    role: exports.PM_INSPECTION_SIGNATURE_ROLES.SUPERVISOR,
    label: 'Supervisor',
};
exports.DEFAULT_WORKER_SIGNATURE = {
    role: exports.PM_INSPECTION_SIGNATURE_ROLES.WORKER,
    label: 'Worker / Inspector',
};
//# sourceMappingURL=pm-inspection-signature.constants.js.map