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
var Phase1MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phase1MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../audit/audit.service");
const phase1_request_context_storage_1 = require("./phase1-request-context.storage");
let Phase1MonitoringService = Phase1MonitoringService_1 = class Phase1MonitoringService {
    constructor(audit) {
        this.audit = audit;
        this.logger = new common_1.Logger(Phase1MonitoringService_1.name);
    }
    base() {
        var _a, _b;
        const s = phase1_request_context_storage_1.phase1RequestStore.getStore();
        return {
            correlationId: (_a = s === null || s === void 0 ? void 0 : s.correlationId) !== null && _a !== void 0 ? _a : null,
            userId: (_b = s === null || s === void 0 ? void 0 : s.userId) !== null && _b !== void 0 ? _b : null,
        };
    }
    emit(kind, domain, action, data) {
        const { correlationId, userId } = this.base();
        const line = JSON.stringify(Object.assign({ type: `phase1.${kind}`, domain,
            action,
            correlationId,
            userId, ts: new Date().toISOString() }, data));
        if (kind === 'error')
            this.logger.error(line);
        else if (kind === 'warn')
            this.logger.warn(line);
        else
            this.logger.log(line);
    }
    processing(domain, action, data) {
        this.emit('processing', domain, action, data);
    }
    warn(domain, action, data) {
        this.emit('warn', domain, action, data);
    }
    error(domain, action, data) {
        this.emit('error', domain, action, data);
    }
    async persistAudit(input) {
        var _a, _b, _c, _d, _e, _f;
        const s = phase1_request_context_storage_1.phase1RequestStore.getStore();
        const { correlationId, userId } = this.base();
        const meta = input.metadata &&
            typeof input.metadata === 'object' &&
            !Array.isArray(input.metadata)
            ? Object.assign({}, input.metadata) : input.metadata != null
            ? { value: input.metadata }
            : {};
        if (correlationId)
            meta.correlationId = correlationId;
        const resolvedUserId = input.userId !== undefined && input.userId !== null
            ? input.userId
            : userId !== null && userId !== void 0 ? userId : undefined;
        try {
            await this.audit.log({
                userId: resolvedUserId !== null && resolvedUserId !== void 0 ? resolvedUserId : null,
                action: input.action,
                entity: (_a = input.entity) !== null && _a !== void 0 ? _a : undefined,
                entityId: (_b = input.entityId) !== null && _b !== void 0 ? _b : undefined,
                metadata: Object.keys(meta).length ? meta : undefined,
                ip: (_d = (_c = input.ip) !== null && _c !== void 0 ? _c : s === null || s === void 0 ? void 0 : s.ip) !== null && _d !== void 0 ? _d : undefined,
                userAgent: (_f = (_e = input.userAgent) !== null && _e !== void 0 ? _e : s === null || s === void 0 ? void 0 : s.userAgent) !== null && _f !== void 0 ? _f : undefined,
            });
        }
        catch (err) {
            this.logger.warn(JSON.stringify({
                type: 'phase1.audit.persist_failed',
                action: input.action,
                correlationId,
                message: err instanceof Error ? err.message : String(err),
            }));
        }
    }
};
exports.Phase1MonitoringService = Phase1MonitoringService;
exports.Phase1MonitoringService = Phase1MonitoringService = Phase1MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], Phase1MonitoringService);
//# sourceMappingURL=phase1-monitoring.service.js.map