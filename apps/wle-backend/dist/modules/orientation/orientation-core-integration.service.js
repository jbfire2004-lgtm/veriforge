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
var OrientationCoreIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationCoreIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ORIENTATION_CERT_CODE = 'ORIENTATION';
const SITE_ORIENTATION_CERT_CODE = 'SITE_ORIENTATION';
let OrientationCoreIntegrationService = OrientationCoreIntegrationService_1 = class OrientationCoreIntegrationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OrientationCoreIntegrationService_1.name);
    }
    async ensureCertification(code, name) {
        const existing = await this.prisma.certification.findFirst({
            where: { code },
        });
        if (existing)
            return existing;
        return this.prisma.certification.create({
            data: { name, code, description: `${name} (Vera orientation module)` },
        });
    }
    async recordCompletion(input) {
        var _a, _b;
        const cert = await this.ensureCertification(input.projectId ? SITE_ORIENTATION_CERT_CODE : ORIENTATION_CERT_CODE, input.projectId ? 'Site orientation' : 'Company orientation');
        const certificateNumber = `ORI-${input.packageId.slice(0, 8)}-v${input.versionNumber}`;
        const existing = await this.prisma.trainingRecord.findFirst({
            where: {
                workerId: input.workerId,
                certificationId: cert.id,
                companyId: (_a = input.companyId) !== null && _a !== void 0 ? _a : undefined,
                projectId: (_b = input.projectId) !== null && _b !== void 0 ? _b : undefined,
                certificateNumber,
            },
        });
        const completedAt = new Date();
        let record;
        if (existing) {
            record = await this.prisma.trainingRecord.update({
                where: { id: existing.id },
                data: {
                    completedAt,
                    certificateUrl: input.certificateId,
                },
            });
        }
        else {
            record = await this.prisma.trainingRecord.create({
                data: {
                    workerId: input.workerId,
                    certificationId: cert.id,
                    companyId: input.companyId,
                    projectId: input.projectId,
                    certificateNumber,
                    certificateUrl: input.certificateId,
                    completedAt,
                    issuedAt: completedAt,
                },
            });
        }
        if (input.projectId && input.companyId) {
            await this.syncSiteOrientationForm(input);
        }
        this.logger.log(`Core training record ${record.id} for worker ${input.workerId} orientation ${input.packageId}`);
        return record;
    }
    async syncSiteOrientationForm(input) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: input.workerId },
            select: { userId: true },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.userId))
            return;
        const existing = await this.prisma.safetyForm.findFirst({
            where: {
                companyId: input.companyId,
                projectId: input.projectId,
                definitionId: 'site-orientation',
                createdById: worker.userId,
            },
        });
        if (existing)
            return;
        const def = await this.prisma.safetyFormDefinition.findUnique({
            where: { id: 'site-orientation' },
        });
        if (!def)
            return;
        await this.prisma.safetyForm.create({
            data: {
                companyId: input.companyId,
                projectId: input.projectId,
                definitionId: 'site-orientation',
                workerId: input.workerId,
                title: input.packageTitle,
                status: 'SUBMITTED',
                createdById: worker.userId,
                submittedById: worker.userId,
                formData: {
                    orientationComplete: true,
                    orientationTopics: ['Vera orientation module'],
                    quizScore: input.quizScore,
                    languageCode: input.languageCode,
                },
                submittedAt: new Date(),
            },
        });
    }
    async complianceSummaryForCompany(companyId) {
        const packages = await this.prisma.orientationPackage.findMany({
            where: { companyId, archivedAt: null, isPublished: true },
            include: {
                workerProgress: true,
            },
        });
        return this.summarizePackages(packages);
    }
    async complianceSummaryForProject(projectId) {
        var _a;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        const packages = await this.prisma.orientationPackage.findMany({
            where: {
                archivedAt: null,
                isPublished: true,
                OR: [{ projectId }, { companyId: (_a = project === null || project === void 0 ? void 0 : project.companyId) !== null && _a !== void 0 ? _a : -1 }],
            },
            include: { workerProgress: true },
        });
        return this.summarizePackages(packages);
    }
    summarizePackages(packages) {
        let completed = 0;
        let pending = 0;
        let outdated = 0;
        for (const pkg of packages) {
            for (const p of pkg.workerProgress) {
                if (p.status === 'COMPLETED' && p.versionNumber >= pkg.version) {
                    completed += 1;
                }
                else if (p.status === 'REORIENTATION_REQUIRED') {
                    outdated += 1;
                }
                else {
                    pending += 1;
                }
            }
        }
        return {
            packageCount: packages.length,
            completed,
            pending,
            outdated,
            packages: packages.map((p) => ({
                id: p.id,
                title: p.title,
                version: p.version,
                progress: p.workerProgress.length,
            })),
        };
    }
};
exports.OrientationCoreIntegrationService = OrientationCoreIntegrationService;
exports.OrientationCoreIntegrationService = OrientationCoreIntegrationService = OrientationCoreIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrientationCoreIntegrationService);
//# sourceMappingURL=orientation-core-integration.service.js.map