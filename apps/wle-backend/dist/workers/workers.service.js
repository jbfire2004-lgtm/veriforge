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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const verification_service_1 = require("../verification/verification.service");
const phase1_monitoring_service_1 = require("../common/monitoring/phase1-monitoring.service");
const adoption_event_service_1 = require("../modules/adoption-analytics/adoption-event.service");
const adoption_analytics_constants_1 = require("../modules/adoption-analytics/adoption-analytics.constants");
const common_2 = require("@nestjs/common");
const company_links_service_1 = require("../modules/vera-core/company-links.service");
let WorkersService = class WorkersService {
    constructor(prisma, verification, monitoring, companyLinks, adoption) {
        this.prisma = prisma;
        this.verification = verification;
        this.monitoring = monitoring;
        this.companyLinks = companyLinks;
        this.adoption = adoption;
    }
    async findAll() {
        return this.prisma.worker.findMany({
            orderBy: { lastName: 'asc' },
            include: {
                company: true,
            },
        });
    }
    async findByCompany(companyId) {
        return this.prisma.worker.findMany({
            where: { companyId },
            orderBy: { lastName: 'asc' },
            include: { company: true },
        });
    }
    async registerHeartbeat(id) {
        const existing = await this.prisma.worker.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Worker not found');
        const now = new Date();
        await this.prisma.$executeRawUnsafe(`
      UPDATE "Worker"
      SET last_heartbeat = $2
      WHERE id = $1
      `, id, now);
        return {
            id,
            lastHeartbeat: now.toISOString(),
        };
    }
    async findWorkerIdByUserId(userId) {
        var _a;
        const w = await this.prisma.worker.findFirst({
            where: { userId },
            select: { id: true },
        });
        return (_a = w === null || w === void 0 ? void 0 : w.id) !== null && _a !== void 0 ? _a : null;
    }
    async findOne(id) {
        const worker = await this.prisma.worker.findUnique({
            where: { id },
            include: {
                company: true,
                trainingRecords: {
                    include: { certification: true },
                    orderBy: { expiresAt: 'asc' },
                },
                equipmentAssignments: {
                    where: {
                        endedAt: null,
                        equipmentId: { not: null },
                    },
                    include: { equipment: true },
                    orderBy: { assignedAt: 'desc' },
                },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const now = new Date();
        const { trainingRecords, equipmentAssignments } = worker, rest = __rest(worker, ["trainingRecords", "equipmentAssignments"]);
        const training = trainingRecords.map((t) => (Object.assign(Object.assign({}, t), { isValid: !t.expiresAt || new Date(t.expiresAt) > now })));
        const equipment = equipmentAssignments
            .filter((a) => a.equipment)
            .map((a) => {
            const eq = a.equipment;
            return {
                id: a.id,
                equipment: Object.assign(Object.assign({}, eq), { isSafe: eq.safetyStatus === 'OK' }),
            };
        });
        return Object.assign(Object.assign({}, rest), { training, equipment });
    }
    async create(data) {
        var _a, _b, _c, _d;
        const firstName = data.firstName.trim();
        const lastName = data.lastName.trim();
        const photoUrl = ((_a = data.photoUrl) === null || _a === void 0 ? void 0 : _a.trim()) || null;
        const companyId = data.companyId;
        if (companyId != null) {
            await this.assertCompanyExists(companyId);
        }
        const created = await this.prisma.worker.create({
            data: {
                firstName,
                lastName,
                companyId: null,
                photoUrl,
            },
        });
        if (companyId != null) {
            await this.companyLinks.linkWorker(created.id, companyId);
        }
        const worker = await this.prisma.worker.findUnique({
            where: { id: created.id },
            include: { company: true },
        });
        this.monitoring.processing('workers', 'worker.create', {
            workerId: created.id,
            companyId: (_b = worker === null || worker === void 0 ? void 0 : worker.companyId) !== null && _b !== void 0 ? _b : null,
        });
        await this.monitoring.persistAudit({
            action: 'worker.create',
            entity: 'Worker',
            entityId: created.id,
            metadata: {
                companyId: (_c = worker === null || worker === void 0 ? void 0 : worker.companyId) !== null && _c !== void 0 ? _c : null,
                firstName,
                lastName,
            },
        });
        const trackCompanyId = (_d = worker === null || worker === void 0 ? void 0 : worker.companyId) !== null && _d !== void 0 ? _d : companyId;
        if (trackCompanyId && this.adoption) {
            this.adoption.track({
                companyId: trackCompanyId,
                event: adoption_analytics_constants_1.ADOPTION_EVENT_TYPES.WORKER_CREATED,
                metadata: { workerId: created.id },
            });
        }
        return worker !== null && worker !== void 0 ? worker : created;
    }
    async assignCompanyBatch(workerIds, companyId) {
        const unique = [...new Set(workerIds)];
        if (companyId != null) {
            await this.assertCompanyExists(companyId);
        }
        const found = await this.prisma.worker.findMany({
            where: { id: { in: unique } },
            select: { id: true },
        });
        if (found.length !== unique.length) {
            throw new common_1.NotFoundException('One or more workers were not found');
        }
        for (const id of unique) {
            if (companyId != null) {
                await this.companyLinks.linkWorker(id, companyId);
            }
            else {
                const active = await this.prisma.companyLink.findMany({
                    where: { workerId: id, active: true },
                });
                for (const link of active) {
                    await this.companyLinks.endAssignment(id, link.companyId);
                }
                await this.prisma.worker.update({
                    where: { id },
                    data: { companyId: null },
                });
            }
        }
        for (const id of unique) {
            this.monitoring.processing('workers', 'worker.assign-company', {
                workerId: id,
                companyId,
            });
            await this.monitoring.persistAudit({
                action: 'worker.assign-company',
                entity: 'Worker',
                entityId: id,
                metadata: {
                    companyId,
                    batchSize: unique.length,
                },
            });
        }
        return { updated: unique.length, workerIds: unique, companyId };
    }
    async update(id, data) {
        var _a;
        const existing = await this.prisma.worker.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Worker not found');
        const firstName = data.firstName !== undefined ? data.firstName.trim() : existing.firstName;
        const lastName = data.lastName !== undefined ? data.lastName.trim() : existing.lastName;
        const photoUrl = data.photoUrl !== undefined
            ? ((_a = data.photoUrl) === null || _a === void 0 ? void 0 : _a.trim()) || null
            : existing.photoUrl;
        if (data.companyId !== undefined && data.companyId !== existing.companyId) {
            if (data.companyId != null) {
                await this.assertCompanyExists(data.companyId);
                await this.companyLinks.linkWorker(id, data.companyId);
            }
            else {
                const active = await this.prisma.companyLink.findMany({
                    where: { workerId: id, active: true },
                });
                for (const link of active) {
                    await this.companyLinks.endAssignment(id, link.companyId);
                }
                await this.prisma.worker.update({
                    where: { id },
                    data: { companyId: null },
                });
            }
        }
        const updated = await this.prisma.worker.update({
            where: { id },
            data: {
                firstName,
                lastName,
                photoUrl,
            },
            include: { company: true },
        });
        this.monitoring.processing('workers', 'worker.update', { workerId: id });
        await this.monitoring.persistAudit({
            action: 'worker.update',
            entity: 'Worker',
            entityId: id,
            metadata: {
                changedFields: Object.keys(data),
                companyId: updated.companyId,
            },
        });
        return updated;
    }
    async assertCompanyExists(companyId) {
        if (!Number.isFinite(companyId)) {
            throw new common_1.BadRequestException('Invalid companyId');
        }
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
    }
    async remove(id) {
        const existing = await this.prisma.worker.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Worker not found');
        await this.prisma.worker.delete({ where: { id } });
        this.monitoring.processing('workers', 'worker.delete', { workerId: id });
        await this.monitoring.persistAudit({
            action: 'worker.delete',
            entity: 'Worker',
            entityId: id,
            metadata: { companyId: existing.companyId },
        });
        return { status: 'ok', deletedId: id };
    }
    async getCompliance(workerId) {
        return this.verification.evaluateWorkerCompliance(workerId);
    }
    async getProfile(id) {
        var _a;
        const worker = await this.prisma.worker.findUnique({
            where: { id },
            include: {
                company: true,
                trainingRecords: {
                    include: { certification: true },
                    orderBy: { expiresAt: 'asc' },
                },
                credentials: {
                    include: { certification: true },
                    orderBy: { expiresAt: 'asc' },
                },
                incidents: {
                    orderBy: { createdAt: 'desc' },
                },
                workerSiteAccess: {
                    include: { site: true },
                    orderBy: { updatedAt: 'desc' },
                },
                digitalSignoff: {
                    include: {
                        supervisor: true,
                        equipment: true,
                        site: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                documents: { where: { type: 'TRAINING' } },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const now = new Date();
        const expiredTraining = worker.trainingRecords.filter((t) => t.expiresAt && t.expiresAt <= now);
        const expiredCredentials = worker.credentials.filter((c) => c.expiresAt && c.expiresAt <= now);
        const compliance = await this.verification.evaluateWorkerCompliance(id);
        return {
            id: worker.id,
            firstName: worker.firstName,
            lastName: worker.lastName,
            fullName: `${worker.firstName} ${worker.lastName}`,
            company: worker.company
                ? { id: worker.company.id, name: worker.company.name }
                : null,
            photoUrl: (_a = worker.photoUrl) !== null && _a !== void 0 ? _a : null,
            training: {
                records: worker.trainingRecords,
                expiredCount: expiredTraining.length,
            },
            credentials: {
                records: worker.credentials,
                expiredCount: expiredCredentials.length,
            },
            incidents: worker.incidents,
            siteAccess: worker.workerSiteAccess,
            signoffs: worker.digitalSignoff,
            compliance,
        };
    }
};
exports.WorkersService = WorkersService;
exports.WorkersService = WorkersService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_2.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        verification_service_1.VerificationService,
        phase1_monitoring_service_1.Phase1MonitoringService,
        company_links_service_1.CompanyLinksService,
        adoption_event_service_1.AdoptionEventService])
], WorkersService);
//# sourceMappingURL=workers.service.js.map