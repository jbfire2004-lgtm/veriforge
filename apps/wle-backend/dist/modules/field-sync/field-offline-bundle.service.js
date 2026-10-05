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
exports.FieldOfflineBundleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const TRAINING_SELECT = {
    id: true,
    workerId: true,
    companyId: true,
    projectId: true,
    issuedAt: true,
    expiresAt: true,
    certificateNumber: true,
    certificateQrToken: true,
    lastVerificationStatus: true,
    verifiedAt: true,
    certification: { select: { id: true, name: true, code: true } },
    worker: {
        select: { id: true, firstName: true, lastName: true, qrToken: true },
    },
};
const SAFETY_FORM_SELECT = {
    id: true,
    definitionId: true,
    definitionVersion: true,
    formType: true,
    status: true,
    title: true,
    formData: true,
    sifFlag: true,
    hecaFlag: true,
    companyId: true,
    projectId: true,
    siteId: true,
    workerId: true,
    equipmentId: true,
    supervisorId: true,
    clientSyncId: true,
    clientVersion: true,
    offlinePending: true,
    submittedAt: true,
    createdAt: true,
    updatedAt: true,
};
let FieldOfflineBundleService = class FieldOfflineBundleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async fetchBundle(params) {
        const syncedAt = new Date().toISOString();
        const { companyId, workerId } = params;
        let worker = null;
        let projectAssignments = [];
        let projectIds = [];
        let coworkerIds = [];
        if (workerId != null) {
            const row = await this.prisma.worker.findUnique({
                where: { id: workerId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    qrToken: true,
                    status: true,
                    companyId: true,
                    userId: true,
                },
            });
            if (!row)
                throw new common_1.NotFoundException('Worker not found');
            worker = row;
            const assignments = await this.prisma.projectAssignment.findMany({
                where: Object.assign({ workerId, status: 'ACTIVE', endedAt: null }, (companyId != null ? { companyId } : {})),
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            status: true,
                            companyId: true,
                            startDate: true,
                            endDate: true,
                        },
                    },
                },
                take: 50,
            });
            projectAssignments = assignments;
            projectIds = assignments.map((a) => a.projectId);
            if (projectIds.length) {
                const peers = await this.prisma.projectAssignment.findMany({
                    where: {
                        projectId: { in: projectIds },
                        status: 'ACTIVE',
                        endedAt: null,
                    },
                    select: { workerId: true },
                    distinct: ['workerId'],
                    take: 200,
                });
                coworkerIds = peers.map((p) => p.workerId);
            }
            else {
                coworkerIds = [workerId];
            }
        }
        const projects = projectIds.length > 0
            ? await this.prisma.project.findMany({
                where: { id: { in: projectIds } },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    status: true,
                    companyId: true,
                    startDate: true,
                    endDate: true,
                },
            })
            : companyId != null
                ? await this.prisma.project.findMany({
                    where: { companyId },
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        status: true,
                        companyId: true,
                        startDate: true,
                        endDate: true,
                    },
                    take: 100,
                })
                : [];
        const effectiveProjectIds = projectIds.length > 0 ? projectIds : projects.map((p) => p.id);
        const safetyFormWhere = workerId != null
            ? Object.assign({ OR: [
                    { workerId },
                    ...(effectiveProjectIds.length
                        ? [{ projectId: { in: effectiveProjectIds } }]
                        : []),
                ] }, (companyId != null ? { companyId } : {})) : companyId != null
            ? {
                OR: [
                    { companyId },
                    ...(effectiveProjectIds.length
                        ? [{ projectId: { in: effectiveProjectIds } }]
                        : []),
                ],
            }
            : null;
        const [safetyForms, credentials, safetyFormDefinitions, safetyFormTemplates,] = await Promise.all([
            safetyFormWhere
                ? this.prisma.safetyForm.findMany({
                    where: safetyFormWhere,
                    select: SAFETY_FORM_SELECT,
                    orderBy: { updatedAt: 'desc' },
                    take: 300,
                })
                : Promise.resolve([]),
            this.fetchCredentials({
                workerId,
                coworkerIds,
                companyId,
            }),
            companyId != null
                ? this.prisma.safetyFormDefinition.findMany({
                    where: {
                        OR: [{ companyId: null }, { companyId }],
                        isActive: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        version: true,
                        definition: true,
                        companyId: true,
                        updatedAt: true,
                    },
                })
                : this.prisma.safetyFormDefinition.findMany({
                    where: { isActive: true },
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
                }),
            companyId != null
                ? this.prisma.safetyFormTemplate.findMany({
                    where: {
                        active: true,
                        OR: [{ companyId }, { companyId: null }],
                    },
                    select: {
                        id: true,
                        formType: true,
                        name: true,
                        schemaVersion: true,
                        template: true,
                        companyId: true,
                        projectId: true,
                    },
                    take: 50,
                })
                : Promise.resolve([]),
        ]);
        return {
            syncedAt,
            worker,
            projectAssignments,
            projects,
            safetyForms,
            credentials,
            safetyFormDefinitions,
            safetyFormTemplates,
        };
    }
    async fetchCredentials(params) {
        const workerIds = [
            ...new Set(params.workerId != null
                ? [params.workerId, ...params.coworkerIds]
                : params.coworkerIds),
        ].filter(Boolean);
        if (workerIds.length === 0 && params.companyId == null) {
            return [];
        }
        return this.prisma.trainingRecord.findMany({
            where: Object.assign(Object.assign({}, (workerIds.length ? { workerId: { in: workerIds } } : {})), (params.companyId != null ? { companyId: params.companyId } : {})),
            select: TRAINING_SELECT,
            orderBy: { issuedAt: 'desc' },
            take: 400,
        });
    }
};
exports.FieldOfflineBundleService = FieldOfflineBundleService;
exports.FieldOfflineBundleService = FieldOfflineBundleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldOfflineBundleService);
//# sourceMappingURL=field-offline-bundle.service.js.map