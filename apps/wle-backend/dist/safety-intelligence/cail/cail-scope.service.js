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
exports.CailScopeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_types_1 = require("./cail.types");
const VERIFY_PROJECT_ROLES = new Set([
    client_1.ProjectSafetyRoleType.prime_admin,
    client_1.ProjectSafetyRoleType.company_safety_manager,
]);
let CailScopeService = class CailScopeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveActor(userId, role, projectId) {
        var _a;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, companyId: true },
        });
        const projectRoles = await this.prisma.projectSafetyRole.findMany({
            where: Object.assign({ userId }, (projectId ? { projectId } : {})),
            select: { projectId: true, role: true },
        });
        return {
            id: userId,
            role: (_a = user === null || user === void 0 ? void 0 : user.role) !== null && _a !== void 0 ? _a : role,
            companyId: user === null || user === void 0 ? void 0 : user.companyId,
            projectRoles,
        };
    }
    isPrime(actor) {
        return cail_types_1.PRIME_ROLES.has(actor.role);
    }
    isClientReadonly(actor, projectId) {
        var _a;
        if (!((_a = actor.projectRoles) === null || _a === void 0 ? void 0 : _a.length))
            return false;
        const roles = projectId
            ? actor.projectRoles.filter((r) => r.projectId === projectId)
            : actor.projectRoles;
        return roles.some((r) => r.role === client_1.ProjectSafetyRoleType.client_readonly);
    }
    buildListWhere(actor, filters) {
        var _a;
        const where = {};
        if (filters.projectId)
            where.projectId = filters.projectId;
        if (filters.status)
            where.status = filters.status;
        if (filters.sourceType)
            where.sourceType = filters.sourceType;
        if (this.isPrime(actor)) {
            if (filters.ownerCompanyId)
                where.ownerCompanyId = filters.ownerCompanyId;
            if (this.isClientReadonly(actor, filters.projectId)) {
                where.severity = { in: ['high', 'critical'] };
            }
            return where;
        }
        if (actor.companyId) {
            where.ownerCompanyId = actor.companyId;
        }
        else {
            where.ownerCompanyId = -1;
        }
        const workerScoped = (_a = actor.projectRoles) === null || _a === void 0 ? void 0 : _a.some((r) => (!filters.projectId || r.projectId === filters.projectId) &&
            r.role === client_1.ProjectSafetyRoleType.worker);
        if (workerScoped && !this.isPrime(actor)) {
            where.assignedUserId = actor.id;
        }
        return where;
    }
    canVerify(actor, projectId) {
        var _a;
        if (this.isPrime(actor))
            return true;
        if (actor.role === client_1.UserRole.SUPERVISOR)
            return true;
        if (!projectId || !((_a = actor.projectRoles) === null || _a === void 0 ? void 0 : _a.length))
            return false;
        return actor.projectRoles.some((r) => r.projectId === projectId && VERIFY_PROJECT_ROLES.has(r.role));
    }
    canAccessEntry(actor, entry) {
        var _a;
        if (this.isPrime(actor))
            return true;
        if (actor.companyId !== entry.ownerCompanyId)
            return false;
        const workerOnly = (_a = actor.projectRoles) === null || _a === void 0 ? void 0 : _a.some((r) => r.projectId === entry.projectId &&
            r.role === client_1.ProjectSafetyRoleType.worker);
        if (workerOnly) {
            return entry.assignedUserId === actor.id;
        }
        return true;
    }
};
exports.CailScopeService = CailScopeService;
exports.CailScopeService = CailScopeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CailScopeService);
//# sourceMappingURL=cail-scope.service.js.map