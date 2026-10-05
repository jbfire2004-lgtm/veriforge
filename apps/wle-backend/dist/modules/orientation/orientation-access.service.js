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
exports.OrientationAccessService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let OrientationAccessService = class OrientationAccessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertWorkerCanAccessProject(workerId, projectId) {
        const result = await this.evaluateWorker(workerId, { projectId });
        if (!result.allowed) {
            throw new common_1.BadRequestException({
                message: 'Orientation incomplete — complete required orientation before project access',
                blockingPackages: result.blockingPackages,
            });
        }
        return result;
    }
    async assertWorkerCanBeAssigned(workerId, projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const companyPackages = await this.pendingForWorker(workerId, {
            companyId: project.companyId,
        });
        if (companyPackages.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Complete company orientation before project assignment',
                blockingPackages: companyPackages,
            });
        }
    }
    async evaluateWorker(workerId, scope) {
        const blocking = await this.pendingForWorker(workerId, scope);
        return {
            allowed: blocking.length === 0,
            blockingPackages: blocking,
        };
    }
    async resolveWorkerIdForUser(userId) {
        var _a;
        const worker = await this.prisma.worker.findFirst({
            where: { userId },
            select: { id: true },
        });
        return (_a = worker === null || worker === void 0 ? void 0 : worker.id) !== null && _a !== void 0 ? _a : null;
    }
    async pendingForWorker(workerId, scope) {
        const progress = await this.prisma.orientationWorkerProgress.findMany({
            where: {
                workerId,
                status: {
                    in: [
                        client_1.OrientationWorkerProgressStatus.NOT_STARTED,
                        client_1.OrientationWorkerProgressStatus.IN_PROGRESS,
                        client_1.OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
                    ],
                },
                package: Object.assign({ isPublished: true, archivedAt: null }, (scope.projectId
                    ? {
                        OR: [
                            { projectId: scope.projectId },
                            scope.companyId ? { companyId: scope.companyId } : {},
                        ],
                    }
                    : scope.companyId
                        ? { companyId: scope.companyId }
                        : {})),
            },
            include: { package: true },
        });
        return progress.map((p) => ({
            packageId: p.packageId,
            title: p.package.title,
            status: this.publicStatus(p.status),
            requiredVersion: p.package.version,
        }));
    }
    publicStatus(status) {
        if (status === client_1.OrientationWorkerProgressStatus.REORIENTATION_REQUIRED) {
            return 'outdated';
        }
        if (status === client_1.OrientationWorkerProgressStatus.COMPLETED) {
            return 'completed';
        }
        if (status === client_1.OrientationWorkerProgressStatus.IN_PROGRESS) {
            return 'in_progress';
        }
        return 'pending';
    }
};
exports.OrientationAccessService = OrientationAccessService;
exports.OrientationAccessService = OrientationAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrientationAccessService);
//# sourceMappingURL=orientation-access.service.js.map