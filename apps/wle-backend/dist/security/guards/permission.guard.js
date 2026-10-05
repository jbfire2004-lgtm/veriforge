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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
const permission_service_1 = require("../permission.service");
let PermissionGuard = class PermissionGuard {
    constructor(reflector, permissions) {
        this.reflector = reflector;
        this.permissions = permissions;
    }
    canActivate(context) {
        const permission = this.reflector.getAllAndOverride(require_permission_decorator_1.PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        if (!permission)
            return true;
        const request = context
            .switchToHttp()
            .getRequest();
        const actor = request.user;
        if (!(actor === null || actor === void 0 ? void 0 : actor.role)) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        this.permissions.assertPermission(actor, permission);
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permission_service_1.PermissionService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map