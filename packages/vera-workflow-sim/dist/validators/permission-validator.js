"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionValidator = void 0;
const permission_rules_1 = require("../permission-rules");
class PermissionValidator {
    validateTransition(transition, ctx) {
        const issues = [];
        const required = transition.permissions ?? [];
        if (required.length === 0)
            return issues;
        const role = ctx.role;
        const allowed = required.some((r) => r === role) || this.hasImplicitElevated(role, required);
        if (!allowed) {
            issues.push({
                code: "PERMISSION_DENIED",
                message: `Role ${role} cannot perform "${transition.event}" (requires ${required.join(" or ")})`,
                severity: "error",
                transition: `${transition.from}→${transition.to}`,
                validator: "PermissionValidator",
            });
        }
        return issues;
    }
    validateStepPermission(permissionKey, ctx) {
        if ((0, permission_rules_1.roleHasPermission)(ctx.role, permissionKey))
            return [];
        return [
            {
                code: "PERMISSION_DENIED",
                message: `Role ${ctx.role} lacks permission: ${permissionKey}`,
                severity: "error",
                validator: "PermissionValidator",
            },
        ];
    }
    validateWorkflowAccess(workflow, ctx) {
        const issues = [];
        if (ctx.multiCompany && ctx.role === "COMPANY_ADMIN" && !ctx.companyId) {
            issues.push({
                code: "COMPANY_SCOPE_MISSING",
                message: "Multi-company simulation requires companyId in context",
                severity: "error",
                validator: "PermissionValidator",
            });
        }
        if (workflow.modules.includes("Field") && ctx.offline && ctx.role === "WORKER") {
            const fieldOk = (0, permission_rules_1.roleHasPermission)(ctx.role, "field.offline");
            if (!fieldOk) {
                issues.push({
                    code: "FIELD_ACCESS_DENIED",
                    message: "Worker role cannot access field offline workflows",
                    severity: "warn",
                    validator: "PermissionValidator",
                });
            }
        }
        return issues;
    }
    hasImplicitElevated(role, required) {
        if (role === "SUPER_ADMIN" || role === "ADMIN")
            return true;
        if (role === "COMPANY_ADMIN" && required.includes("SUPERVISOR"))
            return true;
        if (role === "PROJECT_MANAGER" && required.includes("SUPERVISOR"))
            return true;
        return false;
    }
}
exports.PermissionValidator = PermissionValidator;
//# sourceMappingURL=permission-validator.js.map