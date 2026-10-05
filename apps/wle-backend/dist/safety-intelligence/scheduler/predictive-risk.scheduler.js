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
var PredictiveRiskScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictiveRiskScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const predictive_risk_service_1 = require("../predictive/predictive-risk.service");
let PredictiveRiskScheduler = PredictiveRiskScheduler_1 = class PredictiveRiskScheduler {
    constructor(prisma, predictive) {
        this.prisma = prisma;
        this.predictive = predictive;
        this.logger = new common_1.Logger(PredictiveRiskScheduler_1.name);
        this.running = false;
    }
    async computeProjectSnapshots() {
        if (this.running)
            return;
        this.running = true;
        try {
            const projects = await this.prisma.project.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true },
                take: 200,
            });
            let computed = 0;
            for (const p of projects) {
                try {
                    await this.predictive.computeAndStore(p.id);
                    computed++;
                }
                catch (e) {
                    this.logger.warn(`Predictive risk failed for project ${p.id}: ${e instanceof Error ? e.message : String(e)}`);
                }
            }
            this.logger.log(`Predictive risk snapshots: ${computed}/${projects.length}`);
        }
        finally {
            this.running = false;
        }
    }
};
exports.PredictiveRiskScheduler = PredictiveRiskScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PredictiveRiskScheduler.prototype, "computeProjectSnapshots", null);
exports.PredictiveRiskScheduler = PredictiveRiskScheduler = PredictiveRiskScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        predictive_risk_service_1.PredictiveRiskService])
], PredictiveRiskScheduler);
//# sourceMappingURL=predictive-risk.scheduler.js.map