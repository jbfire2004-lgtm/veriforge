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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("./audit-log.service");
let AuditService = class AuditService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async log(input) {
        var _a, _b, _c, _d;
        const actor = { id: (_a = input.userId) !== null && _a !== void 0 ? _a : null };
        const entity = {
            type: (_b = input.entity) !== null && _b !== void 0 ? _b : 'Unknown',
            id: (_c = input.entityId) !== null && _c !== void 0 ? _c : 'unknown',
            tenantId: (_d = input.tenantId) !== null && _d !== void 0 ? _d : null,
        };
        return this.auditLog.logAudit(actor, input.action, entity, input.metadata, {
            ip: input.ip,
            userAgent: input.userAgent,
        });
    }
    async logAudit(actor, action, entity, metadata, options) {
        return this.auditLog.logAudit(actor, action, entity, metadata, options);
    }
    async findAll(actor, companyId, limit = 200) {
        const where = this.buildTenantWhere(actor, companyId);
        return this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: this.coerceLimit(limit),
        });
    }
    async findForUser(actor, actorId, companyId, limit = 200) {
        const tenantWhere = this.buildTenantWhere(actor, companyId);
        return this.prisma.auditLog.findMany({
            where: Object.assign(Object.assign({}, tenantWhere), { actorId }),
            orderBy: { createdAt: 'desc' },
            take: this.coerceLimit(limit),
        });
    }
    async findForEntity(actor, entityType, entityId, companyId, limit = 200) {
        const tenantWhere = this.buildTenantWhere(actor, companyId);
        return this.prisma.auditLog.findMany({
            where: Object.assign(Object.assign({}, tenantWhere), { entityType, entityId: String(entityId) }),
            orderBy: { createdAt: 'desc' },
            take: this.coerceLimit(limit),
        });
    }
    async findForTenant(actor, tenantId, limit = 200) {
        const where = this.buildTenantWhere(actor, tenantId);
        return this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: this.coerceLimit(limit),
        });
    }
    buildTenantWhere(actor, requestedCompanyId) {
        const normalizedCompanyId = requestedCompanyId != null && Number.isFinite(requestedCompanyId)
            ? Math.trunc(requestedCompanyId)
            : undefined;
        if (actor.role === client_1.UserRole.SUPER_ADMIN || actor.role === client_1.UserRole.ADMIN) {
            if (normalizedCompanyId && normalizedCompanyId > 0) {
                return { tenantId: normalizedCompanyId };
            }
            return {};
        }
        if (actor.companyId == null) {
            throw new common_1.ForbiddenException('Tenant company context required');
        }
        if (normalizedCompanyId != null &&
            normalizedCompanyId > 0 &&
            normalizedCompanyId !== actor.companyId) {
            throw new common_1.ForbiddenException('Cross-tenant audit access denied');
        }
        return { tenantId: actor.companyId };
    }
    coerceLimit(limit) {
        if (!Number.isFinite(limit))
            return 200;
        return Math.max(1, Math.min(500, Math.trunc(limit)));
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], AuditService);
//# sourceMappingURL=audit.service.js.map