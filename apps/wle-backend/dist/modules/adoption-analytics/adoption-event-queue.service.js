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
var AdoptionEventQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdoptionEventQueueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdoptionEventQueueService = AdoptionEventQueueService_1 = class AdoptionEventQueueService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AdoptionEventQueueService_1.name);
        this.buffer = [];
        this.flushTimer = null;
        this.flushing = false;
    }
    enqueue(event) {
        this.buffer.push(event);
        if (this.buffer.length >= 50) {
            void this.flush();
            return;
        }
        if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => {
                this.flushTimer = null;
                void this.flush();
            }, 500);
        }
    }
    async flush() {
        if (this.flushing || this.buffer.length === 0)
            return;
        this.flushing = true;
        const batch = this.buffer.splice(0, this.buffer.length);
        try {
            await this.prisma.analyticsEvent.createMany({
                data: batch.map((e) => {
                    var _a, _b;
                    return ({
                        companyId: e.companyId,
                        userId: (_a = e.userId) !== null && _a !== void 0 ? _a : null,
                        eventType: e.eventType,
                        metadata: ((_b = e.metadata) !== null && _b !== void 0 ? _b : {}),
                    });
                }),
            });
        }
        catch (err) {
            this.logger.error(`Failed to flush ${batch.length} analytics events`, err);
            this.buffer.unshift(...batch);
        }
        finally {
            this.flushing = false;
        }
    }
    async onModuleDestroy() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        await this.flush();
    }
};
exports.AdoptionEventQueueService = AdoptionEventQueueService;
exports.AdoptionEventQueueService = AdoptionEventQueueService = AdoptionEventQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdoptionEventQueueService);
//# sourceMappingURL=adoption-event-queue.service.js.map