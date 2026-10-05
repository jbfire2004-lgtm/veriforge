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
exports.TrainingProviderAccessService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
const phase1_monitoring_service_1 = require("../../common/monitoring/phase1-monitoring.service");
const training_provider_permissions_1 = require("./training-provider-permissions");
const training_provider_core_service_1 = require("./training-provider-core.service");
const training_wallet_integration_service_1 = require("../vera-core/training-wallet-integration.service");
let TrainingProviderAccessService = class TrainingProviderAccessService {
    constructor(prisma, monitoring, walletIntegration, providerCore) {
        this.prisma = prisma;
        this.monitoring = monitoring;
        this.walletIntegration = walletIntegration;
        this.providerCore = providerCore;
    }
    requirePermission(user, permission) {
        if (!(0, training_provider_permissions_1.hasTrainingProviderPermission)(user.role, permission)) {
            throw new common_1.ForbiddenException(`Permission denied: ${permission}`);
        }
    }
    async resolveProviderId(user, queryProviderId) {
        return this.providerCore.resolveProviderId(user, queryProviderId);
    }
    async getPortalContext(user) {
        var _a;
        const permissions = Object.values(training_provider_permissions_1.TrainingProviderPermission).filter((p) => (0, training_provider_permissions_1.hasTrainingProviderPermission)(user.role, p));
        let provider = null;
        let instructor = null;
        if (user.trainingProviderId) {
            provider = await this.prisma.trainingProvider.findUnique({
                where: { id: user.trainingProviderId },
                include: {
                    complianceStatuses: { orderBy: { assessedAt: 'desc' }, take: 1 },
                },
            });
        }
        if (!provider && user.role === client_1.UserRole.TRAINING_INSTRUCTOR) {
            const linkedInstructor = await this.resolveInstructorRecord(user);
            if (linkedInstructor === null || linkedInstructor === void 0 ? void 0 : linkedInstructor.provider) {
                provider = linkedInstructor.provider;
            }
        }
        if (user.role === client_1.UserRole.TRAINING_INSTRUCTOR) {
            instructor =
                user.instructorId != null
                    ? await this.prisma.trainingInstructor.findUnique({
                        where: { id: user.instructorId },
                        include: { courses: true },
                    })
                    : await this.prisma.trainingInstructor.findFirst({
                        where: { userId: user.id, active: true },
                        include: { courses: true },
                    });
        }
        return {
            user: {
                id: user.id,
                role: user.role,
                trainingProviderId: user.trainingProviderId,
                instructorId: (_a = instructor === null || instructor === void 0 ? void 0 : instructor.id) !== null && _a !== void 0 ? _a : user.instructorId,
            },
            permissions,
            provider,
            instructor,
            dashboardPath: user.role === client_1.UserRole.TRAINING_INSTRUCTOR
                ? '/provider-portal/instructor'
                : '/provider-portal',
        };
    }
    async onboardProvider(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.adminEmail },
        });
        if (existing) {
            throw new common_1.ConflictException('Admin email already registered');
        }
        const provider = await this.providerCore.createProvider(dto);
        const hash = await bcrypt.hash(dto.adminPassword, 10);
        const user = await this.prisma.user.create({
            data: {
                username: dto.adminUsername,
                email: dto.adminEmail,
                password: hash,
                role: client_1.UserRole.TRAINING_PROVIDER_ADMIN,
                trainingProviderId: provider.id,
            },
        });
        await this.prisma.providerApproval.create({
            data: {
                providerId: provider.id,
                status: client_1.ProviderApprovalStatus.PENDING,
                notes: 'Provider onboarding — pending company approval',
            },
        });
        await this.audit(user.id, 'training_provider.onboard', provider.id, {
            adminEmail: dto.adminEmail,
        });
        return {
            provider,
            user: { id: user.id, email: user.email, role: user.role },
        };
    }
    async onboardInstructor(providerId, dto, actor) {
        await this.providerCore.assertAccess(actor, providerId);
        this.requirePermission(actor, training_provider_permissions_1.TrainingProviderPermission.MANAGE_INSTRUCTORS);
        const instructor = await this.providerCore.addInstructor(providerId, dto);
        let user = null;
        if (dto.userEmail && dto.userPassword && dto.userUsername) {
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.userEmail },
            });
            if (existing) {
                throw new common_1.ConflictException('Instructor user email already exists');
            }
            const hash = await bcrypt.hash(dto.userPassword, 10);
            user = await this.prisma.user.create({
                data: {
                    username: dto.userUsername,
                    email: dto.userEmail,
                    password: hash,
                    role: client_1.UserRole.TRAINING_INSTRUCTOR,
                    trainingProviderId: providerId,
                },
            });
            await this.prisma.trainingInstructor.update({
                where: { id: instructor.id },
                data: { userId: user.id },
            });
        }
        await this.audit(actor.id, 'training_instructor.onboard', instructor.id, {
            providerId,
            userId: user === null || user === void 0 ? void 0 : user.id,
        });
        return { instructor, user };
    }
    async requestApproval(providerId, dto, actor) {
        var _a;
        await this.providerCore.assertAccess(actor, providerId);
        this.requirePermission(actor, training_provider_permissions_1.TrainingProviderPermission.REQUEST_APPROVAL);
        await this.prisma.trainingProvider.update({
            where: { id: providerId },
            data: { approvalStatus: client_1.ProviderApprovalStatus.PENDING },
        });
        const approval = await this.prisma.providerApproval.create({
            data: {
                providerId,
                status: client_1.ProviderApprovalStatus.PENDING,
                reviewedBy: actor.id,
                notes: (_a = dto.notes) !== null && _a !== void 0 ? _a : 'Approval requested by provider admin',
            },
        });
        await this.audit(actor.id, 'training_provider.approval_requested', providerId);
        return approval;
    }
    async getApprovalStatus(providerId, actor) {
        await this.providerCore.assertAccess(actor, providerId);
        this.requirePermission(actor, training_provider_permissions_1.TrainingProviderPermission.MANAGE_APPROVAL_STATUS);
        const provider = await this.prisma.trainingProvider.findUnique({
            where: { id: providerId },
            select: { id: true, approvalStatus: true, active: true },
        });
        const approvals = await this.prisma.providerApproval.findMany({
            where: { providerId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        return { provider, approvals };
    }
    async uploadClassList(providerId, dto, actor) {
        await this.providerCore.assertAccess(actor, providerId);
        this.requirePermission(actor, training_provider_permissions_1.TrainingProviderPermission.UPLOAD_CLASS_LISTS);
        const instructorId = await this.resolveInstructorIdForActor(actor, providerId);
        const results = [];
        for (const workerId of dto.workerIds) {
            try {
                const out = await this.providerCore.uploadTraining(providerId, {
                    workerId,
                    courseId: dto.courseId,
                    instructorId,
                    companyId: dto.companyId,
                    projectId: dto.projectId,
                    issuedAt: dto.issuedAt,
                    expiresAt: dto.expiresAt,
                });
                results.push({ workerId, ok: true, recordId: out.record.id });
            }
            catch (e) {
                results.push({
                    workerId,
                    ok: false,
                    error: e instanceof Error ? e.message : 'UPLOAD_FAILED',
                });
            }
        }
        await this.audit(actor.id, 'training_provider.class_list_upload', providerId, {
            courseId: dto.courseId,
            count: dto.workerIds.length,
            success: results.filter((r) => r.ok).length,
        });
        return {
            uploaded: results.filter((r) => r.ok).length,
            total: results.length,
            results,
        };
    }
    async signCertificate(recordId, dto, actor) {
        var _a, _b;
        this.requirePermission(actor, training_provider_permissions_1.TrainingProviderPermission.SIGN_CERTIFICATES);
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: recordId },
            include: { trainingProvider: true },
        });
        if (!record)
            throw new common_1.NotFoundException('Training record not found');
        if (record.trainingProviderId) {
            await this.providerCore.assertAccess(actor, record.trainingProviderId);
        }
        const instructorId = await this.resolveInstructorIdForActor(actor, (_a = record.trainingProviderId) !== null && _a !== void 0 ? _a : undefined);
        const signedAt = dto.signedAt ? new Date(dto.signedAt) : new Date();
        const updated = await this.prisma.trainingRecord.update({
            where: { id: recordId },
            data: {
                certificateSignedAt: signedAt,
                certificateSignedByInstructorId: instructorId !== null && instructorId !== void 0 ? instructorId : undefined,
                completedAt: (_b = record.completedAt) !== null && _b !== void 0 ? _b : signedAt,
            },
            include: {
                worker: true,
                certification: true,
                certificateSignedBy: true,
            },
        });
        await this.audit(actor.id, 'training_certificate.signed', recordId, {
            signatureName: dto.signatureName,
            instructorId,
        });
        await this.walletIntegration
            .syncAfterTrainingRecord(recordId)
            .catch(() => undefined);
        return {
            record: updated,
            signature: {
                name: dto.signatureName,
                signedAt: signedAt.toISOString(),
                instructorId,
            },
        };
    }
    async uploadTrainingForActor(providerId, dto, actor) {
        var _a;
        await this.providerCore.assertAccess(actor, providerId);
        this.requirePermission(actor, actor.role === client_1.UserRole.TRAINING_INSTRUCTOR
            ? training_provider_permissions_1.TrainingProviderPermission.DELIVER_TRAINING
            : training_provider_permissions_1.TrainingProviderPermission.UPLOAD_TRAINING);
        const instructorId = (_a = dto.instructorId) !== null && _a !== void 0 ? _a : (await this.resolveInstructorIdForActor(actor, providerId));
        return this.providerCore.uploadTraining(providerId, Object.assign(Object.assign({}, dto), { instructorId }));
    }
    async instructorProfile(actor) {
        this.requirePermission(actor, training_provider_permissions_1.TrainingProviderPermission.VIEW_INSTRUCTOR_PROFILE);
        const instructor = await this.resolveInstructorRecord(actor);
        if (!instructor) {
            throw new common_1.NotFoundException('No instructor profile linked to this account');
        }
        return instructor;
    }
    async trainingHistoryForActor(providerId, actor, limit = 50) {
        await this.providerCore.assertAccess(actor, providerId);
        this.requirePermission(actor, training_provider_permissions_1.TrainingProviderPermission.VIEW_TRAINING_HISTORY);
        if (actor.role === client_1.UserRole.TRAINING_INSTRUCTOR) {
            const instructorId = actor.instructorId;
            if (!instructorId) {
                return this.prisma.trainingRecord.findMany({
                    where: {
                        trainingProviderId: providerId,
                        instructor: { userId: actor.id },
                    },
                    take: limit,
                    orderBy: { issuedAt: 'desc' },
                    include: {
                        worker: { select: { id: true, firstName: true, lastName: true } },
                        certification: true,
                        course: true,
                    },
                });
            }
            return this.prisma.trainingRecord.findMany({
                where: { trainingProviderId: providerId, instructorId },
                take: limit,
                orderBy: { issuedAt: 'desc' },
                include: {
                    worker: { select: { id: true, firstName: true, lastName: true } },
                    certification: true,
                    course: true,
                },
            });
        }
        return this.providerCore.trainingHistory(providerId, limit);
    }
    async resolveInstructorIdForActor(actor, providerId) {
        if (actor.role === client_1.UserRole.TRAINING_PROVIDER_ADMIN) {
            return undefined;
        }
        const instructor = await this.resolveInstructorRecord(actor);
        if (instructor && providerId && instructor.providerId !== providerId) {
            throw new common_1.ForbiddenException('Instructor not assigned to this provider');
        }
        return instructor === null || instructor === void 0 ? void 0 : instructor.id;
    }
    async resolveInstructorRecord(actor) {
        if (actor.instructorId) {
            return this.prisma.trainingInstructor.findUnique({
                where: { id: actor.instructorId },
                include: { courses: true, provider: true },
            });
        }
        return this.prisma.trainingInstructor.findFirst({
            where: { userId: actor.id, active: true },
            include: { courses: true, provider: true },
        });
    }
    async audit(userId, action, entityId, metadata) {
        await this.monitoring.persistAudit({
            userId,
            action,
            entity: 'TrainingProvider',
            entityId,
            metadata,
        });
    }
};
exports.TrainingProviderAccessService = TrainingProviderAccessService;
exports.TrainingProviderAccessService = TrainingProviderAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        phase1_monitoring_service_1.Phase1MonitoringService,
        training_wallet_integration_service_1.TrainingWalletIntegrationService,
        training_provider_core_service_1.TrainingProviderCoreService])
], TrainingProviderAccessService);
//# sourceMappingURL=training-provider-access.service.js.map