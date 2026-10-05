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
var OrientationLinkingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationLinkingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let OrientationLinkingService = OrientationLinkingService_1 = class OrientationLinkingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OrientationLinkingService_1.name);
    }
    async linkWorkersForPackage(packageId) {
        const pkg = await this.prisma.orientationPackage.findUnique({
            where: { id: packageId },
            include: { assignments: true },
        });
        if (!pkg || !pkg.isPublished)
            return 0;
        const workerIds = await this.resolveEligibleWorkerIds(pkg);
        let linked = 0;
        for (const workerId of workerIds) {
            const existing = await this.prisma.orientationWorkerProgress.findUnique({
                where: { packageId_workerId: { packageId, workerId } },
            });
            if (!existing) {
                await this.prisma.orientationWorkerProgress.create({
                    data: {
                        packageId,
                        workerId,
                        versionNumber: pkg.version,
                        status: client_1.OrientationWorkerProgressStatus.NOT_STARTED,
                    },
                });
            }
            else if (existing.status === client_1.OrientationWorkerProgressStatus.COMPLETED &&
                existing.versionNumber < pkg.version) {
                await this.prisma.orientationWorkerProgress.update({
                    where: { id: existing.id },
                    data: {
                        versionNumber: pkg.version,
                        status: client_1.OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
                        completedAt: null,
                        certificateId: null,
                    },
                });
            }
            else if (existing.versionNumber < pkg.version) {
                await this.prisma.orientationWorkerProgress.update({
                    where: { id: existing.id },
                    data: { versionNumber: pkg.version },
                });
            }
            linked += 1;
        }
        this.logger.log(`Linked ${linked} workers to orientation ${packageId}`);
        return linked;
    }
    async onCompanyLinkCreated(workerId, companyId) {
        const packages = await this.prisma.orientationPackage.findMany({
            where: {
                companyId,
                isPublished: true,
                archivedAt: null,
                assignments: {
                    some: {
                        scope: {
                            in: [
                                client_1.OrientationAssignmentScope.COMPANY,
                                client_1.OrientationAssignmentScope.ONBOARDING,
                            ],
                        },
                    },
                },
            },
        });
        for (const pkg of packages) {
            await this.upsertWorkerProgress(workerId, pkg.id, pkg.version);
        }
    }
    async onProjectAssignment(workerId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        if (!project)
            return;
        const packages = await this.prisma.orientationPackage.findMany({
            where: {
                isPublished: true,
                archivedAt: null,
                OR: [
                    { projectId },
                    {
                        companyId: project.companyId,
                        assignments: {
                            some: { scope: client_1.OrientationAssignmentScope.COMPANY },
                        },
                    },
                ],
            },
        });
        for (const pkg of packages) {
            await this.upsertWorkerProgress(workerId, pkg.id, pkg.version);
        }
    }
    async upsertWorkerProgress(workerId, packageId, version) {
        const existing = await this.prisma.orientationWorkerProgress.findUnique({
            where: { packageId_workerId: { packageId, workerId } },
        });
        if ((existing === null || existing === void 0 ? void 0 : existing.status) === client_1.OrientationWorkerProgressStatus.COMPLETED &&
            existing.versionNumber >= version) {
            return;
        }
        await this.prisma.orientationWorkerProgress.upsert({
            where: { packageId_workerId: { packageId, workerId } },
            create: {
                packageId,
                workerId,
                versionNumber: version,
                status: client_1.OrientationWorkerProgressStatus.NOT_STARTED,
            },
            update: {
                versionNumber: version,
                status: (existing === null || existing === void 0 ? void 0 : existing.versionNumber) === version
                    ? existing.status
                    : client_1.OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
            },
        });
    }
    async resolveEligibleWorkerIds(pkg) {
        if (pkg.projectId) {
            const rows = await this.prisma.projectAssignment.findMany({
                where: { projectId: pkg.projectId, status: 'ACTIVE' },
                select: { workerId: true },
            });
            return [...new Set(rows.map((r) => r.workerId))];
        }
        if (pkg.companyId) {
            const links = await this.prisma.companyLink.findMany({
                where: { companyId: pkg.companyId, active: true },
                select: { workerId: true },
            });
            const direct = await this.prisma.worker.findMany({
                where: { companyId: pkg.companyId },
                select: { id: true },
            });
            return [
                ...new Set([
                    ...links.map((l) => l.workerId),
                    ...direct.map((w) => w.id),
                ]),
            ];
        }
        return [];
    }
};
exports.OrientationLinkingService = OrientationLinkingService;
exports.OrientationLinkingService = OrientationLinkingService = OrientationLinkingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrientationLinkingService);
//# sourceMappingURL=orientation-linking.service.js.map