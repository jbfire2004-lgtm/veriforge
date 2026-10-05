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
exports.SafetyFormAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SafetyFormAnalyticsService = class SafetyFormAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboard(companyId) {
        const where = companyId ? { companyId } : {};
        const [total, byStatus, byDefinition, sifCount, hecaCount, openActions] = await Promise.all([
            this.prisma.safetyForm.count({ where }),
            this.prisma.safetyForm.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            this.prisma.safetyForm.groupBy({
                by: ['definitionId'],
                where,
                _count: true,
            }),
            this.prisma.safetyForm.count({ where: Object.assign(Object.assign({}, where), { sifFlag: true }) }),
            this.prisma.safetyForm.count({ where: Object.assign(Object.assign({}, where), { hecaFlag: true }) }),
            this.prisma.safetyFormAction.count({
                where: {
                    status: 'OPEN',
                    form: companyId ? { companyId } : undefined,
                },
            }),
        ]);
        return {
            total,
            byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count])),
            byDefinition: Object.fromEntries(byDefinition.map((r) => [r.definitionId, r._count])),
            sifCount,
            hecaCount,
            openCorrectiveActions: openActions,
        };
    }
    async leadingLagging(companyId) {
        const forms = await this.prisma.safetyForm.findMany({
            where: {
                companyId,
                definitionId: { in: ['leading-indicator', 'lagging-indicator'] },
            },
            select: { definitionId: true, formData: true, submittedAt: true },
            orderBy: { submittedAt: 'desc' },
            take: 100,
        });
        return { indicators: forms };
    }
};
exports.SafetyFormAnalyticsService = SafetyFormAnalyticsService;
exports.SafetyFormAnalyticsService = SafetyFormAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SafetyFormAnalyticsService);
//# sourceMappingURL=analytics.service.js.map