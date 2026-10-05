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
exports.AssignmentDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AssignmentDashboardService = class AssignmentDashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview() {
        const [active, workers, equipment, sites] = await Promise.all([
            this.prisma.workerAssignment.count({ where: { endedAt: null } }),
            this.prisma.worker.count(),
            this.prisma.equipment.count(),
            this.prisma.site.count(),
        ]);
        return {
            activeAssignments: active,
            totalWorkers: workers,
            totalEquipment: equipment,
            totalSites: sites,
        };
    }
    async activeAssignments() {
        const now = new Date();
        const assignments = await this.prisma.workerAssignment.findMany({
            where: { endedAt: null },
            include: {
                worker: {
                    include: {
                        trainingRecords: true,
                        incidents: true,
                    },
                },
                equipment: true,
                site: true,
                company: true,
            },
            orderBy: { assignedAt: 'desc' },
        });
        return assignments.map((a) => {
            const expiredTraining = a.worker.trainingRecords.some((t) => t.expiresAt && t.expiresAt <= now);
            const openIncidents = a.worker.incidents.filter((i) => i.status !== 'CLOSED').length;
            const equipmentUnsafe = a.equipment && a.equipment.safetyStatus !== 'OK';
            return Object.assign(Object.assign({}, a), { risk: {
                    expiredTraining,
                    openIncidents,
                    equipmentUnsafe,
                } });
        });
    }
    async workerLoad() {
        const workers = await this.prisma.worker.findMany({
            include: {
                assignments: {
                    where: { endedAt: null },
                    include: { equipment: true, site: true },
                },
            },
        });
        return workers.map((w) => ({
            id: w.id,
            name: `${w.firstName} ${w.lastName}`,
            activeAssignments: w.assignments.length,
            assignments: w.assignments,
        }));
    }
    async equipmentUtilization() {
        const equipment = await this.prisma.equipment.findMany({
            include: {
                assignments: {
                    where: { endedAt: null },
                    include: { worker: true },
                },
            },
        });
        return equipment.map((e) => ({
            id: e.id,
            name: e.name,
            serialNumber: e.serialNumber,
            safetyStatus: e.safetyStatus,
            assigned: e.assignments.length > 0,
            assignedWorkers: e.assignments.map((a) => a.worker),
        }));
    }
    async siteStaffing() {
        const sites = await this.prisma.site.findMany({
            include: {
                assignments: {
                    where: { endedAt: null },
                    include: { worker: true },
                },
            },
        });
        return sites.map((s) => ({
            id: s.id,
            name: s.name,
            activeWorkers: s.assignments.length,
            workers: s.assignments.map((a) => a.worker),
        }));
    }
    async companyAssignments(companyId) {
        const assignments = await this.prisma.workerAssignment.findMany({
            where: { companyId, endedAt: null },
            include: {
                worker: true,
                equipment: true,
                site: true,
            },
        });
        return {
            companyId,
            total: assignments.length,
            assignments,
        };
    }
};
exports.AssignmentDashboardService = AssignmentDashboardService;
exports.AssignmentDashboardService = AssignmentDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignmentDashboardService);
//# sourceMappingURL=assignment-dashboard.service.js.map