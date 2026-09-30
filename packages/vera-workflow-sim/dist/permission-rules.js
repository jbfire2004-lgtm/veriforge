"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_MATRIX = void 0;
exports.roleHasPermission = roleHasPermission;
const SUPER = new Set(["SUPER_ADMIN", "ADMIN"]);
const COMPANY = new Set([...SUPER, "COMPANY_ADMIN"]);
const SUPERVISOR = new Set([...COMPANY, "SUPERVISOR", "PROJECT_MANAGER"]);
exports.PERMISSION_MATRIX = {
    "worker.create": COMPANY,
    "worker.linkCompany": COMPANY,
    "worker.assignProject": SUPERVISOR,
    "worker.uploadTraining": new Set([...COMPANY, "TRAINING_INSTRUCTOR", "TRAINING_PROVIDER_ADMIN"]),
    "worker.complianceView": SUPERVISOR,
    "worker.qrScan": SUPERVISOR,
    "worker.walletUpdate": COMPANY,
    "worker.leaveProject": SUPERVISOR,
    "worker.leaveCompany": COMPANY,
    "worker.transferCompany": COMPANY,
    "equipment.create": COMPANY,
    "equipment.linkCompany": COMPANY,
    "equipment.assignProject": SUPERVISOR,
    "equipment.inspect": SUPERVISOR,
    "equipment.lockout": SUPERVISOR,
    "equipment.qrScan": SUPERVISOR,
    "training.issue": new Set([...SUPER, "TRAINING_PROVIDER_ADMIN", "TRAINING_INSTRUCTOR"]),
    "training.uploadClass": new Set(["TRAINING_INSTRUCTOR", "TRAINING_PROVIDER_ADMIN"]),
    "training.validate": COMPANY,
    "training.reject": COMPANY,
    "provider.create": SUPER,
    "provider.approve": SUPER,
    "provider.suspend": SUPER,
    "union.memberOnboard": new Set([...SUPER, "UNION_HALL_ADMIN"]),
    "union.dispatch": new Set([...SUPER, "UNION_HALL_ADMIN"]),
    "company.create": SUPER,
    "company.adminOnboard": SUPER,
    "project.create": COMPANY,
    "project.close": COMPANY,
    "project.readiness": SUPERVISOR,
    "compliance.evaluate": SUPERVISOR,
    "inspection.submit": SUPERVISOR,
    "competency.evaluate": SUPERVISOR,
    "competency.override": COMPANY,
    "sync.batch": SUPERVISOR,
    "dashboard.widgets": SUPERVISOR,
    "field.offline": new Set([...SUPERVISOR, "WORKER"]),
};
function roleHasPermission(role, permission) {
    const allowed = exports.PERMISSION_MATRIX[permission];
    if (!allowed)
        return false;
    return allowed.has(role);
}
//# sourceMappingURL=permission-rules.js.map