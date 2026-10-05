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
exports.OrientationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const orientation_ai_service_1 = require("./orientation-ai.service");
const orientation_linking_service_1 = require("./orientation-linking.service");
const orientation_translation_service_1 = require("./orientation-translation.service");
const orientation_constants_1 = require("./orientation.constants");
const orientation_core_integration_service_1 = require("./orientation-core-integration.service");
const orientation_upload_service_1 = require("./orientation-upload.service");
let OrientationService = class OrientationService {
    constructor(prisma, ai, translate, linking, core, upload) {
        this.prisma = prisma;
        this.ai = ai;
        this.translate = translate;
        this.linking = linking;
        this.core = core;
        this.upload = upload;
    }
    async create(input) {
        var _a, _b, _c;
        if (!input.companyId && !input.projectId) {
            throw new common_1.BadRequestException('companyId or projectId required');
        }
        if (input.companyId && input.projectId) {
            throw new common_1.BadRequestException('Provide only companyId or projectId');
        }
        const languages = ((_a = input.languages) === null || _a === void 0 ? void 0 : _a.length) ? input.languages : ['en'];
        const sections = { en: orientation_constants_1.DEFAULT_ORIENTATION_SECTIONS_EN };
        const pkg = await this.prisma.orientationPackage.create({
            data: {
                companyId: (_b = input.companyId) !== null && _b !== void 0 ? _b : null,
                projectId: (_c = input.projectId) !== null && _c !== void 0 ? _c : null,
                type: input.type,
                title: input.title,
                languages,
                createdById: input.userId,
                updatedById: input.userId,
                versions: {
                    create: {
                        versionNumber: 1,
                        sections: sections,
                        quiz: { en: [] },
                        createdById: input.userId,
                    },
                },
                assignments: {
                    create: [
                        {
                            scope: input.projectId
                                ? client_1.OrientationAssignmentScope.PROJECT
                                : client_1.OrientationAssignmentScope.COMPANY,
                            required: true,
                        },
                        {
                            scope: client_1.OrientationAssignmentScope.ONBOARDING,
                            required: true,
                        },
                    ],
                },
            },
            include: { versions: true, assignments: true },
        });
        return this.getById(pkg.id);
    }
    async getById(id) {
        var _a;
        const pkg = await this.prisma.orientationPackage.findFirst({
            where: { id, archivedAt: null },
            include: {
                versions: { orderBy: { versionNumber: 'desc' } },
                assignments: true,
                _count: { select: { workerProgress: true } },
            },
        });
        if (!pkg)
            throw new common_1.NotFoundException('Orientation package not found');
        const current = pkg.versions.find((v) => v.versionNumber === pkg.version);
        return Object.assign(Object.assign({}, pkg), { currentVersion: (_a = current !== null && current !== void 0 ? current : pkg.versions[0]) !== null && _a !== void 0 ? _a : null });
    }
    async listForCompany(companyId) {
        return this.prisma.orientationPackage.findMany({
            where: { companyId, archivedAt: null },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { workerProgress: true } } },
        });
    }
    async listForProject(projectId) {
        return this.prisma.orientationPackage.findMany({
            where: { projectId, archivedAt: null },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { workerProgress: true } } },
        });
    }
    async update(id, data, userId) {
        var _a, _b, _c;
        const pkg = await this.getById(id);
        const updated = await this.prisma.orientationPackage.update({
            where: { id },
            data: {
                title: (_a = data.title) !== null && _a !== void 0 ? _a : pkg.title,
                languages: (_b = data.languages) !== null && _b !== void 0 ? _b : pkg.languages,
                isPublished: (_c = data.isPublished) !== null && _c !== void 0 ? _c : pkg.isPublished,
                updatedById: userId,
            },
        });
        if (data.isPublished) {
            await this.linking.linkWorkersForPackage(id);
        }
        return this.getById(updated.id);
    }
    async archive(id) {
        await this.prisma.orientationPackage.update({
            where: { id },
            data: { archivedAt: new Date() },
        });
        return { ok: true };
    }
    async uploadContent(id, files, userId) {
        var _a, _b, _c;
        if (files.length > 0) {
            await this.upload.processUpload(id, files, userId);
            const pkg = await this.getById(id);
            await this.linking.linkWorkersForPackage(id);
            return pkg;
        }
        const pkg = await this.getById(id);
        const nextVersion = pkg.version + 1;
        const sections = this.translate.translateSections((_b = (_a = pkg.currentVersion) === null || _a === void 0 ? void 0 : _a.sections) !== null && _b !== void 0 ? _b : {
            en: orientation_constants_1.DEFAULT_ORIENTATION_SECTIONS_EN,
        }, pkg.languages);
        await this.createVersion(id, nextVersion, sections, (_c = pkg.currentVersion) === null || _c === void 0 ? void 0 : _c.quiz, userId);
        await this.linking.linkWorkersForPackage(id);
        return this.getById(id);
    }
    async aiGenerate(id, input, userId) {
        const pkg = await this.getById(id);
        const generated = this.ai.generate(input);
        const nextVersion = pkg.version + 1;
        await this.createVersion(id, nextVersion, generated.sections, generated.quiz, userId, generated.aiMetadata);
        await this.prisma.orientationPackage.update({
            where: { id },
            data: { type: client_1.OrientationPackageType.AI_GENERATED },
        });
        return this.getById(id);
    }
    async translatePackage(id, languages) {
        const pkg = await this.getById(id);
        const current = pkg.currentVersion;
        if (!current)
            throw new common_1.BadRequestException('No version to translate');
        const sections = this.translate.translateSections(current.sections, languages);
        await this.prisma.orientationPackage.update({
            where: { id },
            data: { languages: [...new Set([...pkg.languages, ...languages])] },
        });
        await this.prisma.orientationVersion.update({
            where: { id: current.id },
            data: { sections: sections },
        });
        return this.getById(id);
    }
    async assign(id, scope) {
        const existing = await this.prisma.orientationAssignment.findFirst({
            where: { packageId: id, scope },
        });
        if (!existing) {
            await this.prisma.orientationAssignment.create({
                data: { packageId: id, scope, required: true },
            });
        }
        const pkg = await this.getById(id);
        if (pkg.isPublished) {
            await this.linking.linkWorkersForPackage(id);
        }
        return pkg;
    }
    async listWorkers(id) {
        return this.prisma.orientationWorkerProgress.findMany({
            where: { packageId: id },
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async listVersions(id) {
        return this.prisma.orientationVersion.findMany({
            where: { packageId: id },
            orderBy: { versionNumber: 'desc' },
        });
    }
    async rollback(id, versionNumber, userId) {
        const version = await this.prisma.orientationVersion.findUnique({
            where: { packageId_versionNumber: { packageId: id, versionNumber } },
        });
        if (!version)
            throw new common_1.NotFoundException('Version not found');
        await this.prisma.orientationPackage.update({
            where: { id },
            data: { version: versionNumber, updatedById: userId },
        });
        await this.linking.linkWorkersForPackage(id);
        return this.getById(id);
    }
    async startProgress(packageId, workerId) {
        const pkg = await this.getById(packageId);
        return this.prisma.orientationWorkerProgress.upsert({
            where: { packageId_workerId: { packageId, workerId } },
            create: {
                packageId,
                workerId,
                versionNumber: pkg.version,
                status: client_1.OrientationWorkerProgressStatus.IN_PROGRESS,
                startedAt: new Date(),
            },
            update: {
                status: client_1.OrientationWorkerProgressStatus.IN_PROGRESS,
                startedAt: new Date(),
            },
        });
    }
    async completeProgress(packageId, workerId, input) {
        var _a, _b;
        const pkg = await this.getById(packageId);
        const certId = `CERT-${packageId.slice(0, 8)}-${workerId}-${Date.now()}`;
        const progress = await this.prisma.orientationWorkerProgress.update({
            where: { packageId_workerId: { packageId, workerId } },
            data: {
                status: client_1.OrientationWorkerProgressStatus.COMPLETED,
                completedAt: new Date(),
                versionNumber: pkg.version,
                quizScore: input.quizScore,
                languageCode: (_a = input.languageCode) !== null && _a !== void 0 ? _a : 'en',
                certificateId: certId,
            },
        });
        await this.core.recordCompletion({
            workerId,
            packageId,
            packageTitle: pkg.title,
            companyId: pkg.companyId,
            projectId: pkg.projectId,
            versionNumber: pkg.version,
            certificateId: certId,
            quizScore: input.quizScore,
            languageCode: (_b = input.languageCode) !== null && _b !== void 0 ? _b : 'en',
        });
        return progress;
    }
    async getComplianceForCompany(companyId) {
        return this.core.complianceSummaryForCompany(companyId);
    }
    async getComplianceForProject(projectId) {
        return this.core.complianceSummaryForProject(projectId);
    }
    async getStats(packageId) {
        const rows = await this.prisma.orientationWorkerProgress.findMany({
            where: { packageId },
        });
        const total = rows.length;
        const completed = rows.filter((r) => r.status === 'COMPLETED').length;
        const outdated = rows.filter((r) => r.status === 'REORIENTATION_REQUIRED').length;
        const inProgress = rows.filter((r) => r.status === 'IN_PROGRESS').length;
        const pending = total - completed - outdated - inProgress;
        return {
            total,
            completed,
            pending,
            outdated,
            inProgress,
            completionRate: total ? Math.round((completed / total) * 100) : 0,
        };
    }
    async requiredForWorker(workerId) {
        const rows = await this.prisma.orientationWorkerProgress.findMany({
            where: {
                workerId,
                status: {
                    in: [
                        client_1.OrientationWorkerProgressStatus.NOT_STARTED,
                        client_1.OrientationWorkerProgressStatus.IN_PROGRESS,
                        client_1.OrientationWorkerProgressStatus.REORIENTATION_REQUIRED,
                    ],
                },
            },
            include: { package: true },
        });
        return rows;
    }
    async createVersion(packageId, versionNumber, sections, quiz, userId, aiMetadata) {
        await this.prisma.orientationVersion.create({
            data: {
                packageId,
                versionNumber,
                sections: sections,
                quiz: (quiz !== null && quiz !== void 0 ? quiz : { en: [] }),
                aiMetadata: aiMetadata,
                createdById: userId,
            },
        });
        await this.prisma.orientationPackage.update({
            where: { id: packageId },
            data: { version: versionNumber, updatedById: userId },
        });
        await this.linking.linkWorkersForPackage(packageId);
    }
};
exports.OrientationService = OrientationService;
exports.OrientationService = OrientationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orientation_ai_service_1.OrientationAiService,
        orientation_translation_service_1.OrientationTranslationService,
        orientation_linking_service_1.OrientationLinkingService,
        orientation_core_integration_service_1.OrientationCoreIntegrationService,
        orientation_upload_service_1.OrientationUploadService])
], OrientationService);
//# sourceMappingURL=orientation.service.js.map