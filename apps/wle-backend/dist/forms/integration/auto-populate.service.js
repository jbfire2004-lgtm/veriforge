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
exports.AutoPopulateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AutoPopulateService = class AutoPopulateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildContext(ctx) {
        var _a, _b, _c, _d, _e, _f;
        const out = {
            workDate: new Date().toISOString().slice(0, 10),
        };
        if (ctx.workerId) {
            const worker = await this.prisma.worker.findUnique({
                where: { id: ctx.workerId },
                include: { company: { select: { id: true, name: true } } },
            });
            if (!worker)
                return out;
            out.workerId = worker.id;
            out.workerName = `${worker.firstName} ${worker.lastName}`;
            out.companyId = (_a = worker.companyId) !== null && _a !== void 0 ? _a : ctx.companyId;
            out.companyName = (_b = worker.company) === null || _b === void 0 ? void 0 : _b.name;
            const training = await this.prisma.trainingRecord.findMany({
                where: { workerId: worker.id },
                orderBy: { completedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    completedAt: true,
                    expiresAt: true,
                    certification: { select: { name: true } },
                },
            });
            out.recentTraining = training;
            const competency = await this.prisma.competencyEvaluation.findMany({
                where: { workerId: worker.id },
                orderBy: { evaluationDate: 'desc' },
                take: 5,
                select: { id: true, passed: true, evaluationDate: true, score: true },
            });
            out.recentCompetency = competency;
        }
        if (ctx.projectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: ctx.projectId },
                include: {
                    company: { select: { id: true, name: true } },
                    site: { select: { id: true, name: true } },
                },
            });
            if (!project) {
                return out;
            }
            out.projectId = project.id;
            out.projectName = project.name;
            out.projectCode = project.code;
            out.siteId = project.siteId;
            out.siteName = (_c = project.site) === null || _c === void 0 ? void 0 : _c.name;
            out.companyId = (_d = out.companyId) !== null && _d !== void 0 ? _d : project.companyId;
            out.companyName = (_e = out.companyName) !== null && _e !== void 0 ? _e : (_f = project.company) === null || _f === void 0 ? void 0 : _f.name;
        }
        if (ctx.equipmentId) {
            const equipment = await this.prisma.equipment.findUnique({
                where: { id: ctx.equipmentId },
            });
            if (!equipment)
                return out;
            out.equipmentId = equipment.id;
            out.equipmentName = equipment.name;
            out.equipmentAssetTag = equipment.assetTag;
            out.equipmentSafetyStatus = equipment.safetyStatus;
            out.equipmentComplianceStatus = equipment.complianceStatus;
        }
        return out;
    }
};
exports.AutoPopulateService = AutoPopulateService;
exports.AutoPopulateService = AutoPopulateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutoPopulateService);
//# sourceMappingURL=auto-populate.service.js.map