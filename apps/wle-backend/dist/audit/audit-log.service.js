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
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const phase1_request_context_storage_1 = require("../common/monitoring/phase1-request-context.storage");
let AuditLogService = class AuditLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAudit(actor, action, entity, metadata, options) {
        var _a, _b, _c, _d, _e;
        const store = phase1_request_context_storage_1.phase1RequestStore.getStore();
        const tenantId = this.resolveTenantId(actor, entity, metadata);
        const entityId = String(entity.id);
        const meta = this.buildMetadata(metadata, store === null || store === void 0 ? void 0 : store.correlationId);
        const data = Object.assign({ action, entityType: entity.type, entityId, tenantId: tenantId !== null && tenantId !== void 0 ? tenantId : undefined, metadataJson: meta, ip: (_b = (_a = options === null || options === void 0 ? void 0 : options.ip) !== null && _a !== void 0 ? _a : store === null || store === void 0 ? void 0 : store.ip) !== null && _b !== void 0 ? _b : undefined, userAgent: (_d = (_c = options === null || options === void 0 ? void 0 : options.userAgent) !== null && _c !== void 0 ? _c : store === null || store === void 0 ? void 0 : store.userAgent) !== null && _d !== void 0 ? _d : undefined }, ((actor === null || actor === void 0 ? void 0 : actor.id) != null ? { actor: { connect: { id: actor.id } } } : {}));
        const client = (_e = options === null || options === void 0 ? void 0 : options.tx) !== null && _e !== void 0 ? _e : this.prisma;
        return client.auditLog.create({ data });
    }
    async findForTenant(tenantId, limit = 200) {
        return this.prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async findForEntity(entityType, entityId, limit = 100) {
        return this.prisma.auditLog.findMany({
            where: { entityType, entityId: String(entityId) },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    resolveTenantId(actor, entity, metadata) {
        var _a;
        if (entity.tenantId != null && Number.isFinite(entity.tenantId)) {
            return entity.tenantId;
        }
        if ((actor === null || actor === void 0 ? void 0 : actor.companyId) != null && Number.isFinite(actor.companyId)) {
            return actor.companyId;
        }
        const fromMeta = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.companyId) !== null && _a !== void 0 ? _a : metadata === null || metadata === void 0 ? void 0 : metadata.tenantId;
        if (typeof fromMeta === 'number' && Number.isFinite(fromMeta)) {
            return fromMeta;
        }
        return null;
    }
    buildMetadata(metadata, correlationId) {
        const base = metadata ? Object.assign({}, metadata) : {};
        if (correlationId)
            base.correlationId = correlationId;
        return Object.keys(base).length ? base : undefined;
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map