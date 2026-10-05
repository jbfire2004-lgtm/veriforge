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
exports.FieldSyncDeltaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FieldSyncDeltaService = class FieldSyncDeltaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async fetchDelta(params) {
        var _a, _b;
        const since = (_a = params.since) !== null && _a !== void 0 ? _a : null;
        const companyId = params.companyId;
        const timeFilter = since ? { gte: since } : undefined;
        const projectIds = companyId
            ? (await this.prisma.project.findMany({
                where: { companyId },
                select: { id: true },
                take: 500,
            })).map((p) => p.id)
            : [];
        const [workers, equipmentLinks, projects, trainingRecords, inspections, safetyForms, workPackages, tasks, safetyFormDefinitions, deletedWorkPackages, deletedTasks,] = await Promise.all([
            this.fetchWorkers(companyId, since),
            companyId
                ? this.prisma.equipmentLink.findMany({
                    where: Object.assign({ companyId }, (timeFilter ? { startDate: timeFilter } : {})),
                    include: {
                        equipment: {
                            select: {
                                id: true,
                                name: true,
                                qrToken: true,
                                safetyStatus: true,
                            },
                        },
                    },
                    take: 500,
                })
                : Promise.resolve([]),
            companyId
                ? this.prisma.project.findMany({
                    where: Object.assign({ companyId }, (timeFilter ? { createdAt: timeFilter } : {})),
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        companyId: true,
                        code: true,
                        startDate: true,
                        endDate: true,
                        createdAt: true,
                    },
                    take: 200,
                })
                : Promise.resolve([]),
            companyId
                ? this.prisma.trainingRecord.findMany({
                    where: Object.assign({ companyId }, (timeFilter ? { issuedAt: timeFilter } : {})),
                    include: {
                        certification: { select: { id: true, name: true, code: true } },
                        worker: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                qrToken: true,
                            },
                        },
                    },
                    orderBy: { issuedAt: 'desc' },
                    take: 300,
                })
                : Promise.resolve([]),
            companyId
                ? this.prisma.inspection.findMany({
                    where: Object.assign(Object.assign({}, (timeFilter ? { createdAt: timeFilter } : {})), { OR: [
                            { worker: { companyId } },
                            { equipment: { equipmentLinks: { some: { companyId } } } },
                        ] }),
                    orderBy: { createdAt: 'desc' },
                    take: 200,
                })
                : Promise.resolve([]),
            companyId
                ? this.prisma.safetyForm.findMany({
                    where: Object.assign({ OR: [{ companyId }, { project: { companyId } }] }, (timeFilter ? { updatedAt: timeFilter } : {})),
                    select: {
                        id: true,
                        definitionId: true,
                        formType: true,
                        status: true,
                        title: true,
                        formData: true,
                        companyId: true,
                        projectId: true,
                        workerId: true,
                        clientSyncId: true,
                        clientVersion: true,
                        updatedAt: true,
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 200,
                })
                : Promise.resolve([]),
            projectIds.length
                ? this.prisma.pmWorkPackage.findMany({
                    where: Object.assign({ projectId: { in: projectIds }, deletedAt: null }, (timeFilter ? { updatedAt: timeFilter } : {})),
                    select: {
                        id: true,
                        projectId: true,
                        code: true,
                        title: true,
                        status: true,
                        progressPct: true,
                        clientSyncId: true,
                        updatedAt: true,
                    },
                    take: 300,
                })
                : Promise.resolve([]),
            projectIds.length
                ? this.prisma.pmPmTask.findMany({
                    where: Object.assign({ projectId: { in: projectIds }, deletedAt: null }, (timeFilter ? { updatedAt: timeFilter } : {})),
                    select: {
                        id: true,
                        projectId: true,
                        workPackageId: true,
                        code: true,
                        title: true,
                        status: true,
                        taskType: true,
                        progressPct: true,
                        plannedStart: true,
                        plannedEnd: true,
                        clientSyncId: true,
                        updatedAt: true,
                    },
                    take: 500,
                })
                : Promise.resolve([]),
            companyId
                ? this.prisma.safetyFormDefinition.findMany({
                    where: Object.assign({ OR: [{ companyId: null }, { companyId }], isActive: true }, (timeFilter ? { updatedAt: timeFilter } : {})),
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        version: true,
                        definition: true,
                        companyId: true,
                        updatedAt: true,
                    },
                    take: 100,
                })
                : Promise.resolve([]),
            projectIds.length && since
                ? this.prisma.pmWorkPackage.findMany({
                    where: {
                        projectId: { in: projectIds },
                        deletedAt: { gte: since },
                    },
                    select: { id: true, deletedAt: true },
                    take: 100,
                })
                : Promise.resolve([]),
            projectIds.length && since
                ? this.prisma.pmPmTask.findMany({
                    where: {
                        projectId: { in: projectIds },
                        deletedAt: { gte: since },
                    },
                    select: { id: true, deletedAt: true },
                    take: 100,
                })
                : Promise.resolve([]),
        ]);
        const equipment = equipmentLinks.map((l) => ({
            linkId: l.id,
            companyId: l.companyId,
            equipmentId: l.equipmentId,
            complianceStatus: l.complianceStatus,
            equipment: l.equipment,
        }));
        const syncedAtIso = new Date().toISOString();
        const workerWalletSnapshots = this.buildWalletSnapshots(trainingRecords, syncedAtIso);
        const deleted = [
            ...deletedWorkPackages
                .filter((r) => r.deletedAt)
                .map((r) => ({
                type: 'workPackage',
                id: r.id,
                deletedAt: r.deletedAt.toISOString(),
            })),
            ...deletedTasks
                .filter((r) => r.deletedAt)
                .map((r) => ({
                type: 'task',
                id: r.id,
                deletedAt: r.deletedAt.toISOString(),
            })),
        ];
        return {
            syncedAt: syncedAtIso,
            since: (_b = since === null || since === void 0 ? void 0 : since.toISOString()) !== null && _b !== void 0 ? _b : null,
            workers,
            equipment,
            projects,
            trainingRecords,
            inspections,
            safetyForms,
            workPackages,
            tasks,
            safetyFormDefinitions,
            workerWalletSnapshots,
            deleted,
            versions: {
                workers: workers.length,
                equipment: equipment.length,
                projects: projects.length,
                trainingRecords: trainingRecords.length,
                inspections: inspections.length,
                safetyForms: safetyForms.length,
                workPackages: workPackages.length,
                tasks: tasks.length,
                safetyFormDefinitions: safetyFormDefinitions.length,
                workerWalletSnapshots: workerWalletSnapshots.length,
                deleted: deleted.length,
            },
        };
    }
    buildWalletSnapshots(records, syncedAt) {
        var _a;
        const now = Date.now();
        const soonMs = 30 * 86400000;
        const byWorker = new Map();
        for (const r of records) {
            if (!r.workerId)
                continue;
            const bucket = (_a = byWorker.get(r.workerId)) !== null && _a !== void 0 ? _a : {
                verified: 0,
                expiringSoon: 0,
                expired: 0,
            };
            if (r.lastVerificationStatus === 'VERIFIED')
                bucket.verified += 1;
            const exp = r.expiresAt instanceof Date
                ? r.expiresAt.getTime()
                : r.expiresAt
                    ? Date.parse(String(r.expiresAt))
                    : NaN;
            if (!Number.isNaN(exp)) {
                if (exp <= now)
                    bucket.expired += 1;
                else if (exp - now <= soonMs)
                    bucket.expiringSoon += 1;
            }
            byWorker.set(r.workerId, bucket);
        }
        return [...byWorker.entries()].map(([workerId, stats]) => {
            const total = stats.verified + stats.expired;
            const readinessScore = total > 0
                ? Math.round(((stats.verified - stats.expired) / total) * 100)
                : null;
            return {
                workerId,
                verifiedCount: stats.verified,
                expiringSoon: stats.expiringSoon,
                expired: stats.expired,
                readinessScore,
                lastSyncedAt: syncedAt,
            };
        });
    }
    async fetchWorkers(companyId, since) {
        if (!companyId)
            return [];
        if (!since) {
            return this.prisma.worker.findMany({
                where: { companyId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    companyId: true,
                    qrToken: true,
                    status: true,
                    email: true,
                    phone: true,
                },
                take: 500,
            });
        }
        const [fromTraining, fromLinks] = await Promise.all([
            this.prisma.trainingRecord.findMany({
                where: { companyId, issuedAt: { gte: since } },
                select: { workerId: true },
                distinct: ['workerId'],
                take: 200,
            }),
            this.prisma.companyLink.findMany({
                where: { companyId, startDate: { gte: since } },
                select: { workerId: true },
                distinct: ['workerId'],
                take: 200,
            }),
        ]);
        const workerIds = [
            ...new Set([
                ...fromTraining.map((r) => r.workerId),
                ...fromLinks.map((l) => l.workerId),
            ]),
        ];
        if (workerIds.length === 0)
            return [];
        return this.prisma.worker.findMany({
            where: { id: { in: workerIds } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                companyId: true,
                qrToken: true,
                status: true,
                email: true,
                phone: true,
            },
        });
    }
};
exports.FieldSyncDeltaService = FieldSyncDeltaService;
exports.FieldSyncDeltaService = FieldSyncDeltaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldSyncDeltaService);
//# sourceMappingURL=field-sync-delta.service.js.map