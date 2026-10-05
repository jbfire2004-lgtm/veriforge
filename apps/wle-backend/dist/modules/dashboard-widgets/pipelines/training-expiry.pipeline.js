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
exports.TrainingExpiryPipeline = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let TrainingExpiryPipeline = class TrainingExpiryPipeline {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async run(companyId) {
        const now = new Date();
        const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const d60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
        const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const workerFilter = companyId ? { worker: { companyId } } : {};
        const base = Object.assign({ expiresAt: { not: null } }, workerFilter);
        const [expired, expiring30, expiring60, expiring90, gaps] = await Promise.all([
            this.prisma.trainingRecord.count({
                where: Object.assign(Object.assign({}, base), { expiresAt: { lte: now } }),
            }),
            this.prisma.trainingRecord.count({
                where: Object.assign(Object.assign({}, base), { expiresAt: { gt: now, lte: d30 } }),
            }),
            this.prisma.trainingRecord.count({
                where: Object.assign(Object.assign({}, base), { expiresAt: { gt: d30, lte: d60 } }),
            }),
            this.prisma.trainingRecord.count({
                where: Object.assign(Object.assign({}, base), { expiresAt: { gt: d60, lte: d90 } }),
            }),
            this.prisma.worker.count({
                where: Object.assign(Object.assign({}, (companyId ? { companyId } : {})), { trainingRecords: { none: {} } }),
            }),
        ]);
        const highRisk = expired + expiring30;
        return {
            expired,
            expiring30,
            expiring60,
            expiring90,
            highRisk,
            gaps,
        };
    }
};
exports.TrainingExpiryPipeline = TrainingExpiryPipeline;
exports.TrainingExpiryPipeline = TrainingExpiryPipeline = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingExpiryPipeline);
//# sourceMappingURL=training-expiry.pipeline.js.map