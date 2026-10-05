"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingProviderPermission = void 0;
exports.hasTrainingProviderPermission = hasTrainingProviderPermission;
exports.assertTrainingProviderPermission = assertTrainingProviderPermission;
const client_1 = require("@prisma/client");
var TrainingProviderPermission;
(function (TrainingProviderPermission) {
    TrainingProviderPermission["MANAGE_PROVIDER_PROFILE"] = "MANAGE_PROVIDER_PROFILE";
    TrainingProviderPermission["MANAGE_INSTRUCTORS"] = "MANAGE_INSTRUCTORS";
    TrainingProviderPermission["MANAGE_COURSES"] = "MANAGE_COURSES";
    TrainingProviderPermission["UPLOAD_TRAINING"] = "UPLOAD_TRAINING";
    TrainingProviderPermission["ISSUE_CERTIFICATES"] = "ISSUE_CERTIFICATES";
    TrainingProviderPermission["VIEW_PROVIDER_COMPLIANCE"] = "VIEW_PROVIDER_COMPLIANCE";
    TrainingProviderPermission["VIEW_TRAINING_HISTORY"] = "VIEW_TRAINING_HISTORY";
    TrainingProviderPermission["MANAGE_APPROVAL_STATUS"] = "MANAGE_APPROVAL_STATUS";
    TrainingProviderPermission["REQUEST_APPROVAL"] = "REQUEST_APPROVAL";
    TrainingProviderPermission["DELIVER_TRAINING"] = "DELIVER_TRAINING";
    TrainingProviderPermission["UPLOAD_CLASS_LISTS"] = "UPLOAD_CLASS_LISTS";
    TrainingProviderPermission["UPLOAD_CERTIFICATES"] = "UPLOAD_CERTIFICATES";
    TrainingProviderPermission["SIGN_CERTIFICATES"] = "SIGN_CERTIFICATES";
    TrainingProviderPermission["VIEW_INSTRUCTOR_PROFILE"] = "VIEW_INSTRUCTOR_PROFILE";
})(TrainingProviderPermission || (exports.TrainingProviderPermission = TrainingProviderPermission = {}));
const PROVIDER_ADMIN_PERMISSIONS = [
    TrainingProviderPermission.MANAGE_PROVIDER_PROFILE,
    TrainingProviderPermission.MANAGE_INSTRUCTORS,
    TrainingProviderPermission.MANAGE_COURSES,
    TrainingProviderPermission.UPLOAD_TRAINING,
    TrainingProviderPermission.ISSUE_CERTIFICATES,
    TrainingProviderPermission.VIEW_PROVIDER_COMPLIANCE,
    TrainingProviderPermission.VIEW_TRAINING_HISTORY,
    TrainingProviderPermission.MANAGE_APPROVAL_STATUS,
    TrainingProviderPermission.REQUEST_APPROVAL,
    TrainingProviderPermission.UPLOAD_CERTIFICATES,
    TrainingProviderPermission.SIGN_CERTIFICATES,
];
const INSTRUCTOR_PERMISSIONS = [
    TrainingProviderPermission.DELIVER_TRAINING,
    TrainingProviderPermission.UPLOAD_TRAINING,
    TrainingProviderPermission.UPLOAD_CLASS_LISTS,
    TrainingProviderPermission.UPLOAD_CERTIFICATES,
    TrainingProviderPermission.ISSUE_CERTIFICATES,
    TrainingProviderPermission.SIGN_CERTIFICATES,
    TrainingProviderPermission.VIEW_INSTRUCTOR_PROFILE,
    TrainingProviderPermission.VIEW_TRAINING_HISTORY,
];
const PLATFORM_OVERRIDE_ROLES = [
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
];
function hasTrainingProviderPermission(role, permission) {
    if (PLATFORM_OVERRIDE_ROLES.includes(role))
        return true;
    if (role === client_1.UserRole.TRAINING_PROVIDER_ADMIN) {
        return PROVIDER_ADMIN_PERMISSIONS.includes(permission);
    }
    if (role === client_1.UserRole.TRAINING_INSTRUCTOR) {
        return INSTRUCTOR_PERMISSIONS.includes(permission);
    }
    return false;
}
function assertTrainingProviderPermission(role, permission) {
    if (!hasTrainingProviderPermission(role, permission)) {
        throw new Error(`Missing permission: ${permission}`);
    }
}
//# sourceMappingURL=training-provider-permissions.js.map