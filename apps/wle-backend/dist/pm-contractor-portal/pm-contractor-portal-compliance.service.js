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
exports.PmContractorPortalComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_contractor_portal_access_service_1 = require("./pm-contractor-portal-access.service");
let PmContractorPortalComplianceService = class PmContractorPortalComplianceService {
    constructor(prisma, access) {
        this.prisma = prisma;
        this.access = access;
    }
    async getDashboard(actor, projectId) {
        const contractorCompanyId = this.access.requireContractorCompany(actor);
        const workerIds = await this.access.getContractorWorkerIds(contractorCompanyId);
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const [workers, trainingRecords, credentials, equipmentAudits] = await Promise.all([
            this.prisma.worker.findMany({
                where: { id: { in: workerIds.length ? workerIds : [-1] } },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                },
                orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                take: 200,
            }),
            this.prisma.trainingRecord.findMany({
                where: Object.assign({ workerId: { in: workerIds.length ? workerIds : [-1] } }, (projectId
                    ? { projectId }
                    : {
                        OR: [{ companyId: contractorCompanyId }, { companyId: null }],
                    })),
                include: {
                    worker: { select: { id: true, firstName: true, lastName: true } },
                    certification: { select: { id: true, name: true } },
                },
                orderBy: { expiresAt: 'asc' },
                take: 200,
            }),
            this.prisma.credential.findMany({
                where: { workerId: { in: workerIds.length ? workerIds : [-1] } },
                include: {
                    worker: { select: { id: true, firstName: true, lastName: true } },
                    certification: { select: { id: true, name: true } },
                },
                orderBy: { expiresAt: 'asc' },
                take: 200,
            }),
            this.prisma.companyEquipmentAuditView.findMany({
                where: { companyId: contractorCompanyId },
                include: {
                    equipment: { select: { id: true, name: true, serialNumber: true } },
                },
                take: 100,
            }),
        ]);
        const trainingExpired = trainingRecords.filter((t) => t.expiresAt && t.expiresAt < now);
        const trainingExpiringSoon = trainingRecords.filter((t) => t.expiresAt && t.expiresAt >= now && t.expiresAt <= soon);
        const trainingCurrent = trainingRecords.filter((t) => !t.expiresAt || t.expiresAt > soon);
        const credExpired = credentials.filter((c) => c.expiresAt && c.expiresAt < now);
        const credExpiringSoon = credentials.filter((c) => c.expiresAt && c.expiresAt >= now && c.expiresAt <= soon);
        const equipmentNonCompliant = equipmentAudits.filter((e) => !e.preUseCompliant7d || !e.formalCompliant);
        return {
            summary: {
                workersTotal: workers.length,
                trainingExpired: trainingExpired.length,
                trainingExpiringSoon: trainingExpiringSoon.length,
                credentialsExpired: credExpired.length,
                credentialsExpiringSoon: credExpiringSoon.length,
                equipmentNonCompliant: equipmentNonCompliant.length,
                equipmentTotal: equipmentAudits.length,
            },
            workers,
            training: {
                expired: trainingExpired,
                expiringSoon: trainingExpiringSoon,
                current: trainingCurrent.slice(0, 50),
            },
            certifications: {
                expired: credExpired,
                expiringSoon: credExpiringSoon,
            },
            equipment: {
                nonCompliant: equipmentNonCompliant,
                compliant: equipmentAudits.filter((e) => e.preUseCompliant7d && e.formalCompliant),
            },
        };
    }
};
exports.PmContractorPortalComplianceService = PmContractorPortalComplianceService;
exports.PmContractorPortalComplianceService = PmContractorPortalComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_contractor_portal_access_service_1.PmContractorPortalAccessService])
], PmContractorPortalComplianceService);
//# sourceMappingURL=pm-contractor-portal-compliance.service.js.map