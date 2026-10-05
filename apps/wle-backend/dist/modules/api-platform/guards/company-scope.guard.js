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
exports.CompanyScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_1 = require("../../vera-core/roles");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_1 = require("../constants/error-codes");
const scoped_decorator_1 = require("../decorators/scoped.decorator");
let CompanyScopeGuard = class CompanyScopeGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        var _a, _b, _c, _d, _e, _f;
        const paramName = (_a = this.reflector.getAllAndOverride(scoped_decorator_1.COMPANY_SCOPE_KEY, [
            context.getHandler(),
            context.getClass(),
        ])) !== null && _a !== void 0 ? _a : 'companyId';
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!(user === null || user === void 0 ? void 0 : user.role)) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.UNAUTHORIZED, 'Authentication required');
        }
        const role = user.role;
        if ((0, roles_1.isSuperAdmin)(role) || (0, roles_1.isCompanyAdmin)(role)) {
            return true;
        }
        const raw = (_e = (_c = (_b = request.params) === null || _b === void 0 ? void 0 : _b[paramName]) !== null && _c !== void 0 ? _c : (_d = request.query) === null || _d === void 0 ? void 0 : _d[paramName]) !== null && _e !== void 0 ? _e : (((_f = request.body) === null || _f === void 0 ? void 0 : _f[paramName]) != null
            ? String(request.body[paramName])
            : undefined);
        if (!raw)
            return true;
        const companyId = Number(raw);
        if (user.companyId != null && user.companyId !== companyId) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.FORBIDDEN, 'Access denied for this company', { companyId, userCompanyId: user.companyId });
        }
        return true;
    }
};
exports.CompanyScopeGuard = CompanyScopeGuard;
exports.CompanyScopeGuard = CompanyScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], CompanyScopeGuard);
//# sourceMappingURL=company-scope.guard.js.map