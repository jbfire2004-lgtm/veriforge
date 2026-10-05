"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAFF_ROLES = exports.CONTRACTOR_ROLES = exports.TRAINING_INSTRUCTOR_ONLY_ROLES = exports.TRAINING_INSTRUCTOR_ROLES = exports.TRAINING_PROVIDER_ADMIN_ROLES = exports.SUPERVISOR_ROLES = exports.COMPANY_ADMIN_ROLES = exports.UNION_HALL_ROLES = exports.SUPER_ADMIN_ROLES = void 0;
exports.isSuperAdmin = isSuperAdmin;
exports.isUnionHallAdmin = isUnionHallAdmin;
exports.isCompanyAdmin = isCompanyAdmin;
exports.isSupervisor = isSupervisor;
const client_1 = require("@prisma/client");
exports.SUPER_ADMIN_ROLES = [
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.ADMIN,
];
exports.UNION_HALL_ROLES = [
    client_1.UserRole.UNION_HALL_ADMIN,
    ...exports.SUPER_ADMIN_ROLES,
];
exports.COMPANY_ADMIN_ROLES = [
    client_1.UserRole.COMPANY_ADMIN,
    ...exports.SUPER_ADMIN_ROLES,
];
exports.SUPERVISOR_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.PROJECT_MANAGER,
    ...exports.COMPANY_ADMIN_ROLES,
];
exports.TRAINING_PROVIDER_ADMIN_ROLES = [
    client_1.UserRole.TRAINING_PROVIDER_ADMIN,
    ...exports.SUPER_ADMIN_ROLES,
];
exports.TRAINING_INSTRUCTOR_ROLES = [
    client_1.UserRole.TRAINING_INSTRUCTOR,
    ...exports.TRAINING_PROVIDER_ADMIN_ROLES,
];
exports.TRAINING_INSTRUCTOR_ONLY_ROLES = [
    client_1.UserRole.TRAINING_INSTRUCTOR,
    ...exports.SUPER_ADMIN_ROLES,
];
exports.CONTRACTOR_ROLES = [
    client_1.UserRole.CONTRACTOR_ADMIN,
    client_1.UserRole.CONTRACTOR_USER,
];
exports.STAFF_ROLES = [
    ...exports.SUPERVISOR_ROLES,
    client_1.UserRole.WORKER,
    ...exports.TRAINING_INSTRUCTOR_ROLES,
];
function isSuperAdmin(role) {
    return exports.SUPER_ADMIN_ROLES.includes(role);
}
function isUnionHallAdmin(role) {
    return exports.UNION_HALL_ROLES.includes(role);
}
function isCompanyAdmin(role) {
    return exports.COMPANY_ADMIN_ROLES.includes(role);
}
function isSupervisor(role) {
    return exports.SUPERVISOR_ROLES.includes(role);
}
//# sourceMappingURL=roles.js.map