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
exports.OrientationCompletionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const audit_log_service_1 = require("../../../audit/audit-log.service");
const audit_actions_1 = require("../../../audit/audit-actions");
const event_bus_service_1 = require("../../api-platform/events/event-bus.service");
const domain_events_1 = require("../../api-platform/events/domain-events");
const prisma_errors_1 = require("../../../common/prisma-errors");
const orientation_validation_1 = require("./orientation-validation");
let OrientationCompletionService = class OrientationCompletionService {
    constructor(prisma, auditLog, events) {
        this.prisma = prisma;
        this.auditLog = auditLog;
        this.events = events;
    }
    async create(input) {
        var _a, _b, _c, _d;
        const orientation = await this.prisma.orientationDefinition.findUnique({
            where: { id: input.orientationId },
        });
        if (!orientation) {
            throw new common_1.NotFoundException('Orientation definition not found');
        }
        if (orientation.companyId !== input.companyId) {
            throw new common_1.BadRequestException('orientationId does not belong to companyId');
        }
        const worker = await this.prisma.worker.findUnique({
            where: { id: input.workerId },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        if (input.clientSyncId) {
            const existing = await this.prisma.orientationCompletion.findUnique({
                where: { clientSyncId: input.clientSyncId },
            });
            if (existing)
                return existing;
        }
        const status = (_a = input.status) !== null && _a !== void 0 ? _a : (input.score != null && input.score < 70 ? 'failed' : 'completed');
        const completedOn = status === 'completed' || status === 'failed' ? new Date() : null;
        const expiresOn = status === 'completed'
            ? (0, orientation_validation_1.computeExpiresOn)(completedOn, orientation.expiryRules)
            : null;
        let row;
        try {
            row = await this.prisma.orientationCompletion.create({
                data: {
                    workerId: input.workerId,
                    orientationId: input.orientationId,
                    companyId: input.companyId,
                    projectId: input.projectId,
                    completedOn,
                    expiresOn,
                    score: input.score,
                    status,
                    clientSyncId: input.clientSyncId,
                },
            });
        }
        catch (err) {
            row = await (0, prisma_errors_1.replayOrConflict)(err, async () => {
                if (!input.clientSyncId)
                    return null;
                return this.prisma.orientationCompletion.findUnique({
                    where: { clientSyncId: input.clientSyncId },
                });
            });
            return row;
        }
        if (input.actorId) {
            await this.auditLog.logAudit({ id: input.actorId, companyId: input.companyId }, audit_actions_1.AuditAction.ORIENTATION_COMPLETION_RECORDED, {
                type: audit_actions_1.AuditEntityType.ORIENTATION_COMPLETION,
                id: row.id,
                tenantId: input.companyId,
            }, { status: row.status, workerId: row.workerId });
        }
        if (status === 'completed') {
            (_b = this.events) === null || _b === void 0 ? void 0 : _b.emit({
                name: domain_events_1.DomainEvent.ORIENTATION_COMPLETED,
                occurredAt: new Date().toISOString(),
                actorId: input.actorId,
                companyId: input.companyId,
                projectId: input.projectId,
                entityType: 'OrientationCompletion',
                entityId: row.id,
                data: {
                    workerId: row.workerId,
                    orientationId: row.orientationId,
                    expiresOn: (_d = (_c = row.expiresOn) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                    score: row.score,
                },
            });
        }
        return row;
    }
    async list(filters) {
        if (!filters.workerId && !filters.orientationId) {
            throw new common_1.BadRequestException('workerId or orientationId is required');
        }
        return this.prisma.orientationCompletion.findMany({
            where: Object.assign(Object.assign({}, (filters.workerId != null ? { workerId: filters.workerId } : {})), (filters.orientationId
                ? { orientationId: filters.orientationId }
                : {})),
            orderBy: { createdAt: 'desc' },
            take: 200,
            include: {
                orientation: {
                    select: { id: true, title: true, type: true, version: true },
                },
            },
        });
    }
    async expireDue(companyId) {
        const now = new Date();
        const result = await this.prisma.orientationCompletion.updateMany({
            where: Object.assign({ status: 'completed', expiresOn: { lt: now } }, (companyId != null ? { companyId } : {})),
            data: { status: 'expired' },
        });
        return { expired: result.count };
    }
};
exports.OrientationCompletionService = OrientationCompletionService;
exports.OrientationCompletionService = OrientationCompletionService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        event_bus_service_1.EventBusService])
], OrientationCompletionService);
//# sourceMappingURL=orientation-completion.service.js.map