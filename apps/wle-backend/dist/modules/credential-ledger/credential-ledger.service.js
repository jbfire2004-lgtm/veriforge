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
var CredentialLedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialLedgerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let CredentialLedgerService = CredentialLedgerService_1 = class CredentialLedgerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CredentialLedgerService_1.name);
    }
    async append(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const row = await this.prisma.credentialLedgerEvent.create({
            data: Object.assign({ eventType: input.eventType, credentialId: input.credentialId, actorId: (_a = input.actorId) !== null && _a !== void 0 ? _a : null, actorType: (_b = input.actorType) !== null && _b !== void 0 ? _b : client_1.CredentialLedgerActorType.SYSTEM, workerId: (_c = input.workerId) !== null && _c !== void 0 ? _c : null, providerId: (_d = input.providerId) !== null && _d !== void 0 ? _d : null, projectId: (_e = input.projectId) !== null && _e !== void 0 ? _e : null, companyId: (_f = input.companyId) !== null && _f !== void 0 ? _f : null, correlationId: (_g = input.correlationId) !== null && _g !== void 0 ? _g : null, payload: ((_h = input.payload) !== null && _h !== void 0 ? _h : {}) }, (input.occurredAt ? { occurredAt: input.occurredAt } : {})),
        });
        this.logger.log(JSON.stringify({
            type: 'credential_ledger.append',
            eventId: row.id,
            eventType: row.eventType,
            credentialId: row.credentialId,
            correlationId: row.correlationId,
        }));
        return this.toView(row);
    }
    async recordCredentialCreated(ctx) {
        var _a, _b;
        return this.append({
            eventType: client_1.CredentialLedgerEventType.CREATED,
            credentialId: ctx.credentialId,
            actorId: ctx.actorId,
            actorType: (_a = ctx.actorType) !== null && _a !== void 0 ? _a : client_1.CredentialLedgerActorType.SYSTEM,
            workerId: ctx.workerId,
            providerId: (_b = ctx.providerId) !== null && _b !== void 0 ? _b : ctx.trainingProviderId,
            projectId: ctx.projectId,
            companyId: ctx.companyId,
            correlationId: ctx.correlationId,
            payload: Object.assign({ source: 'create' }, ctx.payload),
        });
    }
    async recordCredentialImported(ctx) {
        var _a, _b;
        return this.append({
            eventType: client_1.CredentialLedgerEventType.IMPORTED,
            credentialId: ctx.credentialId,
            actorId: ctx.actorId,
            actorType: (_a = ctx.actorType) !== null && _a !== void 0 ? _a : client_1.CredentialLedgerActorType.SYSTEM,
            workerId: ctx.workerId,
            providerId: (_b = ctx.providerId) !== null && _b !== void 0 ? _b : ctx.trainingProviderId,
            projectId: ctx.projectId,
            companyId: ctx.companyId,
            correlationId: ctx.correlationId,
            payload: Object.assign({ source: 'import' }, ctx.payload),
        });
    }
    async recordCredentialUpdated(ctx) {
        var _a, _b;
        return this.append({
            eventType: client_1.CredentialLedgerEventType.UPDATED,
            credentialId: ctx.credentialId,
            actorId: ctx.actorId,
            actorType: (_a = ctx.actorType) !== null && _a !== void 0 ? _a : client_1.CredentialLedgerActorType.ADMIN,
            workerId: ctx.workerId,
            providerId: (_b = ctx.providerId) !== null && _b !== void 0 ? _b : ctx.trainingProviderId,
            projectId: ctx.projectId,
            companyId: ctx.companyId,
            correlationId: ctx.correlationId,
            payload: ctx.payload,
        });
    }
    async recordCredentialCorrected(ctx) {
        var _a, _b;
        return this.append({
            eventType: client_1.CredentialLedgerEventType.CORRECTED,
            credentialId: ctx.credentialId,
            actorId: ctx.actorId,
            actorType: (_a = ctx.actorType) !== null && _a !== void 0 ? _a : client_1.CredentialLedgerActorType.SUPERVISOR,
            workerId: ctx.workerId,
            providerId: (_b = ctx.providerId) !== null && _b !== void 0 ? _b : ctx.trainingProviderId,
            projectId: ctx.projectId,
            companyId: ctx.companyId,
            correlationId: ctx.correlationId,
            payload: ctx.payload,
        });
    }
    async recordCredentialVerified(ctx) {
        var _a, _b;
        return this.append({
            eventType: client_1.CredentialLedgerEventType.VERIFIED,
            credentialId: ctx.credentialId,
            actorId: ctx.actorId,
            actorType: (_a = ctx.actorType) !== null && _a !== void 0 ? _a : client_1.CredentialLedgerActorType.SUPERVISOR,
            workerId: ctx.workerId,
            providerId: (_b = ctx.providerId) !== null && _b !== void 0 ? _b : ctx.trainingProviderId,
            projectId: ctx.projectId,
            companyId: ctx.companyId,
            correlationId: ctx.correlationId,
            payload: ctx.payload,
        });
    }
    async recordCredentialRevoked(ctx) {
        var _a, _b;
        return this.append({
            eventType: client_1.CredentialLedgerEventType.REVOKED,
            credentialId: ctx.credentialId,
            actorId: ctx.actorId,
            actorType: (_a = ctx.actorType) !== null && _a !== void 0 ? _a : client_1.CredentialLedgerActorType.SUPERVISOR,
            workerId: ctx.workerId,
            providerId: (_b = ctx.providerId) !== null && _b !== void 0 ? _b : ctx.trainingProviderId,
            projectId: ctx.projectId,
            companyId: ctx.companyId,
            correlationId: ctx.correlationId,
            payload: ctx.payload,
        });
    }
    async recordCredentialExpired(ctx) {
        var _a;
        return this.append({
            eventType: client_1.CredentialLedgerEventType.EXPIRED,
            credentialId: ctx.credentialId,
            actorType: client_1.CredentialLedgerActorType.SYSTEM,
            workerId: ctx.workerId,
            providerId: (_a = ctx.providerId) !== null && _a !== void 0 ? _a : ctx.trainingProviderId,
            projectId: ctx.projectId,
            companyId: ctx.companyId,
            correlationId: ctx.correlationId,
            payload: ctx.payload,
        });
    }
    async listByCredential(credentialId, limit = 100) {
        const rows = await this.prisma.credentialLedgerEvent.findMany({
            where: { credentialId },
            orderBy: { occurredAt: 'asc' },
            take: limit,
        });
        return rows.map((r) => this.toView(r));
    }
    assertImmutableOperation(model, action) {
        if (model !== 'CredentialLedgerEvent')
            return;
        if (action === 'update' ||
            action === 'updateMany' ||
            action === 'delete' ||
            action === 'deleteMany' ||
            action === 'upsert') {
            throw new common_1.ForbiddenException('CredentialLedgerEvent rows are immutable and cannot be modified');
        }
    }
    toView(row) {
        return {
            id: row.id,
            occurredAt: row.occurredAt.toISOString(),
            actorId: row.actorId,
            actorType: row.actorType,
            eventType: row.eventType,
            credentialId: row.credentialId,
            workerId: row.workerId,
            providerId: row.providerId,
            projectId: row.projectId,
            companyId: row.companyId,
            correlationId: row.correlationId,
            payload: row.payload != null && typeof row.payload === 'object'
                ? row.payload
                : {},
        };
    }
};
exports.CredentialLedgerService = CredentialLedgerService;
exports.CredentialLedgerService = CredentialLedgerService = CredentialLedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CredentialLedgerService);
//# sourceMappingURL=credential-ledger.service.js.map