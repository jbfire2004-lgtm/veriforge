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
exports.ReportingCoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const verification_service_1 = require("../../verification/verification.service");
const competency_service_1 = require("../competency/competency.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
const inspection_core_service_1 = require("../inspection-core/inspection-core.service");
const reporting_export_util_1 = require("./reporting-export.util");
let ReportingCoreService = class ReportingCoreService {
    constructor(prisma, verification, equipmentComplianceSvc, competency, inspection) {
        this.prisma = prisma;
        this.verification = verification;
        this.equipmentComplianceSvc = equipmentComplianceSvc;
        this.competency = competency;
        this.inspection = inspection;
    }
    async overview(companyId) {
        const [workers, equipment, competencyStatus, inspections, projects, companies, unionDispatch,] = await Promise.all([
            this.workerComplianceSummary(companyId),
            this.equipmentCompliance(companyId),
            this.competencyStatus(companyId),
            this.inspectionStatus(companyId),
            this.projectReadinessSummary(companyId),
            companyId
                ? this.companyReadiness(companyId)
                : this.companiesReadinessSummary(),
            this.unionDispatchStatus(undefined, companyId),
        ]);
        return {
            companyId: companyId !== null && companyId !== void 0 ? companyId : null,
            workers,
            equipment,
            competency: competencyStatus,
            inspections,
            projects,
            companies,
            unionDispatch,
            generatedAt: new Date().toISOString(),
        };
    }
    async workerComplianceSummary(companyId) {
        const where = companyId ? { companyId } : {};
        const totalWorkers = await this.prisma.worker.count({ where });
        const sample = await this.prisma.worker.findMany({
            where,
            take: Math.min(totalWorkers, 50),
            select: { id: true },
        });
        let compliant = 0;
        for (const w of sample) {
            const status = await this.verification.evaluateWorkerCompliance(w.id);
            if (status.isCompliant)
                compliant++;
        }
        const sampleRate = sample.length > 0 ? Math.round((compliant / sample.length) * 100) : 0;
        return {
            summary: {
                totalWorkers,
                evaluated: sample.length,
                compliant,
                nonCompliant: sample.length - compliant,
                expiringSoon: 0,
                complianceRate: sampleRate,
            },
        };
    }
    async workerCompliance(companyId, limit = 200) {
        var _a, _b;
        const where = companyId ? { companyId } : {};
        const workers = await this.prisma.worker.findMany({
            where,
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            take: limit > 0 ? limit : undefined,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                companyId: true,
                company: { select: { id: true, name: true } },
            },
        });
        const rows = [];
        let compliant = 0;
        let nonCompliant = 0;
        let expiringSoon = 0;
        for (const w of workers) {
            const status = await this.verification.evaluateWorkerCompliance(w.id);
            const expiring = status.issues.some((i) => i.type === 'EXPIRING_SOON');
            if (status.isCompliant)
                compliant++;
            else
                nonCompliant++;
            if (expiring)
                expiringSoon++;
            rows.push({
                workerId: w.id,
                workerName: `${w.firstName} ${w.lastName}`.trim(),
                companyId: w.companyId,
                companyName: (_b = (_a = w.company) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : null,
                isCompliant: status.isCompliant,
                issueCount: status.issues.length,
                expiringSoon: expiring,
            });
        }
        const totalWorkers = companyId
            ? await this.prisma.worker.count({ where: { companyId } })
            : await this.prisma.worker.count();
        return {
            summary: {
                totalWorkers,
                evaluated: rows.length,
                compliant,
                nonCompliant,
                expiringSoon,
                complianceRate: rows.length > 0 ? Math.round((compliant / rows.length) * 100) : 0,
            },
            chart: {
                labels: ['Compliant', 'Non-compliant', 'Expiring soon'],
                values: [compliant, nonCompliant, expiringSoon],
            },
            rows,
        };
    }
    async equipmentCompliance(companyId) {
        const dash = await this.equipmentComplianceSvc.dashboard(companyId);
        return {
            summary: {
                total: dash.total,
                compliant: dash.compliant,
                needsAttention: dash.needsAttention,
                nonCompliant: dash.nonCompliant,
                lockedOut: dash.lockedOut,
                overdueInspection: dash.overdueInspection,
                complianceRate: dash.total > 0 ? Math.round((dash.compliant / dash.total) * 100) : 0,
            },
            chart: {
                labels: ['Compliant', 'Needs attention', 'Non-compliant', 'Locked out'],
                values: [
                    dash.compliant,
                    dash.needsAttention,
                    dash.nonCompliant,
                    dash.lockedOut,
                ],
            },
            recent: dash.recent,
        };
    }
    async competencyStatus(companyId) {
        const dash = await this.competency.dashboard(companyId);
        return {
            summary: {
                totalEvaluations: dash.totalEvaluations,
                passing: dash.passing,
                expiringSoon: dash.expiringSoon,
                expired: dash.expired,
                operatorLinks: dash.operatorLinks,
                passRate: dash.totalEvaluations > 0
                    ? Math.round((dash.passing / dash.totalEvaluations) * 100)
                    : 0,
            },
            chart: {
                labels: ['Passing', 'Expiring soon', 'Expired'],
                values: [dash.passing, dash.expiringSoon, dash.expired],
            },
            recent: dash.recent,
        };
    }
    async inspectionStatus(companyId) {
        const dash = await this.inspection.dashboard(companyId);
        const pending = Math.max(0, dash.totalInspections - dash.passed - dash.failed);
        return {
            summary: {
                totalInspections: dash.totalInspections,
                passed: dash.passed,
                failed: dash.failed,
                pending,
                lockedOutEquipment: dash.lockedOutEquipment,
                dueWithin7Days: dash.dueWithin7Days,
                passRate: dash.totalInspections > 0
                    ? Math.round((dash.passed / dash.totalInspections) * 100)
                    : 0,
            },
            chart: {
                labels: ['Passed', 'Failed', 'Other'],
                values: [dash.passed, dash.failed, pending],
            },
            recent: dash.recent,
        };
    }
    async projectReadinessSummary(companyId) {
        const result = await this.projectReadiness(companyId);
        return { summary: result.summary };
    }
    async projectReadiness(companyId, projectId) {
        const where = Object.assign(Object.assign({ status: client_1.ProjectStatus.ACTIVE }, (companyId ? { companyId } : {})), (projectId ? { id: projectId } : {}));
        const projects = await this.prisma.project.findMany({
            where,
            include: {
                company: { select: { id: true, name: true } },
                workerAssignments: {
                    where: { status: client_1.AssignmentStatus.ACTIVE, endedAt: null },
                    include: {
                        worker: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
                equipmentAssignments: {
                    where: { status: client_1.AssignmentStatus.ACTIVE, endedAt: null },
                    include: {
                        equipment: {
                            select: {
                                id: true,
                                name: true,
                                complianceStatus: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        const rows = await Promise.all(projects.map(async (p) => {
            let compliantWorkers = 0;
            for (const a of p.workerAssignments) {
                const c = await this.verification.evaluateWorkerCompliance(a.worker.id);
                if (c.isCompliant)
                    compliantWorkers++;
            }
            const totalWorkers = p.workerAssignments.length;
            const totalEquipment = p.equipmentAssignments.length;
            const compliantEquipment = p.equipmentAssignments.filter((a) => a.equipment.complianceStatus === client_1.LinkComplianceStatus.COMPLIANT).length;
            const workerScore = totalWorkers > 0 ? compliantWorkers / totalWorkers : 1;
            const equipmentScore = totalEquipment > 0 ? compliantEquipment / totalEquipment : 1;
            const readinessScore = Math.round(((workerScore + equipmentScore) / 2) * 100);
            let readinessStatus = 'READY';
            if (readinessScore < 70)
                readinessStatus = 'NOT_READY';
            else if (readinessScore < 90)
                readinessStatus = 'AT_RISK';
            return {
                projectId: p.id,
                projectName: p.name,
                projectCode: p.code,
                companyId: p.companyId,
                companyName: p.company.name,
                totalWorkers,
                compliantWorkers,
                totalEquipment,
                compliantEquipment,
                readinessScore,
                readinessStatus,
            };
        }));
        const ready = rows.filter((r) => r.readinessStatus === 'READY').length;
        const atRisk = rows.filter((r) => r.readinessStatus === 'AT_RISK').length;
        const notReady = rows.filter((r) => r.readinessStatus === 'NOT_READY').length;
        return {
            summary: {
                totalProjects: rows.length,
                ready,
                atRisk,
                notReady,
                averageReadiness: rows.length > 0
                    ? Math.round(rows.reduce((s, r) => s + r.readinessScore, 0) / rows.length)
                    : 0,
            },
            chart: {
                labels: ['Ready', 'At risk', 'Not ready'],
                values: [ready, atRisk, notReady],
            },
            rows,
        };
    }
    async companyReadiness(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const [workers, equipment, inspections, projects] = await Promise.all([
            this.workerCompliance(companyId, 500),
            this.equipmentCompliance(companyId),
            this.inspectionStatus(companyId),
            this.projectReadiness(companyId),
        ]);
        const overallScore = Math.round((workers.summary.complianceRate +
            equipment.summary.complianceRate +
            inspections.summary.passRate +
            projects.summary.averageReadiness) /
            4);
        let readinessStatus = 'READY';
        if (overallScore < 70)
            readinessStatus = 'NOT_READY';
        else if (overallScore < 90)
            readinessStatus = 'AT_RISK';
        return {
            company,
            overallScore,
            readinessStatus,
            workers: workers.summary,
            equipment: equipment.summary,
            inspections: inspections.summary,
            projects: projects.summary,
        };
    }
    async companiesReadinessSummary(limit = 25) {
        const companies = await this.prisma.company.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
            take: limit,
        });
        const rows = await Promise.all(companies.map(async (c) => {
            var _a, _b;
            const [workerCount, equipCounts] = await Promise.all([
                this.prisma.worker.count({ where: { companyId: c.id } }),
                this.prisma.equipment.groupBy({
                    by: ['complianceStatus'],
                    where: {
                        OR: [
                            { companyId: c.id },
                            { equipmentLinks: { some: { companyId: c.id, active: true } } },
                        ],
                    },
                    _count: true,
                }),
            ]);
            const totalEquip = equipCounts.reduce((s, g) => s + g._count, 0);
            const compliantEquip = (_b = (_a = equipCounts.find((g) => g.complianceStatus === client_1.LinkComplianceStatus.COMPLIANT)) === null || _a === void 0 ? void 0 : _a._count) !== null && _b !== void 0 ? _b : 0;
            const equipmentRate = totalEquip > 0
                ? Math.round((compliantEquip / totalEquip) * 100)
                : 100;
            return {
                companyId: c.id,
                companyName: c.name,
                workerCount,
                equipmentCount: totalEquip,
                equipmentComplianceRate: equipmentRate,
            };
        }));
        return { rows };
    }
    async unionDispatchStatus(unionHallId, companyId, from, to) {
        const dateFilter = {};
        if (from || to) {
            dateFilter.dispatchedAt = {};
            if (from)
                dateFilter.dispatchedAt.gte = from;
            if (to)
                dateFilter.dispatchedAt.lte = to;
        }
        const where = Object.assign(Object.assign(Object.assign({}, dateFilter), (unionHallId ? { unionHallId } : {})), (companyId ? { companyId } : {}));
        const [total, active, recalled, recent, byCompany, byHall] = await Promise.all([
            this.prisma.unionDispatch.count({ where }),
            this.prisma.unionDispatch.count({
                where: Object.assign(Object.assign({}, where), { recalledAt: null }),
            }),
            this.prisma.unionDispatch.count({
                where: Object.assign(Object.assign({}, where), { recalledAt: { not: null } }),
            }),
            this.prisma.unionDispatch.findMany({
                where,
                orderBy: { dispatchedAt: 'desc' },
                take: 25,
                include: {
                    worker: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                    company: { select: { id: true, name: true } },
                    unionHall: { select: { id: true, name: true } },
                },
            }),
            this.prisma.unionDispatch.groupBy({
                by: ['companyId'],
                where,
                _count: true,
                orderBy: { _count: { companyId: 'desc' } },
                take: 10,
            }),
            unionHallId
                ? Promise.resolve([])
                : this.prisma.unionDispatch.groupBy({
                    by: ['unionHallId'],
                    where: dateFilter,
                    _count: true,
                    orderBy: { _count: { unionHallId: 'desc' } },
                    take: 10,
                }),
        ]);
        const companyIds = byCompany.map((g) => g.companyId);
        const companies = await this.prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true },
        });
        const companyMap = new Map(companies.map((c) => [c.id, c.name]));
        const hallIds = byHall.map((g) => g.unionHallId);
        const halls = await this.prisma.unionHall.findMany({
            where: { id: { in: hallIds } },
            select: { id: true, name: true },
        });
        const hallMap = new Map(halls.map((h) => [h.id, h.name]));
        const memberCount = unionHallId
            ? await this.prisma.unionMembership.count({
                where: { unionHallId, status: 'ACTIVE' },
            })
            : await this.prisma.unionMembership.count({
                where: { status: 'ACTIVE' },
            });
        return {
            summary: {
                totalDispatches: total,
                activeDispatches: active,
                recalledDispatches: recalled,
                activeMembers: memberCount,
            },
            chart: {
                labels: ['Active', 'Recalled'],
                values: [active, recalled],
            },
            byCompany: byCompany.map((g) => {
                var _a;
                return ({
                    companyId: g.companyId,
                    companyName: (_a = companyMap.get(g.companyId)) !== null && _a !== void 0 ? _a : `Company ${g.companyId}`,
                    count: g._count,
                });
            }),
            byHall: byHall.map((g) => {
                var _a;
                return ({
                    unionHallId: g.unionHallId,
                    unionHallName: (_a = hallMap.get(g.unionHallId)) !== null && _a !== void 0 ? _a : `Hall ${g.unionHallId}`,
                    count: g._count,
                });
            }),
            recent,
        };
    }
    async exportWorkersCsv(companyId) {
        const data = await this.workerCompliance(companyId, 5000);
        return (0, reporting_export_util_1.toCsv)([
            'workerId',
            'workerName',
            'companyId',
            'companyName',
            'isCompliant',
            'issueCount',
            'expiringSoon',
        ], data.rows.map((r) => [
            r.workerId,
            r.workerName,
            r.companyId,
            r.companyName,
            r.isCompliant,
            r.issueCount,
            r.expiringSoon,
        ]));
    }
    async exportEquipmentCsv(companyId) {
        const data = await this.equipmentCompliance(companyId);
        return (0, reporting_export_util_1.toCsv)([
            'equipmentId',
            'name',
            'complianceStatus',
            'lockoutStatus',
            'lastInspectionAt',
            'nextInspectionAt',
            'companyName',
        ], data.recent.map((e) => {
            var _a, _b;
            return [
                e.id,
                e.name,
                e.complianceStatus,
                e.lockoutStatus,
                e.lastInspectionAt,
                e.nextInspectionAt,
                (_b = (_a = e.company) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
            ];
        }));
    }
    async exportProjectsCsv(companyId) {
        const data = await this.projectReadiness(companyId);
        return (0, reporting_export_util_1.toCsv)([
            'projectId',
            'projectName',
            'companyName',
            'readinessScore',
            'readinessStatus',
            'totalWorkers',
            'compliantWorkers',
            'totalEquipment',
            'compliantEquipment',
        ], data.rows.map((r) => [
            r.projectId,
            r.projectName,
            r.companyName,
            r.readinessScore,
            r.readinessStatus,
            r.totalWorkers,
            r.compliantWorkers,
            r.totalEquipment,
            r.compliantEquipment,
        ]));
    }
    async exportUnionDispatchCsv(unionHallId, companyId, from, to) {
        const data = await this.unionDispatchStatus(unionHallId, companyId, from, to);
        return (0, reporting_export_util_1.toCsv)([
            'dispatchId',
            'workerName',
            'companyName',
            'unionHallName',
            'dispatchedAt',
            'recalledAt',
        ], data.recent.map((d) => [
            d.id,
            `${d.worker.firstName} ${d.worker.lastName}`,
            d.company.name,
            d.unionHall.name,
            d.dispatchedAt,
            d.recalledAt,
        ]));
    }
};
exports.ReportingCoreService = ReportingCoreService;
exports.ReportingCoreService = ReportingCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        verification_service_1.VerificationService,
        equipment_compliance_service_1.EquipmentComplianceService,
        competency_service_1.CompetencyService,
        inspection_core_service_1.InspectionCoreService])
], ReportingCoreService);
//# sourceMappingURL=reporting-core.service.js.map