"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBAC = void 0;
exports.rolesFor = rolesFor;
const client_1 = require("@prisma/client");
const roles_1 = require("../modules/vera-core/roles");
exports.RBAC = {
    viewProjectCompliance: roles_1.STAFF_ROLES,
    manageProjectCompliance: roles_1.SUPERVISOR_ROLES,
    submitSafetyForms: [client_1.UserRole.WORKER, ...roles_1.SUPERVISOR_ROLES],
    approveSafetyForms: roles_1.SUPERVISOR_ROLES,
    issueCredentials: roles_1.TRAINING_INSTRUCTOR_ROLES,
    manageProviderApis: roles_1.TRAINING_PROVIDER_ADMIN_ROLES,
    viewCredentialChain: [
        client_1.UserRole.WORKER,
        ...roles_1.SUPERVISOR_ROLES,
        ...roles_1.TRAINING_INSTRUCTOR_ROLES,
    ],
    credentialLedgerBackfill: roles_1.COMPANY_ADMIN_ROLES,
};
function rolesFor(capability) {
    return [...exports.RBAC[capability]];
}
//# sourceMappingURL=rbac.js.map