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
var EventOutboxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventOutboxService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_outbox_prisma_1 = require("./event-outbox.prisma");
const topics_1 = require("./topics");
const event_retry_policy_1 = require("./event-retry.policy");
const event_bus_metrics_service_1 = require("./event-bus-metrics.service");
let EventOutboxService = EventOutboxService_1 = class EventOutboxService {
    constructor(prisma, metrics) {
        this.prisma = prisma;
        this.metrics = metrics;
        this.logger = new common_1.Logger(EventOutboxService_1.name);
    }
    async enqueue(event, options) {
        var _a, _b;
        try {
            const row = await (0, event_outbox_prisma_1.eventOutboxDelegate)(this.prisma).create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    eventName: event.name,
                    topic: (0, topics_1.topicForEvent)(event.name),
                    natsSubject: (0, topics_1.natsSubjectForEvent)(event.name),
                    partitionKey: (0, topics_1.partitionKeyForEvent)(event),
                    payload: event,
                    status: 'PENDING',
                    attempts: 0,
                    maxAttempts: event_retry_policy_1.DEFAULT_PUBLISH_RETRY.maxAttempts,
                    idempotencyKey: (_a = options === null || options === void 0 ? void 0 : options.idempotencyKey) !== null && _a !== void 0 ? _a : null,
                },
            });
            (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.recordEnqueued();
            return row;
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes('Unique constraint') && (options === null || options === void 0 ? void 0 : options.idempotencyKey)) {
                this.logger.debug(`Outbox dedupe skip: ${options.idempotencyKey}`);
                return null;
            }
            this.logger.warn(`Outbox enqueue failed: ${msg}`);
            return null;
        }
    }
    async claimBatch(limit = 50) {
        const due = await (0, event_outbox_prisma_1.eventOutboxDelegate)(this.prisma).findMany({
            where: {
                status: { in: ['PENDING', 'FAILED'] },
                OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
            },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        if (due.length === 0)
            return [];
        await (0, event_outbox_prisma_1.eventOutboxDelegate)(this.prisma).updateMany({
            where: {
                id: { in: due.map((r) => r.id) },
                status: { in: ['PENDING', 'FAILED'] },
            },
            data: { status: 'PUBLISHING' },
        });
        return due;
    }
    async markPublished(id) {
        var _a;
        await (0, event_outbox_prisma_1.eventOutboxDelegate)(this.prisma).update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                lastError: null,
            },
        });
        (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.recordPublished();
    }
    async markFailed(row, error, nextRetryAt) {
        var _a, _b;
        const attempts = row.attempts + 1;
        if (attempts >= row.maxAttempts || nextRetryAt == null) {
            await (0, event_outbox_prisma_1.eventOutboxDelegate)(this.prisma).update({
                where: { id: row.id },
                data: {
                    status: 'DLQ',
                    attempts,
                    lastError: error,
                },
            });
            (_a = this.metrics) === null || _a === void 0 ? void 0 : _a.recordPublishFailed();
            return 'dlq';
        }
        await (0, event_outbox_prisma_1.eventOutboxDelegate)(this.prisma).update({
            where: { id: row.id },
            data: {
                status: 'FAILED',
                attempts,
                lastError: error,
                nextRetryAt,
            },
        });
        (_b = this.metrics) === null || _b === void 0 ? void 0 : _b.recordPublishFailed();
        return 'retry';
    }
};
exports.EventOutboxService = EventOutboxService;
exports.EventOutboxService = EventOutboxService = EventOutboxService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_bus_metrics_service_1.EventBusMetricsService])
], EventOutboxService);
//# sourceMappingURL=event-outbox.service.js.map