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
exports.PmCapaIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmCapaIntelligenceService = class PmCapaIntelligenceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async projectForecast(projectId) {
        const open = await this.prisma.pmCorrectiveAction.findMany({
            where: {
                projectId,
                status: { notIn: ['verified', 'closed', 'cancelled'] },
                deletedAt: null,
            },
            select: { priorityScore: true, dueAt: true, sourceModule: true },
        });
        const overdueRisk = open.filter((a) => a.dueAt && a.dueAt < new Date()).length;
        const avgPriority = open.length > 0
            ? Math.round(open.reduce((s, a) => s + a.priorityScore, 0) / open.length)
            : 0;
        const crossForm = await this.prisma.pmCorrectiveAction.groupBy({
            by: ['sourceModule'],
            where: { projectId, deletedAt: null },
            _count: true,
        });
        return {
            openCount: open.length,
            overdueRisk,
            averagePriority: avgPriority,
            predictedEscalations: Math.min(open.length, overdueRisk * 2 + (avgPriority > 70 ? 3 : 0)),
            crossFormCorrelation: crossForm,
            explainability: [
                {
                    rule: 'escalation_forecast',
                    detail: `overdue(${overdueRisk}) * 2 + high_priority_boost`,
                },
            ],
        };
    }
};
exports.PmCapaIntelligenceService = PmCapaIntelligenceService;
exports.PmCapaIntelligenceService = PmCapaIntelligenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmCapaIntelligenceService);
//# sourceMappingURL=pm-capa-intelligence.service.js.map