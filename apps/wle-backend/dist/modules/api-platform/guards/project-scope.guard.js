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
exports.ProjectScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../../prisma/prisma.service");
const roles_1 = require("../../vera-core/roles");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_1 = require("../constants/error-codes");
const scoped_decorator_1 = require("../decorators/scoped.decorator");
let ProjectScopeGuard = class ProjectScopeGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        var _a, _b;
        const paramName = (_a = this.reflector.getAllAndOverride(scoped_decorator_1.PROJECT_SCOPE_KEY, [
            context.getHandler(),
            context.getClass(),
        ])) !== null && _a !== void 0 ? _a : 'projectId';
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!(user === null || user === void 0 ? void 0 : user.role)) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.UNAUTHORIZED, 'Authentication required');
        }
        const role = user.role;
        if ((0, roles_1.isSuperAdmin)(role) || (0, roles_1.isSupervisor)(role)) {
            return true;
        }
        const projectId = Number((_b = request.params) === null || _b === void 0 ? void 0 : _b[paramName]);
        if (!Number.isFinite(projectId))
            return true;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        if (!project) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.NOT_FOUND, 'Project not found', {
                projectId,
            });
        }
        if (user.companyId != null && project.companyId !== user.companyId) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.FORBIDDEN, 'Access denied for this project', { projectId, companyId: project.companyId });
        }
        return true;
    }
};
exports.ProjectScopeGuard = ProjectScopeGuard;
exports.ProjectScopeGuard = ProjectScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], ProjectScopeGuard);
//# sourceMappingURL=project-scope.guard.js.map