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
exports.UnionHallsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const company_links_service_1 = require("./company-links.service");
const inactivation_service_1 = require("./inactivation.service");
const event_bus_service_1 = require("../api-platform/events/event-bus.service");
const domain_events_1 = require("../api-platform/events/domain-events");
let UnionHallsService = class UnionHallsService {
    constructor(prisma, companyLinks, inactivation, events) {
        this.prisma = prisma;
        this.companyLinks = companyLinks;
        this.inactivation = inactivation;
        this.events = events;
    }
    async listHalls() {
        return this.prisma.unionHall.findMany({ orderBy: { name: 'asc' } });
    }
    async createHall(data) {
        return this.prisma.unionHall.create({ data });
    }
    async listMembers(unionHallId, activeOnly = true) {
        return this.prisma.unionMembership.findMany({
            where: Object.assign({ unionHallId }, (activeOnly ? { status: client_1.UnionMembershipStatus.ACTIVE } : {})),
            include: { worker: true },
            orderBy: { joinedAt: 'desc' },
        });
    }
    async addMember(unionHallId, data) {
        const worker = await this.prisma.worker.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                unionNumber: data.memberNumber,
            },
        });
        return this.prisma.unionMembership.create({
            data: {
                unionHallId,
                workerId: worker.id,
                memberNumber: data.memberNumber,
                status: client_1.UnionMembershipStatus.ACTIVE,
            },
            include: { worker: true, unionHall: true },
        });
    }
    async dispatchWorker(unionHallId, workerId, companyId, dispatchedBy, notes) {
        var _a;
        const membership = await this.prisma.unionMembership.findFirst({
            where: {
                unionHallId,
                workerId,
                status: client_1.UnionMembershipStatus.ACTIVE,
            },
        });
        if (!membership)
            throw new common_1.NotFoundException('Active union membership required');
        const dispatch = await this.prisma.unionDispatch.create({
            data: {
                unionHallId,
                workerId,
                companyId,
                dispatchedBy: dispatchedBy !== null && dispatchedBy !== void 0 ? dispatchedBy : null,
                notes,
            },
        });
        await this.companyLinks.linkWorker(workerId, companyId, {
            deactivateOtherCompanies: true,
        });
        (_a = this.events) === null || _a === void 0 ? void 0 : _a.emit({
            name: domain_events_1.DomainEvent.UNION_DISPATCH,
            occurredAt: new Date().toISOString(),
            companyId,
            entityType: 'union_dispatch',
            entityId: dispatch.id,
            actorId: dispatchedBy !== null && dispatchedBy !== void 0 ? dispatchedBy : undefined,
            data: { unionHallId, workerId },
        });
        return dispatch;
    }
    async recallWorker(unionHallId, workerId, companyId) {
        await this.prisma.unionDispatch.updateMany({
            where: {
                unionHallId,
                workerId,
                companyId,
                recalledAt: null,
            },
            data: { recalledAt: new Date() },
        });
        await this.inactivation.deactivateWorkerAtCompany(workerId, companyId, 'UNION_RECALL');
        return { unionHallId, workerId, companyId, recalled: true };
    }
};
exports.UnionHallsService = UnionHallsService;
exports.UnionHallsService = UnionHallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        company_links_service_1.CompanyLinksService,
        inactivation_service_1.InactivationService,
        event_bus_service_1.EventBusService])
], UnionHallsService);
//# sourceMappingURL=union-halls.service.js.map