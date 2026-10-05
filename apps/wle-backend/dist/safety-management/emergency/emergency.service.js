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
exports.EmergencyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let EmergencyService = class EmergencyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPlans(siteId) {
        return this.prisma.emergencyPlan.findMany({
            where: { siteId, active: true },
            orderBy: { title: 'asc' },
        });
    }
    async createPlan(data) {
        var _a, _b, _c;
        let companyId = data.companyId;
        if (!companyId) {
            const project = await this.prisma.project.findFirst({
                where: { siteId: data.siteId },
                select: { companyId: true },
            });
            companyId = (_a = project === null || project === void 0 ? void 0 : project.companyId) !== null && _a !== void 0 ? _a : 1;
        }
        return this.prisma.emergencyPlan.create({
            data: {
                companyId,
                siteId: data.siteId,
                title: data.title,
                planType: (_b = data.planType) !== null && _b !== void 0 ? _b : 'evacuation',
                contentJson: ((_c = data.contentJson) !== null && _c !== void 0 ? _c : {}),
            },
        });
    }
    async triggerMuster(data) {
        var _a;
        const active = await this.prisma.musterEvent.findFirst({
            where: {
                siteId: data.siteId,
                status: { in: ['activated', 'accounting'] },
            },
        });
        if (active) {
            throw new common_1.BadRequestException('Muster already active for this site');
        }
        const project = await this.prisma.project.findFirst({
            where: data.projectId ? { id: data.projectId } : { siteId: data.siteId },
            select: { companyId: true },
        });
        return this.prisma.musterEvent.create({
            data: {
                companyId: (_a = project === null || project === void 0 ? void 0 : project.companyId) !== null && _a !== void 0 ? _a : 1,
                siteId: data.siteId,
                projectId: data.projectId,
                triggeredByUser: data.triggeredByUser,
                notes: data.notes,
                status: client_1.MusterEventStatus.activated,
            },
        });
    }
    async getActiveMuster(siteId) {
        return this.prisma.musterEvent.findFirst({
            where: {
                siteId,
                status: { in: ['activated', 'accounting'] },
            },
            include: {
                checkins: {
                    include: {
                        worker: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
            orderBy: { triggeredAt: 'desc' },
        });
    }
    async checkIn(data) {
        var _a, _b;
        const event = await this.prisma.musterEvent.findUnique({
            where: { id: data.musterEventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Muster event not found');
        if (event.status === 'all_clear' || event.status === 'cancelled') {
            throw new common_1.BadRequestException('Muster is closed');
        }
        await this.prisma.musterEvent.update({
            where: { id: data.musterEventId },
            data: { status: client_1.MusterEventStatus.accounting },
        });
        return this.prisma.musterCheckin.upsert({
            where: {
                musterEventId_workerId: {
                    musterEventId: data.musterEventId,
                    workerId: data.workerId,
                },
            },
            create: {
                musterEventId: data.musterEventId,
                workerId: data.workerId,
                method: (_a = data.method) !== null && _a !== void 0 ? _a : 'manual',
            },
            update: { checkedInAt: new Date(), method: (_b = data.method) !== null && _b !== void 0 ? _b : 'manual' },
        });
    }
    async allClear(musterEventId) {
        return this.prisma.musterEvent.update({
            where: { id: musterEventId },
            data: {
                status: client_1.MusterEventStatus.all_clear,
                allClearAt: new Date(),
            },
        });
    }
    async listMusterHistory(siteId, limit = 20) {
        return this.prisma.musterEvent.findMany({
            where: { siteId },
            include: { _count: { select: { checkins: true } } },
            orderBy: { triggeredAt: 'desc' },
            take: limit,
        });
    }
};
exports.EmergencyService = EmergencyService;
exports.EmergencyService = EmergencyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmergencyService);
//# sourceMappingURL=emergency.service.js.map