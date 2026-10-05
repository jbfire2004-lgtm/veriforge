"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleSatisfiesAny = roleSatisfiesAny;
exports.isContractorRole = isContractorRole;
const client_1 = require("@prisma/client");
const roles_1 = require("../modules/vera-core/roles");
const CONTRACTOR_PORTAL_ROLES = [
    client_1.UserRole.CONTRACTOR_ADMIN,
    client_1.UserRole.CONTRACTOR_USER,
    ...roles_1.SUPERVISOR_ROLES,
];
const STAFF_HIERARCHY = [
    roles_1.SUPER_ADMIN_ROLES,
    roles_1.COMPANY_ADMIN_ROLES,
    roles_1.SUPERVISOR_ROLES,
];
function roleSatisfiesAny(actorRole, required) {
    if (required.includes(actorRole))
        return true;
    for (const req of required) {
        for (let level = 0; level < STAFF_HIERARCHY.length; level++) {
            if (!STAFF_HIERARCHY[level].includes(req))
                continue;
            for (let higher = 0; higher <= level; higher++) {
                if (STAFF_HIERARCHY[higher].includes(actorRole))
                    return true;
            }
            break;
        }
        if (CONTRACTOR_PORTAL_ROLES.includes(req) &&
            CONTRACTOR_PORTAL_ROLES.includes(actorRole)) {
            return true;
        }
    }
    return false;
}
function isContractorRole(role) {
    return roles_1.CONTRACTOR_ROLES.includes(role);
}
//# sourceMappingURL=role-hierarchy.js.map