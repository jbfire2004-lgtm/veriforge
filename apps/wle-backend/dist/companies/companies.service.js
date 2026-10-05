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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const phase1_monitoring_service_1 = require("../common/monitoring/phase1-monitoring.service");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
let CompaniesService = class CompaniesService {
    constructor(prisma, monitoring, events) {
        this.prisma = prisma;
        this.monitoring = monitoring;
        this.events = events;
    }
    async findAll(actor) {
        if (actor.role === client_1.UserRole.WORKER) {
            const worker = await this.prisma.worker.findFirst({
                where: { userId: actor.id },
                include: { company: true },
            });
            if (!(worker === null || worker === void 0 ? void 0 : worker.company)) {
                return [];
            }
            const c = worker.company;
            return [
                {
                    id: c.id,
                    name: c.name,
                    logoUrl: c.logoUrl,
                    createdAt: c.createdAt,
                },
            ];
        }
        return this.prisma.company.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id, actor) {
        if (actor.role === client_1.UserRole.WORKER) {
            const worker = await this.prisma.worker.findFirst({
                where: { userId: actor.id },
                select: { companyId: true },
            });
            if (!(worker === null || worker === void 0 ? void 0 : worker.companyId) || worker.companyId !== id) {
                throw new common_1.ForbiddenException('You may only view your employer organization.');
            }
        }
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: {
                workers: {
                    include: {
                        trainingRecords: { include: { certification: true } },
                        credentials: { include: { certification: true } },
                        incidents: true,
                    },
                },
                equipment: {
                    include: {
                        incidents: true,
                    },
                },
                documents: true,
                incidents: true,
            },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        return company;
    }
    async create(dto) {
        var _a;
        const created = await this.prisma.company.create({
            data: {
                name: dto.name,
                logoUrl: (_a = dto.logoUrl) !== null && _a !== void 0 ? _a : null,
            },
        });
        this.monitoring.processing('companies', 'company.create', {
            companyId: created.id,
        });
        await this.monitoring.persistAudit({
            action: 'company.create',
            entity: 'Company',
            entityId: created.id,
            metadata: { name: dto.name },
        });
        await this.prisma.companyAnalytics
            .create({ data: { companyId: created.id } })
            .catch(() => undefined);
        return created;
    }
    async update(id, dto) {
        var _a, _b, _c;
        const existing = await this.prisma.company.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Company not found');
        const updated = await this.prisma.company.update({
            where: { id },
            data: {
                name: (_a = dto.name) !== null && _a !== void 0 ? _a : existing.name,
                logoUrl: (_b = dto.logoUrl) !== null && _b !== void 0 ? _b : existing.logoUrl,
            },
        });
        this.monitoring.processing('companies', 'company.update', {
            companyId: id,
        });
        await this.monitoring.persistAudit({
            action: 'company.update',
            entity: 'Company',
            entityId: id,
            metadata: { fields: Object.keys(dto) },
        });
        (_c = this.events) === null || _c === void 0 ? void 0 : _c.emit({
            name: domain_events_1.DomainEvent.COMPANY_UPDATED,
            occurredAt: new Date().toISOString(),
            companyId: id,
            entityType: 'company',
            entityId: id,
            data: { fields: Object.keys(dto) },
        });
        return updated;
    }
    async remove(id) {
        const existing = await this.prisma.company.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Company not found');
        await this.prisma.company.delete({ where: { id } });
        this.monitoring.processing('companies', 'company.delete', {
            companyId: id,
        });
        await this.monitoring.persistAudit({
            action: 'company.delete',
            entity: 'Company',
            entityId: id,
            metadata: { name: existing.name },
        });
        return { status: 'ok', deletedId: id };
    }
    async complianceSummary(id, actor) {
        if ((actor === null || actor === void 0 ? void 0 : actor.role) === client_1.UserRole.WORKER) {
            const worker = await this.prisma.worker.findFirst({
                where: { userId: actor.id },
                select: { companyId: true },
            });
            if (!(worker === null || worker === void 0 ? void 0 : worker.companyId) || worker.companyId !== id) {
                throw new common_1.ForbiddenException('You may only view compliance for your employer organization.');
            }
        }
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: {
                workers: {
                    include: {
                        trainingRecords: { include: { certification: true } },
                        credentials: { include: { certification: true } },
                        incidents: true,
                    },
                },
                equipment: {
                    include: {
                        incidents: true,
                    },
                },
            },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const now = new Date();
        const expiredTraining = [];
        const expiredCredentials = [];
        const workerIncidents = [];
        const equipmentIncidents = [];
        for (const worker of company.workers) {
            expiredTraining.push(...worker.trainingRecords.filter((t) => t.expiresAt && t.expiresAt <= now));
            expiredCredentials.push(...worker.credentials.filter((c) => c.expiresAt && c.expiresAt <= now));
            if (worker.incidents.length > 0) {
                workerIncidents.push(...worker.incidents);
            }
        }
        for (const eq of company.equipment) {
            if (eq.incidents.length > 0) {
                equipmentIncidents.push(...eq.incidents);
            }
        }
        const next30 = new Date();
        next30.setDate(now.getDate() + 30);
        const expiringSoonTraining = [];
        for (const worker of company.workers) {
            for (const t of worker.trainingRecords) {
                if (t.expiresAt && t.expiresAt > now && t.expiresAt <= next30) {
                    expiringSoonTraining.push(t);
                }
            }
        }
        const isCompliant = expiredTraining.length === 0 &&
            expiredCredentials.length === 0 &&
            workerIncidents.length === 0 &&
            equipmentIncidents.length === 0;
        return {
            companyId: company.id,
            companyName: company.name,
            expiredTrainingCount: expiredTraining.length,
            expiringTrainingCount: expiringSoonTraining.length,
            expiredCredentialsCount: expiredCredentials.length,
            workerIncidentsCount: workerIncidents.length,
            equipmentIncidentsCount: equipmentIncidents.length,
            status: isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        };
    }
    async analytics(id) {
        const now = new Date();
        const next30 = new Date();
        next30.setDate(now.getDate() + 30);
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: {
                workers: {
                    include: {
                        trainingRecords: { include: { certification: true } },
                        credentials: { include: { certification: true } },
                        incidents: true,
                    },
                },
                equipment: {
                    include: {
                        incidents: true,
                    },
                },
            },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const workerIncidents = company.workers.flatMap((w) => w.incidents);
        const equipmentIncidents = company.equipment.flatMap((e) => e.incidents);
        const expiredTraining = company.workers.filter((w) => w.trainingRecords.some((t) => t.expiresAt && new Date(t.expiresAt) <= now)).length;
        const expiredCredentials = company.workers.filter((w) => w.credentials.some((c) => c.expiresAt && new Date(c.expiresAt) <= now)).length;
        const expiringSoon = company.workers.filter((w) => w.trainingRecords.some((t) => t.expiresAt &&
            new Date(t.expiresAt) > now &&
            new Date(t.expiresAt) <= next30)).length;
        const months = [];
        const incidentTrend = [];
        const expiryTrend = [];
        for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            months.push(month.toLocaleString('default', { month: 'short' }));
            incidentTrend.push(workerIncidents.filter((inc) => new Date(inc.createdAt) >= month &&
                new Date(inc.createdAt) < nextMonth).length +
                equipmentIncidents.filter((inc) => new Date(inc.createdAt) >= month &&
                    new Date(inc.createdAt) < nextMonth).length);
            expiryTrend.push(company.workers.filter((w) => w.trainingRecords.some((t) => t.expiresAt &&
                new Date(t.expiresAt) >= month &&
                new Date(t.expiresAt) < nextMonth)).length);
        }
        return {
            totalWorkers: company.workers.length,
            expiredTraining,
            expiredCredentials,
            expiringSoon,
            workerIncidents: workerIncidents.length,
            equipmentIncidents: equipmentIncidents.length,
            months,
            incidentTrend,
            expiryTrend,
        };
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        phase1_monitoring_service_1.Phase1MonitoringService,
        event_bus_service_1.EventBusService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map