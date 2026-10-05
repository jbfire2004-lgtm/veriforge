"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_1 = require("../modules/vera-core/roles");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const actor_util_1 = require("../security/actor.util");
const security_types_1 = require("../security/security.types");
const permission_guard_1 = require("../security/guards/permission.guard");
const roles_guard_1 = require("../auth/roles.guard");
let AuditController = class AuditController {
    constructor(audit) {
        this.audit = audit;
    }
    all(req, companyId, limit) {
        var _a;
        return this.audit.findAll((0, actor_util_1.toSecurityActor)(req.user), parsePositiveInt(companyId), (_a = parsePositiveInt(limit)) !== null && _a !== void 0 ? _a : 200);
    }
    forUser(req, id, companyId, limit) {
        var _a;
        return this.audit.findForUser((0, actor_util_1.toSecurityActor)(req.user), id, parsePositiveInt(companyId), (_a = parsePositiveInt(limit)) !== null && _a !== void 0 ? _a : 200);
    }
    forEntity(req, entity, id, companyId, limit) {
        var _a;
        return this.audit.findForEntity((0, actor_util_1.toSecurityActor)(req.user), entity, id, parsePositiveInt(companyId), (_a = parsePositiveInt(limit)) !== null && _a !== void 0 ? _a : 200);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "all", null);
__decorate([
    (0, common_1.Get)('user/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "forUser", null);
__decorate([
    (0, common_1.Get)('entity/:entity/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('entity')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Query)('companyId')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "forEntity", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permission_guard_1.PermissionGuard),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, require_permission_decorator_1.RequirePermission)(security_types_1.Permission.ADMIN_ACCESS),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
function parsePositiveInt(raw) {
    if (!raw)
        return undefined;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0)
        return undefined;
    return Math.trunc(value);
}
//# sourceMappingURL=audit.controller.js.map